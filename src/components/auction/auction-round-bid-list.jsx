import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import _ from "lodash";
import { useQuery } from "@apollo/client";

import { useAuction } from "../../providers/auction-context";
import CustomSpinner from "../common/custom-spinner";
import AuctionListHeader from "../common/AuctionListHeader";
import AuctionList from "../common/AuctionList";

import {
    GET_BID,
    GET_CURRENT_ROUND,
} from "../../apollo/graphqls/querys/Auction";
import { GET_BIDLIST_BY_ROUND } from "../../apollo/graphqls/querys/Bid";
import {
    GET_PRESALE_LIST_BY_ROUND,
    GET_NEW_PRESALE_ORDERS,
} from "../../apollo/graphqls/querys/Presale";
import {
    setCookie,
    NDB_Paypal_TrxType,
    NDB_Auction,
    NDB_Presale,
} from "../../utilities/cookies";

export default function AuctionRoundBidList() {
    const currentUser = useSelector((state) => state.auth.user);
    const auction = useAuction();
    const { optCurrentRound, currentRoundNumber, isAuction, setCurrentRound } =
        auction;

    // Get currency for header display
    const currency = useSelector((state) => state.favAssets?.currency) || {
        value: "USD",
        label: "USD",
        sign: "$",
    };

    // FIX: Initialize displayedBidList as empty array to prevent NaN
    const [currentRoundBidList, setCurrentRoundBidList] = useState(null);
    const [displayedBidList, setDisplayedBidList] = useState([]); // Initialize as empty array
    const [currentAuctionUserExist, setCurrentAuctionUserExist] =
        useState(false);
    const [currentUserBidData, setCurrentUserBidData] = useState(null);
    const pollIntervalValue = 10000;

    const loadingData = !(
        currentRoundBidList &&
        auction.currentRoundBidList &&
        auction.getBid
    );

    // Calculate total count safely
    const totalCount = useMemo(() => {
        const displayedCount = Array.isArray(displayedBidList)
            ? displayedBidList.length
            : 0;
        const currentUserCount = currentAuctionUserExist ? 1 : 0;
        return displayedCount + currentUserCount;
    }, [displayedBidList, currentAuctionUserExist]);

    const lastOrderId = useMemo(() => {
        if (!currentRoundBidList) return null;
        const sortListById = _.orderBy(
            Object.values(currentRoundBidList),
            ["id"],
            ["desc"],
        );
        return sortListById[0]?.id;
    }, [currentRoundBidList]);

    // Webservices
    useQuery(isAuction ? GET_BIDLIST_BY_ROUND : GET_PRESALE_LIST_BY_ROUND, {
        variables: isAuction
            ? {
                  round: currentRoundNumber,
              }
            : {
                  presaleId: optCurrentRound?.id,
              },
        onCompleted: (data) => {
            let list;
            if (isAuction) {
                list = _.orderBy(
                    data?.getBidListByRound,
                    ["ranking", "tokenPrice"],
                    ["asc", "desc"],
                );
                list = list.map((item, index) => ({
                    ...item,
                    totalAmount:
                        (item.tokenPrice || 0) * (item.tokenAmount || 0),
                    ranking: index + 1,
                }));
            } else {
                let ordersObj = {};
                for (let order of data?.getPresaleOrders) {
                    if (ordersObj[order?.userId]) {
                        const id =
                            ordersObj[order?.userId]?.id >= order?.id
                                ? ordersObj[order?.userId]?.id
                                : order?.id;
                        const ndbAmount =
                            (ordersObj[order?.userId]?.ndbAmount || 0) +
                            (order?.ndbAmount || 0);
                        const paidAmount =
                            (ordersObj[order?.userId]?.paidAmount || 0) +
                            (order?.paidAmount || 0);
                        ordersObj[order?.userId] = {
                            ...ordersObj[order?.userId],
                            ndbAmount,
                            paidAmount,
                            id,
                        };
                    } else {
                        ordersObj[order?.userId] = order;
                    }
                }
                list = ordersObj;
            }

            // Reset states properly
            setDisplayedBidList([]);
            setCurrentAuctionUserExist(false);
            setCurrentUserBidData(null); // FIX: was set to [] should be null

            setCurrentRoundBidList(list);
            auction.setCurrentRoundBidList(list);
        },
        onError: (error) => console.log(error),
        fetchPolicy: "no-cache",
        errorPolicy: "ignore",
    });

    useQuery(GET_CURRENT_ROUND, {
        onCompleted: (data) => {
            if (data.getCurrentRound) {
                if (data.getCurrentRound.auction) {
                    setCurrentRound(data.getCurrentRound.auction);
                    setCookie(NDB_Paypal_TrxType, NDB_Auction);
                } else if (data.getCurrentRound.presale) {
                    setCurrentRound(data.getCurrentRound.presale);
                    setCookie(NDB_Paypal_TrxType, NDB_Presale);
                } else {
                    setCookie(NDB_Paypal_TrxType, "");
                }
            }
        },
        onError: (error) => console.log(error),
        fetchPolicy: "no-cache",
        errorPolicy: "ignore",
    });

    const pollingBidList = useQuery(
        GET_NEW_PRESALE_ORDERS,
        { skip: isAuction },
        {
            variables: {
                presaleId: optCurrentRound?.id,
                lastOrderId,
            },
            onCompleted: (data) => {
                if (data?.getNewPresaleOrders) {
                    if (
                        _.isEmpty(data?.getNewPresaleOrders) ||
                        !currentRoundBidList
                    )
                        return;

                    let orderObj = currentRoundBidList;
                    for (let order of data?.getNewPresaleOrders) {
                        if (orderObj[order?.userId]) {
                            if (orderObj[order?.userId]?.id >= order?.id)
                                continue;
                            const id =
                                orderObj[order?.userId]?.id >= order?.id
                                    ? orderObj[order?.userId]?.id
                                    : order?.id;
                            const ndbAmount =
                                (orderObj[order?.userId]?.ndbAmount || 0) +
                                (order?.ndbAmount || 0);
                            const paidAmount =
                                (orderObj[order?.userId]?.paidAmount || 0) +
                                (order?.paidAmount || 0);
                            orderObj[order?.userId] = {
                                ...orderObj[order?.userId],
                                ndbAmount,
                                paidAmount,
                                id,
                            };
                        } else {
                            orderObj[order?.userId] = order;
                        }
                    }
                    setCurrentRoundBidList({ ...orderObj });
                }
            },
            onError: (error) => console.log(error),
            fetchPolicy: "no-cache",
            errorPolicy: "ignore",
            pollInterval: pollIntervalValue,
            notifyOnNetworkStatusChange: true,
        },
    );

    useQuery(GET_BID, {
        variables: {
            roundId: optCurrentRound?.id,
        },
        onCompleted: (data) => {
            if (data?.getBid === null) {
                auction.setGetBid({});
                return auction.setIsBid(true);
            }
            if (data?.getBid.status === 0) {
                auction.setGetBid({});
                return auction.setIsBid(true);
            }
            auction.setGetBid(data?.getBid);
            return auction.setIsBid(false);
        },
    });

    useEffect(() => {
        if (!_.isEmpty(currentRoundBidList)) {
            if (isAuction) {
                const currentUserBidInfo = Object.values(
                    currentRoundBidList,
                )?.filter((auction) => auction.userId === currentUser.id)[0];
                if (currentUserBidInfo) {
                    setCurrentUserBidData(currentUserBidInfo);
                    setCurrentAuctionUserExist(true);
                }
                const restList = Object.values(currentRoundBidList)?.filter(
                    (auction) => auction.userId !== currentUser.id,
                );
                setDisplayedBidList(restList || []); // Ensure array
            } else {
                let sortList = _.orderBy(
                    Object.values(currentRoundBidList),
                    ["ndbAmount"],
                    ["desc"],
                );
                const tempList = sortList.map(({ ranking, ...item }, key) => ({
                    ...item,
                    ranking: key + 1,
                }));
                setDisplayedBidList(tempList || []); // Ensure array
            }
        } else {
            // Properly handle empty state
            setDisplayedBidList([]);
            setCurrentAuctionUserExist(false);
            setCurrentUserBidData(null);
        }
    }, [currentRoundBidList, currentUser.id, isAuction]);

    useEffect(() => {
        if (!isAuction) {
            if (
                optCurrentRound &&
                optCurrentRound.status === 2 &&
                currentRoundBidList
            )
                return pollingBidList.startPolling(pollIntervalValue);
            return pollingBidList.stopPolling();
        }
    }, [optCurrentRound, pollingBidList, currentRoundBidList]);

    // Render
    if (loadingData)
        return (
            <div className="text-center mt-4">
                <CustomSpinner />
            </div>
        );

    return (
        <div className="d-flex flex-column align-items-center pt-5 list-part">
            <AuctionListHeader
                totalCount={totalCount}
                auctionType={isAuction ? "Bidder" : "Buyer"}
                auctionTitle={`${isAuction ? "Bid" : "Order"} `}
            />
            {currentAuctionUserExist && isAuction ? (
                <div className="list-part auction-bid-list-content-final">
                    <AuctionList
                        ranking={currentUserBidData?.ranking || 1}
                        fullName={
                            (currentUserBidData?.prefix || "User") +
                            "." +
                            (currentUserBidData?.name || "Name")
                        }
                        tokenPrice={
                            isAuction
                                ? currentUserBidData?.tokenPrice || 0
                                : currentUserBidData?.ndbPrice || 0
                        }
                        mainAmount={
                            isAuction
                                ? (currentUserBidData?.tokenAmount || 0) *
                                  (currentUserBidData?.tokenPrice || 0)
                                : (currentUserBidData?.ndbAmount || 0) *
                                  (currentUserBidData?.ndbPrice || 0)
                        }
                        ndbAmount={
                            isAuction
                                ? currentUserBidData?.tokenAmount || 0
                                : currentUserBidData?.ndbAmount || 0
                        }
                        paidAmount={currentUserBidData?.paidAmount || 0}
                        winningResult={
                            currentUserBidData?.status !== 0 &&
                            currentUserBidData?.status === 1
                        }
                        isCurrentUser={true}
                    />
                </div>
            ) : null}
            <div className="list-part auction-bid-list-content-group">
                {displayedBidList &&
                    displayedBidList.map((item, index) => (
                        <AuctionList
                            key={index}
                            ranking={item?.ranking || index + 1}
                            fullName={
                                (item?.prefix || "User") +
                                "." +
                                (item?.name || "Name")
                            }
                            tokenPrice={
                                isAuction
                                    ? item?.tokenPrice || 0
                                    : item?.ndbPrice || 0
                            }
                            mainAmount={
                                isAuction
                                    ? (item?.tokenAmount || 0) *
                                      (item?.tokenPrice || 0)
                                    : (item?.ndbAmount || 0) *
                                      (item?.ndbPrice || 0)
                            }
                            ndbAmount={
                                isAuction
                                    ? item?.tokenAmount || 0
                                    : item?.ndbAmount || 0
                            }
                            paidAmount={item?.paidAmount || 0}
                            winningResult={
                                item?.status !== 0 && item?.status === 1
                            }
                            isCurrentUser={item?.userId === currentUser?.id}
                        />
                    ))}
            </div>
        </div>
    );
}
