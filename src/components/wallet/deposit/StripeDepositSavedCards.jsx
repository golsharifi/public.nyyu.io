import React, { useState } from "react";
import { Amex } from "../../../utilities/imgImport";
import CustomSpinner from "../../common/custom-spinner";
import { useMutation } from "@apollo/client";
import { STRIPE_FOR_DEPOSIT_WITH_SAVED_CARD } from "../../payment/payment-webservice";
import PaymentSuccessful from "../../payment/PaymentSuccessful";
import PaymentFailure from "../../payment/PaymentFailure";
import { isBrowser } from "../../../utilities/auth";
import { useStripe } from "@stripe/react-stripe-js";

export default function StripeDepositSavedCards({
    savedCards,
    deleteCardMethod,
    amount,
    currency,
    closeModal,
}) {
    // Containers
    const stripe = useStripe();
    const [requestPending, setRequestPending] = useState(false);
    const [selectedSavedCard, setSelectedSavedCard] = useState(0);
    const [successfulPayment, setSuccessfulPayment] = useState(null);
    const [stripePaymentSecondCall, setStripePaymentSecondCall] =
        useState(false);
    const [stripePaymentWithSavedCard] = useMutation(
        STRIPE_FOR_DEPOSIT_WITH_SAVED_CARD,
        {
            onCompleted: (data) => {
                if (stripePaymentSecondCall === false) {
                    if (data.stripeForDepositWithSavedCard.error) {
                        setRequestPending(false);
                        return setSuccessfulPayment(false);
                    }
                    const { clientSecret, requiresAction } =
                        data.stripeForDepositWithSavedCard;
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
                                return stripePaymentWithSavedCard({
                                    variables: {
                                        fiatType: currency.value,
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
                        data.stripeForDepositWithSavedCard.error ||
                        data.stripeForDepositWithSavedCard.requiresAction ===
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
    const submitPayment = async () => {
        setRequestPending(true);
        await stripePaymentWithSavedCard({
            variables: {
                cryptoType: "USDT",
                fiatType: currency.value,
                cardId: savedCards[selectedSavedCard].id,
                paymentIntentId: null,
            },
        });
    };

    // Render
    return successfulPayment === true ? (
        <PaymentSuccessful
            timeout={3}
            callback={() => isBrowser && window.location.reload(false)}
        />
    ) : successfulPayment === false ? (
        <PaymentFailure timeout={3} callback={closeModal} />
    ) : (
        <>
            <div className="credit-card-save-cards text-light row m-0 mb-4 mb-sm-2 px-0">
                {savedCards.map((item, index) => {
                    return (
                        <div
                            key={index}
                            className={`credit-card-save-cards-item mb-3 mb-sm-2 col-lg-6 col-12 ${
                                index % 2 === 0
                                    ? "pe-sm-2 px-0"
                                    : "ps-sm-2 px-0"
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
                                    <div className="credit-card-save-cards-item-details text-start">
                                        **** **** **** {item.last4} <br />
                                        {item.expMonth}/{item.expYear}{" "}
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
            {savedCards.length && (
                <button
                    className="btn btn-outline-light rounded-0 text-uppercase confirm-payment fw-bold w-100 mt-4 py-2"
                    disabled={requestPending}
                    onClick={submitPayment}
                >
                    <div className="d-flex align-items-center justify-content-center gap-3">
                        {requestPending && (
                            <div>
                                <CustomSpinner sm />
                            </div>
                        )}
                        <div>
                            {stripePaymentSecondCall
                                ? "verifying"
                                : "confirm deposit"}
                        </div>
                    </div>
                </button>
            )}
        </>
    );
}
