import React, { useState, useEffect } from "react"
import { Tabs } from "react-tabs"
import _ from 'lodash';
import { navigate } from "gatsby";

import Seo from "../seo"
import Loading from "../common/Loading"
import Header from "../header"
import { useAuction } from "../../providers/auction-context"
import AuctionRoundNavigator from "./auction-round-navigator"
import AuctionRoundBidList from "./auction-round-bid-list"
import AuctionRoundDetails from "./auction-round-details"
import AuctionPlaceBid from "./auction-place-bid"
// import AuctionPlaceBidModal from "./auction-place-bid-modal"
import PresalePlaceOrder from "./presale-place-order"

const Auction = () => {
    const auction = useAuction()
    const { auctions, presales, entireRounds, setEntireRounds, currentRound, currentRoundNumber, optCurrentRound, setOptCurrentRound, isAuction } = auction
    
    useEffect(() => {
        if (auctions || presales) {
            const tempRounds = auctions?.concat(presales);
            // If tempRounds is null or undefined
            if(!tempRounds) return;
            // If tempRounds is []
            if(_.isEmpty(tempRounds)) {
                navigate('/');
            } else {
                setEntireRounds(_.orderBy(tempRounds, ['round'], 'asc'));
            }
        }
    }, [auctions, presales])

    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (auction.loading === false) {
            auction.setCurrentRoundNumber(entireRounds?.length)
            setLoading(false)
        }
    }, [auction.loading, currentRound, entireRounds])

    useEffect(() => {
        setOptCurrentRound(entireRounds && entireRounds?.filter(
            (item) => item?.round === currentRoundNumber
        )[0])
    }, [currentRoundNumber])
    
    useEffect(() => {
        auction.setIsAuction(optCurrentRound?.kind === 1)
    }, [optCurrentRound])

    if (loading) return <Loading/>
    
    return (
        <>
            <Seo title="Sale"/>
            <main className="auction-page">
                <Header/>
                <section className="section-auction container">
                    <div className="row h-100">
                        <div className="auction-left col-lg-4 col-md-5 position-relative d-block">
                            <div className="d-flex">
                                <div className="w-100">
                                    <Tabs
                                        className="round-tab"
                                        defaultIndex={0}
                                    >
                                        <AuctionRoundNavigator/>
                                    </Tabs>
                                    <AuctionRoundBidList/>
                                </div>
                            </div>
                            <AuctionRoundDetails/>
                            <div className="d-block d-sm-none">
                                {optCurrentRound?.status === 1 &&
                                    <h3 className="mt-2 text-uppercase text-center fw-bold">
                                        Countdown
                                    </h3>
                                }
                                {optCurrentRound?.status === 3 &&
                                    <h3 className="mt-2 text-uppercase text-center fw-bold">
                                        Round is over
                                    </h3>
                                }
                            </div>
                        </div>

                        <div className="auction-right col-lg-8 col-md-7">
                            {isAuction ?
                                <AuctionPlaceBid/>
                                : <PresalePlaceOrder/>
                            }
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}

export default Auction
