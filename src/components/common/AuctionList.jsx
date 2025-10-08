import React from "react";
import { useSelector } from "react-redux";
import { useAuction } from "../../providers/auction-context";
import {
    renderNumberFormat,
    convertCurrency,
    roundNumber,
} from "../../utilities/number";

const AuctionList = ({
    ranking,
    fullName,
    tokenPrice,
    mainAmount,
    paidAmount,
    ndbAmount,
    winningResult,
    isCurrentUser,
}) => {
    // Fix: Add proper null checking for currency with complete default object
    const defaultCurrency = {
        value: "USD",
        label: "USD",
        sign: "$",
    };

    const currency =
        useSelector((state) => state.favAssets?.currency) || defaultCurrency;
    const currencyRates = useSelector((state) => state.currencyRates) || {};
    const { isAuction } = useAuction();

    const currencyRate = currencyRates[currency.value] ?? 1;

    // Fix: Safe calculations with proper null handling
    const safePaidAmount = paidAmount || 0;
    const safeMainAmount = mainAmount || 0;
    const safeNdbAmount = ndbAmount || 0;
    const safeRanking = ranking || 0;

    const totalPaidAmount = renderNumberFormat(
        convertCurrency(safePaidAmount, currencyRate),
        "",
        "",
        2,
        true,
    );
    const totalBidAmount = renderNumberFormat(
        convertCurrency(safeMainAmount, currencyRate),
        "",
        "",
        2,
        true,
        "dimgrey",
    );
    const totalNdbAmount = renderNumberFormat(
        safeNdbAmount,
        "",
        "",
        0,
        true,
        "dimgrey",
    );

    const winning = isAuction ? winningResult : true;

    return (
        <div className="w-100 row border-bottom-scorpion p-2 bid-list-item px-12px">
            <div className="col-2 d-flex align-items-center justify-content-start">
                {/* Fix: Ensure ranking number is always visible with proper color classes */}
                <div
                    className={`pl-4px fw-500 ${
                        isCurrentUser
                            ? winning
                                ? "txt-mountainMeadow fw-bold"
                                : "txt-cinnabar fw-bold"
                            : "text-white fw-500"
                    }`}
                    style={{
                        color: isCurrentUser
                            ? winning
                                ? "#23C865"
                                : "#F6361A"
                            : "#ffffff",
                        fontSize: "16px",
                        fontWeight: isCurrentUser ? "700" : "500",
                    }}
                >
                    {safeRanking}
                </div>
            </div>
            <div className="col-10 d-flex justify-content-between align-items-center pr-4px text-truncate">
                <div className="d-flex align-items-center justify-content-start">
                    <div className="d-flex justify-content-center align-items-center">
                        <div
                            className={
                                isCurrentUser
                                    ? winning
                                        ? "txt-mountainMeadow fw-bold"
                                        : "txt-cinnabar fw-bold"
                                    : "text-white"
                            }
                            style={{
                                color: isCurrentUser
                                    ? winning
                                        ? "#23C865"
                                        : "#F6361A"
                                    : "#ffffff",
                            }}
                        >
                            {fullName || "Anonymous"}
                        </div>
                        {isCurrentUser && isAuction ? (
                            <span
                                className={`w-50px text-center fs-8px ml-8px ${
                                    winning
                                        ? "border-mountainMeadow txt-mountainMeadow"
                                        : "border-cinnabar txt-cinnabar"
                                }`}
                                style={{
                                    color: winning ? "#23C865" : "#F6361A",
                                    borderColor: winning
                                        ? "#23C865"
                                        : "#F6361A",
                                }}
                            >
                                {winningResult ? "WON" : "LOST"}
                            </span>
                        ) : null}
                    </div>
                </div>
                <div className="d-flex align-items-center justify-content-end">
                    <div className="text-end">
                        <div className="text-white fs-14px">
                            {totalPaidAmount}
                        </div>
                        <div className="text-gray fs-12px">
                            {totalNdbAmount} NDB
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuctionList;
