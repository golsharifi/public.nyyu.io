import React from "react";
import { useQuery } from "@apollo/client";
import { GET_TASK_SETTING, GET_USER_TIER_TASK } from "./profile-queries";
import { GET_USER_TIERS } from "../../apollo/graphqls/querys/UserTier"; // Same import as Profile.jsx
import { useState } from "react";
import CustomSpinner from "../common/custom-spinner";
import { QuestionMark } from "../../utilities/imgImport";
import { ReactTooltip } from "../../utilities/tooltip";
import { useSelector } from "react-redux";

export default function TierDetailsTab({ shuftiStatus }) {
    // Exact same pattern as Profile.jsx
    const [userTiersData, setUserTiersData] = useState(null);
    const [gainPointsData, setGainPointsData] = useState(null);
    const [taskSettingData, setTaskSettingData] = useState(null);
    const [walletPoint, setWalletPoint] = useState(0);

    // Get user data same as Profile.jsx
    const userData = useSelector((state) => state.auth?.user);
    const user = userData?.getUser;

    // Add debugging for user data - expand to see actual structure
    console.log("👤 User Debug:", {
        userData: userData,
        user: user,
        hasUserData: !!userData,
        hasUser: !!user,
        userKeys: userData ? Object.keys(userData) : "no userData",
        userLevel: user?.tierLevel,
        userPoint: user?.tierPoint,
        // Let's also check if userData directly has tierLevel
        userDataTierLevel: userData?.tierLevel,
        userDataTierPoint: userData?.tierPoint,
        // Check the entire userData structure
        fullUserData: userData,
    });

    // Step 1: Load user tiers - EXACT same pattern as Profile.jsx
    useQuery(GET_USER_TIERS, {
        onCompleted: (data) => {
            console.log(
                "✅ User tiers loaded (Profile.jsx pattern):",
                data?.getUserTiers,
            );
            setUserTiersData(data?.getUserTiers);
        },
        onError: (error) => {
            console.error("❌ User tiers error:", error);
        },
    });

    // Step 2: Load task settings - same pattern as original
    useQuery(GET_TASK_SETTING, {
        fetchPolicy: "network-only",
        onCompleted: (data) => {
            console.log("✅ Task settings loaded:", data?.getTaskSetting);
            setTaskSettingData(data?.getTaskSetting);
        },
        onError: (error) => {
            console.error("❌ Task settings error:", error);
        },
    });

    // Step 3: Load user tier task
    useQuery(GET_USER_TIER_TASK, {
        fetchPolicy: "network-only",
        onCompleted: (data) => {
            console.log("✅ User tier task loaded:", data?.getUserTierTask);
            setGainPointsData(data?.getUserTierTask);

            // Calculate wallet points
            const walletBalance = data?.getUserTierTask?.wallet || 0;
            let _walletPoint = 0;

            if (taskSettingData?.wallet) {
                taskSettingData.wallet.forEach((elem) => {
                    if (walletBalance > elem.amount) {
                        _walletPoint += elem.point;
                    }
                });
            }
            setWalletPoint(_walletPoint);
        },
        onError: (error) => {
            console.error("❌ User tier task error:", error);
        },
    });

    // Calculate current and next tier - try both user sources
    const actualUser = user || userData; // Try user first, fallback to userData
    const currentTier = userTiersData?.filter(
        (item) => item?.level === actualUser?.tierLevel,
    );
    const nextTier = userTiersData?.filter(
        (item) => item?.level === (actualUser?.tierLevel || 0) + 1,
    );

    // Add tier matching debug
    console.log("🎯 Tier Matching Debug:", {
        userLevel: actualUser?.tierLevel,
        userLevelType: typeof actualUser?.tierLevel,
        userTiersCount: userTiersData?.length || 0,
        allTierLevels:
            userTiersData?.map((t) => ({
                level: t.level,
                name: t.name,
                levelType: typeof t.level,
            })) || [],
        currentTierFound: currentTier?.length || 0,
        nextTierFound: nextTier?.length || 0,
        currentTierDetails: currentTier?.[0],
        nextTierDetails: nextTier?.[0],
        actualUser: actualUser,
    });

    // Loading condition - use actualUser
    const loadingSection = !(
        gainPointsData &&
        taskSettingData &&
        userTiersData &&
        actualUser // Use actualUser instead of userData
    );

    console.log("🔍 TierDetailsTab Debug:", {
        userTiersData: userTiersData?.length || 0,
        userLevel: user?.tierLevel,
        currentTier: currentTier?.length || 0,
        nextTier: nextTier?.length || 0,
        loadingSection,
        hasGainPointsData: !!gainPointsData,
        hasTaskSettingData: !!taskSettingData,
        hasUserData: !!userData,
        hasUser: !!user,
    });

    if (loadingSection) {
        return (
            <div className="d-flex justify-content-center my-5">
                <CustomSpinner />
                <div style={{ marginLeft: "10px" }}>
                    Loading... (Tiers: {userTiersData ? "✓" : "✗"}, Tasks:{" "}
                    {taskSettingData ? "✓" : "✗"}, Points:{" "}
                    {gainPointsData ? "✓" : "✗"}, UserData:{" "}
                    {userData ? "✓" : "✗"}, User: {user ? "✓" : "✗"})
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="tier-details">
                <div className="row w-100 mx-auto">
                    <div className="detail_item my-auto br">Tier</div>
                    <div className="detail_item text-end text-sm-start d-flex align-items-center justify-content-end justify-content-sm-start">
                        {currentTier?.length > 0 ? (
                            <>
                                <div
                                    className="me-3"
                                    dangerouslySetInnerHTML={{
                                        __html: currentTier[0]?.svg,
                                    }}
                                />
                                {currentTier[0]?.name}
                            </>
                        ) : (
                            <div style={{ color: "orange", fontSize: "12px" }}>
                                <div>
                                    No tier found for level: {user?.tierLevel}{" "}
                                    (Type: {typeof user?.tierLevel})
                                </div>
                                <div>
                                    Available tiers:{" "}
                                    {userTiersData
                                        ?.map(
                                            (t) =>
                                                `${t.level}(${typeof t.level})`,
                                        )
                                        .join(", ")}
                                </div>
                                <div>
                                    Total tiers: {userTiersData?.length || 0}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="row w-100 mx-auto">
                    <div className="detail_item br">Point to next tier</div>
                    <div className="detail_item text-end text-sm-start">
                        {nextTier?.length > 0
                            ? nextTier[0]?.point - (actualUser?.tierPoint || 0)
                            : ""}
                    </div>
                </div>
                <div className="row w-100 mx-auto pt-5">
                    <h4>
                        <span className="txt-green">G</span>
                        ain Points
                    </h4>
                    <div className="detail_item d-flex align-items-center br">
                        <div
                            className={`status me-2 ${
                                shuftiStatus?.event !== "verification.accepted"
                                    ? "deactive"
                                    : "active"
                            }`}
                        />
                        KYC/AML completion
                    </div>
                    <div className="detail_item text-end text-sm-start">
                        {taskSettingData?.verification || 0}
                    </div>
                </div>

                <div className="row mx-0">
                    <div className="detail_item d-flex align-items-center br">
                        <div
                            className={`status me-2 ${
                                gainPointsData?.wallet === 0 ||
                                !gainPointsData?.wallet
                                    ? "deactive"
                                    : "active"
                            }`}
                        />
                        Wallet balance
                        <img
                            className="ms-2"
                            data-tooltip-id="wallet-balance-tooltip"
                            data-tooltip-content="Wallet balance is calculated based on the total amount of digital assets in your wallet."
                            width="14"
                            src={QuestionMark}
                            alt="Question Mark"
                        />
                        <ReactTooltip
                            id="wallet-balance-tooltip"
                            className="custom-tooltip"
                        />
                    </div>
                    <div className="detail_item text-end text-sm-start">
                        {walletPoint}
                    </div>
                </div>
                <div className="row mx-0">
                    <div className="detail_item d-flex align-items-center br">
                        <div
                            className={`status me-2 ${
                                (gainPointsData?.auctions?.length || 0) > 0
                                    ? "active"
                                    : "deactive"
                            }`}
                        />
                        Auction participation
                    </div>
                    <div className="detail_item text-end text-sm-start">
                        {(taskSettingData?.auction || 0) *
                            (gainPointsData?.auctions?.length || 0)}
                    </div>
                </div>
                <div className="row mx-0">
                    <div className="detail_item d-flex align-items-center br">
                        <div
                            className={`status me-2 ${
                                (gainPointsData?.direct || 0) > 0
                                    ? "active"
                                    : "deactive"
                            }`}
                        />
                        Direct Purchase
                    </div>
                    <div className="detail_item text-end text-sm-start">
                        {gainPointsData?.direct || 0}
                    </div>
                </div>
            </div>
        </>
    );
}
