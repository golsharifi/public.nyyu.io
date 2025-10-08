/* eslint-disable */
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { navigate } from "gatsby";

import { useQuery } from "@apollo/client";
import { useMutation } from "@apollo/client";
import _ from "lodash";
import { FaArrowLeft } from "@react-icons/all-files/fa/FaArrowLeft";

import Header from "../header";
import Loading from "../common/Loading";
import {
    CryptoCoin,
    Paypal,
    Credit,
    NyyuWalletPayment,
    ExternalWallet,
    PaypalBrand,
} from "../../utilities/imgImport";
import Seo from "./../seo";
import CreditCardTab from "./credit-card-tab";
import CoinPaymentsTab from "./CoinPaymentsTab";
import OrderSummary from "./order-summary";
import OrderSummaryOfCoinPayments from "./OrderSummaryOfCoinPayments";
import OrderSummaryOfCreditCard from "./order-summary-of-credit-card";
import { set_All_Fees } from "../../store/actions/settingAction";
import OrderSummaryNDBWallet from "./OrderSummaryNDBWallet";
import NDBWalletTab from "./NDBWalletTab";
import PaymentExternalWalletTab from "./payment-external-wallet-tab";
import { GET_ALL_FEES } from "../../apollo/graphqls/querys/Payment";
import {
    PAYPAL_FOR_AUCTION,
    PAYPAL_FOR_PRESALE,
} from "../../apollo/graphqls/mutations/Payment";
import {
    getCookie,
    NDB_Paypal_TrxType,
    NDB_Auction,
    NDB_Presale,
} from "../../utilities/cookies";
import { ROUTES } from "../../utilities/routes";
import AuctionProvider from "../../providers/auction-context";
import CurrentCapProgressBar from "../shared/CurrentCapProgressBar";

const payment_types = [
    { icon: CryptoCoin, value: "cryptocoin", label: "Cryptocoin" },
    { icon: Credit, value: "creditcard", label: "Credit / Debit Card" },
    { icon: Paypal, value: "paypal", label: "PayPal" },
    { icon: NyyuWalletPayment, value: "nyyu_wallet", label: "Nyyu Wallet" },
    {
        icon: ExternalWallet,
        value: "externalwallets",
        label: "External Wallets",
    },
];

