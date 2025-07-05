import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Modal from "react-modal";
import { useDispatch } from "react-redux";
import { navigate } from "gatsby";
import { useMutation } from "@apollo/client";
import NumberFormat from "../../../utilities/number";

import { useAuction } from "../../providers/auction-context";
import { setBidInfo, setCurrentRound } from "../../store/actions/bidAction";

import { CloseIcon } from "../../utilities/imgImport";
import { ROUTES } from "../../utilities/routes";
import { INCREASE_BID, PLACE_BID } from "../../apollo/graphqls/mutations/Bid";
import CustomSpinner from "../common/custom-spinner";

export default function AuctionPlaceBidModal() {
    // Fix: Add proper null checking for currency
    const favAssets = useSelector((state) => state.favAssets);
    const currency = favAssets?.currency || {
        value: "USD",
        label: "USD",
        sign: "$",
    };
    const currencyRates = useSelector((state) => state.currencyRates) || {};
    const currencyRate = currencyRates[currency.value] ?? 1;

    const auction = useAuction();
    const dispatch = useDispatch();
    const { optCurrentRound, getBid, isBid } = auction;

    // State
    const [amount, setAmount] = useState(1);
    const [price, setPrice] = useState(optCurrentRound?.placeBid || 1);
    const [error, setError] = useState("");
    const [reqPending, setReqPending] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // Mutations
    const [placeBid] = useMutation(PLACE_BID, {
        onCompleted: () => {
            navigate(ROUTES.payment);
            setReqPending(false);
            setIsOpen(false);
        },
        onError: (err) => {
            setError(err.message);
            setReqPending(false);
        },
    });

    const [increaseBid] = useMutation(INCREASE_BID, {
        onCompleted: () => {
            navigate(ROUTES.payment);
            setReqPending(false);
            setIsOpen(false);
        },
        onError: (err) => {
            setError(err.message);
            setReqPending(false);
        },
    });

    const bidMutation = () => {
        setReqPending(true);
        setError("");

        if (isBid) {
            placeBid({
                variables: {
                    roundId: optCurrentRound?.id,
                    tokenAmount: amount,
                    tokenPrice: price,
                },
            });
            dispatch(setBidInfo(Number(price * amount)));
        } else {
            increaseBid({
                variables: {
                    roundId: optCurrentRound?.id,
                    tokenAmount: amount,
                    tokenPrice: price,
                },
            });
            dispatch(setBidInfo(Number(price * amount)));
        }
        dispatch(setCurrentRound(optCurrentRound?.id));
    };

    // Calculate values in selected currency
    const priceInCurrency = price * currencyRate;
    const totalInCurrency = amount * priceInCurrency;

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={() => setIsOpen(false)}
            className="auction-bid-modal"
            overlayClassName="modal-overlay"
            ariaHideApp={false}
        >
            <div className="modal-header">
                <h4>Place Bid</h4>
                <button
                    onClick={() => setIsOpen(false)}
                    className="close-button"
                >
                    <img src={CloseIcon} alt="close" />
                </button>
            </div>

            <div className="modal-body">
                <div
                    className="currency-info"
                    style={{
                        fontSize: "12px",
                        color:
                            Object.keys(currencyRates).length > 0
                                ? "#00ff88"
                                : "#ffa500",
                        marginBottom: "15px",
                        textAlign: "center",
                    }}
                >
                    Currency: {currency.sign}
                    {currency.value}
                    {Object.keys(currencyRates).length === 0 && (
                        <span style={{ color: "#ffa500" }}>
                            {" "}
                            (rates loading...)
                        </span>
                    )}
                </div>

                <div className="form-group">
                    <label>Token Amount</label>
                    <NumberFormat
                        value={amount}
                        onValueChange={(values) => {
                            const { floatValue } = values;
                            setAmount(floatValue || 1);
                        }}
                        className="form-control"
                        placeholder="Enter amount"
                        thousandSeparator={true}
                        allowNegative={false}
                        decimalScale={2}
                    />
                </div>

                <div className="form-group">
                    <label>
                        Price per Token ({currency.value})
                        {currency.value !== "USD" &&
                            Object.keys(currencyRates).length > 0 && (
                                <span
                                    style={{
                                        fontSize: "11px",
                                        color: "#888",
                                        marginLeft: "8px",
                                    }}
                                >
                                    (≈ ${price.toFixed(4)} USD)
                                </span>
                            )}
                    </label>
                    <NumberFormat
                        value={priceInCurrency}
                        onValueChange={(values) => {
                            const { floatValue } = values;
                            const usdPrice = (floatValue || 1) / currencyRate;
                            setPrice(usdPrice);
                        }}
                        className="form-control"
                        placeholder={`Enter price in ${currency.value}`}
                        prefix={currency.sign}
                        thousandSeparator={true}
                        allowNegative={false}
                        decimalScale={4}
                    />
                </div>

                <div
                    className="total-display"
                    style={{
                        background: "rgba(0, 255, 136, 0.1)",
                        padding: "15px",
                        borderRadius: "8px",
                        margin: "15px 0",
                    }}
                >
                    <div className="d-flex justify-content-between">
                        <span>Total Cost:</span>
                        <span style={{ color: "#00ff88", fontWeight: "600" }}>
                            {currency.sign}
                            {totalInCurrency.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 4,
                            })}
                            {currency.value !== "USD" &&
                                Object.keys(currencyRates).length > 0 && (
                                    <span
                                        style={{
                                            fontSize: "11px",
                                            color: "#888",
                                            display: "block",
                                        }}
                                    >
                                        ≈ ${(amount * price).toFixed(2)} USD
                                    </span>
                                )}
                        </span>
                    </div>
                </div>

                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}

                <div className="modal-actions">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setIsOpen(false)}
                        disabled={reqPending}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={bidMutation}
                        disabled={
                            reqPending ||
                            amount < 1 ||
                            price < (optCurrentRound?.minPrice || 1)
                        }
                    >
                        {reqPending ? (
                            <div className="d-flex align-items-center">
                                <CustomSpinner />
                                <span className="ms-2">Processing...</span>
                            </div>
                        ) : (
                            `${isBid ? "Place" : "Increase"} Bid`
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
