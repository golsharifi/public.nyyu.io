import React, { useEffect, useState } from "react";
import { Link } from "gatsby";
import { useDispatch, useSelector } from "react-redux";
import Slider from "rc-slider";
import { navigate } from "gatsby";
import { useMutation } from "@apollo/client";
import NumberFormat from "../../utilities/number";
import { useAuction } from "../../providers/auction-context";
import { setBidInfo, setCurrentRound } from "../../store/actions/bidAction";
import CustomSpinner from "../common/custom-spinner";
import { ROUTES } from "../../utilities/routes";
import { INCREASE_BID, PLACE_BID } from "../../apollo/graphqls/mutations/Bid";

const initialMaxPrice = 100;

export default function AuctionPlaceBid() {
    // Fix: Improved currency and currency rates access with proper fallbacks
    const favAssets = useSelector((state) => state.favAssets);
    const currency = favAssets?.currency || {
        value: "USD",
        label: "USD",
        sign: "$",
    };
    const currencyRates = useSelector((state) => state.currencyRates) || {};

    // Get the exchange rate for the selected currency, default to 1 (USD)
    const currencyRate = currencyRates[currency.value] ?? 1;

    // Log for debugging
    console.log("💰 AuctionPlaceBid Currency Debug:", {
        currency: currency.value,
        currencyRate,
        currencyRatesLoaded: Object.keys(currencyRates).length > 0,
        availableRates: Object.keys(currencyRates).slice(0, 5),
    });

    const auction = useAuction();
    const dispatch = useDispatch();
    const { optCurrentRound, getBid, currentRoundBidList, isBid, isAuction } =
        auction;

    // Container
    const [amount, setAmount] = useState(1);
    const [price, setPrice] = useState(
        optCurrentRound?.placeBid ? optCurrentRound?.placeBid : 1,
    );

    // Containers
    const [error, setError] = useState("");
    const [reqPending, setReqPending] = useState(false);
    const [preAmount, setPreAmount] = useState(1);
    const [prePrice, setPrePrice] = useState(1);
    const [maxPrice, setMaxPrice] = useState(initialMaxPrice);

    // Webservice
    const [placeBid] = useMutation(PLACE_BID, {
        onCompleted: () => {
            navigate(ROUTES.payment);
            setReqPending(false);
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
        },
        onError: (err) => {
            setError(err.message);
            setReqPending(false);
        },
    });

    // Methods
    const bidMutation = () => {
        setReqPending(true);
        setError("");
        if (auction.isBid) {
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
            dispatch(setBidInfo(Number(price * amount - prePrice * preAmount)));
        }
        dispatch(setCurrentRound(optCurrentRound?.id));
    };

    useEffect(() => {
        if (price === maxPrice) {
            setTimeout(() => setMaxPrice(2 * maxPrice), 300);
        } else if (price === optCurrentRound?.minPrice) {
            setTimeout(() => setMaxPrice(100), 300);
        }
    }, [price, maxPrice, optCurrentRound?.minPrice]);

    useEffect(() => {
        if (getBid)
            if (Object.keys(getBid).length !== 0) {
                setPrice(isBid ? optCurrentRound?.placeBid : getBid.tokenPrice);
                setAmount(isBid ? 1 : getBid.tokenAmount);
                if (!isBid) {
                    setPreAmount(getBid.tokenAmount);
                    setPrePrice(getBid.tokenPrice);
                }
            }
    }, [getBid, optCurrentRound?.placeBid, isBid]);

    // Calculate values in selected currency
    const priceInCurrency = price * currencyRate;
    const totalInCurrency = amount * priceInCurrency;
    const minPriceInCurrency = (optCurrentRound?.minPrice || 1) * currencyRate;

    // Render
    return (
        <>
            {optCurrentRound?.status === 3 ? (
                <div className="d-flex justify-content-center mt-4">
                    <div style={{ maxWidth: "400px", textAlign: "center" }}>
                        <h5 style={{ color: "#ff6b6b", marginBottom: "15px" }}>
                            Round Completed
                        </h5>
                        <p style={{ color: "#888", fontSize: "14px" }}>
                            This auction round has ended. Check the results or
                            wait for the next round.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="place-bid">
                    <div className="place-bid__header">
                        <h6>Place Your Bid</h6>

                        {/* Currency indicator */}
                        <div
                            style={{
                                fontSize: "12px",
                                color:
                                    Object.keys(currencyRates).length > 0
                                        ? "#00ff88"
                                        : "#ffa500",
                                marginTop: "5px",
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
                    </div>

                    <div className="place-bid__body">
                        <div className="place-bid__amount">
                            <label>Token Amount</label>
                            <NumberFormat
                                thousandSeparator={true}
                                allowNegative={false}
                                decimalScale={2}
                                fixedDecimalScale={false}
                                value={amount}
                                onValueChange={(values) => {
                                    const { floatValue } = values;
                                    setAmount(floatValue || 1);
                                }}
                                className="form-control"
                                placeholder="Enter amount"
                                min={1}
                            />
                        </div>

                        <div className="place-bid__price">
                            <label>
                                Price per Token
                                {Object.keys(currencyRates).length > 0 &&
                                    currency.value !== "USD" && (
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
                                thousandSeparator={true}
                                allowNegative={false}
                                decimalScale={4}
                                fixedDecimalScale={false}
                                value={priceInCurrency}
                                onValueChange={(values) => {
                                    const { floatValue } = values;
                                    const usdPrice =
                                        (floatValue || 1) / currencyRate;
                                    setPrice(usdPrice);
                                }}
                                className="form-control"
                                placeholder={`Enter price in ${currency.value}`}
                                prefix={currency.sign}
                            />
                            <div
                                style={{
                                    fontSize: "11px",
                                    color: "#888",
                                    marginTop: "3px",
                                }}
                            >
                                Minimum: {currency.sign}
                                {minPriceInCurrency.toFixed(4)}
                            </div>
                        </div>

                        <div className="place-bid__slider">
                            <label>Adjust Price</label>
                            <Slider
                                min={optCurrentRound?.minPrice || 1}
                                max={maxPrice}
                                step={0.0001}
                                value={price}
                                onChange={(value) => setPrice(value)}
                                trackStyle={{ backgroundColor: "#00ff88" }}
                                handleStyle={{
                                    borderColor: "#00ff88",
                                    backgroundColor: "#00ff88",
                                }}
                                railStyle={{ backgroundColor: "#333" }}
                            />
                        </div>

                        <div className="place-bid__total">
                            <div className="d-flex justify-content-between">
                                <span>Total Cost:</span>
                                <span
                                    style={{
                                        color: "#00ff88",
                                        fontWeight: "600",
                                    }}
                                >
                                    {currency.sign}
                                    {totalInCurrency.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 4,
                                    })}
                                    {currency.value !== "USD" &&
                                        Object.keys(currencyRates).length >
                                            0 && (
                                            <span
                                                style={{
                                                    fontSize: "11px",
                                                    color: "#888",
                                                    marginLeft: "8px",
                                                }}
                                            >
                                                (≈ $
                                                {(amount * price).toFixed(2)}{" "}
                                                USD)
                                            </span>
                                        )}
                                </span>
                            </div>
                        </div>

                        {error && (
                            <div
                                className="alert alert-danger mt-3"
                                role="alert"
                            >
                                {error}
                            </div>
                        )}

                        <div className="place-bid__actions mt-4">
                            <button
                                type="button"
                                className="btn btn-primary w-100"
                                onClick={bidMutation}
                                disabled={
                                    reqPending ||
                                    amount < 1 ||
                                    price < (optCurrentRound?.minPrice || 1)
                                }
                            >
                                {reqPending ? (
                                    <div className="d-flex align-items-center justify-content-center">
                                        <CustomSpinner />
                                        <span className="ms-2">
                                            Processing...
                                        </span>
                                    </div>
                                ) : (
                                    `${isBid ? "Place" : "Increase"} Bid`
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
