import React, { useContext, useState } from "react"
import { useQuery } from "@apollo/client"
import {
    GET_AUCTION,
    GET_CURRENT_ROUND,
    GET_PRESALES,
} from "../apollo/graphqls/querys/Auction"
import { setCookie, NDB_Paypal_TrxType, NDB_Auction, NDB_Presale } from '../utilities/cookies';

export const AuctionContext = React.createContext()
export const useAuction = () => useContext(AuctionContext)

const AuctionProvider = ({ children }) => {
    // Containers
    const [auctions, setAuctions] = useState(null)
    const [presales, setPresales] = useState(null)
    const [currentRoundNumber, setCurrentRoundNumber] = useState(-1)
    const [currentRoundBidList, setCurrentRoundBidList] = useState(null)
    const [bidModal, setBidModal] = useState(false)
    const [getBid, setGetBid] = useState(null)
    const [isBid, setIsBid] = useState(null)
    const [isAuction, setIsAuction] = useState(true)
    const [currentRound, setCurrentRound] = useState(null)
    const [entireRounds, setEntireRounds] = useState(null)
    const [optCurrentRound, setOptCurrentRound] = useState(null)
    const [presalePlaceOrderStage, setPresalePlaceOrderStage] = useState(0)
    const [presaleNdbAmount, setPresaleNdbAmount] = useState(1)

    const loading = !(auctions && presales && currentRound)
    
    // Webservices
    useQuery(GET_AUCTION, {
        onCompleted: (data) => {
            setAuctions(data.getAuctions)
        },
        onError: (error) => console.log(error),
        errorPolicy: 'ignore',
        fetchPolicy: "network-only",
    })

    useQuery(GET_PRESALES, {
        onCompleted: (data) => {
            setPresales(data.getPreSales)
        },
        onError: (error) => console.log(error),
        errorPolicy: 'ignore',
        fetchPolicy: "network-only",
    })

    useQuery(GET_CURRENT_ROUND, {
        onCompleted: (data) => {
            if(data.getCurrentRound) {
                setCurrentRound(data.getCurrentRound)
                if(data.getCurrentRound?.auction) {
                    setCookie(NDB_Paypal_TrxType, NDB_Auction);
                    setIsAuction(true);
                } else if(data.getCurrentRound?.presale) {
                    setCookie(NDB_Paypal_TrxType, NDB_Presale);
                    setIsAuction(false);
                } else {
                    setCookie(NDB_Paypal_TrxType, '');
                }
            }
        },
        onError: (error) => console.log(error),
        errorPolicy: 'ignore',
        fetchPolicy: "network-only",
    })

    // Binding
    const providerValue = {
        loading,
        auctions,

        // current round number
        currentRoundNumber,
        setCurrentRoundNumber,

        // curren round bid list
        currentRoundBidList,
        setCurrentRoundBidList,

        // bid modal
        bidModal,
        setBidModal,

        // is bid
        isBid,
        setIsBid,

        // get bid
        getBid,
        setGetBid,

        // current round
        currentRound,
        setCurrentRound,

        // is auction or not
        isAuction,
        setIsAuction,

        presales,
        setPresales,

        entireRounds,
        setEntireRounds,

        optCurrentRound,
        setOptCurrentRound,

        presaleNdbAmount,
        setPresaleNdbAmount,

        presalePlaceOrderStage,
        setPresalePlaceOrderStage
    }

    // Render
    return (
        <AuctionContext.Provider value={providerValue}>
            {children}
        </AuctionContext.Provider>
    )
}

export default AuctionProvider
