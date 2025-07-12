/* eslint-disable */
import React, { useReducer, useEffect, useState, useRef } from "react";
import useDeepCompareEffect from "use-deep-compare-effect";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import NumberFormat from "../../utilities/number";
import { numberSign, numFormatter } from "../../utilities/number";
import icons from "base64-cryptocurrency-icons";
import { Icon } from "@iconify/react";
import ReactECharts from "echarts-for-react";
import { cryptoSymbol } from "crypto-symbol";
import _ from "lodash";
import { NickToken, NDB } from "../../utilities/imgImport";
import Skeleton from "@mui/material/Skeleton";
import CustomSpinner from "./../common/custom-spinner";
import { setCookie, getCookie, NDB_FavAssets } from "../../utilities/cookies";
import { update_Favor_Assets } from "../../store/actions/settingAction";
import { fetchPriceFromFreeAPIs } from "../../utilities/freeCryptoPrices";

const QUOTE = "USDT";

// Using Coinbase API endpoints instead of Binance
const COINBASE_BASE_API = "https://api.coinbase.com/v2";
const COINBASE_EXCHANGE_API = "https://api.exchange.coinbase.com";
const TICKER_24hr = `${COINBASE_EXCHANGE_API}/products/stats`;
const ALLPRICES = `${COINBASE_EXCHANGE_API}/products`;
const KLINE_ENDPOINT = `${COINBASE_EXCHANGE_API}/products`;

const KLINE_INTERVAL = "300"; // 5 minutes in seconds
const GREEN = "#23C865";
const RED = "#F6361A";

const { get } = cryptoSymbol({});
const cryptoSymbolList = get().SNPair;
const REFRESH_TIME = 30;

const fetch_Ticker_From_Coinbase = async (tokenSymbol) => {
    try {
        console.log(`Fetching ticker for ${tokenSymbol} from Coinbase...`);
        // Get 24hr stats from Coinbase
        const res = await axios.get(
            `${COINBASE_EXCHANGE_API}/products/${tokenSymbol}-${QUOTE}/stats`,
        );
        const price = Number(res.data.last);
        const percent = Number(
            (((res.data.last - res.data.open) / res.data.open) * 100).toFixed(
                2,
            ),
        );
        const volume = Number(res.data.volume) * price; // Convert base volume to USD volume
        console.log(`Coinbase data for ${tokenSymbol}:`, {
            price,
            percent,
            volume,
        });
        return { price, percent, volume };
    } catch (error) {
        console.error(
            `Error fetching ticker for ${tokenSymbol} from Coinbase:`,
            error,
        );

        // Fallback to Binance
        try {
            console.log(`Trying Binance fallback for ${tokenSymbol}...`);
            const binanceUrl = `${process.env.GATSBY_BINANCE_BASE_API}/v3/ticker/24hr`;
            const res = await axios.get(binanceUrl, {
                params: { symbol: tokenSymbol + QUOTE },
            });
            const price = Number(res.data.lastPrice);
            const percent = Number(res.data.priceChangePercent);
            const volume = Number(res.data.quoteVolume);
            console.log(`Binance fallback data for ${tokenSymbol}:`, {
                price,
                percent,
                volume,
            });
            return { price, percent, volume };
        } catch (binanceError) {
            console.error(`Both APIs failed for ${tokenSymbol}:`, binanceError);
            return { price: 0, percent: 0, volume: 0 };
        }
    }
};

const fetch_Ticker_Of_NDB = async () => {
    try {
        const res = await axios.get(
            `${process.env.GATSBY_API_BASE_URL}/ndbcoin/info`,
        );
        const price = Number(res.data.price);
        const percent = Number(res.data.change);
        const volume = Number(res.data.volume);
        return { price, percent, volume };
    } catch (error) {
        console.warn("NDB ticker API not available:", error.message);
        // Return default values when API is not available
        return {
            price: 0.001, // Default NDB price
            percent: 0,
            volume: 0,
        };
    }
};

