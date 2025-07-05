import React, { useEffect, useState, useMemo, useRef } from "react";
import useDeepCompareEffect from "use-deep-compare-effect";
import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";
import svgToDataURL from "svg-to-dataurl";
import axios from "axios";
import DepositModal from "./DepositModal";
import WithdrawModal from "./WithdrawModal";
import CustomSpinner from "../common/custom-spinner";
import NumberFormat from "../../utilities/number";
import { useQuery } from "@apollo/client";
import { GET_BALANCES } from "../../apollo/graphqls/querys/Auth";
import { AiFillEyeInvisible } from "@react-icons/all-files/ai/AiFillEyeInvisible";
import { AiFillEye } from "@react-icons/all-files/ai/AiFillEye";
import { roundNumber } from "../../utilities/number";

import {
    updateHiddenStatus,
    changeEquity,
    fetchNDBPrice,
} from "../../store/actions/tempAction";

// Free API endpoints (no rate limits, no API keys required)
const FREE_APIS = {
    // CoinGecko - Very reliable, widely used, free tier with good limits
    COINGECKO: {
        BASE: "https://api.coingecko.com/api/v3",
        PRICES: "https://api.coingecko.com/api/v3/simple/price",
    },
    // CoinCap - Alternative free API
    COINCAP: {
        BASE: "https://api.coincap.io/v2",
        ASSETS: "https://api.coincap.io/v2/assets",
    },
    // CryptoCompare - Another reliable free option
    CRYPTOCOMPARE: {
        BASE: "https://min-api.cryptocompare.com/data",
        PRICES: "https://min-api.cryptocompare.com/data/pricemultifull",
    },
    // Binance - Keep as fallback (public endpoints)
    BINANCE: {
        BASE: "https://api.binance.com/api/v3",
        TICKER: "https://api.binance.com/api/v3/ticker/price",
    },
};

// Mapping for CoinGecko IDs (symbol to ID conversion)
const COINGECKO_SYMBOL_MAP = {
    BTC: "bitcoin",
    ETH: "ethereum",
    BNB: "binancecoin",
    ADA: "cardano",
    SOL: "solana",
    XRP: "ripple",
    DOT: "polkadot",
    DOGE: "dogecoin",
    AVAX: "avalanche-2",
    SHIB: "shiba-inu",
    MATIC: "matic-network",
    UNI: "uniswap",
    LINK: "chainlink",
    LTC: "litecoin",
    BCH: "bitcoin-cash",
    ALGO: "algorand",
    VET: "vechain",
    ICP: "internet-computer",
    FIL: "filecoin",
    TRX: "tron",
    ETC: "ethereum-classic",
    XLM: "stellar",
    THETA: "theta-token",
    ATOM: "cosmos",
    AXS: "axie-infinity",
    SAND: "the-sandbox",
    MANA: "decentraland",
    CRO: "crypto-com-chain",
    NEAR: "near",
    FTM: "fantom",
    ONE: "harmony",
    HBAR: "hedera-hashgraph",
    EGLD: "elrond-erd-2",
    FLOW: "flow",
    XTZ: "tezos",
    ZEC: "zcash",
    DASH: "dash",
    KSM: "kusama",
    WAVES: "waves",
    COMP: "compound-governance-token",
    MKR: "maker",
    SUSHI: "sushi",
    AAVE: "aave",
    SNX: "havven",
    YFI: "yearn-finance",
    CRV: "curve-dao-token",
    BAL: "balancer",
    ZRX: "0x",
    OMG: "omisego",
    BNT: "bancor",
    REP: "augur",
    GRT: "the-graph",
    ENJ: "enjincoin",
    CHZ: "chiliz",
    BAT: "basic-attention-token",
    QTUM: "qtum",
    ZIL: "zilliqa",
    RVN: "ravencoin",
    NANO: "nano",
    SC: "siacoin",
    DGB: "digibyte",
    STMX: "storm",
    HOT: "holotoken",
    WIN: "wink",
    BUSD: "binance-usd",
    USDC: "usd-coin",
};

const QUOTE = "USDT";
const REFRESH_TIME = 30000; // 30 seconds

const obscureValueString = "******";

