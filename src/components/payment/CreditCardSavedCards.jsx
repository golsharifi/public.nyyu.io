import { useMutation } from "@apollo/client";
import { useStripe } from "@stripe/react-stripe-js";
import React, { useState } from "react";
import {
    getCookie,
    NDB_Auction,
    NDB_Paypal_TrxType,
    NDB_Presale,
} from "../../utilities/cookies";
import { Amex } from "../../utilities/imgImport";
import CustomSpinner from "../common/custom-spinner";
import {
    PAY_STRIPE_FOR_AUCTION_WITH_SAVED_CARD,
    PAY_STRIPE_FOR_PRESALE_WITH_SAVED_CARD,
} from "./payment-webservice";
import PaymentFailure from "./PaymentFailure";
import PaymentSuccessful from "./PaymentSuccessful";

export default function CreditCardSavedCards({
    savedCards,
    deleteCardMethod,
    selectedSavedCard,
    setSelectedSavedCard,
    amount,
    roundId,
    orderId,
}) {
    // Containers
    const stripe = useStripe();
    const [requestPending, setRequestPending] = useState(false);
    const [stripePaymentSecondCall, setStripePaymentSecondCall] =
        useState(false);
    const [successfulPayment, setSuccessfulPayment] = useState(null);

    const [stripePaymentId, setStripePaymentId] = useState(0);

    // Webserver
    const [payStripeForAuctionWithSavedCard] = useMutation(
        PAY_STRIPE_FOR_AUCTION_WITH_SAVED_CARD,
        {
            onCompleted: (data) => {
                if (stripePaymentSecondCall === false) {
                    if (data.payStripeForAuctionWithSavedCard.error) {
                        setRequestPending(false);
                        return setSuccessfulPayment(false);
                    }
                    const { clientSecret, requiresAction } =
                        data.payStripeForAuctionWithSavedCard;
                    if (requiresAction === false || requiresAction === null) {
                        setRequestPending(false);
                        return setSuccessfulPayment(true);
                    }
                    if (clientSecret)
                        return stripe
                            .handleCardAction(clientSecret)
                            .then((result) => {
                                setStripePaymentSecondCall(true);
                                if (result.error) {
                                    setRequestPending(false);
                                    return setSuccessfulPayment(false);
                                }
                                const paymentIntentId = result.paymentIntent.id;
                                return payStripeForAuctionWithSavedCard({
                                    variables: {
                                        roundId,
                                        amount: amount * 100,
                                        cardId: savedCards[selectedSavedCard]
                                            .id,
                                        paymentIntentId,
                                    },
                                });
                            });
                    return setSuccessfulPayment(false);
                } else if (stripePaymentSecondCall === true) {
                    if (
                        data.payStripeForAuctionWithSavedCard.error ||
                        data.payStripeForAuctionWithSavedCard.requiresAction ===
                            true
                    ) {
                        setRequestPending(false);
                        return setSuccessfulPayment(false);
                    }
                    return setSuccessfulPayment(true);
                }
            },
            onError: (error) => console.log(error),
        }
    );
    const [payStripeForPreSaleWithSavedCard] = useMutation(
        PAY_STRIPE_FOR_PRESALE_WITH_SAVED_CARD,
        {
            onCompleted: (data) => {
                if (stripePaymentSecondCall === false) {
                    if (data.payStripeForPreSaleWithSavedCard.error) {
                        setRequestPending(false);
                        return setSuccessfulPayment(false);
                    }
                    const { clientSecret, requiresAction, paymentId } =
                        data.payStripeForPreSaleWithSavedCard;
                    if (requiresAction === false || requiresAction === null) {
                        setRequestPending(false);
                        return setSuccessfulPayment(true);
                    }
                    if (clientSecret) {
                        setStripePaymentId(paymentId);
                            return stripe
                                .handleCardAction(clientSecret)
                                .then((result) => {
                                    setStripePaymentSecondCall(true);
                                    if (result.error) {
                                        setRequestPending(false);
                                        return setSuccessfulPayment(false);
                                    }
                                    const paymentIntentId = result.paymentIntent.id;
                                    return payStripeForPreSaleWithSavedCard({
                                        variables: {
                                            id: paymentId,
                                            presaleId: roundId,
                                            orderId: orderId,
                                            amount: amount * 100,
                                            cardId: savedCards[selectedSavedCard]
                                                .id,
                                            paymentIntentId,
                                        },
                                    });
                                });
                    }
                    return setSuccessfulPayment(false);
                } else if (stripePaymentSecondCall === true) {
                    if (
                        data.payStripeForPreSaleWithSavedCard.error ||
                        data.payStripeForPreSaleWithSavedCard.requiresAction ===
                            true
                    ) {
                        setRequestPending(false);
                        return setSuccessfulPayment(false);
                    }
                    return setSuccessfulPayment(true);
                }
            },
            onError: (error) => console.log(error),
        }
    );

    // Methods
    const submitPayment = () => {
        setRequestPending(true);
        const type = getCookie(NDB_Paypal_TrxType);
        if (type === NDB_Auction)
            return payStripeForAuctionWithSavedCard({
                variables: {
                    roundId,
                    amount: amount * 100,
                    cardId: savedCards[selectedSavedCard].id,
                    paymentIntentId: null,
                },
            });
        else if (type === NDB_Presale) {
            payStripeForPreSaleWithSavedCard({
                variables: {
                    id: 0,
                    presaleId: roundId,
                    orderId: orderId,
                    amount: amount * 100,
                    cardId: savedCards[selectedSavedCard].id,
                    paymentIntentId: null,
                },
            });
        }
    };

    // Render
    return successfulPayment === true ? (
        <PaymentSuccessful timeout={3} />
    ) : successfulPayment === false ? (
        <PaymentFailure timeout={3} />
    ) : (
        <>
            <div className="credit-card-save-cards text-light row m-0 mb-4 mb-sm-2 px-0">
                {savedCards.map((item, index) => {
                    return (
                        <div
                            key={index}
                            className={`credit-card-save-cards-item mb-3 mb-sm-2 col-lg-6 col-12 ${
                                index % 2 === 0
                                    ? "pe-lg-2 px-0"
                                    : "ps-lg-2 px-0"
                            }`}
                        >
                            <button
                                onClick={() => setSelectedSavedCard(index)}
                                className={`btn rounded-0 mt-0 col-12 ${
                                    index === selectedSavedCard && "active"
                                }`}
                            >
                                <div className="d-flex align-items-start">
                                    <img
                                        src={Amex}
                                        alt="Amex"
                                        className="me-4"
                                    />
                                    <div className="credit-card-save-cards-item-details">
                                        **** **** **** {item.last4} <br />
                                        {item.expMonth}/{item.expYear}
                                    </div>
                                    <button
                                        onClick={() =>
                                            deleteCardMethod(item.id)
                                        }
                                        className="btn text-underline text-light mt-0 pt-0 fs-13px ms-auto"
                                    >
                                        Delete card
                                    </button>
                                </div>
                            </button>
                        </div>
                    );
                })}
                {savedCards.length === 0 && (
                    <div className="text-center mx-auto mt-2 text-uppercase text-light fw-500">
                        No saved cards
                    </div>
                )}
            </div>
            <button
                className={`btn btn-outline-light rounded-0 text-uppercase confirm-payment fw-bold w-100 mt-2 ${
                    requestPending && "disabled"
                }`}
                onClick={requestPending ? null : submitPayment}
            >
                <div className="d-flex align-items-center justify-content-center gap-3">
                    {requestPending && <CustomSpinner sm />}
                    {stripePaymentSecondCall ? "verifying" : "confirm payment"}
                </div>
            </button>
        </>
    );
}
