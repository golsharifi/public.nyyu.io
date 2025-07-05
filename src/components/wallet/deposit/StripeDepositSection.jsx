import { useMutation, useQuery } from "@apollo/client";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import React, { useState } from "react";
import CustomSpinner from "../../common/custom-spinner";
import {
    DELETE_CARD,
    GET_SAVED_CARDS,
    GET_STRIPE_PUB_KEY,
} from "../../payment/payment-webservice";
import StripeDepositForm from "./StripeDepositForm";
import StripeDepositSavedCards from "./StripeDepositSavedCards";

const StripeDepositSection = ({ amount, closeModal, currency }) => {
    // Containers
    const [isNewCard, setIsNewCard] = useState(true);
    const [savedCards, setSavedCards] = useState(null);
    const [stripePublicKey, setStripePublicKey] = useState(null);
    const [deleteCardLoading, setDeleteCardLoading] = useState(false);
    const loading = !(stripePublicKey && savedCards);

    // Webserver
    useQuery(GET_STRIPE_PUB_KEY, {
        fetchPolicy: "network-only",
        onCompleted: (data) => setStripePublicKey(data.getStripePubKey),
        onError: (error) => console.log(error),
    });
    useQuery(GET_SAVED_CARDS, {
        fetchPolicy: "network-only",
        onCompleted: (data) => setSavedCards(data.getSavedCards),
        onError: (error) => console.log(error),
    });
    const [deleteCard] = useMutation(DELETE_CARD, {
        onCompleted: (data) => setDeleteCardLoading(false),
        onError: (error) => console.log(error),
    });

    // Methods
    const deleteCardMethod = (id) => {
        setDeleteCardLoading(true);
        setSavedCards(savedCards.filter((item) => item.id !== id));
        deleteCard({
            variables: {
                id,
            },
        });
    };

    // Render
    return (
        <>
            <div className="row m-0 my-4">
                <button
                    onClick={() => setIsNewCard(true)}
                    className={`btn col-6 py-3 border-0 border-bottom fw-500 text-center rounded-0 ${
                        isNewCard
                            ? "border-success text-success"
                            : "border-light text-light"
                    }`}
                >
                    New card
                </button>
                <button
                    onClick={() => setIsNewCard(false)}
                    className={`btn col-6 py-3 border-0 border-bottom fw-500 text-center rounded-0 ${
                        !isNewCard
                            ? "border-success text-success"
                            : "border-light text-light"
                    }`}
                >
                    Saved cards
                </button>
            </div>

            {loading || deleteCardLoading ? (
                <div className="text-center mx-auto mt-2">
                    <CustomSpinner />
                </div>
            ) : isNewCard ? (
                <Elements
                    options={{
                        fonts: [
                            {
                                cssSrc: "https://fonts.googleapis.com/css2?family=Montserrat:wght@500&display=swap%27",
                            },
                        ],
                    }}
                    stripe={loadStripe(stripePublicKey)}
                >
                    <StripeDepositForm
                        amount={Number(amount)}
                        closeModal={closeModal}
                        currency={currency}
                    />
                </Elements>
            ) : (
                <Elements
                    options={{
                        fonts: [
                            {
                                cssSrc: "https://fonts.googleapis.com/css2?family=Montserrat:wght@500&display=swap%27",
                            },
                        ],
                    }}
                    stripe={loadStripe(stripePublicKey)}
                >
                    <StripeDepositSavedCards
                        closeModal={closeModal}
                        savedCards={savedCards}
                        deleteCardMethod={deleteCardMethod}
                        amount={Number(amount)}
                        currency={currency}
                    />
                </Elements>
            )}
        </>
    );
};

export default StripeDepositSection;