// Enhanced price fetching with multiple API fallbacks
const fetchPriceFromFreeAPIs = async (tokenSymbol) => {
    console.log(`🔍 Fetching price for ${tokenSymbol} from free APIs...`);

    // Method 1: Try CoinGecko (most reliable)
    try {
        const coinId =
            COINGECKO_SYMBOL_MAP[tokenSymbol] || tokenSymbol.toLowerCase();
        const response = await axios.get(FREE_APIS.COINGECKO.PRICES, {
            params: {
                ids: coinId,
                vs_currencies: "usd",
            },
            timeout: 8000,
        });

        if (
            response.data &&
            response.data[coinId] &&
            response.data[coinId].usd
        ) {
            const price = Number(response.data[coinId].usd);
            console.log(`✅ CoinGecko price for ${tokenSymbol}: $${price}`);
            return price;
        }
    } catch (error) {
        console.warn(`⚠️ CoinGecko failed for ${tokenSymbol}:`, error.message);
    }

    // Method 2: Try CoinCap
    try {
        const response = await axios.get(
            `${FREE_APIS.COINCAP.ASSETS}/${tokenSymbol.toLowerCase()}`,
            {
                timeout: 8000,
            },
        );

        if (
            response.data &&
            response.data.data &&
            response.data.data.priceUsd
        ) {
            const price = Number(response.data.data.priceUsd);
            console.log(`✅ CoinCap price for ${tokenSymbol}: $${price}`);
            return price;
        }
    } catch (error) {
        console.warn(`⚠️ CoinCap failed for ${tokenSymbol}:`, error.message);
    }

    // Method 3: Try CryptoCompare
    try {
        const response = await axios.get(FREE_APIS.CRYPTOCOMPARE.PRICES, {
            params: {
                fsyms: tokenSymbol,
                tsyms: "USD",
                relaxedValidation: true,
            },
            timeout: 8000,
        });

        if (
            response.data &&
            response.data.RAW &&
            response.data.RAW[tokenSymbol]
        ) {
            const price = Number(response.data.RAW[tokenSymbol].USD.PRICE);
            console.log(`✅ CryptoCompare price for ${tokenSymbol}: $${price}`);
            return price;
        }
    } catch (error) {
        console.warn(
            `⚠️ CryptoCompare failed for ${tokenSymbol}:`,
            error.message,
        );
    }

    // Method 4: Try Binance (as last resort)
    try {
        console.log(`🔄 Trying Binance fallback for ${tokenSymbol}...`);
        const response = await axios.get(FREE_APIS.BINANCE.TICKER, {
            params: { symbol: tokenSymbol + QUOTE },
            timeout: 8000,
        });

        if (response.data && response.data.price) {
            const price = Number(response.data.price);
            console.log(
                `✅ Binance fallback price for ${tokenSymbol}: $${price}`,
            );
            return price;
        }
    } catch (error) {
        console.warn(
            `⚠️ Binance fallback failed for ${tokenSymbol}:`,
            error.message,
        );
    }

    // All APIs failed
    console.error(`❌ All APIs failed for ${tokenSymbol}`);
    return 0;
};

const Asset = ({ item, isHideAsset }) => {
    const currency = useSelector((state) => state.favAssets?.currency) || {
        value: "USD",
        sign: "$",
    };
    const currencyRates = useSelector((state) => state.currencyRates) || {};
    const currencyRate = currencyRates[currency.value] ?? 1;
    const precision = 8;

    // Guard against undefined item
    if (!item) return null;

    return (
        <tr>
            <td className="d-flex align-items-center ps-2">
                <img
                    className="me-2 balance_img"
                    src={item.symbol}
                    alt="coin icon"
                    style={{ width: "40px", height: "40px" }}
                />
                <div>
                    <p className="coin-abbr text-light">{item.tokenName}</p>
                </div>
            </td>
            <td>
                <NumberFormat
                    value={roundNumber(
                        (item.free || 0) + (item.hold || 0),
                        precision,
                    )}
                    className="coin-price fw-bold"
                    displayType={"text"}
                    thousandSeparator={true}
                    renderText={(value, props) => (
                        <p {...props}>
                            {isHideAsset
                                ? obscureValueString
                                : value + " " + item.tokenSymbol}
                        </p>
                    )}
                />
                <NumberFormat
                    value={Number((item.balance || 0) * currencyRate).toFixed(
                        2,
                    )}
                    className="coin-percent"
                    displayType={"text"}
                    thousandSeparator={true}
                    renderText={(value, props) => (
                        <p {...props}>
                            {isHideAsset
                                ? obscureValueString
                                : value + " " + currency.value}
                        </p>
                    )}
                />
            </td>
        </tr>
    );
};