const CryptoRow = ({ data = {}, favours = {}, doAction }) => {
    const defaultCurrency = { label: "USD", sign: "$", value: "USD" };
    const currency =
        useSelector((state) => state.favAssets?.currency) || defaultCurrency;
    const currencyRates = useSelector((state) => state.currencyRates) || {};
    const currencyRate = currencyRates[currency.value] ?? 1;

    const [state, setState] = useReducer(
        (old, action) => ({ ...old, ...action }),
        {
            chart: [],
            min: 0,
            max: 0,
            percent: "",
            price: "",
            volume: "",
        },
    );

    const { chart, min, price, percent, volume } = state;

    useEffect(() => {
        const getChartData = async () => {
            if (!data.symbol) return;
            let chartData;

            if (data.symbol === "NDB") {
                try {
                    const res = await axios.get(
                        `${process.env.GATSBY_API_BASE_URL}/ndbcoin/kline`,
                    );
                    chartData = res.data;
                } catch (error) {
                    console.error("Error fetching NDB chart data:", error);
                    chartData = [];
                }
            } else {
                try {
                    console.log(`Fetching chart data for ${data.symbol}...`);
                    // Get historical data from Coinbase
                    const endTime = new Date();
                    const startTime = new Date(
                        endTime.getTime() - 24 * 3600 * 1000,
                    );

                    const res = await axios.get(
                        `${COINBASE_EXCHANGE_API}/products/${data.symbol}-${QUOTE}/candles`,
                        {
                            params: {
                                start: startTime.toISOString(),
                                end: endTime.toISOString(),
                                granularity: KLINE_INTERVAL,
                            },
                        },
                    );

                    chartData = res.data.map((candle) => candle[4]); // closing prices
                } catch (error) {
                    console.error(
                        `Error fetching chart data for ${data.symbol}:`,
                        error,
                    );

                    // Fallback to Binance for chart data
                    try {
                        console.log(
                            `Trying Binance fallback for chart data...`,
                        );
                        const res = await axios.get(
                            `${process.env.GATSBY_BINANCE_BASE_API}/v3/klines`,
                            {
                                params: {
                                    symbol: data.symbol + QUOTE,
                                    interval: "5m",
                                    limit: 288, // 24 hours of 5-minute intervals
                                },
                            },
                        );
                        chartData = res.data.map((candle) => candle[4]); // closing prices
                    } catch (binanceError) {
                        console.error(
                            `Chart data failed for both APIs for ${data.symbol}:`,
                            binanceError,
                        );
                        chartData = [];
                    }
                }
            }

            if (chartData && chartData.length > 0) {
                setState({
                    min: Math.min(...chartData),
                    max: Math.max(...chartData),
                    chart: chartData,
                });
            } else {
                console.log(`No chart data available for ${data.symbol}`);
            }
        };

        const getTicker24hr = async () => {
            if (!data.symbol) return;
            let fetchData;

            if (data.symbol === "NDB") {
                try {
                    fetchData = await fetch_Ticker_Of_NDB();
                } catch (error) {
                    console.warn("NDB API unavailable, using fallback data");
                    fetchData = { price: 0.001, percent: 0, volume: 0 };
                }
            } else {
                // Use the centralized freeCryptoPrices function for consistent data
                try {
                    const price = await fetchPriceFromFreeAPIs(
                        data.symbol,
                        "USD",
                    );
                    // For volume, we'll fallback to the existing API calls since freeCryptoPrices only handles price
                    const volumeData = await fetch_Ticker_From_Coinbase(
                        data.symbol,
                    );
                    fetchData = {
                        price,
                        percent: volumeData.percent,
                        volume: volumeData.volume,
                    };
                } catch (error) {
                    console.error(
                        `Error with freeCryptoPrices for ${data.symbol}:`,
                        error,
                    );
                    // Fallback to original method
                    try {
                        fetchData = await fetch_Ticker_From_Coinbase(
                            data.symbol,
                        );
                    } catch (fallbackError) {
                        console.warn(
                            `All APIs failed for ${data.symbol}, using default values`,
                        );
                        fetchData = { price: 0, percent: 0, volume: 0 };
                    }
                }
            }

            const { price, percent, volume } = fetchData;
            setState({
                price,
                percent,
                volume,
            });
        };

        getTicker24hr();
        getChartData();

        const interval_crypto = setInterval(() => {
            getTicker24hr();
            getChartData();
        }, 1000 * REFRESH_TIME);

        return () => clearInterval(interval_crypto);
    }, [data.symbol]);

    let tokenImage;
    if (data.symbol === "NDB") {
        tokenImage = NDB;
    } else {
        tokenImage = icons[data.symbol]?.icon ?? NickToken;
    }

    return (
        <tr>
            <td className="d-flex align-items-start ps-2">
                <div className="star_selected" onClick={doAction}>
                    <Icon
                        icon="bx:bxs-star"
                        className={`star-checkbox ${favours[data.symbol] ? "txt-green" : "txt-grey"}`}
                    />
                </div>
                <div>
                    <img
                        src={tokenImage}
                        alt="coin"
                        className="me-2 full-width"
                        width="30"
                    />
                </div>
                <div style={{ width: "100%", paddingRight: 20 }}>
                    <p className="coin-abbr">{data.symbol}</p>
                    <p className="coin-name">{data.name}</p>
                </div>
            </td>
            <td className="text-center">
                <p className="coin-price text-center">
                    {price ? (
                        <NumberFormat
                            value={
                                Math.round(
                                    price *
                                        Number(currencyRate).toFixed(2) *
                                        10 ** 8,
                                ) /
                                10 ** 8
                            }
                            thousandSeparator={true}
                            displayType="text"
                            prefix={(currency.sign || "$") + " "}
                            allowNegative={false}
                            renderText={(value, props) => (
                                <span {...props}>{value}</span>
                            )}
                        />
                    ) : (
                        ""
                    )}
                </p>
                <p
                    className={
                        numberSign(percent) === "+"
                            ? "coin-percent txt-green text-center"
                            : "coin-percent txt-red text-center"
                    }
                >
                    {percent
                        ? `${numberSign(percent)}${Number(percent).toFixed(2)}%`
                        : ""}
                </p>
            </td>
            <td className="laptop-not price-chart">
                {_.isEmpty(chart) ? (
                    <Skeleton
                        variant="text"
                        animation="wave"
                        sx={{ bgcolor: "#d3d3d353" }}
                    />
                ) : (
                    <ReactECharts
                        option={{
                            color: percent >= 0 ? GREEN : RED,
                            backgroundColor: "transparent",
                            xAxis: {
                                type: "category",
                                show: false,
                            },
                            yAxis: {
                                type: "value",
                                show: false,
                                min: min,
                            },
                            series: [
                                {
                                    data: chart,
                                    type: "line",
                                    smooth: true,
                                    showSymbol: false,
                                },
                            ],
                            grid: {
                                show: false,
                                top: "10%",
                                bottom: "10%",
                                left: "0",
                                right: "0",
                            },
                        }}
                        style={{
                            height: "50px",
                            width: "150px",
                            margin: "auto !important",
                        }}
                        className="echarts-for-echarts"
                    />
                )}
            </td>
            <td className="mobile-not text-center">
                {!volume
                    ? ""
                    : (currency.sign || "$") +
                      " " +
                      numFormatter(volume * Number(currencyRate), 2)}
            </td>
        </tr>
    );
};

