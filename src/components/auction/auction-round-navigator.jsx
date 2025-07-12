import React, { useEffect, useState } from "react";
import { Tab, TabList } from "react-tabs";
import { Icon } from "@iconify/react";
import NumberFormat from "../../utilities/number";

import { useAuction } from "../../providers/auction-context";

export default function AuctionRoundNavigator() {
    // Containers
    const auction = useAuction();
    const {
        optCurrentRound,
        entireRounds,
        currentRoundNumber,
        setCurrentRoundNumber,
        isAuction,
    } = auction;
    const [canGoNext, setCanGoNext] = useState(true);
    const [canGoBack, setCanGoBack] = useState(true);

    useEffect(() => {
        setCanGoNext(entireRounds?.length !== currentRoundNumber);
    }, [entireRounds, currentRoundNumber]);

    useEffect(() => {
        setCanGoBack(currentRoundNumber !== 1);
    }, [currentRoundNumber]);

    // Methods
    const reset = () => {
        auction.setCurrentRoundBidList(null);
    };
    const goBack = () => {
        if (canGoBack) {
            setCurrentRoundNumber(currentRoundNumber - 1);
            reset();
        }
    };
    const goNext = () => {
        if (canGoNext) {
            setCurrentRoundNumber(currentRoundNumber + 1);
            reset();
        }
    };

    // Render
    return (
        <TabList>
            <Tab className="w-100">
                <div className="d-flex justify-content-center flex-column align-items-center">
                    <div className="d-flex justify-content-between align-items-center w-100">
                        <button
                            className="btn text-light cursor-pointer"
                            onClick={goBack}
                            disabled={!canGoBack}
                        >
                            <Icon icon="ooui:previous-ltr" />
                        </button>
                        <div className="fw-bold text-uppercase fs-30px border-bottom border-3 border-success px-2">
                            <div>
                                Round
                                {" " + (optCurrentRound?.round ?? "")}
                            </div>
                        </div>
                        <button
                            className="btn text-light cursor-pointer"
                            onClick={goNext}
                            disabled={!canGoNext}
                        >
                            <Icon icon="ooui:previous-rtl" />
                        </button>
                    </div>
                    <div className="mt-3">
                        <span className="text-[#959595]">Token Available </span>
                        <span className="fw-500">
                            <NumberFormat
                                value={
                                    isAuction
                                        ? optCurrentRound?.totalToken
                                        : optCurrentRound?.tokenAmount
                                }
                                thousandSeparator={true}
                                displayType="text"
                                allowNegative={false}
                                renderText={(value, props) => (
                                    <span {...props}>{value}</span>
                                )}
                            />
                        </span>
                    </div>
                </div>
            </Tab>
        </TabList>
    );
}
