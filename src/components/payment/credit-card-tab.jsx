import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
    CardNumberElement,
    CardCvcElement,
    CardExpiryElement,
    Elements,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import { PAYMENT_FRACTION_TOOLTIP_CONTENT } from "../../utilities/staticData";
import { ReactTooltip } from "../../utilities/tooltip";
import { Icon } from "@iconify/react";
import { CheckBox } from "../common/FormControl";
import {
    DELETE_CARD,
    GET_SAVED_CARDS,
    GET_STRIPE_PUB_KEY,
    PAY_STRIPE_FOR_PRESALE,
    STRIPE_PAYMENT,
} from "./payment-webservice";
import { useMutation, useQuery } from "@apollo/client";
import CustomSpinner from "../common/custom-spinner";
import { navigate } from "gatsby";
import { ROUTES } from "../../utilities/routes";
import useCountDown from "react-countdown-hook";
import { getStripePaymentFee } from "../../utilities/utility-methods";
import { useSelector } from "react-redux";
import CreditCardSavedCards from "./CreditCardSavedCards";
import {
    getCookie,
    NDB_Auction,
    NDB_Paypal_TrxType,
    NDB_Presale,
} from "../../utilities/cookies";

export default function CreditCardTab({ amount, round, orderId }) {
    // Containers
    const [stripePublicKey, setStripePublicKey] = useState(null);
    const user = useSelector((state) => state.auth.user);
    const { allFees } = useSelector((state) => state);
    const stripePaymentFee = getStripePaymentFee(user, allFees, amount);
    const [savedCards, setSavedCards] = useState([]);
    const loading = !(stripePublicKey && savedCards);

    // Webservice
    useQuery(GET_STRIPE_PUB_KEY, {
        onCompleted: (data) => setStripePublicKey(data.getStripePubKey),
        onError: (error) => console.log(error),
    });
    useQuery(GET_SAVED_CARDS, {
        onCompleted: (data) => setSavedCards(data.getSavedCards),
        onError: (error) => console.log(error),
    });

    // Render
    return (
        <div>
            {loading ? (
                <div className="text-center mx-auto mt-2">
                    <CustomSpinner />
                </div>
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
                    <CardSection
                        amount={Number(amount) + Number(stripePaymentFee)}
                        round={round}
                        savedCards={savedCards}
                        setSavedCards={setSavedCards}
                        orderId={orderId}
                    />
                </Elements>
            )}
        </div>
    );
}

