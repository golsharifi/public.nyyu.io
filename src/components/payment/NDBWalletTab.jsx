import { useMutation, useQuery } from "@apollo/client";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import Select, { components } from "react-select";
import _ from "lodash";
import { Icon } from "@iconify/react";
import { ReactTooltip } from "../../utilities/tooltip";
import NumberFormat from "../../utilities/number";
import { GET_BALANCES } from "../../apollo/graphqls/querys/Auth";
import { PAYMENT_FRACTION_TOOLTIP_CONTENT } from "../../utilities/staticData";
import CustomSpinner from "../common/custom-spinner";
import { CheckBox } from "../common/FormControl";
import svgToDataURL from "svg-to-dataurl";
import {
    PAY_WALLET_FOR_PRESALE,
    PAY_WALLLET_FOR_AUCTION,
} from "./payment-webservice";
import PaymentSuccessful from "./PaymentSuccessful";
import { getNDBWalletPaymentFee } from "../../utilities/utility-methods";
import {
    getCookie,
    NDB_Paypal_TrxType,
    NDB_Auction,
    NDB_Presale,
} from "../../utilities/cookies";
import { roundNumber } from "../../utilities/number";

const { Option } = components;

const setAmountWithPrecision = (tokenType, amount) => {
    let precision = 8;

    return (
        Math.round(amount * Math.pow(10, precision)) / Math.pow(10, precision)
    );
};

const SelectOption = (props) => {
    const { data } = props;
    return (
        <Option {...props}>
            <div className="d-flex justify-content-center justify-content-sm-start align-items-center ">
                <img
                    src={svgToDataURL(data.icon)}
                    style={{ width: "30px", height: "30px" }}
                    alt={data.value}
                />
                <div className="d-flex justify-content-between w-100 ms-2">
                    <NumberFormat
                        className="ms-2"
                        displayType={"text"}
                        value={setAmountWithPrecision(
                            data.tokenType,
                            data.amount,
                        )}
                        thousandSeparator={true}
                        renderText={(value, props) => <p {...props}>{value}</p>}
                        style={{ width: "70%" }}
                    />
                    <p style={{ width: "30%" }}>{data.tokenType}</p>
                </div>
            </div>
        </Option>
    );
};

