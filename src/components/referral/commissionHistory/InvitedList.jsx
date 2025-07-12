import React from "react";
import { useSelector } from "react-redux";
import { REFER_AVATAR, SPINNER } from "../../../utilities/imgImport";
import { useReferral } from "../ReferralContext";
import NumberFormat from "../../../utilities/number";
const InvitedList = ({ loading, invitedList }) => {
    const { btcPrice } = useReferral();
    const { hidden, equity, ndbPrice } = useSelector((state) => state.balance);
    const { currencyRates } = useSelector((state) => state);

    const priceFactor =
        equity === "BTC"
            ? ndbPrice / btcPrice
            : ndbPrice * currencyRates[equity];
    const decimals = equity === "BTC" ? 8 : 2;

    return (
        <div className="mt-4">
            <div className="d-flex justify-content-between align-items-center mt-5 pe-3">
                <span className="fw-bold fs-22px">INVITED</span>
                <span className="txt-green fs-14px">YOU EARNED</span>
            </div>
            {loading ? (
                <div className="text-center pt-4">
                    <img
                        src={SPINNER}
                        width="34px"
                        height="34px"
                        alt="spinner"
                    />
                </div>
            ) : (
                <div
                    className={`overflow-auto pe-4 pt-4 ${invitedList.length === 0 ? "mb-5" : ""}`}
                >
                    {invitedList.length === 0 ? (
                        <div className="text-white text-center pt-3">
                            No invited users
                        </div>
                    ) : (
                        <>
                            {invitedList.map((user, key) => {
                                return (
                                    <div
                                        key={key}
                                        className="d-flex justify-content-between  border-bottom border-secondary py-3"
                                    >
                                        <span className="fs-12px">
                                            <img
                                                src={REFER_AVATAR}
                                                width="24"
                                                height="24"
                                                alt="spinner"
                                            />{" "}
                                            &nbsp;&nbsp;{user.name}
                                        </span>
                                        <div className="text-end">
                                            {hidden ? (
                                                <div className="fs-15px text-white fw-bold ls-1px">
                                                    ********
                                                </div>
                                            ) : (
                                                <div className="fs-15px text-white fw-bold ls-1px">
                                                    <NumberFormat
                                                        value={user.amount}
                                                        displayType="text"
                                                        thousandSeparator={true}
                                                        renderText={(value) => (
                                                            <>~ {value} NDB</>
                                                        )}
                                                    ></NumberFormat>
                                                </div>
                                            )}
                                            {hidden ? (
                                                <div className="fs-11px txt-baseprice">
                                                    ********
                                                </div>
                                            ) : (
                                                <div className="fs-11px txt-baseprice">
                                                    <NumberFormat
                                                        value={(
                                                            user.amount *
                                                            priceFactor
                                                        ).toFixed(decimals)}
                                                        displayType="text"
                                                        thousandSeparator={true}
                                                        renderText={(value) => (
                                                            <>
                                                                {value} {equity}
                                                            </>
                                                        )}
                                                    ></NumberFormat>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default InvitedList;
