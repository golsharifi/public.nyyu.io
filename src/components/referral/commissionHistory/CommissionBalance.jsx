import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AiFillEyeInvisible } from "@react-icons/all-files/ai/AiFillEyeInvisible";
import { AiFillEye } from "@react-icons/all-files/ai/AiFillEye";
import NumberFormat from "../../../utilities/number";
import { SPINNER } from "../../../utilities/imgImport";
import { useReferral } from "../../../components/referral/ReferralContext";
import {
    changeEquity,
    updateHiddenStatus,
} from "../../../store/actions/tempAction";
import { fetchPriceFromFreeAPIs } from "../../../utilities/freeCryptoPrices";

const REFRESH_TIME = 30 * 1000;

const CommissionBalance = ({ loading, totalEarned }) => {
    const dispatch = useDispatch();

    // Fix: Add proper null checking for currency
    const currencyObject = useSelector(
        (state) => state.favAssets?.currency,
    ) || { value: "USD", label: "USD", sign: "$" };
    const currency = currencyObject.value;
    const currencyRate = useSelector((state) => state.currencyRates) || {};
    const { equity, hidden, ndbPrice } = useSelector(
        (state) => state.balance,
    ) || { equity: "USD", hidden: false, ndbPrice: 0 };

    const { btcPrice, setBtcPrice } = useReferral();

    const [price, setPrice] = useState(
        equity !== "BTC" ? 1 / (currencyRate[equity] || 1) : btcPrice,
    );
    const [decimals, setDecimals] = useState(equity !== "BTC" ? 2 : 8);

    const onChangeEquity = (newEquity) => {
        if (equity === newEquity) return;
        // change equity
        dispatch(changeEquity(newEquity));

        // change equity balance
        setDecimals(newEquity === "BTC" ? 8 : 2);
        setPrice(
            newEquity === "BTC" ? btcPrice : 1 / (currencyRate[newEquity] || 1),
        );
    };

    useEffect(() => {
        const getBtcPrice = async () => {
            try {
                const fetchedBtcPrice = await fetchPriceFromFreeAPIs("BTC");
                if (fetchedBtcPrice > 0) {
                    setBtcPrice(fetchedBtcPrice);
                    if (equity === "BTC") {
                        setPrice(fetchedBtcPrice);
                    }
                }
            } catch (error) {
                console.error("Error fetching BTC price:", error);
            }
        };

        getBtcPrice();
        const interval = setInterval(() => {
            getBtcPrice();
        }, REFRESH_TIME);
        return () => clearInterval(interval);
    }, [equity, setBtcPrice]);

    return (
        <div className="text-white bg-gray-50 px-3 py-3">
            <div className="d-flex justify-content-between fs-17px">
                <div className="txt-disable-gray">
                    Total Earned&nbsp;&nbsp;
                    {!hidden ? (
                        <AiFillEye
                            className="cursor-pointer"
                            size="1.5em"
                            onClick={() => dispatch(updateHiddenStatus(true))}
                        />
                    ) : (
                        <AiFillEyeInvisible
                            className="cursor-pointer"
                            size="1.5em"
                            onClick={() => dispatch(updateHiddenStatus(false))}
                        />
                    )}
                </div>
                <div className="d-flex">
                    <div
                        className={`cursor-pointer ${
                            equity === "BTC" ? "fw-bold text-white" : ""
                        }`}
                        onClick={() => onChangeEquity("BTC")}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                onChangeEquity("BTC");
                            }
                        }}
                        role="button"
                        tabIndex={0}
                    >
                        BTC
                    </div>
                    <div className="mx-1">|</div>
                    <div
                        className={`cursor-pointer ${
                            equity !== "BTC" ? "fw-bold text-white" : ""
                        }`}
                        onClick={() => onChangeEquity(currency)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                onChangeEquity(currency);
                            }
                        }}
                        role="button"
                        tabIndex={0}
                    >
                        {currency}
                    </div>
                </div>
            </div>
            {hidden ? (
                <p className="fs-34px fw-bold lh-54px">***********</p>
            ) : loading ? (
                <img
                    src={SPINNER}
                    alt="Loading..."
                    className="py-3"
                    width="60"
                />
            ) : (
                <NumberFormat
                    value={Number((totalEarned || 0) * (price || 1)).toFixed(
                        decimals,
                    )}
                    displayType="text"
                    thousandSeparator={true}
                    renderText={(value, props) => (
                        <p {...props} className="fs-34px fw-bold lh-54px">
                            {value} {equity}
                        </p>
                    )}
                />
            )}
        </div>
    );
};

export default CommissionBalance;
