import React, { useState, useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import Slider from "rc-slider";
import NumberFormat from "../../utilities/number";
import { useAuction } from "../../providers/auction-context";
import { renderNumberFormat } from "../../utilities/number";

export default function PresalePlaceOrderHome() {
    const currency = useSelector((state) => state.favAssets.currency);
    const currencyRates = useSelector((state) => state.currencyRates);
    const currencyRate = currencyRates[currency.value] ?? 1;
    const totalInput = document.querySelector(".presale-total-input");

    const auction = useAuction();
    const { optCurrentRound, setPresalePlaceOrderStage, setPresaleNdbAmount } =
        auction;
    const [amount, setAmount] = useState(1);
    const [totalPrice, setTotalPrice] = useState(1);

    useEffect(() => {
        setTotalPrice(1 * optCurrentRound.tokenPrice * currencyRate);
    }, [currencyRate]);

    const isFirstPurchase = false;

    const handleOrder = () => {
        setPresalePlaceOrderStage(1);
        setPresaleNdbAmount(amount);
    };

    const leftAmount = useMemo(() => {
        return optCurrentRound.tokenAmount - optCurrentRound.sold;
    }, [optCurrentRound.tokenAmount, optCurrentRound.sold]);

    // Render
    return (
        <>
            <h3 className="range-label">amount of token</h3>
            <div className="d-flex align-items-center mb-4">
                <NumberFormat
                    className="range-input"
                    value={amount}
                    onValueChange={(values) => {
                        setAmount(values.value);
                        if (totalInput !== document.activeElement)
                            setTotalPrice(
                                Number(
                                    values.value *
                                        optCurrentRound?.tokenPrice *
                                        currencyRate,
                                ),
                            );
                    }}
                    isAllowed={({ floatValue }) =>
                        floatValue >= 1 && floatValue <= leftAmount
                    }
                    thousandSeparator={true}
                    decimalScale={0}
                    allowNegative={false}
                />
                <Slider
                    value={amount}
                    onChange={(value) => setAmount(value)}
                    min={1}
                    max={leftAmount}
                    step={1}
                />
            </div>
            <div className="row">
                <div className="col-lg-4">
                    <div className="range-label mt-15px">Total price</div>
                </div>
                <div className="col-lg-8">
                    <div className="w-100 d-flex justify-content-between align-items-center">
                        <div className="w-100 d-flex flex-column justify-content-center align-items-end">
                            <NumberFormat
                                className="presale-total-input"
                                value={totalPrice}
                                onValueChange={(values) => {
                                    setTotalPrice(values.value);
                                    setAmount(
                                        Number(
                                            values.value /
                                                optCurrentRound?.tokenPrice /
                                                currencyRate,
                                        ),
                                    );
                                }}
                                isAllowed={({ floatValue }) =>
                                    floatValue >= 0.01 &&
                                    floatValue <=
                                        optCurrentRound?.tokenPrice *
                                            leftAmount *
                                            currencyRate
                                }
                                decimalScale={3}
                                thousandSeparator={true}
                                allowNegative={false}
                            />
                        </div>
                        <h3 className="symbol-label mt-10px ml-7px">
                            {currency.label}
                        </h3>
                    </div>
                </div>
            </div>
            <div
                className="text-center"
                style={{ height: 20, fontWeight: 600 }}
            >
                {currency.label !== "USD" ? (
                    <NumberFormat
                        className="txt-green"
                        value={Number(
                            optCurrentRound?.tokenPrice * amount,
                        ).toFixed(2)}
                        thousandSeparator={true}
                        displayType="text"
                        allowNegative={false}
                        renderText={(value, props) => (
                            <span {...props}>{value} USD</span>
                        )}
                    />
                ) : (
                    ""
                )}
            </div>
            {isFirstPurchase && (
                <div className="row">
                    <div className="col-lg-8">
                        <p className="txt-green">
                            This is a referred account. You will get an extra
                            10% of NDB Tokens with your first purchase. Make it
                            count!
                        </p>
                    </div>
                    <div className="col-lg-4 d-flex align-items-center justify-content-center">
                        <p className="my-2 fs-18px">
                            Extra:{" "}
                            {renderNumberFormat(
                                Number(amount * 0.1).toFixed(1),
                                "NDB",
                            )}
                        </p>
                    </div>
                </div>
            )}
            <div className="mt-3 mb-1">
                <p className="text-secondary fw-500 text-[#959595]">
                    Audited by{" "}
                    <a
                        href="https://www.certik.com/projects/ndb"
                        target="_blank"
                        className="hover\:txt-green"
                    >
                        CertiK
                    </a>
                </p>
            </div>
            <button
                className="btn btn-outline-light rounded-0 text-uppercase w-100 fw-bold py-12px fs-20px"
                onClick={() => handleOrder()}
            >
                <div className="d-flex align-items-center justify-content-center gap-3">
                    BUY
                </div>
            </button>
        </>
    );
}
