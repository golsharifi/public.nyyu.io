import React, { useState } from 'react';

const LockedPeriods = [
    { id: 0, label: "Flexible", value: '' },
    { id: 1, label: "30 days", value: 30 },
    { id: 2, label: "60 days", value: 60 },
    { id: 3, label: "90 days", value: 90 },
];

export default function LockedStakingTab() {
    // Containers
    const [lockedStakingAssets, setLockedStakingAssets] = useState([]);
    if (lockedStakingAssets.length === 0)
        setLockedStakingAssets([
            {
                id: 0,
                label: "btc",
                minAmount: "1 btc",
                apy: "30.77%",
                duration: 0,
            },
            {
                id: 1,
                label: "eth",
                minAmount: "1 eth",
                apy: "0.90%",
                duration: 1,
            },
            {
                id: 2,
                label: "usdc",
                minAmount: "1 usdc",
                apy: "4.49%",
                duration: 0,
            },
        ]);
    // Methods
    const changeDurationForAsset = (assetID, durationID) => {
        const fooArray = lockedStakingAssets;
        fooArray[assetID].duration = durationID;
        setLockedStakingAssets([...fooArray]);
        // console.log("clicking")
    };

    return (
        <div className="py-3 overflow-x-auto">
            <table className="wallet-transaction-table w-100 text-center mt-1">
                <tr className="text-center border-bottom-2-dark-gray">
                    <th className="text-start">Token</th>
                    <th>Est. APY</th>
                    <th></th>
                    <th>Duration</th>
                    <th></th>
                    <th>Min. amount</th>
                    <th>Action</th>
                </tr>
                {lockedStakingAssets.map((asset, index) => (
                    <tr
                        key={index}
                        className="border-bottom-2-dark-gray"
                    >
                        <td>
                            <div className="d-flex align-items-center fs-16px gap-2">
                                <div className="circle-light"></div>
                                <div className="fs-16px fw-500 text-uppercase">
                                    {asset.label}
                                </div>
                            </div>
                        </td>
                        <td className="fs-14px text-success">
                            {asset.apy}
                        </td>
                        <td className="fs-14px" colSpan={3}>
                            <div className="stake-duration">
                                {LockedPeriods.map((item, index) => (
                                    <div
                                        key={index}
                                        className={`bg-black-10 ${
                                            asset.duration ===
                                                item.id &&
                                            "active-duration"
                                        }`}
                                        onClick={() =>
                                            changeDurationForAsset(
                                                asset.id,
                                                item.id
                                            )
                                        }
                                    >
                                        {item.label}
                                    </div>
                                ))}
                            </div>
                        </td>
                        <td className="fs-14px text-uppercase">
                            {asset.minAmount}
                        </td>
                        <td>
                            <button className="btn btn-outline-light rounded-0 fw-bold text-uppercase w-100 py-1">
                                stake
                            </button>
                        </td>
                    </tr>
                ))}
            </table>
        </div>
    );
}