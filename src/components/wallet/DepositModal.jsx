import React, { useState, useEffect, useMemo } from "react";
import jq from "jquery";
import parse from "html-react-parser";
import Modal from "react-modal";
import _ from "lodash";
import styled from "styled-components";
import Select, { components } from "react-select";
import NumberFormat from "../../utilities/number";
import Loading from "../common/Loading";
import { Icon } from "@iconify/react";
import { useMutation, useQuery } from "@apollo/client";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { generateQR } from "../../utilities/string";
import CustomSpinner from "../common/custom-spinner";
import StripeDepositSection from "./deposit/StripeDepositSection";
import { GET_ALL_FEES } from "../../apollo/graphqls/querys/Payment";
import {
    getStripePaymentFee,
    getPaypalPaymentFee,
    getBankTransferFee,
} from "../../utilities/utility-methods";
import { useSelector } from "react-redux";
import {
    Plaid,
    PaypalFiat,
    CreditCards,
    USDT,
} from "../../utilities/imgImport";
import { SUPPORTED_COINS } from "../../utilities/staticData2";
import * as Mutation from "../../apollo/graphqls/mutations/Payment";
import * as Query from "../../apollo/graphqls/querys/Payment";
import {
    setCookie,
    NDB_Paypal_TrxType,
    NDB_Deposit,
} from "../../utilities/cookies";
import { roundNumber } from "../../utilities/number";
import CountDownDeposit from "../../components/common/CountdownDeposit";

const IntervalTime = 5 * 1000;

const CURRENCIES = [
    { label: "USD", value: "USD", symbol: "$" },
    { label: "GBP", value: "GBP", symbol: "£" },
    { label: "EUR", value: "EUR", symbol: "€" },
];

const CURRENCIES_BANK = [
    { label: "USD", value: "USD", symbol: "$" },
    { label: "GBP", value: "GBP", symbol: "£" },
    { label: "EUR", value: "EUR", symbol: "€" },
];

const DEPOSIT_COINS = SUPPORTED_COINS.filter((item) => item.value !== "NDB");

const BankTransferData = {
    EUR: {
        "Account holder": "NYYU UAB",
        BIC: "REVOLT21",
        IBAN: "LT89 3250 0581 6682 8541",
        Address: "Kalvarijų gatvė 125, 08221, Vilnius, Lithuania",
    },
    GBP: {
        "Account holder": "NYYU UAB",
        "Sort code": "04-00-75",
        "Account number": "76232735",
        BIC: "REVOLT21",
        IBAN: "LT89 3250 0581 6682 8541",
        "Intermediary BIC": "CHASGB2L",
        Address: "Kalvarijų gatvė 125, 08221, Vilnius, Lithuania",
    },
    USD: {
        "Account holder": "NYYU UAB",
        BIC: "REVOLT21",
        IBAN: "LT89 3250 0581 6682 8541",
        Address: "Kalvarijų gatvė 125, 08221, Vilnius, Lithuania",
    },
};

const BankTrxDescription = {
    first: "Incoming payments can take 3 working days to be added to your wallet",
    second: `Please make sure you use the
        <span className="txt-green">reference number</span>
        indicated above when you are making the transfer, otherwise we may not be able to locate your transaction.`,
};

const { Option } = components;
const MIN_VALUE = 1;

const CRYPTOCURRENCY = "CRYPTOCURRENCY";
const PAYPAL = "PAYPAL";
const STRIP = "STRIP";
const BANKTRANSER = "BANKTRANSER";
const MPESA = "MPESA";

const SelectOption = (props) => {
    return (
        <Option {...props}>
            <div className="d-flex justify-content-sm-start align-items-center ">
                <img
                    src={props.data?.icon}
                    style={{ width: "30px", height: "30px" }}
                    alt={props.data.value}
                />
                <p className="coin-label ms-3">{props.data?.label}</p>
            </div>
        </Option>
    );
};