const CryptoRowForSearch = ({ data = {}, favours = {}, doAction }) => {
    let tokenImage;
    if (data.symbol === "NDB") {
        tokenImage = NDB;
    } else {
        tokenImage = icons[data.symbol]?.icon ?? NickToken;
    }
    return (
        <tr>
            <td className="d-flex align-items-start ps-2">
                <div className="star_selected" onClick={doAction}>
                    <Icon
                        icon="bx:bxs-star"
                        className={`star-checkbox ${favours[data.symbol] ? "txt-green" : "txt-grey"}`}
                    />
                </div>
                <img src={tokenImage} alt="coin" className="me-2" width="30" />
                <div>
                    <p className="coin-abbr">{data.symbol}</p>
                    <p className="coin-name">{data.name}</p>
                </div>
            </td>
            <td className="mobile-not text-center" />
        </tr>
    );
};

export default function MarketTab() {
    const defaultFavAssets = {
        currency: { label: "USD", sign: "$", value: "USD" },
        assets: [],
    };
    const { currency, assets } =
        useSelector((state) => state.favAssets) || defaultFavAssets;
    const dispatch = useDispatch();

    const [searchValue, setSearchValue] = useState("");
    const [cryptoList, setCryptoList] = useState({});
    const [sortOption, setSortOption] = useState({});

    const [favours, setFavours] = useState({});
    const [favoursData, setFavoursData] = useState({});

    const componentWillUnmount = useRef(false);

    // This is componentWillUnmount
    useEffect(() => {
        return () => {
            componentWillUnmount.current = true;
        };
    }, []);

    useEffect(() => {
        return function cleanup() {
            if (componentWillUnmount.current && !_.isEmpty(favoursData)) {
                const updateData = {
                    assets:
                        (currency?.label || "USD") +
                        "," +
                        Object.keys(favoursData).join(","),
                };
                dispatch(update_Favor_Assets(updateData));
            }
        };
    }, [favoursData, currency, dispatch]);

    // ONLY FIX: Added assets dependency to fix useDeepCompareEffect error
    useDeepCompareEffect(() => {
        const fav_Cookie = JSON.parse(getCookie(NDB_FavAssets) ?? "{}");
        if (!_.isEmpty(fav_Cookie)) {
            setFavours(fav_Cookie);
        } else {
            const favArray = (assets || []).map((item) => ({ symbol: item }));
            const favObj = _.mapKeys(favArray, "symbol");
            setFavours(favObj);
            setCookie(NDB_FavAssets, JSON.stringify(favObj));
        }
    }, [assets]); // Added assets dependency

    useEffect(() => {
        // Fetch available products from Coinbase - let's try a simpler approach first
        const fetchCryptoList = async () => {
            try {
                console.log("Fetching crypto list from Coinbase...");
                const res = await axios.get(ALLPRICES);
                console.log("Coinbase API response:", res.data);

                const allProducts = res.data;
                let cryptos = allProducts
                    ?.filter(
                        (product) =>
                            product.quote_currency === QUOTE &&
                            product.status === "online",
                    )
                    .map((item) => ({ symbol: item.base_currency }));

                console.log("Filtered cryptos:", cryptos);

                // Added NDB to search list
                cryptos = [{ symbol: "NDB" }, ...cryptos];

                cryptos = cryptos.map((item) => ({
                    symbol: item.symbol,
                    name:
                        cryptoSymbolList[item.symbol] ?? item.symbol + " Coin",
                }));

                console.log("Final crypto list:", cryptos);
                setCryptoList(_.mapKeys(cryptos, "symbol"));
            } catch (error) {
                console.error("Error fetching Coinbase products:", error);

                // Fallback to Binance API if Coinbase fails
                console.log("Trying Binance API as fallback...");
                try {
                    const binanceUrl = `${process.env.GATSBY_BINANCE_BASE_API}/v3/ticker/price`;
                    const res = await axios.get(binanceUrl);
                    console.log("Binance fallback response:", res.data);

                    const allprices = res.data;
                    let cryptos = allprices
                        ?.filter((el) => el.symbol.match(/USDT$/))
                        .map((item) => ({
                            symbol: item.symbol?.replace("USDT", ""),
                        }));

                    // Added NDB to search list
                    cryptos = [{ symbol: "NDB" }, ...cryptos];

                    cryptos = cryptos.map((item) => ({
                        symbol: item.symbol,
                        name:
                            cryptoSymbolList[item.symbol] ??
                            item.symbol + " Coin",
                    }));

                    console.log("Binance fallback crypto list:", cryptos);
                    setCryptoList(_.mapKeys(cryptos, "symbol"));
                } catch (binanceError) {
                    console.error(
                        "Both Coinbase and Binance APIs failed:",
                        binanceError,
                    );

                    // Last resort: use hardcoded list
                    const defaultCryptos = [
                        { symbol: "NDB" },
                        { symbol: "BTC" },
                        { symbol: "ETH" },
                        { symbol: "ADA" },
                        { symbol: "DOT" },
                        { symbol: "LINK" },
                        { symbol: "UNI" },
                        { symbol: "LTC" },
                    ].map((item) => ({
                        symbol: item.symbol,
                        name:
                            cryptoSymbolList[item.symbol] ??
                            item.symbol + " Coin",
                    }));

                    console.log("Using default crypto list:", defaultCryptos);
                    setCryptoList(_.mapKeys(defaultCryptos, "symbol"));
                }
            }
        };

        fetchCryptoList();
    }, []);

    // ONLY FIX: Added favours dependency to fix useDeepCompareEffect error
    useDeepCompareEffect(() => {
        (async function () {
            let assets = { ...favours };
            let tickerData;

            for (const favour of Object.values(favours)) {
                if (favour.symbol === "NDB") {
                    try {
                        tickerData = await fetch_Ticker_Of_NDB(favour.symbol);
                    } catch (error) {
                        console.warn(
                            "NDB API unavailable in favourites, using fallback",
                        );
                        tickerData = { price: 0.001, percent: 0, volume: 0 };
                    }
                } else {
                    // Use centralized freeCryptoPrices for consistent pricing
                    try {
                        const price = await fetchPriceFromFreeAPIs(
                            favour.symbol,
                            "USD",
                        );
                        // Get volume and percent from existing API for now
                        const volumeData = await fetch_Ticker_From_Coinbase(
                            favour.symbol,
                        );
                        tickerData = {
                            price,
                            percent: volumeData.percent,
                            volume: volumeData.volume,
                        };
                    } catch (error) {
                        console.error(
                            `Error with freeCryptoPrices for ${favour.symbol}:`,
                            error,
                        );
                        // Fallback to original method
                        try {
                            tickerData = await fetch_Ticker_From_Coinbase(
                                favour.symbol,
                            );
                        } catch (fallbackError) {
                            console.warn(
                                `All APIs failed for ${favour.symbol}, using default values`,
                            );
                            tickerData = { price: 0, percent: 0, volume: 0 };
                        }
                    }
                }
                const { price, percent, volume } = tickerData;
                assets[favour.symbol] = {
                    ...favour,
                    name:
                        cryptoSymbolList[favour.symbol] ??
                        favour.symbol + " Coin",
                    price,
                    percent,
                    volume,
                };
            }
            setFavoursData({ ...assets });
        })();
    }, [favours]); // Added favours dependency

    const set_Favourite_Crypto = (item) => {
        if (favoursData[item.symbol]) {
            delete favoursData[item.symbol];
            setFavoursData({ ...favoursData });
            delete favours[item.symbol];
            setFavours({ ...favours });
            setCookie(NDB_FavAssets, JSON.stringify(favours));

            return;
        }
        const temp = { ...favours, [item.symbol]: item };
        setFavours(temp);
        setCookie(NDB_FavAssets, JSON.stringify(temp));
    };

    const set_SortOption = (sortName) => {
        setSortOption({
            [sortName]: sortOption[sortName] === "desc" ? "asc" : "desc",
        });
    };

    return (
        <table className="wallet-transaction-table">
            <thead>
                <tr>
                    <th colSpan="4">
                        <div className="search">
                            <Icon
                                className="search-icon text-light"
                                icon={
                                    searchValue
                                        ? "bi:list-stars"
                                        : "carbon:search"
                                }
                                onClick={() => setSearchValue("")}
                                disabled={!searchValue}
                            />
                            <input
                                className="black_input"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                placeholder="Search"
                            />
                        </div>
                    </th>
                </tr>
                <tr>
                    <th className="text-center">
                        Name
                        <Icon
                            icon={
                                sortOption["symbol"] === "desc"
                                    ? "ant-design:caret-up-filled"
                                    : "ant-design:caret-down-filled"
                            }
                            className={sortOption["symbol"] ? "txt-green" : ""}
                            onClick={() => set_SortOption("symbol")}
                        />
                    </th>
                    <th className="text-center">
                        Price ({currency?.label || "USD"})
                        <Icon
                            icon={
                                sortOption["price"] === "desc"
                                    ? "ant-design:caret-up-filled"
                                    : "ant-design:caret-down-filled"
                            }
                            className={sortOption["price"] ? "txt-green" : ""}
                            onClick={() => set_SortOption("price")}
                        />
                    </th>
                    <th className="laptop-not text-center">
                        Price Chart
                        <Icon
                            icon={
                                sortOption["percent"] === "desc"
                                    ? "ant-design:caret-up-filled"
                                    : "ant-design:caret-down-filled"
                            }
                            className={sortOption["percent"] ? "txt-green" : ""}
                            onClick={() => set_SortOption("percent")}
                        />
                    </th>
                    <th className="mobile-not text-center">
                        Volume (24h)
                        <Icon
                            icon={
                                sortOption["volume"] === "desc"
                                    ? "ant-design:caret-up-filled"
                                    : "ant-design:caret-down-filled"
                            }
                            className={sortOption["volume"] ? "txt-green" : ""}
                            onClick={() => set_SortOption("volume")}
                        />
                    </th>
                </tr>
            </thead>
            <tbody>
                {searchValue ? (
                    _.map(
                        _.filter(
                            cryptoList,
                            (item) =>
                                item.name
                                    .toLowerCase()
                                    .includes(searchValue.toLowerCase()) ||
                                item.symbol
                                    .toLowerCase()
                                    .includes(searchValue.toLowerCase()),
                        ),
                        (item) => (
                            <CryptoRowForSearch
                                data={item}
                                key={item.name}
                                favours={favours}
                                doAction={() => set_Favourite_Crypto(item)}
                            />
                        ),
                    )
                ) : _.isEmpty(favoursData) ? (
                    <tr>
                        <td colSpan="4" className="text-center">
                            <div className="d-flex justify-content-center align-items-center mt-4">
                                <CustomSpinner />
                            </div>
                        </td>
                    </tr>
                ) : (
                    _.map(
                        _.orderBy(
                            favoursData,
                            [Object.keys(sortOption)[0]],
                            [Object.values(sortOption)[0]],
                        ),
                        (item) => (
                            <CryptoRow
                                data={item}
                                key={item.name}
                                favours={favours}
                                doAction={() => set_Favourite_Crypto(item)}
                            />
                        ),
                    )
                )}
            </tbody>
        </table>
    );
}
