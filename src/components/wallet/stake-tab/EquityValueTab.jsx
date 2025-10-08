import React from 'react';
import { BTC, DownArrow, Equity, ETH, USDC } from "../../../utilities/imgImport";

export default function EquityValueTab() {
    return (
        <div className="py-3">
            <div className="d-flex justify-content-between px-0 px-sm-2 flex-sm-row flex-column">
                <div className="d-flex flex-column justify-content-center">
                    <div className="d-flex align-items-center gap-3">
                        <div className="fs-24px fw-500">
                            Equity value(BTC)
                        </div>
                        <img src={Equity} alt="equity icon" />
                    </div>
                    <div className="txt-green fs-36px lh-25px mt-3">
                        ******
                    </div>
                    <div className="text-secondary fs-24px">******</div>
                </div>
                <div>
                    <div className="d-flex justify-content-between gap-5">
                        <div>
                            <div className="text-secondary fs-14px fw-500">
                                30-day profit (BTC)
                            </div>
                            <div className="txt-green fs-18px">
                                ******
                            </div>
                        </div>
                        <div>
                            <div className="text-secondary fs-14px fw-500">
                                Last day PNL (BTC)
                            </div>
                            <div className="txt-green fs-18px">
                                ******
                            </div>
                        </div>
                    </div>
                    <div className="mt-4">
                        <button className="btn btn-outline-light rounded-0 w-100 fw-bold text-uppercase">
                            stake to earn
                        </button>
                    </div>
                </div>
            </div>
            <div className="mt-5 overflow-auto">
                <div className="d-flex gap-3 justify-content-start align-items-center">
                    <div className="d-flex justify-content-start align-items-center gap-2">
                        <div className="fs-14px">All holdings</div>
                        <div>
                            <img
                                src={DownArrow}
                                alt="down arrow"
                                className="cursor-pointer w-50"
                            />
                        </div>
                    </div>
                    <div className="d-flex justify-content-start align-items-center gap-2">
                        <div className="fs-14px">All coins</div>
                        <div>
                            <img
                                src={DownArrow}
                                alt="down arrow"
                                className="cursor-pointer w-50"
                            />
                        </div>
                    </div>
                </div>
                <table>
                    <thead className="border-bottom-1px">
                        <tr>
                            <th>Token</th>
                            <th className="text-sm-center">Amount</th>
                            <th className="text-sm-end">APY</th>
                            <th className="text-sm-end">Interest</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            { icon: BTC, label: "btc" },
                            { icon: ETH, label: "eth" },
                        ].map((item, index) => (
                            <tr key={index} className="w-sm-100">
                                <td className="pe-5">
                                    <div className="d-flex align-items-center fs-12px gap-2">
                                        <img
                                            src={item.icon}
                                            alt="btc image"
                                        />
                                        <div className="fs-16px fw-500 text-uppercase">
                                            {item.label}
                                        </div>
                                    </div>
                                </td>
                                <td className="fs-12px text-center pe-5">
                                    1 NDB
                                </td>
                                <td className="fs-12px text-success text-end pe-5">
                                    30.77%
                                </td>
                                <td className="fs-12px text-end pe-5 white-space-nowrap">
                                    0.06251 NDB
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}