import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AiFillEyeInvisible } from "@react-icons/all-files/ai/AiFillEyeInvisible";
import { AiFillEye } from "@react-icons/all-files/ai/AiFillEye";
import NumberFormat from "../../../utilities/number";
import { SPINNER } from "../../../utilities/imgImport";
import { updateHiddenStatus } from "../../../store/actions/tempAction";
import { fetchPriceFromFreeAPIs } from "../../../utilities/freeCryptoPrices";

const REFRESH_TIME = 30 * 1000;
const obscureValueString = "********";

const LockedNDBBalance = ({ loading, totalLocked }) => {
    const dispatch = useDispatch();

    const currency = useSelector((state) => state.favAssets?.currency?.value);
    const currencyRate = useSelector((state) => state.currencyRates) || {};
    const { equity, hidden, ndbPrice } = useSelector(
        (state) => state.balance,
    ) || {
        equity: "USD",
        hidden: false,
        ndbPrice: 0,
    };

    const [price, setPrice] = useState(1 / (currencyRate[equity] || 1));
    const [decimals, setDecimals] = useState(equity !== "BTC" ? 2 : 8);
    const [btcPrice, setBtcPrice] = useState(45000); // Default fallback price

    // Fetch BTC price on component mount and set up refresh interval
    useEffect(() => {
        const fetchBTCPrice = async () => {
            try {
                const fetchedPrice = await fetchPriceFromFreeAPIs("BTC");
                setBtcPrice(fetchedPrice);
                console.log("✅ BTC price updated:", fetchedPrice);
            } catch (error) {
                console.error("❌ Failed to fetch BTC price:", error);
                // Keep the fallback price if fetch fails
            }
        };

        // Fetch immediately
        fetchBTCPrice();

        // Set up interval to refresh price every 30 seconds
        const interval = setInterval(fetchBTCPrice, REFRESH_TIME);

        // Cleanup interval on component unmount
        return () => clearInterval(interval);
    }, []);

    // Update price and decimals when equity changes
    useEffect(() => {
        if (equity === "BTC") {
            setPrice(btcPrice);
            setDecimals(8);
        } else {
            setPrice(1 / (currencyRate[equity] || 1));
            setDecimals(2);
        }
    }, [equity, currencyRate, btcPrice]);

    return (
        <div className="text-white bg-gray-50 px-3 py-3">
            <div className="d-flex justify-content-between">
                <p className="fs-24px fw-500">Total Locked (NDB)</p>
                <div className="txt-disable-gray">
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
            </div>
            <div className="lh-54px">
                {!hidden ? (
                    <>
                        {loading ? (
                            <img
                                src={SPINNER}
                                width="17px"
                                height="17px"
                                alt="spinner"
                            />
                        ) : (
                            <NumberFormat
                                value={Number(totalLocked || 0).toFixed(2)}
                                className="fs-24px fw-600 lh-54px txt-green"
                                displayType="text"
                                thousandSeparator={true}
                                renderText={(value, props) => (
                                    <p {...props}>
                                        {value}{" "}
                                        <span className="txt-green">NDB</span>
                                    </p>
                                )}
                            />
                        )}
                    </>
                ) : (
                    <p className="fs-30px fw-400 lh-54px">
                        {obscureValueString}
                    </p>
                )}
            </div>
            <div className="fs-14px text-[#959595] mt-3 lh-18px">
                {!hidden ? (
                    <>
                        {loading ? (
                            <img
                                src={SPINNER}
                                width="15px"
                                height="15px"
                                alt="spinner"
                            />
                        ) : (
                            <NumberFormat
                                value={(
                                    ((totalLocked || 0) * (ndbPrice || 0)) /
                                    (price || 1)
                                ).toFixed(decimals)}
                                className="text-[#959595] fs-15px"
                                displayType="text"
                                thousandSeparator={true}
                                renderText={(value, props) => (
                                    <p {...props}>
                                        ~ {value} {equity || "USD"}
                                    </p>
                                )}
                            />
                        )}
                    </>
                ) : (
                    <p className="fs-15px txt-disable-gray">
                        {obscureValueString}
                    </p>
                )}
            </div>
        </div>
    );
};

export default LockedNDBBalance;
