import React, {
    useState,
    useEffect,
    useCallback,
    useReducer,
    useMemo,
} from "react";
import { navigate } from "gatsby";
import { useDispatch, useSelector } from "react-redux";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useQuery, useMutation } from "@apollo/client";
import { Icon } from "@iconify/react";
import axios from "axios";
import _ from "lodash";
import Select, { components } from "react-select";
import { ReactTooltip } from "../../utilities/tooltip";
import NumberFormat from "../../utilities/number";
import CircularProgress from "@mui/material/CircularProgress";
import Countdown from "react-countdown";

import CustomSpinner from "../common/custom-spinner";
import { generateQR } from "../../utilities/string";
import { CheckBox } from "../common/FormControl";
import { set_Temp_Data } from "../../store/actions/tempAction";
import * as Mutation from "../../apollo/graphqls/mutations/Payment";
import { PAYMENT_FRACTION_TOOLTIP_CONTENT } from "../../utilities/staticData";
import * as Query from "./../../apollo/graphqls/querys/Payment";
import { SUPPORTED_COINS } from "../../utilities/staticData2";
import { QUOTE, TICKER_24hr } from "./data";
import { roundNumber } from "../../utilities/number";
import { useAuction } from "../../providers/auction-context";
import { ROUTES } from "../../utilities/routes";
import PaymentSuccessful from "./PaymentSuccessful";

const { Option } = components;

const SelectOption = (props) => {
    const { data } = props;
    return (
        <Option {...props}>
            <div className="d-flex justify-content-start align-items-center ">
                <img
                    src={data.icon}
                    style={{ width: "30px", height: "30px" }}
                    alt={data.value}
                />
                <p className="coin-label ms-2">{data.value}</p>
            </div>
        </Option>
    );
};

// Renderer callback with condition
const countDownRenderer = ({ minutes, seconds, completed }) => {
    if (completed) {
        // Render a completed state
        navigate(ROUTES.auction);
        return <></>;
    } else {
        // Render a countdown
        return (
            <>
                <span className="me-2">PAYMENT EXPIRES IN</span>
                <span className="txt-green">
                    {minutes}m: {seconds}s
                </span>
            </>
        );
    }
};

const SESSION_EXPIRE_TIME = 10 * 60 * 1000;

