import React, { useState, useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import jq from "jquery";
import Hashes from "jshashes";
import ReactCodeInput from "react-code-input";
import Modal from "react-modal";
import validator from "validator";
import _ from "lodash";
import styled from "styled-components";
import Select, { components } from "react-select";
import NumberFormat from "../../utilities/number";
import { Icon } from "@iconify/react";
import { useQuery, useMutation } from "@apollo/client";
import { useAccount, useConnect } from "wagmi";
import CustomSpinner from "../common/custom-spinner";
import { GET_ALL_FEES } from "../../apollo/graphqls/querys/Payment";
import {
    getPaypalPaymentFee,
    getBankTransferFee,
} from "../../utilities/utility-methods";
import { PaypalFiat } from "../../utilities/imgImport";
import { renderNumberFormat, roundNumber } from "../../utilities/number";
import { SUPPORTED_COINS } from "../../utilities/staticData2";
import * as Mutation from "../../apollo/graphqls/mutations/Payment";
import { censorEmail } from "../../utilities/string";
import { countryList } from "../../utilities/countryAlpha2";
import LocationSearchInput from "./LocationSearchInput";
import ConnectWalletTab from "../profile/connect-wallet-tab";

const DOMESTIC_BANK_PER_COUNTRY = {
    GB: {
        meta: ["Sort code"],
    },
    US: {
        meta: ["ACH routing number", "Account type"],
    },
    FJ: {
        meta: ["Branch code"],
    },
    AR: {
        meta: ["Tax ID: CUIL / CUIT"],
    },
    JP: {
        meta: ["Branch Name", "Account type"],
        info: "Enter the recipient name exactly as it appears in their Japanese bank account (It is usually written in Katakana).",
    },
    MX: {
        meta: ["CLABE"],
    },
    HK: {
        info: "We can only pay out to HKD accounts in Hong Kong.",
    },
    CA: {
        meta: ["Transit Number"],
    },
    AU: {
        meta: ["BSB Code (Bank State Branch)"],
    },
    CN: {
        meta: ["Card number"],
    },
    IN: {
        meta: ["IFSC code"],
    },
};

const CURRENCIES = [
    { label: "USD", value: "USD", symbol: "$" },
    { label: "GBP", value: "GBP", symbol: "£" },
    { label: "EUR", value: "EUR", symbol: "€" },
];

const CRYPTOCURRENCY = "CRYPTOCURRENCY";
const PAYPAL = "PAYPAL";
const BANKTRANSFER = "BANKTRANSFER";

const MIN_VALUE = 1;

const SupportedCoins = _.mapKeys(SUPPORTED_COINS, "value");

const Countries = countryList.map((item) => {
    return { label: item.name, value: item["alpha-2"] };
});

const FiatButton = styled.button`
    background: transparent !important;
    border: 1px solid var(--bs-border-color) !important;
    width: 100%;
    height: 116px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    text-decoration: none;
    border-radius: 0;
    padding: 20px;

    &:hover {
        border-color: #fff !important;
    }

    &.active {
        border-color: #fff !important;
    }

    img {
        max-width: 100%;
        max-height: 60px;
    }

    p {
        margin: 0;
        text-align: center;
        font-weight: 500;
    }
`;

const customSelectStyles = {
    control: (provided) => ({
        ...provided,
        backgroundColor: "transparent",
        border: "1px solid #6c757d",
        borderRadius: 0,
        "&:hover": {
            border: "1px solid #6c757d",
        },
    }),
    menu: (provided) => ({
        ...provided,
        backgroundColor: "#212529",
        border: "1px solid #6c757d",
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected ? "#495057" : "transparent",
        color: "white",
        "&:hover": {
            backgroundColor: "#495057",
        },
    }),
    singleValue: (provided) => ({
        ...provided,
        color: "white",
    }),
    placeholder: (provided) => ({
        ...provided,
        color: "#6c757d",
    }),
};

const { Option } = components;
const SelectOption = (props) => {
    const value = roundNumber(props.data?.amount, 8);
    return (
        <Option {...props}>
            <div className="d-flex justify-content-sm-start align-items-center ">
                <img
                    src={props.data?.icon}
                    style={{ width: "30px", height: "30px" }}
                    alt={props.data.value}
                />
                <p className="coin-label ms-3">
                    <NumberFormat
                        value={value}
                        displayType={"text"}
                        thousandSeparator={true}
                        renderText={(value, props) => (
                            <span {...props}>{value} </span>
                        )}
                    />
                    {props.data?.label}
                </p>
            </div>
        </Option>
    );
};

export default function WithdrawModal({ showModal, setShowModal, assets }) {
    const user = useSelector((state) => state.auth.user);
    const { currencyRates } = useSelector((state) => state);

    const myAssets = _.orderBy(
        Object.values(assets || {})
            .filter((item) => {
                return item.tokenSymbol !== "WATT";
            })
            .map((item) => {
                return {
                    value: item.tokenSymbol,
                    label: item.tokenSymbol,
                    amount: item.free,
                    icon: item.symbol,
                    balance: item.balance,
                    networks: SupportedCoins[item.tokenSymbol]?.networks,
                    isDisabled: item.tokenSymbol === "NDB" ? true : false,
                };
            }),
        ["balance"],
        ["desc"],
    );

    const myAssetsCrypto = myAssets.filter((item) => Number(item.amount) !== 0);
    const myAssetsFiat = myAssets
        .filter((item) => item.value !== "NDB" && Number(item.amount) !== 0)
        .map((item) => {
            return {
                value: item.value,
                label: item.label,
                icon: item.icon,
            };
        });

    const {
        address: walletAddress,
        isConnected: isWalletConnected,
        connector,
    } = useAccount();
    const { isPending: isConnecting } = useConnect();

    // Create walletAccountData object for backward compatibility
    const walletAccountData = isWalletConnected
        ? {
              address: walletAddress,
              connector: connector,
          }
        : null;

    // State management
    const [selectedAsset, setSelectedAsset] = useState(myAssetsCrypto[0]);
    const [selectedAssetFiat, setSelectedAssetFiat] = useState(myAssetsFiat[0]);
    const [currentStep, setCurrentStep] = useState(1);
    const [withdrawType, setWithdrawType] = useState(null);
    const [tabIndex, setTabIndex] = useState(1);
    const [pending, setPending] = useState(false);
    const [error, setError] = useState("");
    const [showError, setShowError] = useState(false);
    const [returnValue, setReturnValue] = useState({});

    const networks = useMemo(
        () => selectedAsset?.networks ?? [],
        [selectedAsset],
    );
    const [network, setNetwork] = useState(networks[0]);
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [confirmCode, setConfirmCode] = useState("");

    const invalidForWithdraw =
        !withdrawAmount ||
        Number(withdrawAmount) === 0 ||
        Number(withdrawAmount) > Number(selectedAsset?.amount || 0);

    // Variables for bank transfer
    const [currency, setCurrency] = useState(CURRENCIES[0]);
    const [transferAmount, setTransferAmount] = useState("");
    const [paypalEmail, setPaypalEmail] = useState("");
    const [allFees, setAllFees] = useState({});

    // Variables for bank withdraw
    const [bankWithdrawData, setBankWithdrawData] = useState({
        country: Countries[0],
        mode: 1,
        holderName: "",
        bankName: "",
        accNumber: "",
        postCode: "",
        swiftBicCode: "",
        ibanCode: "",
    });
    const [recipientAddress, setRecipientAddress] = useState("");
    const [bankSpecificData, setBankSpecificData] = useState({});

    // Initialize network when selectedAsset changes
    useEffect(() => {
        if (selectedAsset?.networks && selectedAsset.networks.length > 0) {
            setNetwork(selectedAsset.networks[0]);
        }
    }, [selectedAsset]);

    // Initialize bank specific data when changing the country
    useEffect(() => {
        if (bankWithdrawData.country?.value) {
            const countryCode = bankWithdrawData.country.value;
            const countryData = DOMESTIC_BANK_PER_COUNTRY[countryCode];
            if (countryData && countryData.meta) {
                const initialData = {};
                countryData.meta.forEach((field) => {
                    initialData[field] = "";
                });
                setBankSpecificData(initialData);
            } else {
                setBankSpecificData({});
            }
        }
    }, [bankWithdrawData.country]);

    // Bank withdraw error validation
    const bankWithDrawError = useMemo(() => {
        const errors = {};
        if (!bankWithdrawData.holderName)
            errors.holderName = "Account holder name is required";
        if (!bankWithdrawData.bankName)
            errors.bankName = "Bank name is required";
        if (!bankWithdrawData.accNumber)
            errors.accNumber = "Account number is required";
        if (!recipientAddress)
            errors.recipientAddress = "Recipient address is required";
        if (!bankWithdrawData.postCode)
            errors.postCode = "Post code is required";

        if (bankWithdrawData.mode === 2) {
            if (!bankWithdrawData.swiftBicCode)
                errors.swiftBicCode = "SWIFT/BIC code is required";
            if (!bankWithdrawData.ibanCode)
                errors.ibanCode = "IBAN code is required";
        }

        // Check bank specific data
        if (
            bankWithdrawData.country?.value &&
            DOMESTIC_BANK_PER_COUNTRY[bankWithdrawData.country.value]
        ) {
            const countryData =
                DOMESTIC_BANK_PER_COUNTRY[bankWithdrawData.country.value];
            if (countryData.meta) {
                countryData.meta.forEach((field) => {
                    if (!bankSpecificData[field]) {
                        errors[field] = `${field} is required`;
                    }
                });
            }
        }

        return errors;
    }, [bankWithdrawData, recipientAddress, bankSpecificData]);

    // PayPal email validation
    const paypalEmailError = useMemo(() => {
        if (!paypalEmail) return "PayPal email is required";
        if (!validator.isEmail(paypalEmail)) return "Invalid Email";
        return null;
    }, [paypalEmail]);

    // Load fees
    useQuery(GET_ALL_FEES, {
        onCompleted: (data) => {
            setAllFees(_.mapKeys(data.getAllFees, "tierLevel"));
        },
        onError: (error) => console.log(error),
    });

    const goBackToFiat = () => {
        setCurrentStep(1);
        setCurrency(CURRENCIES[0]);
        setSelectedAssetFiat(myAssetsFiat[0]);
        setTransferAmount("");
    };

    const closeModal = () => {
        setWithdrawAmount("");
        setCurrentStep(1);
        setWithdrawType(null);
        setTabIndex(1);
        setPending(false);
        setError("");
        setShowError(false);
        setConfirmCode("");
        setReturnValue({});
        setShowModal(false);
    };

    // Generate withdraw code mutation
    const [generateWithdrawMutation] = useMutation(Mutation.GENERATE_WITHDRAW, {
        onCompleted: (data) => {
            if (data.generateWithdraw) {
                setCurrentStep(4);
            }
            setPending(false);
        },
        onError: (err) => {
            console.error("Generate withdraw error:", err.message);
            setError(err.message || "Failed to generate withdrawal code");
            setPending(false);
        },
    });

    const generate_Withdraw_Code = () => {
        // Validation checks
        if (withdrawType === PAYPAL && paypalEmailError) {
            setShowError(true);
            return;
        }

        if (withdrawType === BANKTRANSFER && !_.isEmpty(bankWithDrawError)) {
            setShowError(true);
            return;
        }

        // Check if cryptocurrency withdrawal has required data
        if (withdrawType === CRYPTOCURRENCY) {
            if (!selectedAsset) {
                setError("Please select an asset");
                return;
            }
            if (!withdrawAmount || Number(withdrawAmount) <= 0) {
                setError("Please enter a valid withdrawal amount");
                return;
            }
            if (Number(withdrawAmount) > Number(selectedAsset.amount)) {
                setError("Insufficient balance");
                return;
            }
            if (!isWalletConnected || !walletAddress) {
                setError("Please connect your wallet");
                return;
            }
        }

        setError("");
        setConfirmCode("");
        setPending(true);
        generateWithdrawMutation();
    };

    // PayPal withdraw mutation
    const [paypalWithdrawRequestMutation] = useMutation(
        Mutation.PAYPAL_WITHDRAW_REQUEST,
        {
            onCompleted: (data) => {
                if (data.paypalWithdrawRequest) {
                    setReturnValue(data.paypalWithdrawRequest);
                    setCurrentStep(5);
                }
                setPending(false);
            },
            onError: (err) => {
                setPending(false);
                if (err.message === "Insufficient funds") {
                    setError(
                        "Sorry! Your wallet doesn't have sufficient funds.",
                    );
                } else {
                    setError(err.message || "PayPal withdrawal failed");
                }
            },
        },
    );

    const paypal_Withdraw_Request = () => {
        setError("");
        setPending(true);
        const requestData = {
            email: paypalEmail,
            target: currency.value,
            amount: Number(transferAmount),
            sourceToken: selectedAssetFiat?.value,
            code: confirmCode,
        };
        paypalWithdrawRequestMutation({
            variables: { ...requestData },
        });
    };

    // Crypto withdraw mutation
    const [cryptoWithdrawRequestMutation] = useMutation(
        Mutation.CRYPTO_WITHDRAW_REQUEST,
        {
            onCompleted: (data) => {
                if (data.cryptoWithdrawRequest) {
                    setReturnValue(data.cryptoWithdrawRequest);
                    setCurrentStep(5);
                }
                setPending(false);
            },
            onError: (err) => {
                setPending(false);
                if (err.message === "2FA failed") {
                    setError(
                        "Sorry! Two-factor authentication failed. Try again.",
                    );
                } else if (err.message === "Insufficient funds") {
                    setError(
                        "Sorry! Your wallet doesn't have sufficient funds.",
                    );
                } else {
                    setError(err.message || "Cryptocurrency withdrawal failed");
                }
            },
        },
    );

    const crypto_Withdraw_Request = () => {
        const ts = Math.floor(Date.now() / 1000);
        const plainText =
            ts +
            "." +
            selectedAsset.label +
            "." +
            network?.network +
            "." +
            walletAddress +
            "." +
            withdrawAmount;

        const SHA256 = new Hashes.SHA256();
        const signature = SHA256.hex(plainText);

        setError("");
        setPending(true);
        const requestData = {
            amount: Number(withdrawAmount),
            sourceToken: selectedAsset?.value,
            network: network?.network,
            des: walletAddress,
            code: confirmCode,
        };
        cryptoWithdrawRequestMutation({
            variables: { ...requestData },
        });
    };

    // Bank withdraw mutation
    const [bankWithdrawRequestMutation] = useMutation(
        Mutation.BANK_WITHDRAW_REQUEST,
        {
            onCompleted: (data) => {
                if (data.bankWithdrawRequest) {
                    setReturnValue(data.bankWithdrawRequest);
                    setCurrentStep(5);
                }
                setPending(false);
            },
            onError: (err) => {
                setPending(false);
                if (err.message === "Insufficient funds") {
                    setError(
                        "Sorry! Your wallet doesn't have sufficient funds.",
                    );
                } else {
                    setError(err.message || "Bank withdrawal failed");
                }
            },
        },
    );

    const bank_Withdraw_Request = () => {
        const metaData =
            bankWithdrawData.mode === 1
                ? { ...bankSpecificData }
                : {
                      "SWIFT / BIC code": bankWithdrawData.swiftBicCode,
                      "IBAN code": bankWithdrawData.ibanCode,
                  };

        setError("");
        setPending(true);
        const requestData = {
            targetCurrency: currency.value,
            amount: Number(transferAmount),
            sourceToken: selectedAssetFiat?.value,
            mode: bankWithdrawData.mode,
            country: bankWithdrawData.country?.value,
            holderName: bankWithdrawData.holderName,
            bankName: bankWithdrawData.bankName,
            accNumber: bankWithdrawData.accNumber,
            metadata: JSON.stringify(metaData),
            address: recipientAddress,
            postCode: bankWithdrawData.postCode,
            code: confirmCode,
        };
        bankWithdrawRequestMutation({
            variables: { ...requestData },
        });
    };

    const handleWithdrawRequest = () => {
        if (withdrawType === CRYPTOCURRENCY) {
            crypto_Withdraw_Request();
        } else if (withdrawType === PAYPAL) {
            paypal_Withdraw_Request();
        } else if (withdrawType === BANKTRANSFER) {
            bank_Withdraw_Request();
        }
    };

    // Confirmation data
    const confirmDataForPaypal = [
        { topic: "User Email", content: censorEmail(user?.email || "") },
        { topic: "Destination PayPal address", content: paypalEmail },
        { topic: "Currency", content: currency.value },
        { topic: "Source Token", content: selectedAssetFiat?.label },
        { topic: "Withdraw Amount", content: transferAmount },
    ];

    const metaDataForBankTransfer = useMemo(() => {
        if (!returnValue?.metadata) return [];
        try {
            const metadata = JSON.parse(returnValue.metadata);
            if (_.isEmpty(metadata)) return [];
            return Object.keys(metadata).map((key) => ({
                topic: key,
                content: metadata[key],
            }));
        } catch (error) {
            console.error("Error parsing bank transfer metadata:", error);
            return [];
        }
    }, [returnValue]);

    const confirmDataForBankTransfer = useMemo(() => {
        if (!returnValue) return [];
        return [
            { topic: "Account Holder Name", content: returnValue.holderName },
            { topic: "Bank Name", content: returnValue.bankName },
            ...metaDataForBankTransfer,
            { topic: "Account Number", content: returnValue.accountNumber },
            { topic: "Recipient Address", content: returnValue.address },
            { topic: "Post Code", content: returnValue.postCode },
            {
                topic: "Token Amount",
                content: renderNumberFormat(
                    Number(returnValue.tokenAmount || 0).toFixed(8),
                    returnValue.sourceToken,
                ),
            },
            {
                topic: "Withdraw Amount",
                content: renderNumberFormat(
                    Number(returnValue.withdrawAmount || 0).toFixed(2),
                    returnValue.targetCurrency,
                ),
            },
        ];
    }, [returnValue, metaDataForBankTransfer]);

    const confirmDataForCrypto = [
        { topic: "User Email", content: censorEmail(user?.email || "") },
        {
            topic: "Destination wallet address",
            content: walletAddress || "Not connected", // Updated this line
        },
        { topic: "Source Token", content: selectedAsset?.value },
        { topic: "Withdraw Amount", content: withdrawAmount },
    ];

    // Early return if no assets
    if (!assets || Object.keys(assets).length === 0) {
        return null;
    }

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
                        onClick={goBackToFiat}
                    />
                )}
                {currentStep === 3 && (
                    <Icon
                        className="icon"
                        icon="carbon:arrow-left"
                        onClick={() => {
                            setCurrentStep(2);
                            setShowError(false);
                        }}
                    />
                )}
                {currentStep === 4 && (
                    <Icon
                        className="icon"
                        icon="carbon:arrow-left"
                        onClick={() => {
                            if (withdrawType === CRYPTOCURRENCY) {
                                setCurrentStep(1);
                                setTabIndex(1);
                            } else {
                                setCurrentStep(3);
                            }
                            setConfirmCode("");
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
                    <div className="deposit min_height2">
                        <div className="width1">
                            <h4 className="text-center mb-4">Withdraw</h4>
                            <div className="button-group pt-2">
                                <button
                                    className={`btn ${tabIndex === 1 ? "selected" : ""}`}
                                    onClick={() => setTabIndex(1)}
                                >
                                    Cryptocurrency
                                </button>
                                <button
                                    className={`btn ${tabIndex === 2 ? "selected" : ""}`}
                                    onClick={() => setTabIndex(2)}
                                >
                                    Fiat
                                </button>
                            </div>
                        </div>
                        {tabIndex === 1 &&
                            (_.isEmpty(myAssetsCrypto) ? (
                                <h5 className="text-center mt-5">
                                    No Assets to withdraw
                                </h5>
                            ) : (
                                <div className="width2">
                                    <div className="select_div">
                                        <p className="subtitle">
                                            Select Withdraw Asset
                                        </p>
                                        <Select
                                            className="black_input"
                                            options={myAssetsCrypto}
                                            value={selectedAsset}
                                            onChange={setSelectedAsset}
                                            styles={customSelectStyles}
                                            components={{
                                                Option: SelectOption,
                                                IndicatorSeparator: null,
                                            }}
                                            placeholder="Select asset"
                                        />
                                    </div>
                                    <div className="select_div">
                                        <p className="subtitle">
                                            Select Network
                                        </p>
                                        <Select
                                            className="black_input"
                                            options={networks}
                                            value={network}
                                            onChange={setNetwork}
                                            styles={customSelectStyles}
                                            getOptionLabel={(option) =>
                                                option.network
                                            }
                                            getOptionValue={(option) =>
                                                option.network
                                            }
                                            placeholder="Select network"
                                            components={{
                                                IndicatorSeparator: null,
                                            }}
                                        />
                                    </div>
                                    <div className="select_div">
                                        <p className="subtitle">Amount</p>
                                        <div className="black_input withdraw_amount ps-2">
                                            <NumberFormat
                                                value={withdrawAmount}
                                                thousandSeparator={true}
                                                onValueChange={(values) => {
                                                    setWithdrawAmount(
                                                        values.value,
                                                    );
                                                }}
                                                allowNegative={false}
                                                decimalScale={8}
                                                placeholder="0.00"
                                            />
                                            <p
                                                className="btn"
                                                aria-hidden="true"
                                                onClick={() => {
                                                    setWithdrawAmount(
                                                        roundNumber(
                                                            selectedAsset?.amount ||
                                                                0,
                                                            8,
                                                        ),
                                                    );
                                                }}
                                            >
                                                <span>MAX</span>
                                            </p>
                                        </div>
                                        {invalidForWithdraw &&
                                            withdrawAmount && (
                                                <p className="text-danger mt-1">
                                                    {Number(withdrawAmount) >
                                                    Number(
                                                        selectedAsset?.amount ||
                                                            0,
                                                    )
                                                        ? "Insufficient balance"
                                                        : "Please enter a valid amount"}
                                                </p>
                                            )}
                                    </div>
                                    <button
                                        className="btn btn-outline-light rounded-0 w-100 mt-40px fw-bold mb-3"
                                        onClick={() => {
                                            setWithdrawType(CRYPTOCURRENCY);
                                            setCurrentStep(2);
                                        }}
                                        disabled={invalidForWithdraw}
                                    >
                                        NEXT
                                    </button>
                                </div>
                            ))}
                        {tabIndex === 2 && (
                            <div className="width2 mt-5 pt-5">
                                <div className="row mt-5">
                                    <div className="col-sm-6">
                                        <FiatButton
                                            className="active"
                                            onClick={() => {
                                                setWithdrawType(PAYPAL);
                                                setCurrentStep(2);
                                            }}
                                        >
                                            <img
                                                src={PaypalFiat}
                                                alt="paypal"
                                            />
                                        </FiatButton>
                                    </div>
                                    <div className="col-sm-6">
                                        <FiatButton
                                            className="active"
                                            onClick={() => {
                                                setWithdrawType(BANKTRANSFER);
                                                setCurrentStep(2);
                                            }}
                                        >
                                            <p>Standard bank transfer</p>
                                        </FiatButton>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {currentStep === 2 && (
                    <>
                        {_.isEmpty(selectedAssetFiat) &&
                            (withdrawType === PAYPAL ||
                                withdrawType === BANKTRANSFER) && (
                                <h5 className="text-center mt-5">
                                    No Assets to withdraw
                                </h5>
                            )}
                        {!_.isEmpty(selectedAsset) &&
                            withdrawType === CRYPTOCURRENCY && (
                                <div className="deposit width2">
                                    <div className="connect-wallet">
                                        <h5>Select wallet</h5>
                                        <ConnectWalletTab />
                                    </div>
                                    <button
                                        className="btn btn-outline-light rounded-0 w-100 mt-30px mb-5 fw-bold d-flex align-items-center justify-content-center"
                                        onClick={generate_Withdraw_Code}
                                        disabled={
                                            pending ||
                                            isConnecting ||
                                            !isWalletConnected ||
                                            !walletAddress ||
                                            invalidForWithdraw
                                        }
                                    >
                                        <div
                                            className={`${pending || isConnecting ? "opacity-100" : "opacity-0"} d-flex`}
                                        >
                                            <CustomSpinner />
                                        </div>
                                        <div
                                            className={`${pending || isConnecting ? "ms-3" : "pe-4"} text-uppercase`}
                                        >
                                            {isConnecting
                                                ? "Connecting..."
                                                : pending
                                                  ? "Processing..."
                                                  : "Next"}
                                        </div>
                                    </button>
                                    {error && (
                                        <div className="alert alert-danger mt-3">
                                            {error}
                                        </div>
                                    )}
                                </div>
                            )}
                        {!_.isEmpty(selectedAssetFiat) &&
                            withdrawType === PAYPAL && (
                                <div className="deposit width2">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="select_div">
                                                <p className="subtitle">
                                                    Select Withdraw Asset
                                                </p>
                                                <Select
                                                    className="black_input"
                                                    options={myAssetsFiat}
                                                    value={selectedAssetFiat}
                                                    onChange={
                                                        setSelectedAssetFiat
                                                    }
                                                    styles={customSelectStyles}
                                                    components={{
                                                        IndicatorSeparator:
                                                            null,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="select_div">
                                                <p className="subtitle">
                                                    To Currency
                                                </p>
                                                <Select
                                                    className="black_input"
                                                    options={CURRENCIES}
                                                    value={currency}
                                                    onChange={setCurrency}
                                                    styles={customSelectStyles}
                                                    components={{
                                                        IndicatorSeparator:
                                                            null,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="select_div">
                                        <p className="subtitle">
                                            PayPal Email Address
                                        </p>
                                        <input
                                            type="email"
                                            className="black_input"
                                            value={paypalEmail}
                                            onChange={(e) =>
                                                setPaypalEmail(e.target.value)
                                            }
                                            placeholder="Enter PayPal email"
                                        />
                                        {showError && paypalEmailError && (
                                            <p className="text-danger mt-1">
                                                {paypalEmailError}
                                            </p>
                                        )}
                                    </div>
                                    <div className="select_div">
                                        <p className="subtitle">Amount</p>
                                        <div className="black_input withdraw_amount ps-2">
                                            <NumberFormat
                                                value={transferAmount}
                                                thousandSeparator={true}
                                                onValueChange={(values) => {
                                                    setTransferAmount(
                                                        values.value,
                                                    );
                                                }}
                                                allowNegative={false}
                                                decimalScale={2}
                                                placeholder="0.00"
                                            />
                                            <span className="currency-symbol">
                                                {currency.symbol}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        className="btn btn-outline-light rounded-0 w-100 mt-40px fw-bold mb-3 d-flex align-items-center justify-content-center"
                                        onClick={generate_Withdraw_Code}
                                        disabled={
                                            pending ||
                                            !transferAmount ||
                                            Number(transferAmount) <= 0 ||
                                            paypalEmailError
                                        }
                                    >
                                        <div
                                            className={`${pending ? "opacity-100" : "opacity-0"} d-flex`}
                                        >
                                            <CustomSpinner />
                                        </div>
                                        <div
                                            className={`${pending ? "ms-3" : "pe-4"} text-uppercase`}
                                        >
                                            Next
                                        </div>
                                    </button>
                                    {error && (
                                        <div className="alert alert-danger mt-3">
                                            {error}
                                        </div>
                                    )}
                                </div>
                            )}
                        {withdrawType === BANKTRANSFER && (
                            <div className="deposit width2 bankDetail">
                                <div className="mb-2">
                                    <p className="subtitle">Select Country</p>
                                    <Select
                                        className="black_input"
                                        options={Countries}
                                        value={bankWithdrawData.country}
                                        onChange={(selected) =>
                                            setBankWithdrawData({
                                                ...bankWithdrawData,
                                                country: selected,
                                            })
                                        }
                                        styles={customSelectStyles}
                                        components={{
                                            IndicatorSeparator: null,
                                        }}
                                    />
                                </div>
                                <div className="button-group pb-3">
                                    <button
                                        className={`btn ${bankWithdrawData.mode === 1 ? "selected" : ""}`}
                                        onClick={() =>
                                            setBankWithdrawData({
                                                ...bankWithdrawData,
                                                mode: 1,
                                            })
                                        }
                                        style={{ height: 47 }}
                                    >
                                        Domestic transfer
                                    </button>
                                    <button
                                        className={`btn ${bankWithdrawData.mode === 2 ? "selected" : ""}`}
                                        onClick={() =>
                                            setBankWithdrawData({
                                                ...bankWithdrawData,
                                                mode: 2,
                                            })
                                        }
                                        style={{ height: 47 }}
                                    >
                                        International transfer
                                    </button>
                                </div>
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="select_div">
                                            <p className="subtitle">
                                                Select Withdraw Asset
                                            </p>
                                            <Select
                                                className="black_input"
                                                options={myAssetsFiat}
                                                value={selectedAssetFiat}
                                                onChange={setSelectedAssetFiat}
                                                styles={customSelectStyles}
                                                components={{
                                                    IndicatorSeparator: null,
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="select_div">
                                            <p className="subtitle">
                                                To Currency
                                            </p>
                                            <Select
                                                className="black_input"
                                                options={CURRENCIES}
                                                value={currency}
                                                onChange={setCurrency}
                                                styles={customSelectStyles}
                                                components={{
                                                    IndicatorSeparator: null,
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Bank Details Form */}
                                <div className="select_div">
                                    <p className="subtitle">
                                        Account Holder Name
                                    </p>
                                    <input
                                        type="text"
                                        className="black_input"
                                        value={bankWithdrawData.holderName}
                                        onChange={(e) =>
                                            setBankWithdrawData({
                                                ...bankWithdrawData,
                                                holderName: e.target.value,
                                            })
                                        }
                                        placeholder="Enter account holder name"
                                    />
                                    {showError &&
                                        bankWithDrawError.holderName && (
                                            <p className="text-danger mt-1">
                                                {bankWithDrawError.holderName}
                                            </p>
                                        )}
                                </div>

                                <div className="select_div">
                                    <p className="subtitle">Bank Name</p>
                                    <input
                                        type="text"
                                        className="black_input"
                                        value={bankWithdrawData.bankName}
                                        onChange={(e) =>
                                            setBankWithdrawData({
                                                ...bankWithdrawData,
                                                bankName: e.target.value,
                                            })
                                        }
                                        placeholder="Enter bank name"
                                    />
                                    {showError &&
                                        bankWithDrawError.bankName && (
                                            <p className="text-danger mt-1">
                                                {bankWithDrawError.bankName}
                                            </p>
                                        )}
                                </div>

                                <div className="select_div">
                                    <p className="subtitle">Account Number</p>
                                    <input
                                        type="text"
                                        className="black_input"
                                        value={bankWithdrawData.accNumber}
                                        onChange={(e) =>
                                            setBankWithdrawData({
                                                ...bankWithdrawData,
                                                accNumber: e.target.value,
                                            })
                                        }
                                        placeholder="Enter account number"
                                    />
                                    {showError &&
                                        bankWithDrawError.accNumber && (
                                            <p className="text-danger mt-1">
                                                {bankWithDrawError.accNumber}
                                            </p>
                                        )}
                                </div>

                                {/* Conditional fields based on transfer mode */}
                                {bankWithdrawData.mode === 2 && (
                                    <>
                                        <div className="select_div">
                                            <p className="subtitle">
                                                SWIFT/BIC Code
                                            </p>
                                            <input
                                                type="text"
                                                className="black_input"
                                                value={
                                                    bankWithdrawData.swiftBicCode
                                                }
                                                onChange={(e) =>
                                                    setBankWithdrawData({
                                                        ...bankWithdrawData,
                                                        swiftBicCode:
                                                            e.target.value,
                                                    })
                                                }
                                                placeholder="Enter SWIFT/BIC code"
                                            />
                                            {showError &&
                                                bankWithDrawError.swiftBicCode && (
                                                    <p className="text-danger mt-1">
                                                        {
                                                            bankWithDrawError.swiftBicCode
                                                        }
                                                    </p>
                                                )}
                                        </div>

                                        <div className="select_div">
                                            <p className="subtitle">
                                                IBAN Code
                                            </p>
                                            <input
                                                type="text"
                                                className="black_input"
                                                value={
                                                    bankWithdrawData.ibanCode
                                                }
                                                onChange={(e) =>
                                                    setBankWithdrawData({
                                                        ...bankWithdrawData,
                                                        ibanCode:
                                                            e.target.value,
                                                    })
                                                }
                                                placeholder="Enter IBAN code"
                                            />
                                            {showError &&
                                                bankWithDrawError.ibanCode && (
                                                    <p className="text-danger mt-1">
                                                        {
                                                            bankWithDrawError.ibanCode
                                                        }
                                                    </p>
                                                )}
                                        </div>
                                    </>
                                )}

                                {/* Country-specific fields for domestic transfers */}
                                {bankWithdrawData.mode === 1 &&
                                    bankWithdrawData.country?.value &&
                                    DOMESTIC_BANK_PER_COUNTRY[
                                        bankWithdrawData.country.value
                                    ] && (
                                        <>
                                            {DOMESTIC_BANK_PER_COUNTRY[
                                                bankWithdrawData.country.value
                                            ].meta?.map((field) => (
                                                <div
                                                    key={field}
                                                    className="select_div"
                                                >
                                                    <p className="subtitle">
                                                        {field}
                                                    </p>
                                                    <input
                                                        type="text"
                                                        className="black_input"
                                                        value={
                                                            bankSpecificData[
                                                                field
                                                            ] || ""
                                                        }
                                                        onChange={(e) =>
                                                            setBankSpecificData(
                                                                {
                                                                    ...bankSpecificData,
                                                                    [field]:
                                                                        e.target
                                                                            .value,
                                                                },
                                                            )
                                                        }
                                                        placeholder={`Enter ${field.toLowerCase()}`}
                                                    />
                                                    {showError &&
                                                        bankWithDrawError[
                                                            field
                                                        ] && (
                                                            <p className="text-danger mt-1">
                                                                {
                                                                    bankWithDrawError[
                                                                        field
                                                                    ]
                                                                }
                                                            </p>
                                                        )}
                                                </div>
                                            ))}
                                        </>
                                    )}

                                <div className="select_div">
                                    <p className="subtitle">
                                        Recipient Address
                                    </p>
                                    <LocationSearchInput
                                        address={recipientAddress}
                                        setAddress={setRecipientAddress}
                                    />
                                    {showError &&
                                        bankWithDrawError.recipientAddress && (
                                            <p className="text-danger mt-1">
                                                {
                                                    bankWithDrawError.recipientAddress
                                                }
                                            </p>
                                        )}
                                </div>

                                <div className="select_div">
                                    <p className="subtitle">Post Code</p>
                                    <input
                                        type="text"
                                        className="black_input"
                                        value={bankWithdrawData.postCode}
                                        onChange={(e) =>
                                            setBankWithdrawData({
                                                ...bankWithdrawData,
                                                postCode: e.target.value,
                                            })
                                        }
                                        placeholder="Enter post code"
                                    />
                                    {showError &&
                                        bankWithDrawError.postCode && (
                                            <p className="text-danger mt-1">
                                                {bankWithDrawError.postCode}
                                            </p>
                                        )}
                                </div>

                                <div className="select_div">
                                    <p className="subtitle">Amount</p>
                                    <div className="black_input withdraw_amount ps-2">
                                        <NumberFormat
                                            value={transferAmount}
                                            thousandSeparator={true}
                                            onValueChange={(values) => {
                                                setTransferAmount(values.value);
                                            }}
                                            allowNegative={false}
                                            decimalScale={2}
                                            placeholder="0.00"
                                        />
                                        <span className="currency-symbol">
                                            {currency.symbol}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    className="btn btn-outline-light rounded-0 w-100 mt-40px fw-bold mb-3 d-flex align-items-center justify-content-center"
                                    onClick={generate_Withdraw_Code}
                                    disabled={
                                        pending ||
                                        !transferAmount ||
                                        Number(transferAmount) <= 0 ||
                                        !_.isEmpty(bankWithDrawError)
                                    }
                                >
                                    <div
                                        className={`${pending ? "opacity-100" : "opacity-0"} d-flex`}
                                    >
                                        <CustomSpinner />
                                    </div>
                                    <div
                                        className={`${pending ? "ms-3" : "pe-4"} text-uppercase`}
                                    >
                                        Next
                                    </div>
                                </button>
                                {error && (
                                    <div className="alert alert-danger mt-3">
                                        {error}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
                {currentStep === 4 && (
                    <div className="deposit width2">
                        <div className="confirm_div">
                            <h4 className="mt-3">
                                <strong>Enter Confirmation Code</strong>
                            </h4>
                            <p className="mt-2">
                                We've sent a 6-digit confirmation code to your
                                email. Please enter it below.
                            </p>
                        </div>
                        <div className="verification-code-container my-4">
                            <ReactCodeInput
                                type="number"
                                fields={6}
                                value={confirmCode}
                                onChange={setConfirmCode}
                                className="react-code-input"
                                inputStyle={{
                                    fontFamily: "monospace",
                                    margin: "4px",
                                    MozAppearance: "textfield",
                                    width: "40px",
                                    borderRadius: "3px",
                                    fontSize: "14px",
                                    height: "40px",
                                    paddingLeft: "7px",
                                    backgroundColor: "transparent",
                                    color: "white",
                                    border: "1px solid #6c757d",
                                }}
                            />
                        </div>
                        <div className="text-center">
                            <span
                                className="btn btn-link text-light"
                                style={{ opacity: pending ? 0.5 : 1 }}
                                onClick={generate_Withdraw_Code}
                                disabled={pending}
                            >
                                <strong>Resend</strong>
                            </span>
                        </div>
                        {error && (
                            <div className="alert alert-danger mt-3">
                                {error}
                            </div>
                        )}
                        <div className="d-flex justify-content-center mt-2">
                            <button
                                className="btn btn-outline-light fw-bold rounded-0 w-50 mx-1"
                                onClick={closeModal}
                            >
                                CANCEL
                            </button>
                            <button
                                className="btn btn-outline-light fw-bold rounded-0 w-50 mx-1 d-flex align-items-center justify-content-center"
                                onClick={handleWithdrawRequest}
                                disabled={pending || confirmCode.length < 6}
                            >
                                <div
                                    className={`${pending ? "opacity-100" : "opacity-0"} d-flex`}
                                >
                                    <CustomSpinner />
                                </div>
                                <div className={`${pending ? "ms-3" : "pe-4"}`}>
                                    CONFIRM
                                </div>
                            </button>
                        </div>
                    </div>
                )}
                {currentStep === 5 && (
                    <div className="deposit width2">
                        <div className="confirm_div">
                            <h4 className="mt-3">
                                <strong>
                                    {withdrawType === PAYPAL && "PayPal "}
                                    {withdrawType === BANKTRANSFER &&
                                        "Bank Transfer "}
                                    {withdrawType === CRYPTOCURRENCY &&
                                        "Cryptocurrency "}
                                    Withdraw Details
                                </strong>
                            </h4>
                            <h5 className="mt-2 txt-green">
                                Request sent successfully
                            </h5>
                            <div className="stats_div w-100 mt-2">
                                {withdrawType === PAYPAL &&
                                    confirmDataForPaypal.map((item, index) => (
                                        <div key={index} className="row mb-2">
                                            <div className="col-6 text-muted">
                                                {item.topic}
                                            </div>
                                            <div className="col-6 text-end">
                                                {item.content}
                                            </div>
                                        </div>
                                    ))}
                                {withdrawType === BANKTRANSFER &&
                                    confirmDataForBankTransfer.map(
                                        (item, index) => (
                                            <div
                                                key={index}
                                                className="row mb-2"
                                            >
                                                <div className="col-6 text-muted">
                                                    {item.topic}
                                                </div>
                                                <div className="col-6 text-end">
                                                    {item.content}
                                                </div>
                                            </div>
                                        ),
                                    )}
                                {withdrawType === CRYPTOCURRENCY &&
                                    confirmDataForCrypto.map((item, index) => (
                                        <div key={index} className="row mb-2">
                                            <div className="col-6 text-muted">
                                                {item.topic}
                                            </div>
                                            <div className="col-6 text-end">
                                                {item.content}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                            <button
                                className="btn btn-outline-light rounded-0 w-100 mt-4 fw-bold"
                                onClick={closeModal}
                            >
                                CLOSE
                            </button>
                        </div>
                    </div>
                )}
            </>
        </Modal>
    );
}
