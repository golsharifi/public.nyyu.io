import React from "react";
import { useSelector } from "react-redux";
import NumberFormat from "../../utilities/number";
import { roundNumber } from "../../utilities/number";
import { getStripePaymentFee } from "../../utilities/utility-methods";

export default function OrderSummaryOfCreditCard({ bidAmount }) {
    // Containers
    const { allFees } = useSelector((state) => state);
    const user = useSelector((state) => state.auth.user);
    const stripePaymentFee = getStripePaymentFee(user, allFees, bidAmount);

    // Render
    return (
        <div className="col-lg-4 d-flex flex-column justify-content-between">
            <div className="order-summary d-flex flex-column h-100 justify-content-between">
                <div>
                    <h4>ORDER SUMMARY</h4>
                    <div className="order-list-coinpayment border-0">
                        <div className="d-flex justify-content-between my-3">
                            <p className="order-list__label">Total order</p>
                            <NumberFormat
                                className="order-list__detail"
                                displayType={"text"}
                                suffix=" USD"
                                value={roundNumber(bidAmount, 2)}
                                thousandSeparator={true}
                                renderText={(value, props) => (
                                    <p {...props}>~ {value}</p>
                                )}
                            />
                        </div>
                        <div className="d-flex justify-content-between my-3">
                            <p className="order-list__label">Fee</p>
                            <NumberFormat
                                className="order-list__detail"
                                displayType={"text"}
                                suffix=" USD"
                                value={roundNumber(stripePaymentFee, 2)}
                                thousandSeparator={true}
                                renderText={(value, props) => (
                                    <p {...props}>~ {value}</p>
                                )}
                            />
                        </div>
                        <div className="d-flex justify-content-between">
                            <p className="order-list__label">Discount</p>
                            <p className="order-list__label">0</p>
                        </div>
                    </div>
                </div>
                <div
                    className="d-flex justify-content-between border-top border-light"
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
                        value={roundNumber(
                            Number(bidAmount) + Number(stripePaymentFee),
                            2,
                        )}
                        thousandSeparator={true}
                        renderText={(value, props) => (
                            <p {...props}>~ {value}</p>
                        )}
                    />
                </div>
            </div>
        </div>
    );
}
