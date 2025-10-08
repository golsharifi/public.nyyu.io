import React from "react"

import { useAuction } from "../../providers/auction-context"
import PresalePlaceOrderHome from "./presale-place-order-home"
import PresalePlaceOrderWalletSelect from "./presale-place-order-wallet-select"

export default function PresalePlaceOrder() {
    const auction = useAuction()
    const { optCurrentRound, presalePlaceOrderStage, isAuction } = auction
    // Render
    return (
        <>
            {optCurrentRound?.status === 3 ? (
                <div className="d-sm-flex d-none text-light fw-bold fs-24px text-uppercase w-100 align-items-center justify-content-center vh-85">
                    round is over
                </div>
            ) : optCurrentRound?.status === 1? (
                <div className="d-sm-flex d-none text-light fw-bold fs-24px text-uppercase w-100 align-items-center justify-content-center vh-85">
                    countdown
                </div>
            ) : !auction.currentRoundBidList ? (
                <></>
            ) : <div className="place-bid">
                    {!isAuction && !presalePlaceOrderStage ? <PresalePlaceOrderHome/> : <PresalePlaceOrderWalletSelect/>}
                </div>
            }
        </>
    )
}
