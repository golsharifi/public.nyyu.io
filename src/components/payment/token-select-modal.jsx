import React, { useState, useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { navigate } from "gatsby";
import Modal from "react-modal";
import Select, { components } from "react-select";
import { useQuery, useMutation } from "@apollo/client";
import { useNetwork } from "../../utilities/wagmi-hooks";
import { useSendTransaction } from "wagmi";
import _ from "lodash";
import { CircularProgress } from "@mui/material";
import Web3 from "web3";
import { BigNumber } from "../../utilities/ethers-utils";
import NumberFormat from "../../utilities/number";
import { roundNumber } from "../../utilities/number";
import { QUOTE, TICKER_24hr } from "./data";
import { ERC20_ABI } from "../../utilities/staticData2";
import { CloseIcon } from "../../utilities/imgImport";
import * as Query from "./../../apollo/graphqls/querys/Payment";
import * as Mutation from "./../../apollo/graphqls/mutations/Payment";
import { ROUTES } from "../../utilities/routes";
import CustomSpinner from "../common/custom-spinner";

const BSC_JSON_RPC = "https://bsc-dataseed.binance.org/";
const ETH_JSON_RPC =
    "https://mainnet.infura.io/v3/03021c5a727a40eb8d086a4d46d32ec7";

const { Option } = components;

const SelectOption = (props) => {
    const { data } = props;
    return (
        <Option {...props}>
            <div className="d-flex align-items-center ">
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

export default function TokenSelectModal({
    isTokenModalOpen,
    closeModal,
    accountInfo,
    SUPPORTED_COINS,
    defaultNetwork,
}) {
    // load from redux
    const {
        round_id: currentRound,
        bid_amount: bidAmount,
        order_id: orderId,
    } = useSelector((state) => state?.placeBid);

    const { activeChain, switchNetworkAsync } = useNetwork();
    const [supportedCoins, setSupportedCoins] = useState([]);
    const [selectedCoin, setSelectedCoin] = useState({});
    const [network, setNetwork] = useState(defaultNetwork);
    const [sufficient, setSufficient] = useState(true);
    const [balance, setBalance] = useState(0);
    const [coinQuantity, setCoinQuantity] = useState(0);
    const [pending, setPending] = useState(true);
    const [loading, setLoading] = useState(true);
    const [BTCPrice, setBTCPrice] = useState(null);
    const networks = useMemo(() => selectedCoin?.networks, [selectedCoin]);

    const { sendTransactionAsync } = useSendTransaction();

    useQuery(Query.GET_EXCHANGE_RATE, {
        onCompleted: (data) => {
            if (data.getExchangeRate) {
                const temp = JSON.parse(data.getExchangeRate);
                // console.log(temp)
                const coins = SUPPORTED_COINS?.filter((item) => {
                    if (
                        item.label !== "BTC" &&
                        item.label !== "NDB" &&
                        item.label !== "SOL"
                    )
                        return item;
                    return null;
                }).map((item) => {
                    const nets = item.networks.filter((i) => {
                        if (i.network === "ERC20" || i.network === "BEP20")
                            return i;
                        return null;
                    });
                    item.networks = nets;
                    return { ...item, detail: temp?.result[item.value] };
                });

                setSupportedCoins(coins);
                setSelectedCoin(coins[0]);

                setNetwork(null);
                setBalance(0);
                setSufficient(true);
            }
            setLoading(false);
            setPending(false);
        },
        onError: (err) => {
            console.log("get exchange rate: ", err);
            setLoading(false);
            setPending(false);
        },
    });

    // console.log(supportedCoins)

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
        let coinPrice = BTCPrice * selectedCoin?.detail?.rate_btc;
        if (selectedCoin.label === "USDT") coinPrice = 1;
        let precision = 8;

        let quantity = parseFloat((bidAmount / coinPrice).toFixed(precision));
        if (quantity === Infinity) quantity = null;
        setCoinQuantity(quantity);
    }, [bidAmount, selectedCoin, BTCPrice]);

    const [updateTransactionHash] = useMutation(
        Mutation.UPDATE_TRANSACTION_HASH,
    );

    const [createChargeForPresale] = useMutation(
        Mutation.CREATE_CHARGE_FOR_PRESALE,
        {
            onCompleted: async (data) => {
                if (data.createChargeForPresale) {
                    const resData = data.createChargeForPresale;

                    // transfer funds to deposit address
                    const weiUnit = 100000000;
                    let _payAmount = resData?.cryptoAmount * weiUnit;
                    const payamount = _payAmount * 10000000000;
                    try {
                        const result = await sendTransactionAsync({
                            request: {
                                to: resData?.depositAddress,
                                value: BigNumber.from(_.toInteger(payamount)),
                            },
                        });

                        // update tx hash
                        const hash = result.hash;
                        updateTransactionHash({
                            variables: {
                                id: resData.id,
                                txHash: hash,
                            },
                        });

                        await navigate(ROUTES.auction);
                    } catch (error) {
                        console.log(error);
                        setPending(false);
                    }
                }
            },
            onError: (err) => {
                console.log("get deposit address: ", err);
                setPending(false);
            },
        },
    );

    const [createChargeForAuction] = useMutation(
        Mutation.CREATE_CRYPTO_PAYMENT,
        {
            onCompleted: async (data) => {
                if (data.createCryptoPaymentForAuction) {
                    const resData = data.createCryptoPaymentForAuction;

                    const weiUnit = 100000000;
                    let _payAmount = resData?.cryptoAmount * weiUnit;
                    const payamount = _payAmount * 10000000000;

                    try {
                        const result = await sendTransactionAsync({
                            request: {
                                to: resData?.depositAddress,
                                value: BigNumber.from(_.toInteger(payamount)),
                            },
                        });

                        // update tx hash
                        const hash = result.hash;
                        updateTransactionHash({
                            variables: {
                                id: resData.id,
                                txHash: hash,
                            },
                        });

                        await navigate(ROUTES.auction);
                    } catch (error) {
                        setPending(false);
                    }
                }
            },
            onError: (err) => {},
        },
    );

    const confirmToPay = async () => {
        // check chainId with selected network
        if (network && network.network === "ERC20" && activeChain.id !== 1) {
            await switchNetworkAsync(1);
            setPending(false);
            closeModal();
        } else if (
            network &&
            network.network === "BEP20" &&
            activeChain.id !== 56
        ) {
            await switchNetworkAsync(56);
            setPending(false);
            closeModal();
        }
        setPending(true);

        // checking auction or presale
        if (orderId === 0) {
            // auction
            const createdData = {
                roundId: currentRound,
                cryptoType: selectedCoin.value,
                network: network.network,
                coin: network.value,
            };
            createChargeForAuction({
                variables: { ...createdData },
            });
        } else {
            const createdData = {
                presaleId: currentRound,
                orderId,
                cryptoType: selectedCoin.value,
                network: network.network,
                coin: network.value,
            };
            createChargeForPresale({
                variables: { ...createdData },
            });
        }
    };

    const onChangeNetwork = async (v) => {
        setPending(true);
        setNetwork(v);

        if (!activeChain) return;
        const web3 =
            v.network === "ERC20"
                ? new Web3(ETH_JSON_RPC)
                : new Web3(BSC_JSON_RPC);
        const contract = new web3.eth.Contract(ERC20_ABI, v.address);

        let _balance = 0;
        if (
            (v.network === "ERC20" && selectedCoin.value === "ETH") ||
            (v.network === "BEP20" && selectedCoin.value === "BNB")
        ) {
            const bal = await web3.eth.getBalance(accountInfo.address);
            _balance = web3.utils.fromWei(bal, "ether"); //
        } else {
            _balance = await contract.methods
                .balanceOf(accountInfo.address)
                .call();
            _balance = web3.utils.fromWei(_balance, "ether"); //
        }
        setBalance(_balance);

        if (_balance > coinQuantity) setSufficient(true);
        else setSufficient(false);
        setPending(false);
    };

    const onChangeCoin = (v) => {
        setSelectedCoin(v);
        setNetwork(null);
        setBalance(0);
        setSufficient(true);
    };

    return (
        <Modal
            isOpen={isTokenModalOpen}
            onRequestClose={closeModal}
            ariaHideApp={false}
            className="twoFA-modal"
            overlayClassName="2fa-modal__overlay"
        >
            <div className="tfa-modal__header">
                <div
                    onClick={() => closeModal()}
                    onKeyDown={() => closeModal()}
                    role="button"
                    tabIndex="0"
                >
                    <img
                        width="14px"
                        height="14px"
                        src={CloseIcon}
                        alt="close"
                    />
                </div>
            </div>
            <div className="twoFA-modal__body">
                <div className="payment-page">
                    <div className="payment-type__tab">
                        <div className="cryptocoin-tab">
                            <div
                                style={{
                                    color: "white",
                                    textAlign: "center",
                                    fontSize: "20px",
                                }}
                            >
                                {accountInfo?.connector && (
                                    <>
                                        Select Token To Pay in{" "}
                                        {accountInfo.connector?.name}
                                    </>
                                )}
                            </div>
                            <div className="payment-content">
                                {loading ? (
                                    <div className="text-center my-3">
                                        <CustomSpinner />
                                    </div>
                                ) : (
                                    <div className="set-cryptocoin">
                                        <div className="d-flex flex-column justify-content-between coin-address">
                                            <div className="d-flex justify-content-between cryptocoin-select-amount">
                                                <Select
                                                    className="cryptocoin-select"
                                                    options={supportedCoins}
                                                    value={selectedCoin}
                                                    onChange={(v) =>
                                                        onChangeCoin(v)
                                                    }
                                                    components={{
                                                        Option: SelectOption,
                                                        SingleValue:
                                                            SelectOption,
                                                    }}
                                                    styles={
                                                        customSelectWithIconStyles
                                                    }
                                                />
                                                <div className="cryptocoin-amount">
                                                    <div className="show_value">
                                                        <NumberFormat
                                                            className="coin_value"
                                                            displayType={"text"}
                                                            value={roundNumber(
                                                                coinQuantity,
                                                                8,
                                                            )}
                                                            thousandSeparator={
                                                                true
                                                            }
                                                            renderText={(
                                                                value,
                                                                props,
                                                            ) => (
                                                                <p {...props}>
                                                                    {value}
                                                                </p>
                                                            )}
                                                        />
                                                        <NumberFormat
                                                            className="order_value"
                                                            displayType={"text"}
                                                            value={roundNumber(
                                                                bidAmount,
                                                                2,
                                                            )}
                                                            suffix={` USD`}
                                                            thousandSeparator={
                                                                true
                                                            }
                                                            renderText={(
                                                                value,
                                                                props,
                                                            ) => (
                                                                <p {...props}>
                                                                    ~ {value}
                                                                </p>
                                                            )}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="d-flex justify-content-between w-100">
                                                <Select
                                                    className="w-100"
                                                    options={networks}
                                                    value={network}
                                                    onChange={(e) =>
                                                        onChangeNetwork(e)
                                                    }
                                                    styles={customSelectStyles}
                                                    placeholder="SELECT NETWORK"
                                                    isSearchable={false}
                                                />
                                            </div>
                                            {!sufficient && (
                                                <div
                                                    className="py-2"
                                                    style={{ color: "#e8503a" }}
                                                >
                                                    {`Your balance is ${roundNumber(balance, 8)} ${selectedCoin.value}.`}
                                                </div>
                                            )}
                                            {balance !== 0 && sufficient && (
                                                <div
                                                    className="py-2"
                                                    style={{ color: "#65e83a" }}
                                                >
                                                    {`Your have enough ${roundNumber(balance, 8)} ${selectedCoin.value} to pay.`}
                                                </div>
                                            )}
                                            <button
                                                className="btn btn-light rounded-0 text-uppercase fw-bold mt-2 py-10px w-100"
                                                onClick={confirmToPay}
                                                disabled={
                                                    !sufficient ||
                                                    network === "" ||
                                                    network === null
                                                }
                                            >
                                                {pending ? (
                                                    <CircularProgress
                                                        sx={{ color: "black" }}
                                                        size={20}
                                                    />
                                                ) : (
                                                    "Confirm"
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}

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
