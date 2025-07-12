import React, { useMemo, useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import NumberFormat from "../../../../utilities/number";
import Modal from "react-modal";
import { Icon } from "@iconify/react";
import Select, { components } from "react-select";
import { CloseIcon } from "../../../../utilities/imgImport";
import CustomSpinner from "../../../common/custom-spinner";
import * as Mutation from "../../../../apollo/graphqls/mutations/Approval";
import { useBankDeposit } from "./useBankDeposit";
import { showSuccessAlarm, showFailAlarm } from "../../AlarmModal";

const CURRENCIES = [
    { label: "USD", value: "USD", symbol: "$" },
    { label: "GBP", value: "GBP", symbol: "£" },
    { label: "EUR", value: "EUR", symbol: "€" },
];

const DropdownIndicator = (props) => {
    return (
        <components.DropdownIndicator {...props}>
            <Icon icon="ant-design:caret-down-filled" />
        </components.DropdownIndicator>
    );
};

const ApproveBankDepositModal = ({ isOpen, setIsOpen, datum }) => {
    const bankDeposit = useBankDeposit();

    const [currencyCode, setCurrencyCode] = useState(CURRENCIES[0]);
    const [confirmCode, setConfirmCode] = useState("");
    const [depositAmount, setDepositAmount] = useState("");
    const [showError, setShowError] = useState(false);
    const [pending, setPending] = useState(false);
    const [loading, setLoading] = useState(false);

    const error = useMemo(() => {
        if (!depositAmount || Number(depositAmount) === 0)
            return "Amount is required";
        if (!confirmCode) return "Confirmation code is required";
        return "";
    }, [depositAmount, confirmCode]);

    const [sendWithdrawConfirmCodeMutation] = useMutation(
        Mutation.SEND_WITHDRAW_CONFIRM_CODE,
        {
            onCompleted: (data) => {
                if (data.sendWithdrawConfirmCode) {
                    setLoading(false);
                }
            },
            onError: (err) => {
                showFailAlarm("Sending confirmation code failed", err.message);
                setIsOpen(false);
            },
        },
    );

    useEffect(() => {
        setLoading(true);
        sendWithdrawConfirmCodeMutation();
    }, [sendWithdrawConfirmCodeMutation]);

    const [confirmBankDepositMutation] = useMutation(
        Mutation.CONFIRM_BANK_DEPOSIT,
        {
            onCompleted: (data) => {
                if (data.confirmBankDeposit) {
                    bankDeposit.updateDatum(data.confirmBankDeposit);
                    showSuccessAlarm("Bank Deposit Request approved");
                }
                setPending(false);
                setIsOpen(false);
            },
            onError: (err) => {
                console.log(err);
                showFailAlarm("Action failed", err.message);
                setPending(false);
                setIsOpen(false);
            },
        },
    );

    const handleSubmit = async () => {
        if (error) {
            setShowError(true);
            return;
        }
        setPending(true);
        const confirmData = {
            id: datum.id,
            currencyCode: currencyCode.value,
            amount: Number(depositAmount),
            cryptoType: "USDT",
            code: confirmCode,
        };
        confirmBankDepositMutation({
            variables: { ...confirmData },
        });
    };

    const closeModal = () => {
        setIsOpen(false);
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={closeModal}
            className="support-modal"
            overlayClassName="deposit-widthdraw-modal__overlay"
            ariaHideApp={false}
        >
            <div className="support-modal__header justify-content-end">
                <div
                    onClick={closeModal}
                    onKeyDown={closeModal}
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
            <div className="width1">
                <div className="text-center mb-3">
                    <h4 className="mt-3">Approve Bank Deposit</h4>
                    <p>
                        <span className="text-muted me-2">Reference:</span>{" "}
                        {datum.uid}
                    </p>
                    <p>
                        <span className="text-muted me-2">User's email:</span>{" "}
                        {datum.email}
                    </p>
                </div>
                {loading ? (
                    <div className="text-center my-4">
                        <CustomSpinner />
                    </div>
                ) : (
                    <div>
                        <p className="text-muted">Select currency</p>
                        <Select
                            className="black_input"
                            options={CURRENCIES}
                            value={currencyCode}
                            onChange={(selected) => {
                                setCurrencyCode(selected);
                            }}
                            styles={customSelectStyles}
                            components={{
                                IndicatorSeparator: null,
                                DropdownIndicator,
                            }}
                        />
                        <p className="text-muted mt-2">Amount</p>
                        <NumberFormat
                            className="black_input"
                            thousandSeparator={true}
                            prefix={currencyCode.symbol + " "}
                            allowNegative={false}
                            value={depositAmount}
                            onValueChange={(values) =>
                                setDepositAmount(values.value)
                            }
                            decimalScale={2}
                        />
                        <p className="text-muted mt-2">Code</p>
                        <input
                            className="black_input"
                            value={confirmCode}
                            onChange={(e) => setConfirmCode(e.target.value)}
                        />
                        <p className="txt-green fs-12px">
                            Confirmation code sent to ADMIN
                        </p>
                        <p className="text-danger mt-3">{showError && error}</p>
                        <button
                            className="btn btn-outline-light rounded-0 my-5 fw-bold w-100"
                            style={{ height: 47 }}
                            onClick={handleSubmit}
                        >
                            {pending ? <CustomSpinner /> : "CONFIRM"}
                        </button>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default ApproveBankDepositModal;

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
        borderRadius: 0,
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