export default function InternalWallet() {
    const dispatch = useDispatch();

    const currency = useSelector((state) => state.favAssets?.currency) || {
        value: "USD",
        sign: "$",
    };
    const currencyRates = useSelector((state) => state.currencyRates) || {};
    const currencyRate = currencyRates[currency.value] ?? 1;

    const { hidden, equity, ndbPrice } = useSelector(
        (state) => state.balance,
    ) || { hidden: false, equity: "USD", ndbPrice: 0 };

    const InitialAssets = {};
    const [myAssets, setMyAssets] = useState(InitialAssets);
    const [myAssetsWithBalance, setMyAssetsWithBalance] = useState({});
    const [BTCPrice, setBTCPrice] = useState(10000);

    const initLoaded = useRef(false);

    const [isDepositOpen, setIsDepositOpen] = useState(false);
    const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

    const totalBalance = useMemo(() => {
        const balances = Object.values(myAssetsWithBalance);
        if (!balances.length) return 0;
        const total = _.sumBy(balances, "balance") || 0;
        console.log(
            "Total balance calculated:",
            total,
            "from assets:",
            balances,
        );
        return total;
    }, [myAssetsWithBalance]);

    useEffect(() => {
        const get_BTCPrice = async () => {
            try {
                const price = await fetchPriceFromFreeAPIs("BTC");
                if (price > 0) {
                    setBTCPrice(price);
                }
            } catch (error) {
                console.error("Error fetching BTC price:", error);
            }
        };

        get_BTCPrice();
        dispatch(fetchNDBPrice());

        const interval = setInterval(() => {
            get_BTCPrice();
            dispatch(fetchNDBPrice());
        }, REFRESH_TIME);

        return () => clearInterval(interval);
    }, [dispatch]);

    const { startPolling, stopPolling } = useQuery(GET_BALANCES, {
        onCompleted: (data) => {
            if (data?.getBalances) {
                let assets = data.getBalances?.map((item) => {
                    return { ...item, symbol: svgToDataURL(item.symbol) };
                });
                assets = _.mapKeys(assets, "tokenSymbol");
                setMyAssets(assets); // Don't spread with old assets, replace completely
            }
        },
        onError: (error) => console.log(error),
        fetchPolicy: "no-cache",
        errorPolicy: "ignore",
        pollInterval: REFRESH_TIME,
        notifyOnNetworkStatusChange: true,
    });

    useEffect(() => {
        if (startPolling && stopPolling) {
            startPolling(REFRESH_TIME);
            return () => stopPolling();
        }
    }, [startPolling, stopPolling]);

    useDeepCompareEffect(() => {
        const get_Balances_Price = async () => {
            if (_.isEmpty(myAssets)) return; // Don't process if no assets

            let assets = { ...myAssets };

            for (const item of Object.values(myAssets)) {
                let price = 0;
                if (!item.tokenSymbol || item.tokenSymbol === "WATT") {
                    price = 0;
                } else if (item.tokenSymbol === "USDT") {
                    price = 1;
                } else if (item.tokenSymbol === "NDB") {
                    price = ndbPrice || 0;
                } else {
                    try {
                        price = await fetchPriceFromFreeAPIs(item.tokenSymbol);
                    } catch (error) {
                        console.error(
                            `Error fetching price for ${item.tokenSymbol}:`,
                            error,
                        );
                        price = 0;
                    }
                }
                const balance = ((item.hold || 0) + (item.free || 0)) * price;
                assets[item.tokenSymbol] = {
                    ...item,
                    price,
                    balance: balance,
                    value: item.tokenSymbol,
                };
            }

            initLoaded.current = true;
            setMyAssetsWithBalance(assets);
        };

        get_Balances_Price();

        // Only set interval if we have assets
        if (!_.isEmpty(myAssets)) {
            const interval1 = setInterval(() => {
                get_Balances_Price();
            }, REFRESH_TIME);

            return () => clearInterval(interval1);
        }
    }, [myAssets, ndbPrice]); // Simplified dependency array

    return (
        <div>
            <div className="profile-value">
                <div className="value-box mt-4 p-3">
                    <div className="value-label d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                            Equity Value ({equity})
                            {!hidden ? (
                                <AiFillEye
                                    className="cursor-pointer"
                                    size="1.5em"
                                    onClick={() =>
                                        dispatch(updateHiddenStatus(true))
                                    }
                                />
                            ) : (
                                <AiFillEyeInvisible
                                    className="cursor-pointer"
                                    size="1.5em"
                                    onClick={() =>
                                        dispatch(updateHiddenStatus(false))
                                    }
                                />
                            )}
                        </div>

                        <div className="d-flex">
                            <div
                                className={`cursor-pointer me-1 ${
                                    equity === "BTC" ? "fw-bold text-white" : ""
                                }`}
                                onClick={() => dispatch(changeEquity("BTC"))}
                                onKeyDown={() => dispatch(changeEquity("BTC"))}
                                role="presentation"
                            >
                                BTC
                            </div>
                            <div>|</div>
                            <div
                                className={`cursor-pointer ms-1 ${
                                    equity !== "BTC" ? "fw-bold text-white" : ""
                                }`}
                                onClick={() =>
                                    dispatch(changeEquity(currency.value))
                                }
                                onKeyDown={() =>
                                    dispatch(changeEquity(currency.value))
                                }
                                role="presentation"
                            >
                                {currency.value}
                            </div>
                        </div>
                    </div>
                    {hidden ? (
                        <>
                            <p className="value">{obscureValueString}</p>
                            <p className="max-value mt-3">
                                {obscureValueString}
                            </p>
                        </>
                    ) : (
                        <>
                            <NumberFormat
                                value={
                                    equity !== "BTC"
                                        ? totalBalance === 0
                                            ? 0
                                            : Number(
                                                  totalBalance * currencyRate,
                                              ).toFixed(2)
                                        : totalBalance === 0
                                          ? 0
                                          : (totalBalance / BTCPrice).toFixed(8)
                                }
                                className="value"
                                displayType="text"
                                thousandSeparator={true}
                                renderText={(value, props) => (
                                    <p {...props}>
                                        {value}{" "}
                                        {equity !== "BTC"
                                            ? currency.value
                                            : "BTC"}
                                    </p>
                                )}
                            />
                            <NumberFormat
                                value={
                                    equity !== "BTC"
                                        ? totalBalance === 0
                                            ? 0
                                            : (totalBalance / BTCPrice).toFixed(
                                                  8,
                                              )
                                        : totalBalance === 0
                                          ? 0
                                          : Number(
                                                totalBalance * currencyRate,
                                            ).toFixed(2)
                                }
                                className="max-value mt-3"
                                displayType="text"
                                thousandSeparator={true}
                                renderText={(value, props) => (
                                    <p {...props}>
                                        ~ {value}{" "}
                                        {equity !== "BTC"
                                            ? "BTC"
                                            : currency.value}
                                    </p>
                                )}
                            />
                        </>
                    )}
                </div>
                <div className="btn-group d-flex justify-content-between mt-3 align-items-center">
                    <div className="col-6 pe-2">
                        <button
                            className="btn btn-outline-light rounded-0 col-12 text-uppercase fw-bold py-2 h4"
                            onClick={() => {
                                setIsDepositOpen(true);
                            }}
                        >
                            deposit
                        </button>
                    </div>
                    <div className="col-6 ps-2">
                        <button
                            className="btn btn-outline-light rounded-0 col-12 text-uppercase fw-bold py-2 h4"
                            onClick={() => {
                                setIsWithdrawOpen(true);
                            }}
                            disabled={!initLoaded.current}
                        >
                            withdraw
                        </button>
                    </div>
                </div>
            </div>
            <div className="mt-4">
                <table className="wallet-transaction-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {_.isEmpty(myAssetsWithBalance) ? (
                            <tr>
                                <td colSpan={2}>
                                    <div className="d-flex justify-content-center mt-4">
                                        <CustomSpinner />
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            _.map(myAssetsWithBalance, (item) => (
                                <Asset
                                    key={item.tokenSymbol}
                                    item={item}
                                    isHideAsset={hidden}
                                />
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <DepositModal
                showModal={isDepositOpen}
                setShowModal={setIsDepositOpen}
            />
            <WithdrawModal
                showModal={isWithdrawOpen}
                setShowModal={setIsWithdrawOpen}
                assets={myAssetsWithBalance}
            />
        </div>
    );
}
