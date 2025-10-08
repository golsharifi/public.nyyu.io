import React, { useMemo } from "react";
import { navigate } from "gatsby";
import { useSelector } from "react-redux";
import Countdown, { zeroPad } from "react-countdown";

import { useAuction } from "../../providers/auction-context";
import { renderNumberFormat } from "../../utilities/number";
import PercentageBar from "./percentage-bar";
import { ROUTES } from "../../utilities/routes";
import { isBrowser } from "../../utilities/auth";

// Renderer callbacks remain the same...
const startRoundRender = ({ days, hours, minutes, seconds, completed }) => {
    if (completed) {
        isBrowser && window.location.reload();
        return <span>Started</span>;
    } else {
        return (
            <span>
                {zeroPad(days)}: {zeroPad(hours)}: {zeroPad(minutes)}:{" "}
                <span style={{ width: 15, display: "inline-block" }}>
                    {zeroPad(seconds)}
                </span>
            </span>
        );
    }
};

const endRoundRender = ({ days, hours, minutes, seconds, completed }) => {
    if (completed) {
        return <span>Ended</span>;
    } else {
        return (
            <span>
                {zeroPad(days)}: {zeroPad(hours)}: {zeroPad(minutes)}:{" "}
                <span style={{ width: 15, display: "inline-block" }}>
                    {zeroPad(seconds)}
                </span>
            </span>
        );
    }
};

export default function AuctionRoundDetails() {
    const currency = useSelector((state) => state.favAssets?.currency) || {
        value: "USD",
        sign: "$",
    };
    const currencyRates = useSelector((state) => state.currencyRates) || {};
    const currencyRate = currencyRates[currency.value] ?? 1;

    const auction = useAuction();
    const { optCurrentRound, currentRoundBidList, isAuction } = auction;

    // Calculate metrics from bid list data
    const auctionMetrics = useMemo(() => {
        if (!currentRoundBidList || !optCurrentRound) {
            return {
                totalVolume: 0,
                participants: 0,
                tokenPrice: 0,
            };
        }

        const bidArray = Object.values(currentRoundBidList);

        // Calculate total volume (sum of all mainAmount values)
        const totalVolume = bidArray.reduce((sum, bid) => {
            const amount = isAuction
                ? bid.tokenAmount * bid.tokenPrice
                : bid.ndbAmount * bid.ndbPrice;
            return sum + (amount || 0);
        }, 0);

        // Count unique participants
        const participants = bidArray.length;

        // Get token price (3 decimal places)
        const tokenPrice = isAuction
            ? optCurrentRound?.placeBid || 0
            : optCurrentRound?.tokenPrice || 0;

        return {
            totalVolume,
            participants,
            tokenPrice,
        };
    }, [currentRoundBidList, optCurrentRound, isAuction]);

    const soldTokensPercentage = optCurrentRound
        ? (optCurrentRound?.sold /
              (isAuction
                  ? optCurrentRound?.totalToken
                  : optCurrentRound?.tokenAmount)) *
          100
        : 0;

    // Don't render if no data
    if (!currentRoundBidList || !optCurrentRound) return <></>;

    return (
        <div className="auction-left__bottom">
            <PercentageBar
                percentage={soldTokensPercentage}
                sold={optCurrentRound?.sold || 0}
                total={
                    isAuction
                        ? optCurrentRound?.totalToken
                        : optCurrentRound?.tokenAmount
                }
            />
            <div className="d-flex justify-content-between mt-20px">
                <div>
                    <p className="caption text-[#959595]">
                        {isAuction ? "Reserved Price" : "Token Price"}
                    </p>
                    <p className="value">
                        {renderNumberFormat(
                            auctionMetrics.tokenPrice * currencyRate,
                            currency.sign,
                            "",
                            3, // 3 decimal places for token price
                            true,
                        )}
                    </p>
                </div>
                <div>
                    <p className="caption text-[#959595]">Total Volume</p>
                    <p className="value">
                        {renderNumberFormat(
                            auctionMetrics.totalVolume * currencyRate,
                            currency.sign,
                            "",
                            2, // 2 decimal places for total volume
                            true,
                        )}
                    </p>
                </div>
            </div>
            <div className="d-flex justify-content-between mt-20px">
                <div>
                    <p className="caption text-[#959595]">Round ends in</p>
                    <p className="value">
                        {optCurrentRound?.status === 1 ? (
                            <Countdown
                                date={new Date(optCurrentRound?.startDate)}
                                renderer={startRoundRender}
                            />
                        ) : optCurrentRound?.status === 3 ? (
                            <span>Ended</span>
                        ) : (
                            <Countdown
                                date={new Date(optCurrentRound?.endDate)}
                                renderer={endRoundRender}
                            />
                        )}
                    </p>
                </div>
                <div>
                    <p className="caption text-[#959595]">Participants</p>
                    <p className="value">{auctionMetrics.participants}</p>
                </div>
            </div>
        </div>
    );
}