const CoinPaymentsTab = ({ currentRound, bidAmount, paySuccess }) => {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
    const { order_id } = useSelector((state) => state.placeBid);
    const { allFees } = useSelector((state) => state);

    const auction = useAuction();
    const { isAuction } = auction;

    const [copied, setCopied] = useState({
        coinQuantity: false,
        depositAddress: false,
    });

    const [fooCoins, setFooCoins] = useState([]);
    const [BTCPrice, setBTCPrice] = useState(null);

    const loadingData = _.isEmpty(fooCoins) || !BTCPrice || _.isEmpty(allFees);

    const [coin, setCoin] = useState({});
    const [network, setNetwork] = useState(null);
    const [pending, setPending] = useState(false);

    const [coinQuantity, setCoinQuantity] = useState("");

    const [state, setState] = useReducer(
        (old, action) => ({ ...old, ...action }),
        {
            allow_fraction: false,
        },
    );
    const { allow_fraction } = state;

    const [coinQRCode, setCoinQRCode] = useState("");
    const [depositAddress, setDepositAddress] = useState("");
    const [paymentId, setPaymentId] = useState(null);
    const [createdAt, setCreatedAt] = useState(null);

    const networks = useMemo(() => coin.networks, [coin]);

    const transactionFee = useMemo(() => {
        const fee = allFees[user?.tierLevel]?.fee;
        const txnFee = (bidAmount * (0.5 + fee)) / 100;
        if (isNaN(txnFee)) return null;
        return txnFee.toFixed(4);
    }, [allFees, bidAmount, user]);

    useQuery(Query.GET_EXCHANGE_RATE, {
        onCompleted: (data) => {
            if (data.getExchangeRate) {
                const temp = JSON.parse(data.getExchangeRate);
                const coins = SUPPORTED_COINS?.filter(
                    (item) => item.value !== "NDB",
                ).map((item) => {
                    return { ...item, detail: temp?.result[item.value] };
                });
                setFooCoins(coins);
                setCoin(coins[0]);
            }
        },
        onError: (err) => {
            console.log("get exchange rate: ", err);
        },
    });

    useEffect(() => {
        (async function () {
            // Fetch the price of BTC
            const { data: BTCPriceData } = await axios.get(TICKER_24hr, {
                params: { symbol: "BTC" + QUOTE },
            });
            setBTCPrice(BTCPriceData.lastPrice);
        })();
    }, []);

    useEffect(() => {
        let coinPrice = BTCPrice * coin?.detail?.rate_btc;
        if (coin.label === "USDT") coinPrice = 1;
        let precision = 8;

        let quantity = parseFloat((bidAmount / coinPrice).toFixed(precision));
        if (quantity === Infinity) quantity = null;
        setCoinQuantity(quantity);

        const tempData = {
            coinValue: quantity,
            coinSymbol: coin.value,
            paymentId,
            transactionFee,
            createdAt,
        };
        dispatch(set_Temp_Data(tempData));
    }, [
        bidAmount,
        coin,
        BTCPrice,
        paymentId,
        transactionFee,
        createdAt,
        dispatch,
    ]);

    useEffect(() => {
        (async function () {
            if (depositAddress) {
                const qrCode = await generateQR(depositAddress);
                setCoinQRCode(qrCode);
            }
            return "";
        })();
    }, [depositAddress]);

    const [createCryptoPaymentMutation] = useMutation(
        Mutation.CREATE_CRYPTO_PAYMENT,
        {
            onCompleted: (data) => {
                if (data.createCryptoPaymentForAuction) {
                    const resData = data.createCryptoPaymentForAuction;

                    setDepositAddress(resData?.depositAddress);
                    setPaymentId(resData?.id);
                    setCreatedAt(Date.now());
                }
                setPending(false);
            },
            onError: (err) => {
                console.log("get deposit address: ", err);
                setPending(false);
            },
        },
    );

    const [createChargeForPresaleMutation] = useMutation(
        Mutation.CREATE_CHARGE_FOR_PRESALE,
        {
            onCompleted: (data) => {
                if (data.createChargeForPresale) {
                    const resData = data.createChargeForPresale;

                    setDepositAddress(resData?.depositAddress);
                    setPaymentId(resData?.id);
                    setCreatedAt(Date.now());
                }
                setPending(false);
            },
            onError: (err) => {
                console.log("get deposit address for presale", err);
                setPending(false);
            },
        },
    );

    const create_Crypto_Payment = () => {
        setPending(true);
        if (isAuction) {
            const createData = {
                roundId: currentRound,
                cryptoType: coin.value,
                network: network.network,
                coin: network.value,
            };

            createCryptoPaymentMutation({
                variables: { ...createData },
            });
        } else {
            const createData = {
                presaleId: currentRound,
                orderId: order_id,
                coin: network.value,
                network: network.network,
                cryptoType: coin.value,
            };

            createChargeForPresaleMutation({
                variables: { ...createData },
            });
        }
    };

    const handleAllowFraction = useCallback(
        (e) => {
            e.preventDefault();
            setState({ allow_fraction: !allow_fraction });
        },
        [allow_fraction],
    );

    const handleCopyToClipboard = (item) => {
        setCopied({ ...copied, [item]: true });
        setTimeout(() => {
            setCopied({ ...copied, [item]: false });
        }, 1000);
    };

    return loadingData ? (
        <div className="text-center">
            <CustomSpinner />
        </div>
    ) : (
        <div className="cryptocoin-tab">
            {paySuccess ? (
                <PaymentSuccessful />
            ) : (
                <div className="payment-content">
                    <div className="set-cryptocoin">
                        <div className="d-flex flex-column coin-address">
                            <div className="d-flex justify-content-between cryptocoin-select-amount">
                                <Select
                                    className="cryptocoin-select"
                                    options={fooCoins}
                                    value={coin}
                                    onChange={(v) => {
                                        setCoin(v);
                                        setNetwork(null);
                                        setDepositAddress("");
                                        setPaymentId(null);
                                    }}
                                    components={{
                                        Option: SelectOption,
                                        SingleValue: SelectOption,
                                    }}
                                    styles={customSelectWithIconStyles}
                                />
                                <div className="cryptocoin-amount">
                                    <CopyToClipboard
                                        onCopy={() =>
                                            handleCopyToClipboard(
                                                "coinQuantity",
                                            )
                                        }
                                        text={coinQuantity}
                                        options={{ message: "copied" }}
                                    >
                                        <div className="show_value cursor-pointer">
                                            <NumberFormat
                                                className="coin_value"
                                                displayType={"text"}
                                                value={coinQuantity}
                                                thousandSeparator={true}
                                                renderText={(value, props) => (
                                                    <p {...props}>{value}</p>
                                                )}
                                            />
                                            <div className="d-flex">
                                                <NumberFormat
                                                    className="order_value"
                                                    displayType={"text"}
                                                    value={roundNumber(
                                                        bidAmount,
                                                        2,
                                                    )}
                                                    suffix={` USD`}
                                                    thousandSeparator={true}
                                                    renderText={(
                                                        value,
                                                        props,
                                                    ) => (
                                                        <p {...props}>
                                                            ~ {value}
                                                        </p>
                                                    )}
                                                />
                                                <span
                                                    className="cursor-pointer me-2"
                                                    onClick={() =>
                                                        handleCopyToClipboard(
                                                            "coinQuantity",
                                                        )
                                                    }
                                                    onKeyDown={() =>
                                                        handleCopyToClipboard(
                                                            "coinQuantity",
                                                        )
                                                    }
                                                >
                                                    {copied.coinQuantity ? (
                                                        <Icon
                                                            icon="fluent:copy-24-filled"
                                                            className="fs-22px"
                                                        />
                                                    ) : (
                                                        <Icon
                                                            icon="fluent:copy-24-regular"
                                                            className="fs-22px"
                                                        />
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </CopyToClipboard>
                                </div>
                            </div>
                            {!depositAddress ? (
                                <>
                                    <div className="d-flex justify-content-between w-100">
                                        <Select
                                            className="w-100"
                                            options={networks}
                                            value={network}
                                            onChange={(v) => {
                                                setNetwork(v);
                                                setDepositAddress("");
                                            }}
                                            styles={customSelectStyles}
                                            placeholder="SELECT NETWORK"
                                            isSearchable={false}
                                        />
                                    </div>
                                    <button
                                        className="btn btn-light rounded-0 text-uppercase fw-bold mt-2 py-10px w-100"
                                        onClick={create_Crypto_Payment}
                                        disabled={!network}
                                    >
                                        {pending ? (
                                            <CircularProgress
                                                sx={{ color: "black" }}
                                                size={20}
                                            />
                                        ) : (
                                            "get deposit address"
                                        )}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <CopyToClipboard
                                        onCopy={() =>
                                            handleCopyToClipboard(
                                                "depositAddress",
                                            )
                                        }
                                        text={depositAddress}
                                        options={{ message: "copied" }}
                                    >
                                        <p
                                            className="clipboard"
                                            onClick={() =>
                                                handleCopyToClipboard(
                                                    "depositAddress",
                                                )
                                            }
                                            onKeyDown={() =>
                                                handleCopyToClipboard(
                                                    "depositAddress",
                                                )
                                            }
                                            role="presentation"
                                        >
                                            <code>{depositAddress}</code>
                                            {copied.depositAddress ? (
                                                <Icon
                                                    icon="fluent:copy-24-filled"
                                                    className="fs-22px text-black"
                                                />
                                            ) : (
                                                <Icon
                                                    icon="fluent:copy-24-regular"
                                                    className="fs-22px text-black"
                                                />
                                            )}
                                        </p>
                                    </CopyToClipboard>
                                </>
                            )}
                        </div>
                        {depositAddress && (
                            <div className="qr-code">
                                {coinQRCode ? (
                                    <img src={coinQRCode} alt="qrcode" />
                                ) : (
                                    ""
                                )}
                            </div>
                        )}
                    </div>
                    {depositAddress && (
                        <p className="inform">
                            Send only <span>{coin.value}</span> to this deposit
                            address. Ensure the network is{" "}
                            <span>{network.label}</span>
                        </p>
                    )}
                    <div className="mt-3 d-flex justify-content-between">
                        <div className="d-flex flex-row align-items-center">
                            <CheckBox
                                type="checkbox"
                                name="allow_fraction"
                                value={allow_fraction}
                                onChange={handleAllowFraction}
                                className="text-uppercase"
                            />
                            <div className="allow-text text-light">
                                Do you allow fraction of order completion?
                                <span
                                    className="ms-2 fs-20px"
                                    data-tip="React-tooltip"
                                    data-for="coinpayments-tooltip"
                                >
                                    <Icon icon="bi:question-circle" />
                                </span>
                            </div>
                            <ReactTooltip
                                place="right"
                                type="light"
                                effect="solid"
                                id="coinpayments-tooltip"
                            >
                                <div
                                    className="text-justify"
                                    style={{
                                        width: "300px",
                                    }}
                                >
                                    {PAYMENT_FRACTION_TOOLTIP_CONTENT}
                                </div>
                            </ReactTooltip>
                        </div>
                        {depositAddress && createdAt && (
                            <p className="payment-expire my-auto">
                                <Countdown
                                    date={createdAt + SESSION_EXPIRE_TIME}
                                    renderer={countDownRenderer}
                                />
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CoinPaymentsTab;

const customSelectWithIconStyles = {
    input: (provided) => ({
        ...provided,
        position: "absolute",
        color: "transparent",
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected ? "#000000" : undefined,
        borderBottom: "1px solid dimgrey",
        cursor: "pointer",
        ":hover": {
            backgroundColor: "inherit",
        },
    }),
    menu: (provided) => ({
        ...provided,
        backgroundColor: "#1e1e1e",
        border: "1px solid white",
        borderRadius: 0,
        padding: 0,
    }),
    menuList: (provided) => ({
        ...provided,
        margin: 0,
        padding: 0,
    }),
};

const customSelectStyles = {
    option: (provided, state) => ({
        ...provided,
        color: "white",
        fontWeight: 500,
        backgroundColor: state.isSelected ? "#000000" : undefined,
        borderBottom: "1px solid dimgrey",
        cursor: "pointer",
        ":hover": {
            backgroundColor: "inherit",
        },
    }),
    control: (provided) => ({
        ...provided,
        backgroundColor: "#1e1e1e",
        borderColor: "white",
        borderRadius: 0,
        height: 46,
        cursor: "pointer",
    }),
    menu: (provided) => ({
        ...provided,
        backgroundColor: "#1e1e1e",
        border: "1px solid white",
        borderRadius: 0,
        padding: 0,
    }),
    menuList: (provided) => ({
        ...provided,
        margin: 0,
        padding: 0,
    }),
    singleValue: (provided) => ({
        ...provided,
        color: "white",
        padding: 8,
        fontSize: 18,
        fontWeight: 600,
    }),
    input: (provided) => ({
        ...provided,
        color: "white",
        padding: 8,
        fontSize: 18,
        fontWeight: 600,
    }),
    placeholder: (provided) => ({
        ...provided,
        padding: 8,
        fontSize: 18,
        fontWeight: 600,
        color: "#ffffff",
    }),
};