export default function DepositModal({ showModal, setShowModal }) {
    const user = useSelector((state) => state.auth.user);
    const [selectedAsset, setSelectedAsset] = useState(SUPPORTED_COINS[0]);
    const [currentStep, setCurrentStep] = useState(1);
    const [tabIndex, setTabIndex] = useState(1);
    const [copied, setCopied] = useState(false);
    const [pending, setPending] = useState(false);
    const [error, setError] = useState("");

    const [coinQRCode, setCoinQRCode] = useState("");
    const [loading, setLoading] = useState(false);

    const networks = useMemo(() => selectedAsset.networks, [selectedAsset]);
    const [network, setNetwork] = useState(networks[0]);
    const [depositData, setDepositData] = useState(null);
    const [confirmById, setConfirmById] = useState(null);

    // Variables for bank transfer
    const [currency, setCurrency] = useState(CURRENCIES[0]);
    const [transferAmount, setTransferAmount] = useState("");
    const [referenceNumber, setReferenceNumber] = useState(null);

    // MPESA specific state
    const [mpesaPhone, setMpesaPhone] = useState("");

    const [copyText, setCopyText] = useState("");
    const [depositType, setDepositType] = useState("");
    const [allFees, setAllFees] = useState({});

    const loadingStripe = !allFees;

    useEffect(() => {
        (async function () {
            if (depositData?.depositAddress) {
                const qrCode = await generateQR(depositData?.depositAddress);
                setCoinQRCode(qrCode);
            }
            return "";
        })();
    }, [depositData]);

    useEffect(() => {
        setError("");
    }, [tabIndex, currentStep]);

    useQuery(GET_ALL_FEES, {
        onCompleted: (data) => {
            setAllFees(_.mapKeys(data.getAllFees, "tierLevel"));
        },
        onError: (error) => console.log(error),
    });

    const [createChargeForDepositMutation] = useMutation(
        Mutation.CREATE_CHARGE_FOR_DEPOSIT,
        {
            onCompleted: (data) => {
                if (data?.createChargeForDeposit) {
                    const resData = data?.createChargeForDeposit;
                    setDepositData(resData);
                    setPending(false);
                    setCurrentStep(2);
                }
                setError("");
            },
            onError: (err) => {
                setError(err.message);
                setPending(false);
            },
        },
    );

    const goBackToMain = () => {
        setDepositData(null);
        setConfirmById(null);
        setCurrency(CURRENCIES[0]);
        setTransferAmount("");
        setMpesaPhone("");
        setCurrentStep(1);
    };

    const create_Charge_For_Deposit = () => {
        setError("");
        setPending(true);
        setDepositType(CRYPTOCURRENCY);
        const createData = {
            coin: network.value,
            network: network.network,
            cryptoType: selectedAsset.value,
        };
        createChargeForDepositMutation({
            variables: { ...createData },
        });
    };

    // MPESA handler function
    const handleMpesaDeposit = async () => {
        if (!transferAmount || !mpesaPhone) {
            setError("Please enter amount and phone number");
            return;
        }

        if (transferAmount < 100) {
            setError("Minimum deposit amount is 100 KES");
            return;
        }

        if (transferAmount > 150000) {
            setError("Maximum deposit amount is 150,000 KES");
            return;
        }

        if (mpesaPhone.length !== 9) {
            setError("Please enter a valid 9-digit phone number");
            return;
        }

        // Validate phone number starts with 7 (Kenyan mobile format)
        if (!mpesaPhone.startsWith("7")) {
            setError("Phone number must start with 7 (e.g., 712345678)");
            return;
        }

        setPending(true);
        setError("");

        try {
            // TODO: Replace with actual MPESA GraphQL mutation when backend is ready
            console.log("🚀 MPESA Deposit Request:", {
                amount: transferAmount,
                phone: `+254${mpesaPhone}`,
                currency: "KES",
                cryptoType: "USDT",
                userId: user?.id,
            });

            // Simulate API call for now (remove this when backend is ready)
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Simulate success response (remove this when backend is ready)
            setError("");
            alert(
                `M-PESA payment request sent to +254${mpesaPhone} for ${transferAmount} KES.\n\nPlease check your phone and enter your M-PESA PIN to complete the transaction.\n\nYou will receive approximately ${(transferAmount * 0.0067).toFixed(2)} USDT in your wallet once payment is confirmed.`,
            );

            // Reset form and close modal
            setTransferAmount("");
            setMpesaPhone("");
            setCurrentStep(1);
            closeModal();
        } catch (error) {
            console.error("MPESA deposit error:", error);
            setError("Failed to initiate M-PESA payment. Please try again.");
        } finally {
            setPending(false);
        }
    };

    const { startPolling, stopPolling } = useQuery(
        Query.GET_COINPAYMENT_DEPOSITTX_BYID,
        {
            variables: {
                id: depositData?.id,
            },
            onCompleted: (data) => {
                if (data.getCoinpaymentDepositTxById) {
                    setConfirmById(data.getCoinpaymentDepositTxById);
                }
            },
            onError: (err) => {
                console.log("Transaction query error:", err.message);

                // Handle "Transaction not found" error gracefully
                if (err.message.includes("Transaction not found")) {
                    console.log("Transaction not found, stopping polling");
                    stopPolling();
                    // Optionally clear the deposit data or show a message
                    // setDepositData(null);
                } else {
                    console.error("Unexpected error:", err);
                }
            },
            pollInterval: IntervalTime,
            notifyOnNetworkStatusChange: true,
            // Skip the query if no deposit ID is available
            skip: !depositData?.id,
            // Don't show error notifications for expected "not found" errors
            errorPolicy: "all",
        },
    );

    useEffect(() => {
        if (depositData?.id) {
            console.log("Starting polling for transaction ID:", depositData.id);
            return startPolling(IntervalTime);
        } else {
            console.log("No deposit ID, stopping polling");
            return stopPolling();
        }
    }, [depositData?.id, startPolling, stopPolling]);
    //-----------------------------------------------------------------

    const closeModal = () => {
        setDepositData(null);
        setTransferAmount("");
        setMpesaPhone("");
        setShowModal(false);
    };

    const handleCopy = () => {
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
        }, 1000);
    };

    const handleCopyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopyText(text);
    };

    const [paypalDeposit] = useMutation(Mutation.PAYPAL_FOR_DEPOSIT, {
        onCompleted: (data) => {
            let links = data.paypalForDeposit.links;
            for (let i = 0; i < links.length; i++) {
                if (links[i].rel === "approve") {
                    window.location.href = links[i].href;
                    break;
                }
            }
            setLoading(false);
            setError("");
        },
        onError: (err) => {
            setError(err.message);
            setLoading(false);
        },
    });

    const initPaypalCheckout = () => {
        setCookie(NDB_Paypal_TrxType, NDB_Deposit);
        setLoading(true);
        paypalDeposit({
            variables: {
                amount: transferAmount,
                currencyCode: currency.value,
                cryptoType: "USDT",
            },
        });
    };

    const [bankForDeposit] = useMutation(Mutation.BANK_FOR_DEPOSIT, {
        onCompleted: (data) => {
            if (data.bankForDeposit) {
                setPending(false);
                setReferenceNumber(data.bankForDeposit);
                setCurrentStep(3);
            }
            setError("");
            setPending(false);
        },
        onError: (err) => {
            setError(err.message);
            setPending(false);
        },
    });

    const handleBankForDeposit = () => {
        setPending(true);
        bankForDeposit();
    };

    if (loading) return <Loading />;

    return (
        <Modal
            isOpen={showModal}
            onRequestClose={closeModal}
            className="deposit-modal"
            overlayClassName="deposit-widthdraw-modal__overlay"
            ariaHideApp={false}
        >
            <div className="d-flex justify-content-between align-items-center">
                {currentStep === 2 && (
                    <Icon
                        className="icon"
                        icon="carbon:arrow-left"
                        onClick={goBackToMain}
                    />
                )}
                {currentStep === 3 && (
                    <Icon
                        className="icon"
                        icon="carbon:arrow-left"
                        onClick={goBackToMain}
                    />
                )}
                {currentStep === 4 && (
                    <Icon
                        className="icon"
                        icon="carbon:arrow-left"
                        onClick={() => {
                            setCurrentStep(3);
                            setCopyText("");
                        }}
                    />
                )}
                <div className="fw-bold h4 text-light"> </div>
                <Icon
                    className="icon"
                    icon="carbon:close"
                    onClick={closeModal}
                />
            </div>
            <>
                {currentStep === 1 && (
                    <div className="deposit min_height1">
                        <div className="width1">
                            <h4 className="text-center mb-5">Deposit</h4>
                            <div className="button-group">
                                <button
                                    className={`btn ${
                                        tabIndex === 1 ? "selected" : ""
                                    }`}
                                    onClick={() => setTabIndex(1)}
                                >
                                    Cryptocurrency
                                </button>
                                <button
                                    className={`btn ${
                                        tabIndex === 2 ? "selected" : ""
                                    }`}
                                    onClick={() => setTabIndex(2)}
                                >
                                    Fiat
                                </button>
                            </div>
                        </div>
                        {tabIndex === 1 && (
                            <div className="width1">
                                <div className="select_div">
                                    <p className="subtitle">Select coin</p>
                                    <Select
                                        className="black_input"
                                        options={DEPOSIT_COINS}
                                        value={selectedAsset}
                                        onChange={(selected) => {
                                            setSelectedAsset(selected);
                                            setNetwork(selected?.networks[0]);
                                        }}
                                        styles={customSelectStylesWithIcon}
                                        placeholder="Select Coin"
                                        components={{
                                            Option: SelectOption,
                                            SingleValue: SelectOption,
                                            IndicatorSeparator: null,
                                        }}
                                    />
                                </div>
                                <div className="select_div">
                                    <p className="subtitle">Select network</p>
                                    <Select
                                        className="black_input"
                                        options={networks}
                                        value={network}
                                        onChange={(selected) =>
                                            setNetwork(selected)
                                        }
                                        styles={customSelectStyles}
                                        placeholder="Select network"
                                        components={{
                                            IndicatorSeparator: null,
                                        }}
                                    />
                                </div>
                                <button
                                    className="btn btn-outline-light rounded-0 w-100 mt-40px fw-bold"
                                    onClick={create_Charge_For_Deposit}
                                    disabled={pending}
                                >
                                    {pending ? (
                                        <CustomSpinner />
                                    ) : (
                                        "GET DEPOSIT ADDRESS"
                                    )}
                                </button>
                                <p className="mt-2 text-warning">{error}</p>
                            </div>
                        )}
                        {tabIndex === 2 && (
                            <div className="width2 mt-5">
                                <div className="row">
                                    {/* MPESA Payment Option */}
                                    <div className="col-sm-6">
                                        <FiatButton
                                            className="active"
                                            onClick={() => {
                                                setDepositType(MPESA);
                                                setCurrentStep(3);
                                            }}
                                        >
                                            <div className="payment-method-content">
                                                <div className="mpesa-logo">
                                                    <span
                                                        style={{
                                                            color: "#00D13B",
                                                            fontWeight: "bold",
                                                            fontSize: "18px",
                                                        }}
                                                    >
                                                        M-PESA
                                                    </span>
                                                </div>
                                                <small
                                                    style={{
                                                        color: "#888",
                                                        fontSize: "12px",
                                                    }}
                                                >
                                                    Mobile Money
                                                </small>
                                            </div>
                                        </FiatButton>
                                    </div>

                                    {/* Credit Cards (Stripe) - Keep Active */}
                                    <div className="col-sm-6">
                                        <FiatButton
                                            className="active"
                                            onClick={() => {
                                                setDepositType(STRIP);
                                                setCurrentStep(3);
                                            }}
                                        >
                                            <img
                                                src={CreditCards}
                                                alt="Credit cards"
                                            />
                                        </FiatButton>
                                    </div>
                                </div>

                                <div className="row">
                                    {/* Bank Transfer - Keep Active */}
                                    <div className="col-sm-6">
                                        <FiatButton
                                            className="active"
                                            onClick={() => {
                                                setDepositType(BANKTRANSER);
                                                handleBankForDeposit();
                                            }}
                                            disabled={pending}
                                        >
                                            {pending ? (
                                                <CustomSpinner />
                                            ) : (
                                                <p>Standard bank transfer</p>
                                            )}
                                        </FiatButton>
                                    </div>

                                    {/* PayPal - Disabled */}
                                    <div className="col-sm-6">
                                        <FiatButton
                                            className="inactive"
                                            disabled={true}
                                            title="PayPal temporarily disabled"
                                        >
                                            <div style={{ opacity: 0.5 }}>
                                                <img
                                                    src={PaypalFiat}
                                                    alt="paypal"
                                                />
                                                <small
                                                    style={{
                                                        display: "block",
                                                        color: "#888",
                                                        fontSize: "10px",
                                                        marginTop: "5px",
                                                    }}
                                                >
                                                    Temporarily Disabled
                                                </small>
                                            </div>
                                        </FiatButton>
                                    </div>
                                </div>

                                <div className="mt-3 text-center">
                                    <small style={{ color: "#888" }}>
                                        More payment methods coming soon
                                    </small>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {currentStep === 2 &&
                    !_.isEmpty(depositData) &&
                    depositType === CRYPTOCURRENCY && (
                        <div className="deposit width3">
                            <div className="address_div">
                                <p className="subtitle">Deposit Address</p>
                                <div className="clip_div">
                                    <CopyToClipboard
                                        onCopy={handleCopy}
                                        text={depositData?.depositAddress}
                                        options={{ message: "copied" }}
                                    >
                                        <div
                                            className="clipboard"
                                            onClick={handleCopy}
                                            onKeyDown={handleCopy}
                                            role="presentation"
                                        >
                                            <div className="address">
                                                {depositData?.depositAddress}
                                            </div>
                                            <div className="copy_icon">
                                                <Icon
                                                    icon={
                                                        copied
                                                            ? "clarity:copy-solid"
                                                            : "clarity:copy-line"
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </CopyToClipboard>
                                    <div className="qr_code">
                                        {coinQRCode ? (
                                            <img
                                                src={coinQRCode}
                                                alt="qrcode"
                                            />
                                        ) : (
                                            ""
                                        )}
                                    </div>
                                </div>
                                <p className="desc mt-2">
                                    Send only{" "}
                                    <span className="txt-green">
                                        {selectedAsset.value}
                                    </span>{" "}
                                    to this deposit address. Ensure the network
                                    is{" "}
                                    <span className="txt-green">
                                        {network.label}
                                    </span>
                                </p>
                                <div className="stats_div">
                                    <div className="stats">
                                        <p className="topic">Status</p>
                                        <p className="content">
                                            {!confirmById?.depositStatus
                                                ? "Waiting for your funds"
                                                : "Received"}
                                        </p>
                                    </div>
                                    <div className="stats">
                                        <p className="topic">Received so far</p>
                                        <p className="content">
                                            {roundNumber(
                                                confirmById?.cryptoAmount,
                                                8,
                                            )}{" "}
                                            {selectedAsset.value}
                                        </p>
                                    </div>
                                    {!(
                                        network.network === "BEP20" ||
                                        network.network === "ERC20"
                                    ) && (
                                        <>
                                            <hr />
                                            <div className="stats">
                                                <p className="topic">
                                                    Time left to confirm funds
                                                </p>
                                                <div className="content">
                                                    {!confirmById?.depositStatus ? (
                                                        <CountDownDeposit
                                                            deadline={
                                                                confirmById?.createdAt +
                                                                8 * 3600 * 1000
                                                            }
                                                        />
                                                    ) : (
                                                        <span className="txt-green">
                                                            Confirmed
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="stats">
                                                <p className="topic">
                                                    Payment ID
                                                </p>
                                                <p className="content">
                                                    {depositData?.id}
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                {/* MPESA Deposit Step */}
                {currentStep === 3 && depositType === MPESA && (
                    <div className="width2">
                        <div className="mpesa-deposit-section">
                            <h4 className="text-center mb-4">
                                Deposit via M-PESA
                            </h4>

                            {/* Amount Selection */}
                            <div className="form-group mb-3">
                                <label className="form-label text-white">
                                    Amount to Deposit
                                </label>
                                <div className="input-group">
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="Enter amount"
                                        value={transferAmount}
                                        onChange={(e) =>
                                            setTransferAmount(e.target.value)
                                        }
                                        min="100"
                                        max="150000"
                                        step="1"
                                        style={{
                                            backgroundColor: "#1e1e1e",
                                            border: "1px solid white",
                                            color: "white",
                                            borderRadius: "0",
                                        }}
                                    />
                                    <span
                                        className="input-group-text"
                                        style={{
                                            backgroundColor: "#333",
                                            color: "white",
                                            border: "1px solid white",
                                            borderLeft: "none",
                                        }}
                                    >
                                        KES
                                    </span>
                                </div>
                                <small className="text-muted">
                                    Minimum: 100 KES | Maximum: 150,000 KES
                                </small>
                            </div>

                            {/* Phone Number Input */}
                            <div className="form-group mb-3">
                                <label className="form-label text-white">
                                    M-PESA Phone Number
                                </label>
                                <div className="input-group">
                                    <span
                                        className="input-group-text"
                                        style={{
                                            backgroundColor: "#333",
                                            color: "white",
                                            border: "1px solid white",
                                        }}
                                    >
                                        +254
                                    </span>
                                    <input
                                        type="tel"
                                        className="form-control"
                                        placeholder="7XXXXXXXX"
                                        value={mpesaPhone}
                                        onChange={(e) =>
                                            setMpesaPhone(e.target.value)
                                        }
                                        maxLength="9"
                                        pattern="[0-9]{9}"
                                        style={{
                                            backgroundColor: "#1e1e1e",
                                            border: "1px solid white",
                                            borderLeft: "none",
                                            color: "white",
                                            borderRadius: "0",
                                        }}
                                    />
                                </div>
                                <small className="text-muted">
                                    Enter your M-PESA registered phone number
                                </small>
                            </div>

                            {/* Transaction Summary */}
                            {transferAmount && mpesaPhone && (
                                <div
                                    className="transaction-summary mb-4 p-3"
                                    style={{
                                        backgroundColor:
                                            "rgba(255, 255, 255, 0.1)",
                                        borderRadius: "5px",
                                        border: "1px solid #333",
                                    }}
                                >
                                    <h6 className="text-white">
                                        Transaction Summary
                                    </h6>
                                    <div className="d-flex justify-content-between">
                                        <span>Amount:</span>
                                        <span>{transferAmount} KES</span>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span>Phone:</span>
                                        <span>+254{mpesaPhone}</span>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span>Conversion Rate:</span>
                                        <span>1 KES = 0.0067 USD</span>
                                    </div>
                                    <div className="d-flex justify-content-between font-weight-bold">
                                        <span>You'll receive:</span>
                                        <span>
                                            ~
                                            {(transferAmount * 0.0067).toFixed(
                                                2,
                                            )}{" "}
                                            USDT
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                className="btn btn-outline-light rounded-0 w-100 mt-3 fw-bold"
                                onClick={handleMpesaDeposit}
                                disabled={
                                    !transferAmount ||
                                    !mpesaPhone ||
                                    pending ||
                                    transferAmount < 100 ||
                                    transferAmount > 150000 ||
                                    mpesaPhone.length !== 9 ||
                                    !mpesaPhone.startsWith("7")
                                }
                            >
                                {pending ? (
                                    <div className="d-flex align-items-center justify-content-center">
                                        <CustomSpinner />
                                        <span className="ms-2">
                                            Processing...
                                        </span>
                                    </div>
                                ) : (
                                    "INITIATE M-PESA PAYMENT"
                                )}
                            </button>

                            {error && (
                                <div className="alert alert-danger mt-3">
                                    {error}
                                </div>
                            )}

                            <div className="mt-3 text-center">
                                <small className="text-muted">
                                    You will receive an M-PESA prompt on your
                                    phone to complete the payment
                                </small>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bank Transfer Deposit Steps */}
                {currentStep === 3 && depositType === BANKTRANSER && (
                    <div className="deposit width2 mb-5">
                        <h5 className="text-center">Bank transfer deposit</h5>
                        <div>
                            <p className="subtitle">Select currency</p>
                            <Select
                                className="black_input"
                                options={CURRENCIES_BANK}
                                value={currency}
                                onChange={(selected) => {
                                    setCurrency(selected);
                                }}
                                styles={customSelectStyles}
                                components={{
                                    IndicatorSeparator: null,
                                }}
                            />
                        </div>
                        <div className="mt-3">
                            <p className="subtitle">Amount</p>
                            <div
                                className="black_input transfer_input"
                                aria-hidden="true"
                                onClick={() =>
                                    jq("input#transferAmount").trigger("focus")
                                }
                            >
                                <NumberFormat
                                    id="transferAmount"
                                    className="ms-2"
                                    thousandSeparator={true}
                                    prefix={currency.symbol + " "}
                                    allowNegative={false}
                                    value={transferAmount}
                                    onValueChange={(values) =>
                                        setTransferAmount(values.value)
                                    }
                                    autoComplete="off"
                                />
                                <div>
                                    Bank transfer fee{" "}
                                    <NumberFormat
                                        thousandSeparator={true}
                                        suffix={" " + currency.symbol}
                                        displayType="text"
                                        allowNegative={false}
                                        value={Number(
                                            getBankTransferFee(
                                                user,
                                                allFees,
                                                transferAmount,
                                            ),
                                        )}
                                        decimalScale={2}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="mt-3">
                            <p>
                                The{" "}
                                <span className="txt-green">
                                    {currency.label}
                                </span>{" "}
                                will be converted to{" "}
                                <span className="txt-green">USDT</span> and
                                deposited to the wallet
                            </p>
                            <div className="black_input usdt_div">
                                <img src={USDT} alt="usdt" className="ms-2" />
                                <p className="ms-2">USDT</p>
                            </div>
                        </div>
                        <button
                            className="btn btn-outline-light rounded-0 w-100 mt-50px fw-bold"
                            onClick={() => setCurrentStep(4)}
                            disabled={!transferAmount}
                        >
                            NEXT
                        </button>
                    </div>
                )}
                {currentStep === 4 && depositType === BANKTRANSER && (
                    <div className="deposit width2 mb-5">
                        <h4 className="text-center">
                            {currency.label} Deposits Only
                        </h4>
                        <p className="subtitle mb-4">
                            <Icon
                                icon="akar-icons:clock"
                                className="me-2"
                                style={{ fontSize: 18 }}
                            />
                            {BankTrxDescription.first}
                        </p>
                        {_.map(BankTransferData[currency.value], (val, key) => (
                            <div className="transfer_data_div" key={key}>
                                <p className="subtitle pe-2">{key}:</p>
                                <p className="value">
                                    {val}
                                    <Icon
                                        icon={
                                            copyText === val
                                                ? "fluent:copy-24-filled"
                                                : "fluent:copy-24-regular"
                                        }
                                        onClick={() =>
                                            handleCopyToClipboard(val)
                                        }
                                    />
                                </p>
                            </div>
                        ))}
                        <div className="transfer_data_div mt-3">
                            <p className="subtitle pe-2">Reference:</p>
                            <p className="value">
                                {referenceNumber}
                                <Icon
                                    icon={
                                        copyText === referenceNumber
                                            ? "fluent:copy-24-filled"
                                            : "fluent:copy-24-regular"
                                    }
                                    onClick={() =>
                                        handleCopyToClipboard(referenceNumber)
                                    }
                                />
                            </p>
                        </div>
                        <p className="subtitle mt-5">
                            {parse(BankTrxDescription.second)}
                        </p>
                        <button
                            className="btn btn-outline-light rounded-0 w-100 fw-bold mt-3"
                            onClick={closeModal}
                        >
                            CONFIRM
                        </button>
                    </div>
                )}

                {/* PayPal Deposit (Disabled) - Keep for reference */}
                {currentStep === 3 && depositType === PAYPAL && (
                    <div className="deposit width2">
                        <div className="text-center p-4">
                            <h5 className="text-warning">
                                PayPal Temporarily Disabled
                            </h5>
                            <p className="text-muted">
                                PayPal payments are currently unavailable.
                                Please use M-PESA, Credit Card, or Bank Transfer
                                instead.
                            </p>
                            <button
                                className="btn btn-outline-light rounded-0 mt-3"
                                onClick={() => setCurrentStep(1)}
                            >
                                BACK TO PAYMENT OPTIONS
                            </button>
                        </div>
                    </div>
                )}

                {/* Stripe Deposit Steps */}
                {currentStep === 3 && depositType === STRIP && (
                    <div className="deposit width2">
                        <div>
                            {loadingStripe ? (
                                <div className="text-center mt-4">
                                    <CustomSpinner />
                                </div>
                            ) : (
                                <>
                                    <h5 className="text-center">
                                        Credit card deposit
                                    </h5>
                                    <div>
                                        <p className="subtitle">Currency</p>
                                        <Select
                                            className="black_input"
                                            options={CURRENCIES}
                                            value={currency}
                                            onChange={(selected) => {
                                                setCurrency(selected);
                                            }}
                                            styles={customSelectStyles}
                                            components={{
                                                IndicatorSeparator: null,
                                            }}
                                        />
                                    </div>
                                    <div className="mt-3">
                                        <p className="subtitle">Amount</p>
                                        <div
                                            className="black_input transfer_input"
                                            aria-hidden="true"
                                            onClick={() =>
                                                jq(
                                                    "input#transferAmount",
                                                ).trigger("focus")
                                            }
                                        >
                                            <NumberFormat
                                                id="transferAmount"
                                                className="ms-2"
                                                thousandSeparator={true}
                                                prefix={currency.symbol + " "}
                                                allowNegative={false}
                                                value={transferAmount}
                                                onValueChange={(values) =>
                                                    setTransferAmount(
                                                        values.value,
                                                    )
                                                }
                                                autoComplete="off"
                                            />
                                            <div>
                                                Stripe fee{" "}
                                                <NumberFormat
                                                    thousandSeparator={true}
                                                    suffix={
                                                        " " + currency.symbol
                                                    }
                                                    displayType="text"
                                                    allowNegative={false}
                                                    value={Number(
                                                        getStripePaymentFee(
                                                            user,
                                                            allFees,
                                                            transferAmount,
                                                        ),
                                                    )}
                                                    decimalScale={2}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <p>
                                            The{" "}
                                            <span className="txt-green">
                                                {currency.label}
                                            </span>{" "}
                                            will be converted to{" "}
                                            <span className="txt-green">
                                                USDT
                                            </span>{" "}
                                            and deposited to the wallet
                                        </p>
                                        <div className="black_input usdt_div">
                                            <img
                                                src={USDT}
                                                alt="usdt"
                                                className="ms-2"
                                            />
                                            <p className="ms-2">USDT</p>
                                        </div>
                                    </div>
                                    <button
                                        className="btn btn-outline-light rounded-0 w-100 mt-50px mb-5 fw-bold"
                                        onClick={() => setCurrentStep(4)}
                                        disabled={!transferAmount}
                                    >
                                        CONTINUE
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
                {currentStep === 4 && depositType === STRIP && (
                    <StripeDepositSection
                        closeModal={closeModal}
                        amount={Number(transferAmount)}
                        currency={currency}
                    />
                )}
            </>
        </Modal>
    );
}

const customSelectStylesWithIcon = {
    input: (provided) => ({
        ...provided,
        position: "absolute",
    }),
    option: (provided, state) => ({
        ...provided,
        color: "white",
        backgroundColor: state.isSelected ? "#000000" : undefined,
        fontSize: 14,
        borderBottom: "1px solid dimgrey",
        cursor: "pointer",
        ":hover": {
            backgroundColor: "inherit",
        },
    }),
    control: (provided) => ({
        ...provided,
        backgroundColor: "#1e1e1e",
        border: "none",
        borderRadius: 0,
    }),
    menu: (provided) => ({
        ...provided,
        backgroundColor: "#1e1e1e",
        border: "1px solid white",
    }),
    menuList: (provided) => ({
        ...provided,
        margin: 0,
        padding: 0,
    }),
    valueContainer: (provided) => ({
        ...provided,
        padding: 0,
    }),
    singleValue: (provided) => ({
        ...provided,
        color: "white",
    }),
    placeholder: (provided) => ({
        ...provided,
        color: "dimgrey",
    }),
};

const customSelectStyles = {
    option: (provided, state) => ({
        ...provided,
        color: "white",
        backgroundColor: state.isSelected ? "#000000" : undefined,
        fontSize: 14,
        borderBottom: "1px solid dimgrey",
        cursor: "pointer",
        ":hover": {
            backgroundColor: "inherit",
        },
    }),
    control: (provided) => ({
        ...provided,
        backgroundColor: "#1e1e1e",
        border: "none",
        borderRadius: 0,
        height: 47,
        cursor: "pointer",
    }),
    menu: (provided) => ({
        ...provided,
        backgroundColor: "#1e1e1e",
        border: "1px solid white",
    }),
    menuList: (provided) => ({
        ...provided,
        margin: 0,
        padding: 0,
    }),
    valueContainer: (provided) => ({
        ...provided,
        padding: 0,
    }),
    singleValue: (provided) => ({
        ...provided,
        color: "white",
        marginLeft: 10,
    }),
    placeholder: (provided) => ({
        ...provided,
        color: "dimgrey",
    }),
};

const FiatButton = styled.button`
    border: 1px solid white;
    background-color: inherit;
    width: 100%;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 15px;
    transition: 0.3s;
    p {
        font-size: 18px !important;
        font-weight: 600;
    }
    img {
        margin: 5px;
    }
    &.active:hover {
        border-color: #23c865;
    }
    &.inactive {
        opacity: 0.4;
        cursor: not-allowed;
    }
`;