const Payment = () => {
    const {
        round_id: currentRound,
        bid_amount: bidAmount,
        order_id: orderId,
    } = useSelector((state) => state?.placeBid);

    const [allFees, setAllFees] = useState(null);
    const [payPalLoading, setPayPalLoading] = useState(false);
    const [paySuccess, setPaySuccess] = useState(false);

    const dispatch = useDispatch();
    const loading = !(allFees && !payPalLoading);

    // if (!isSSR && !currentRound) navigate(ROUTES.auction);
    // TODO: uncomment the above line later on.

    const [tabIndex, setTabIndex] = useState(0);

    useEffect(() => {
        if (currentRound === 0) navigate(ROUTES.auction);
    }, [currentRound]);

    useQuery(GET_ALL_FEES, {
        onCompleted: (data) => {
            setAllFees(data.getAllFees);
            const allFees = _.mapKeys(data.getAllFees, "tierLevel");

            if (allFees) {
                dispatch(set_All_Fees(allFees));
            }
        },
        onError: (error) => console.log(error),
    });

    const [paypalForAuctionMutation] = useMutation(PAYPAL_FOR_AUCTION, {
        onCompleted: (data) => {
            let links = data.paypalForAuction.links;
            for (let i = 0; i < links.length; i++) {
                if (links[i].rel === "approve") {
                    setPayPalLoading(false);
                    window.location.href = links[i].href;
                    break;
                }
            }
        },
        onError: (err) => {
            console.log(err);
            alert("Error in PayPal checkout");
            setPayPalLoading(false);
        },
    });

    const [paypalForPresaleMutation] = useMutation(PAYPAL_FOR_PRESALE, {
        onCompleted: (data) => {
            let links = data.paypalForPresale.links;
            for (let i = 0; i < links.length; i++) {
                if (links[i].rel === "approve") {
                    setPayPalLoading(false);
                    window.location.href = links[i].href;
                    break;
                }
            }
        },
        onError: (err) => {
            console.log(err);
            alert("Error in PayPal checkout from backend");
            setPayPalLoading(false);
        },
    });

    const initPaypal = () => {
        setPayPalLoading(true);
        const paypalTrxType = getCookie(NDB_Paypal_TrxType);
        if (paypalTrxType === NDB_Auction) {
            paypalForAuctionMutation({
                variables: { roundId: currentRound, currencyCode: "USD" },
            });
        } else if (paypalTrxType === NDB_Presale) {
            paypalForPresaleMutation({
                variables: {
                    presaleId: currentRound,
                    orderId,
                    currencyCode: "USD",
                },
            });
        }
    };

    if (loading) return <Loading />;
    return (
        <AuctionProvider>
            <Seo title="Payment" />
            <main className="payment-page">
                <Header />
                <section className="container position-relative">
                    <div className="row payment-wrapper">
                        <div className="col-lg-8 payment-select">
                            <div className="payment-type__tab">
                                <div className="payment-type__tab-name">
                                    {tabIndex !== 0 && (
                                        <FaArrowLeft
                                            className="left-arrow cursor-pointer text-light"
                                            size="1.3rem"
                                            onClick={() => setTabIndex(0)}
                                        />
                                    )}
                                    <h4>
                                        {tabIndex === 0
                                            ? "How do you want to pay?"
                                            : payment_types[tabIndex - 1].label}
                                    </h4>
                                </div>
                                {tabIndex === 0 && (
                                    <div className="payment-type__tab-list">
                                        {payment_types.map((item, idx) => (
                                            <div
                                                className="payment-type"
                                                key={idx}
                                                onClick={() =>
                                                    setTabIndex(idx + 1)
                                                }
                                                style={{
                                                    display:
                                                        idx === 2 && "none",

                                                    width: "calc(50% - 6px)",
                                                    // idx === 0
                                                    //     ? "100%"
                                                    //     : "calc(50% - 6px)",
                                                    marginRight:
                                                        idx === 0 || idx === 3
                                                            ? "12px"
                                                            : "0",
                                                    // idx % 2 === 0 || idx === 0
                                                    //     ? "0"
                                                    //     : "12px",
                                                }}
                                            >
                                                <img
                                                    className="payment-type__icon"
                                                    src={item.icon}
                                                    alt="payment type"
                                                />
                                                <p className="payment-type__name">
                                                    {item.label}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}{" "}
                                {tabIndex === 1 && (
                                    <CoinPaymentsTab
                                        currentRound={currentRound}
                                        bidAmount={bidAmount}
                                        paySuccess={paySuccess}
                                    />
                                )}
                                {tabIndex === 2 && (
                                    <CreditCardTab
                                        amount={Number(bidAmount).toFixed(2)}
                                        round={currentRound}
                                        orderId={orderId}
                                    />
                                )}
                                {tabIndex === 3 && (
                                    <div className="paypal-tab">
                                        <div
                                            className="payment-content"
                                            onClick={() => initPaypal()}
                                        >
                                            <button className="paypal-checkout btn-second">
                                                Check out with &nbsp;
                                                <img
                                                    src={PaypalBrand}
                                                    alt="paypal"
                                                />
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {tabIndex === 4 && (
                                    <NDBWalletTab
                                        bidAmount={bidAmount}
                                        currentRound={currentRound}
                                        orderId={orderId}
                                    />
                                )}
                                {tabIndex === 5 && (
                                    <div className="externalwallets-tab">
                                        <div
                                            className="payment-content"
                                            style={{ display: "block" }}
                                        >
                                            <PaymentExternalWalletTab
                                                currentRound={currentRound}
                                                bidAmount={bidAmount}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        {tabIndex === 1 && (
                            <OrderSummaryOfCoinPayments
                                bidAmount={bidAmount}
                                setPaymentSuccess={setPaySuccess}
                            />
                        )}
                        {tabIndex === 2 && (
                            <OrderSummaryOfCreditCard bidAmount={bidAmount} />
                        )}
                        {tabIndex === 4 && (
                            <OrderSummaryNDBWallet bidAmount={bidAmount} />
                        )}
                        {tabIndex !== 1 && tabIndex !== 2 && tabIndex !== 4 && (
                            <OrderSummary bidAmount={bidAmount} />
                        )}
                    </div>
                    <div className="mt-5 py-5">
                        <CurrentCapProgressBar />
                    </div>
                </section>
            </main>
        </AuctionProvider>
    );
};

export default Payment;