export default function NDBWalletTab({ bidAmount, currentRound, orderId }) {
    // Containers
    const [balance, setBalance] = useState(null);
    const [userBalances, setUserBalances] = useState(null);
    const loading = !userBalances;
    const [requestPending, setRequestPending] = useState(false);
    const [error, setError] = useState("");
    const [paymentSuccessful, setPaymentSuccessful] = useState(false);

    // Getting the fee.
    const { allFees } = useSelector((state) => state);
    const user = useSelector((state) => state.auth.user);
    const NDBWalletPaymentFee = getNDBWalletPaymentFee(
        user,
        allFees,
        bidAmount,
    );
    const finalPaymentAmount = Number(bidAmount) + Number(NDBWalletPaymentFee);

    // Webserver
    useQuery(GET_BALANCES, {
        onCompleted: (data) => {
            if (data.getBalances) {
                let list = data.getBalances?.filter(
                    (token) =>
                        token.tokenName !== "NDB" && token.tokenName !== "WATT",
                );
                list = _.orderBy(list, ["free"], ["desc"]);
                list = list.map((item) => ({
                    value: item.free + item.tokenSymbol,
                    tokenType: item.tokenSymbol,
                    icon: item.symbol,
                    amount: item.free,
                }));

                setUserBalances(list);
                setBalance(list[0]);
            }
        },
        onError: (error) => console.log(error),
    });
    const [payWalletForAuction] = useMutation(PAY_WALLLET_FOR_AUCTION, {
        onCompleted: (data) => {
            if (data && data?.payWalletForAuction === "SUCCESS")
                setPaymentSuccessful(true);
            setRequestPending(false);
        },
        onError: (error) => {
            setError("Insufficient funds");
            setRequestPending(false);
        },
    });
    const [payWalletForPresale] = useMutation(PAY_WALLET_FOR_PRESALE, {
        onCompleted: (data) => {
            if (data && data?.payWalletForPresale === "Success")
                setPaymentSuccessful(true);
            setRequestPending(false);
        },
        onError: (error) => {
            setError("Insufficient funds");
            setRequestPending(false);
        },
    });

    // Methods
    const submitPayment = (e) => {
        e.preventDefault();
        setError("");
        setRequestPending(true);
        const type = getCookie(NDB_Paypal_TrxType);
        if (type === NDB_Auction)
            return payWalletForAuction({
                variables: {
                    roundId: currentRound,
                    cryptoType: balance?.tokenType,
                },
            });
        else if (type === NDB_Presale)
            return payWalletForPresale({
                variables: {
                    presaleId: currentRound,
                    orderId: orderId,
                    cryptoType: balance?.tokenType,
                },
            });
    };

    // Render
    if (loading)
        return (
            <div className="text-center py-3">
                <CustomSpinner />
            </div>
        );

    return (
        <div className="wallet-tab">
            <div className="payment-content">
                {error && (
                    <div className="text-danger fs-16px ps-0 mb-2">
                        <div className="d-flex align-items-center gap-2">
                            <Icon
                                icon="bx:error-circle"
                                className="icon-23px"
                            />
                            <div>{error}</div>
                        </div>
                    </div>
                )}
                {paymentSuccessful ? (
                    <PaymentSuccessful />
                ) : (
                    <>
                        <div className="select_div">
                            <div className="col-lg-4">
                                <p className="text-lightgrey mb-1">
                                    Your wallet balance
                                </p>
                                <Select
                                    className="balance-select"
                                    options={userBalances}
                                    value={balance}
                                    onChange={(v) => setBalance(v)}
                                    components={{
                                        Option: SelectOption,
                                        SingleValue: SelectOption,
                                    }}
                                    styles={customSelectWithIconStyles}
                                />
                            </div>
                            <div className="col-lg-8">
                                <p className="text-lightgrey mb-1">
                                    Payment amount
                                </p>
                                <NumberFormat
                                    className="black_input form-control ps-3"
                                    displayType={"text"}
                                    suffix=" USD"
                                    value={roundNumber(
                                        Number(finalPaymentAmount),
                                        2,
                                    )}
                                    thousandSeparator={true}
                                    renderText={(value, props) => (
                                        <p {...props}>~ {value}</p>
                                    )}
                                />
                            </div>
                        </div>
                        <div className="mt-3 d-flex justify-content-between">
                            <div className="d-flex flex-row align-items-center">
                                <CheckBox
                                    type="checkbox"
                                    name="allow_fraction"
                                    className="text-uppercase"
                                />
                                <div className="allow-text text-light">
                                    Do you allow fraction of order compleation?
                                    <span
                                        className="ms-2 fs-20px"
                                        data-tip="React-tooltip"
                                        data-for="ndb-wallet-question-mark-tooltip"
                                    >
                                        <Icon icon="bi:question-circle" />
                                    </span>
                                </div>
                                <ReactTooltip
                                    id="ndb-wallet-question-mark-tooltip"
                                    place="right"
                                    type="light"
                                    effect="solid"
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
                            <p className="payment-expire my-auto text-uppercase">
                                payment expires in{" "}
                                <span className="txt-green">10 minutes</span>
                            </p>
                        </div>
                        <button
                            className={`btn btn-outline-light rounded-0 text-uppercase confirm-payment fw-bold w-100 mt-4 ${
                                requestPending && "disabled"
                            }`}
                            disabled={requestPending}
                            onClick={submitPayment}
                        >
                            <div className="d-flex align-items-center justify-content-center gap-3">
                                {requestPending && <CustomSpinner />}
                                confirm payment
                            </div>
                        </button>
                    </>
                )}
            </div>
        </div>
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
    placeholder: (provided) => ({
        ...provided,
        color: "transparent",
    }),
};