const CardSection = ({ amount, round, savedCards, setSavedCards, orderId }) => {
    // Containers
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState("");
    const [cardHolder, setCardHolder] = useState("");
    const [allowFractionBox, setAllowFractionBox] = useState(false);
    const [successfulPayment, setSuccessfulPayment] = useState(null);
    const [requestPending, setRequestPending] = useState(false);
    const [isNewCard, setIsNewCard] = useState(true);
    const [postalCode, setPostalCode] = useState("");
    const [country, setCountry] = useState("");
    const [isSaveCard, setIsSaveCard] = useState(false);
    const [selectedSavedCard, setSelectedSavedCard] = useState(0);
    const [deleteCardRequestPending, setDeleteCardRequestPending] =
        useState(false);
    const [stripePaymentSecondCall, setStripePaymentSecondCall] =
        useState(false);

    /// stripe payment id
    const [stripePaymentId, setStripePaymentId] = useState(0);

    // Countdown
    const initialTime = 5 * 1000;
    const interval = 1000;
    const [timeLeft, { start: startTimer }] = useCountDown(
        initialTime,
        interval,
    );

    const style = {
        base: {
            color: "#E3E3E3",
            fontFamily: "Montserrat",
            fontWeight: "500",
            fontSmoothing: "antialiased",
            fontSize: "14px",
            backgroundColor: "transparent",
            border: "1px solid white",
            "::placeholder": {
                color: "dimgrey",
            },
        },
        invalid: {
            color: "#fa755a",
            iconColor: "#fa755a",
        },
    };

    // Webservice
    const [deleteCard] = useMutation(DELETE_CARD, {
        onCompleted: (data) => {
            setDeleteCardRequestPending(false);
        },
        onError: (error) => console.log(error),
    });
    const [stripePayment] = useMutation(STRIPE_PAYMENT, {
        onCompleted: async (data) => {
            if (stripePaymentSecondCall === false) {
                setStripePaymentSecondCall(true);
                if (data.payStripeForAuction.error) {
                    setRequestPending(false);
                    let error = data.payStripeForPresale.error;
                    error = error.split(";")[0];
                    return setError(error);
                }
                const { clientSecret, requiresAction } =
                    data.payStripeForAuction;
                if (requiresAction === false || requiresAction === null) {
                    startTimer();
                    setRequestPending(false);
                    return setSuccessfulPayment(true);
                }
                if (clientSecret)
                    return stripe
                        .handleCardAction(clientSecret)
                        .then((result) => {
                            if (result.error) {
                                startTimer();
                                return setSuccessfulPayment(false);
                            }
                            return stripePayment({
                                variables: {
                                    roundId: Number(round),
                                    amount: amount * 100,
                                    fiatAmount: amount * 100,
                                    fiatType: "USD",
                                    paymentMethodId: null,
                                    paymentIntentId: result.paymentIntent.id,
                                },
                            });
                        });
                return setError("Invalid payment");
            } else if (stripePaymentSecondCall === true) {
                if (
                    data.payStripeForAuction.error ||
                    data.payStripeForAuction.requiresAction === true
                ) {
                    startTimer();
                    setRequestPending(false);
                    return setSuccessfulPayment(false);
                }
                startTimer();
                return setSuccessfulPayment(true);
            }
        },
        onError: (error) => {
            console.log(error);
            setRequestPending(false);
            return setError("Invalid payment");
        },
    });
    const [stripePaymentForPresale] = useMutation(PAY_STRIPE_FOR_PRESALE, {
        onCompleted: async (data) => {
            if (stripePaymentSecondCall === false) {
                if (data.payStripeForPreSale.error) {
                    setRequestPending(false);
                    console.log(data.payStripeForPreSale.error);
                    const error = data.payStripeForPreSale.error.split(";")[0];
                    return setError(error);
                }
                const { clientSecret, requiresAction, paymentId } =
                    data.payStripeForPreSale;
                if (requiresAction === false || requiresAction === null) {
                    startTimer();
                    setRequestPending(false);
                    return setSuccessfulPayment(true);
                }
                if (clientSecret) {
                    setStripePaymentSecondCall(true);
                    setStripePaymentId(paymentId);
                    return stripe
                        .handleCardAction(clientSecret)
                        .then((result) => {
                            if (result.error) {
                                startTimer();
                                return setSuccessfulPayment(false);
                            }
                            return stripePaymentForPresale({
                                variables: {
                                    id: paymentId,
                                    presaleId: Number(round),
                                    orderId: orderId,
                                    amount: amount * 100,
                                    fiatAmount: amount * 100,
                                    fiatType: "USD",
                                    paymentMethodId: null,
                                    paymentIntentId: result.paymentIntent.id,
                                    isSaveCard,
                                },
                            });
                        });
                }
                return setError("Invalid payment");
            } else if (stripePaymentSecondCall === true) {
                if (
                    data.payStripeForPreSale.error ||
                    data.payStripeForPreSale.requiresAction === true
                ) {
                    startTimer();
                    setRequestPending(false);
                    return setSuccessfulPayment(false);
                }
                startTimer();
                return setSuccessfulPayment(true);
            }
        },
        onError: (error) => {
            console.log(error);
            setRequestPending(false);
            return setError("Invalid payment");
        },
    });

    // Methods
    const deleteCardMethod = (id) => {
        setDeleteCardRequestPending(true);
        setSavedCards(savedCards.filter((item) => item.id !== id));
        deleteCard({
            variables: {
                id,
            },
        });
    };
    const submitPayment = async (e) => {
        e.preventDefault();
        setError("");
        setRequestPending(true);
        if (!stripe || !elements) return;

        const { paymentMethod } = await stripe.createPaymentMethod({
            type: "card",
            card: elements.getElement(CardNumberElement),
            billing_details: {
                name: cardHolder,
                address: {
                    city: null,
                    country: null,
                    line1: null,
                    line2: null,
                    postal_code: postalCode,
                    state: null,
                },
            },
        });
        if (paymentMethod && "id" in paymentMethod && paymentMethod.id) {
            const type = getCookie(NDB_Paypal_TrxType);
            if (type === NDB_Auction)
                return stripePayment({
                    variables: {
                        roundId: Number(round),
                        amount: amount * 100,
                        fiatAmount: amount * 100,
                        fiatType: "USD",
                        paymentMethodId: paymentMethod.id,
                        paymentIntentId: null,
                        isSaveCard,
                    },
                });
            else if (type === NDB_Presale)
                return stripePaymentForPresale({
                    variables: {
                        id: 0,
                        presaleId: Number(round),
                        orderId: orderId,
                        amount: amount * 100,
                        fiatAmount: amount * 100,
                        fiatType: "USD",
                        paymentMethodId: paymentMethod.id,
                        paymentIntentId: null,
                        isSaveCard,
                    },
                });
        }
        setRequestPending(false);
        return setError("Invalid card information");
    };

    useEffect(() => {
        if (successfulPayment !== null)
            if (timeLeft === 0) navigate(ROUTES.auction);
    }, [timeLeft, successfulPayment]);

    // Render
    return successfulPayment === true ? (
        <div className="text-center p-4">
            <div className="mb-4">
                <Icon
                    icon="akar-icons:circle-check"
                    className="text-success"
                    style={{ width: 100, height: 100 }}
                />
            </div>
            <div className="text-capitalize fs-28px fw-bold text-success">
                payment successful
            </div>
            <div className="text-capitalize text-light fs-18px fw-500 mt-2">
                you will be redirected in {Math.floor(timeLeft / 1000)} ...
            </div>
        </div>
    ) : successfulPayment === false ? (
        <div className="text-center p-4">
            <div className="mb-4">
                <Icon
                    icon="charm:circle-cross"
                    className="text-white"
                    style={{ width: 100, height: 100 }}
                />
            </div>
            <div className="text-capitalize text-light fs-28px fw-bold">
                payment failed
            </div>
            <div className="text-capitalize text-light fs-18px fw-500 mt-2">
                you will be redirected in {Math.floor(timeLeft / 1000)} ...
            </div>
        </div>
    ) : (
        <>
            <div className="row m-0 mb-4">
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
            {isNewCard ? (
                <form className="row m-0">
                    {error && (
                        <div className="text-danger fs-16px ps-0 mb-2">
                            <div className="d-flex align-items-center gap-2">
                                <svg
                                    className="icon-23px"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    ></path>
                                </svg>
                                <div>{error}</div>
                            </div>
                        </div>
                    )}

                    <div className="col-sm-6 col-12 pe-sm-1 px-0">
                        <CardNumberElement
                            className="border border-light border-1 p-2 w-100 mb-3"
                            options={{
                                style,
                                placeholder:
                                    "Card number (4563 9999 8883 7777 2888)",
                            }}
                        />
                    </div>
                    <div className="col-sm-3 col-12 px-sm-1 px-0">
                        <CardExpiryElement
                            className="border border-light border-1 p-2 mb-3 w-100"
                            options={{
                                style,
                                placeholder: "MM/YY (07/27)",
                            }}
                        />
                    </div>
                    <div className="col-sm-3 col-12 ps-sm-1 px-0">
                        <CardCvcElement
                            className="border border-light border-1 p-2 mb-3 w-100"
                            options={{
                                style,
                                placeholder: "CVC code (123)",
                            }}
                        />
                    </div>
                    <div className="col-sm-6 col-12 pe-sm-1 px-0">
                        <input
                            type="text"
                            style={style.base}
                            className="border border-light border-1 p-2 w-100 mb-3 placeholder:text-light form-control"
                            placeholder="Card holder (John Smith)"
                            value={cardHolder}
                            onChange={(e) => setCardHolder(e.target.value)}
                        />
                    </div>
                    <div className="col-sm-3 col-12 px-sm-1 px-0">
                        <input
                            type="text"
                            style={style.base}
                            className="border border-light border-1 p-2 w-100 mb-3 placeholder:text-light form-control"
                            placeholder="Country"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                        />
                    </div>
                    <div className="col-sm-3 col-12 ps-sm-1 px-0">
                        <input
                            type="text"
                            style={style.base}
                            className="border border-light border-1 p-2 w-100 mb-3 placeholder:text-light form-control"
                            placeholder="Billing zip/postal code"
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                        />
                    </div>
                </form>
            ) : deleteCardRequestPending ? (
                <div className="credit-card-save-cards d-flex align-items-center justify-content-center w-100 my-3 px-0 overflow-y-hidden">
                    <CustomSpinner />
                </div>
            ) : (
                <CreditCardSavedCards
                    roundId={Number(round)}
                    amount={amount}
                    savedCards={savedCards}
                    deleteCardMethod={deleteCardMethod}
                    selectedSavedCard={selectedSavedCard}
                    setSelectedSavedCard={setSelectedSavedCard}
                    orderId={orderId}
                />
            )}
            {isNewCard && (
                <>
                    <div className="mt-3 d-flex justify-content-between">
                        <div className="d-flex flex-row align-items-center">
                            <CheckBox
                                type="checkbox"
                                name="allow_fraction"
                                value={allowFractionBox}
                                onChange={(e) =>
                                    setAllowFractionBox(e.target.checked)
                                }
                                className="text-uppercase"
                            ></CheckBox>
                            <div className="allow-text text-light">
                                Do you allow fraction of order compleation?
                                <span
                                    className="ms-2 fs-20px"
                                    data-tip="React-tooltip"
                                    data-for="question-mark-tooltip"
                                >
                                    <Icon icon="bi:question-circle" />
                                </span>
                            </div>
                            <ReactTooltip
                                id="question-mark-tooltip"
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
                    <div className="mt-2 d-flex justify-content-between">
                        <div className="d-flex flex-row align-items-center">
                            <CheckBox
                                type="checkbox"
                                name="allow_fraction"
                                value={isSaveCard}
                                onChange={(e) =>
                                    setIsSaveCard(e.target.checked)
                                }
                                className="text-uppercase"
                            ></CheckBox>
                            <div className="allow-text text-light">
                                save card details for future purchase
                            </div>
                        </div>
                    </div>
                </>
            )}
            {isNewCard && (
                <button
                    className={`btn btn-outline-light rounded-0 text-uppercase confirm-payment fw-bold w-100 mt-2 ${
                        requestPending && "disabled"
                    }`}
                    onClick={requestPending ? null : submitPayment}
                >
                    <div className="d-flex align-items-center justify-content-center gap-3">
                        {requestPending && <CustomSpinner />}
                        {stripePaymentSecondCall
                            ? "verifying"
                            : "confirm payment"}
                    </div>
                </button>
            )}
        </>
    );
};
