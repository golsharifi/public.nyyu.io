import React from "react";

export default function TierProgressBar({ user, nextTier }) {
    const current = user?.tierPoint ? user.tierPoint : 0;
    const total = nextTier?.length > 0 ? nextTier[0]?.point : 100;
    const percentageValue = (current / total) * 100;
    return (
        <div className="timeframe-bar mt-1">
            <div
                className="timeleft"
                style={{
                    width: `${
                        !percentageValue
                            ? 0
                            : percentageValue > 100
                            ? 100
                            : percentageValue < 0
                            ? 0
                            : percentageValue
                    }%`,
                }}
            />
        </div>
    );
}
