import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useQuery } from "@apollo/client";
import { roundNumber } from "../../utilities/number";
import NumberFormat from "../../utilities/number";
import Countdown from "react-countdown";
import { useAuction } from "../../providers/auction-context";
import {
    GET_CRYPTO_AUCTOIN_TX_BYID,
    GET_CRYPTO_PRESALE_TX_BYID,
} from "../../apollo/graphqls/querys/Payment";

const Completionist = () => <span>Payment expired!</span>;

// Renderer callback with condition
const renderer = ({ hours, minutes, seconds, completed }) => {
    if (completed) {
        // Render a completed state
        return <Completionist />;
    } else {
        // Render a countdown
        return (
            <span>
                {hours}h: {minutes}m: {seconds}s
            </span>
        );
    }
};

const EXPIRE_TIME = 8 * 3600 * 1000;
const POLL_INTERVAL_TIME = 10 * 1000;

export default function OrderSummary({ bidAmount, setPaymentSuccess }) {
    const { temp: coinData } = useSelector((state) => state);
    const auction = useAuction();
    const { isAuction } = auction;

    const [isSuccess, setIsSucess] = useState(false);

    const { startPolling, stopPolling } = useQuery(
        isAuction ? GET_CRYPTO_AUCTOIN_TX_BYID : GET_CRYPTO_PRESALE_TX_BYID,
        {
            variables: {
                id: coinData.paymentId,
            },
            onCompleted: (data) => {
                const resData = isAuction
                    ? data.getCryptoAuctionTxById
                    : data.getCryptoPresaleTxById;
                if (resData?.depositStatus === 1) {
                    setPaymentSuccess(true);
                    setIsSucess(true);
                }
            },
            onError: (error) => console.log(error),
            fetchPolicy: "no-cache",
            errorPolicy: "ignore",
            pollInterval: POLL_INTERVAL_TIME,
            notifyOnNetworkStatusChange: true,
        },
    );

    useEffect(() => {
        if (coinData.paymentId) return startPolling(POLL_INTERVAL_TIME);
        if (isSuccess) return stopPolling();
    }, [coinData.paymentId, isSuccess, startPolling, stopPolling]);

    return (
        <div className="col-lg-4 d-flex flex-column justify-content-between">
            <div className="order-summary ">
                <h4>ORDER SUMMARY</h4>

                <div className="order-list-coinpayment">
                    <div className="d-flex justify-content-between">
                        <p className="order-list__label">Status</p>
                        <p className="order-list__detail">
                            {isSuccess ? (
                                <span className="txt-green fw-bold">
                                    Success
                                </span>
                            ) : (
                                "Waiting for your funds"
                            )}
                        </p>
                    </div>
                    <div className="d-flex justify-content-between my-3">
                        <p className="order-list__label">Balance remaining</p>
                        {coinData.coinValue ? (
                            <NumberFormat
                                className="order-list__detail"
                                displayType={"text"}
                                suffix={` ${coinData.coinSymbol}`}
                                value={coinData.coinValue}
                                thousandSeparator={true}
                                renderText={(value, props) => (
                                    <p {...props}>{value}</p>
                                )}
                            />
                        ) : (
                            ""
                        )}
                    </div>
                    <div className="d-flex justify-content-between my-3">
                        <p className="order-list__label">Recieved so far</p>
                        <p className="order-list__detail">
                            {coinData.coinValue
                                ? `0 ${coinData.coinSymbol}`
                                : ""}
                        </p>
                    </div>
                    <div className="d-flex justify-content-between my-3">
                        <p className="order-list__label">
                            Time left to confirm funds
                        </p>
                        <p className="order-list__detail">
                            {coinData?.paymentId && coinData?.createdAt ? (
                                <Countdown
                                    zeroPadTime={2}
                                    date={coinData?.createdAt + EXPIRE_TIME}
                                    renderer={renderer}
                                />
                            ) : (
                                <span>8h: 0m: 0s</span>
                            )}
                        </p>
                    </div>
                    <div className="d-flex justify-content-between my-3">
                        <p className="order-list__label">Payment ID</p>
                        <p className="order-list__detail">
                            {coinData?.paymentId ? coinData?.paymentId : ""}
                        </p>
                    </div>
                    <div className="d-flex justify-content-between my-3">
                        <p className="order-list__label">Transaction fee</p>
                        {coinData?.transactionFee ? (
                            <NumberFormat
                                className="order-list__detail"
                                displayType={"text"}
                                suffix={` USD`}
                                value={coinData?.transactionFee}
                                thousandSeparator={true}
                                renderText={(value, props) => (
                                    <p {...props}>{value}</p>
                                )}
                            />
                        ) : (
                            ""
                        )}
                    </div>
                </div>
                <div
                    className="d-flex justify-content-between"
                    style={{ paddingTop: "11px", paddingBottom: "10px" }}
                >
                    <p
                        className="order-list__label"
                        style={{ color: "dimgrey" }}
                    >
                        Order total:
                    </p>
                    <NumberFormat
                        className="order-total"
                        displayType={"text"}
                        suffix=" USD"
                        value={roundNumber(bidAmount, 2)}
                        thousandSeparator={true}
                        renderText={(value, props) => (
                            <p {...props}>~ {value}</p>
                        )}
                    />
                </div>
                {coinData.coinValue ? (
                    <NumberFormat
                        style={{ textAlign: "right", color: "dimgrey" }}
                        displayType={"text"}
                        suffix={` ${coinData.coinSymbol}`}
                        value={coinData.coinValue}
                        thousandSeparator={true}
                        renderText={(value, props) => (
                            <p {...props}>~ {value}</p>
                        )}
                    />
                ) : (
                    ""
                )}
            </div>
        </div>
    );
}
