import { useQuery } from "@apollo/client";
import React from "react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GET_USER_TIERS } from "../../apollo/graphqls/querys/UserTier";
import { fillUserTiers } from "../../store/actions/userTierAction";

export default function UserTier() {
    // Containers
    const user = useSelector((state) => state.auth?.user);
    const [userTiersData, setUserTiersData] = useState(null);

    // Methods
    const dispatch = useDispatch();

    // Debug log to check user tier data
    console.log("UserTier Debug - User Data:", {
        user,
        tierLevel: user?.tierLevel,
        tierLevelType: typeof user?.tierLevel,
    });

    // Webservice
    const { loading: userTiersLoading } = useQuery(GET_USER_TIERS, {
        onCompleted: (data) => {
            console.log("UserTier Debug - Tiers Data:", data?.getUserTiers);
            setUserTiersData(data?.getUserTiers);
            dispatch(fillUserTiers(data?.getUserTiers));
        },
        onError: (error) => {
            console.error("UserTier Error:", error);
        },
    });

    // Render
    if (userTiersLoading || !userTiersData) {
        return <></>;
    }

    // Find the current tier
    const currentTier = userTiersData.find(
        (item) => item?.level === user?.tierLevel,
    );

    console.log("UserTier Debug - Current Tier:", {
        userLevel: user?.tierLevel,
        foundTier: currentTier,
        allTiers: userTiersData.map((t) => ({ level: t.level, name: t.name })),
    });

    if (!currentTier || !currentTier.svg) {
        return <></>;
    }

    return (
        <div
            className="header-avatar-user-tier"
            style={{
                position: "absolute",
                bottom: "-5px",
                right: "-5px",
                width: "20px",
                height: "20px",
                zIndex: 2,
            }}
            dangerouslySetInnerHTML={{
                __html: currentTier.svg,
            }}
        />
    );
}
