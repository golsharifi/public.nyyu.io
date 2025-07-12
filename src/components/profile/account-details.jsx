import { Link } from "gatsby";
import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { ROUTES } from "../../utilities/routes";
import ChangeEmailModal from "./ChangeEmailModal";
import ChangeNameModal from "./ChangeNameModal";
import ChangeDiscordModal from "./ChangeDiscordModal";
import SelectCurrencyModal from "./SelectCurrencyModal";
import { EuropeanFlag } from "../../utilities/imgImport";
import { useLazyQuery, useQuery } from "@apollo/client";
import {
    MANUAL_STATUS_CHECK,
    GET_SHUFTI_REF_PAYLOAD,
} from "../verify-identity/kyc-webservice";

// Verification status cache utility for instant loading
const CACHE_KEY = "verification_status_cache";
const CACHE_DURATION = 3 * 60 * 1000; // 3 minutes

const verificationCache = {
    get() {
        if (typeof window === "undefined") return null;

        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (!cached) return null;

            const parsed = JSON.parse(cached);
            const age = Date.now() - parsed.timestamp;

            if (age > CACHE_DURATION) {
                localStorage.removeItem(CACHE_KEY);
                return null;
            }

            console.log(
                `📦 Using cached verification status (${Math.round(age / 1000)}s old)`,
            );
            return parsed.data;
        } catch (e) {
            localStorage.removeItem(CACHE_KEY);
            return null;
        }
    },

    set(data) {
        if (typeof window === "undefined") return;

        try {
            localStorage.setItem(
                CACHE_KEY,
                JSON.stringify({
                    data,
                    timestamp: Date.now(),
                }),
            );
            console.log("💾 Cached verification status");
        } catch (e) {
            console.warn("Failed to cache verification status");
        }
    },

    clear() {
        if (typeof window === "undefined") return;
        localStorage.removeItem(CACHE_KEY);
    },
};

export default function AccountDetails({
    setIsPasswordModalOpen,
    user,
    displayName,
    shuftiStatus,
    discordName,
}) {
    // Helper function to determine status from payload (enhanced version)
    const determineStatusFromPayload = (payload) => {
        // PRIORITY 1: Check database verification status first
        const isVerifiedInDatabase =
            user?.verify?.kycVerified ||
            user?.kycVerified ||
            user?.isKycVerified ||
            false;

        console.log(
            "🔍 Profile verification check - Database status:",
            isVerifiedInDatabase,
        );
        console.log("🔍 User object:", user);

        if (isVerifiedInDatabase) {
            console.log(
                "✅ User verified in database, returning verified status",
            );
            return "verified";
        }

        // PRIORITY 2: If not verified in database, check Shufti status
        if (!payload) return "setup";

        const isVerified =
            payload.docStatus &&
            payload.addrStatus &&
            payload.conStatus &&
            payload.selfieStatus;
        const isPending = payload.pending;
        const hasFailed = payload.failed || payload.error;

        if (isVerified && !isPending && !hasFailed) {
            return "verified";
        } else if (isPending) {
            return "pending";
        } else if (hasFailed || payload.status === "failed") {
            return "failed";
        } else if (
            payload.docStatus === false ||
            payload.addrStatus === false ||
            payload.conStatus === false ||
            payload.selfieStatus === false
        ) {
            return "failed";
        } else {
            return "setup";
        }
    };

    // Containers
    const [isChangeNameModalOpen, setIsChangeNameModalOpen] = useState(false);
    const [isChangeEmailModalOpen, setIsChangeEmailModalOpen] = useState(false);
    const [isChangeDiscordModalOpen, setIsChangeDiscordModalOpen] =
        useState(false);
    const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);

    // Status refresh states
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [autoCheckCount, setAutoCheckCount] = useState(0);
    const [lastStatusUpdate, setLastStatusUpdate] = useState(null);
    const [currentVerificationStatus, setCurrentVerificationStatus] = useState(
        () => {
            // Check database status first
            const isVerifiedInDatabase =
                user?.verify?.kycVerified ||
                user?.kycVerified ||
                user?.isKycVerified ||
                false;

            console.log(
                "🔍 Profile verification init - Database status:",
                isVerifiedInDatabase,
            );

            if (isVerifiedInDatabase) {
                return "verified";
            }

            // Instantly load from cache if available
            const cached = verificationCache.get();
            if (cached) {
                return determineStatusFromPayload(cached);
            }
            return shuftiStatus || "loading";
        },
    );
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);

    // Refs to prevent infinite loops
    const autoCheckInterval = useRef(null);
    const initialCheckTimeout = useRef(null);
    const statusUpdateTimeout = useRef(null);

    // Fix: Add proper null checking for savedCurrency with fallback default
    const savedCurrency = useSelector((state) => state.favAssets?.currency) || {
        value: "USD",
        label: "USD",
        sign: "$",
    };

    // Immediately fetch current status on component mount with optimized caching
    // Check if we should skip the API call (if we have fresh cache)
    const cachedData = verificationCache.get();
    const shouldSkip = !!cachedData;

    // Immediately fetch current status on component mount with smart caching
    const { loading: initialLoading } = useQuery(GET_SHUFTI_REF_PAYLOAD, {
        fetchPolicy: shouldSkip ? "cache-only" : "cache-first",
        errorPolicy: "ignore",
        notifyOnNetworkStatusChange: false,
        skip: shouldSkip, // Skip if we have fresh cached data
        onCompleted: (data) => {
            if (data?.getShuftiRefPayload) {
                const status = determineStatusFromPayload(
                    data.getShuftiRefPayload,
                );
                setCurrentVerificationStatus(status);

                // Cache the result for future page loads
                verificationCache.set(data.getShuftiRefPayload);

                console.log("📊 Fresh Verification Status Loaded:", {
                    payload: data.getShuftiRefPayload,
                    determinedStatus: status,
                });
            } else {
                // If no payload exists, user hasn't started verification
                setCurrentVerificationStatus("setup");
            }
            setInitialLoadComplete(true);
        },
        onError: (error) => {
            console.error("Error loading initial verification status:", error);
            // Fallback to prop value if API fails
            setCurrentVerificationStatus(shuftiStatus || "setup");
            setInitialLoadComplete(true);
        },
    });

    // If we have cached data, mark as loaded immediately
    useEffect(() => {
        if (cachedData) {
            setInitialLoadComplete(true);
            console.log("⚡ Instant load from cache");
        }
    }, [cachedData]);

    // Get current verification payload (for manual refresh)
    const [getShuftiRefPayload] = useLazyQuery(GET_SHUFTI_REF_PAYLOAD, {
        fetchPolicy: "network-only", // Only use network for manual refresh
        onCompleted: (data) => {
            if (data?.getShuftiRefPayload) {
                const payload = data.getShuftiRefPayload;
                const newStatus = determineStatusFromPayload(payload);

                // Update cache with fresh data
                verificationCache.set(payload);

                console.log("📊 Verification Status Update:", {
                    payload,
                    oldStatus: currentVerificationStatus,
                    newStatus,
                });

                let statusMessage = "";

                if (newStatus === "verified") {
                    statusMessage =
                        "✅ Verification confirmed! You are now verified.";

                    // Clear auto-check when verified
                    clearAutoCheck();

                    // Clear cache so next page load will show verified immediately
                    verificationCache.clear();

                    // Only reload if status actually changed from non-verified to verified
                    if (
                        currentVerificationStatus !== "verified" &&
                        currentVerificationStatus !== "approved"
                    ) {
                        statusUpdateTimeout.current = setTimeout(() => {
                            window.location.reload();
                        }, 2000);
                    }
                } else if (newStatus === "pending") {
                    statusMessage = "⏳ Verification is under review...";
                } else if (newStatus === "failed") {
                    const errorDetails =
                        payload.error ||
                        payload.failureReason ||
                        "Verification failed. Please try again with different documents.";
                    statusMessage = `❌ Verification failed: ${errorDetails}`;
                } else {
                    statusMessage = "❌ Verification not completed yet.";
                }

                // Only update if status actually changed
                if (newStatus !== currentVerificationStatus) {
                    setCurrentVerificationStatus(newStatus);
                    setLastStatusUpdate(statusMessage);

                    // Clear status message after 10 seconds
                    if (statusUpdateTimeout.current) {
                        clearTimeout(statusUpdateTimeout.current);
                    }
                    statusUpdateTimeout.current = setTimeout(() => {
                        setLastStatusUpdate(null);
                    }, 10000);
                }
            }
            setIsRefreshing(false);
        },
        onError: (error) => {
            console.error("Error getting verification payload:", error);
            setIsRefreshing(false);
            setLastStatusUpdate("❌ Error checking status. Please try again.");

            // Clear error message after 5 seconds
            if (statusUpdateTimeout.current) {
                clearTimeout(statusUpdateTimeout.current);
            }
            statusUpdateTimeout.current = setTimeout(() => {
                setLastStatusUpdate(null);
            }, 5000);
        },
    });

    // Manual status check query
    const [manualStatusCheck] = useLazyQuery(MANUAL_STATUS_CHECK, {
        fetchPolicy: "network-only",
        onCompleted: (data) => {
            console.log("Manual status check result:", data.manualStatusCheck);
            // After manual status check, get the latest payload
            getShuftiRefPayload();
        },
        onError: (error) => {
            setIsRefreshing(false);
            console.error("Manual status check error:", error);
            setLastStatusUpdate("❌ Error checking status. Please try again.");

            if (statusUpdateTimeout.current) {
                clearTimeout(statusUpdateTimeout.current);
            }
            statusUpdateTimeout.current = setTimeout(() => {
                setLastStatusUpdate(null);
            }, 5000);
        },
    });

    // Enhanced verification status display component
    const VerificationStatusDisplay = ({ status, error, failureReason }) => {
        const getStatusIcon = () => {
            switch (status) {
                case "verified":
                    return "✅";
                case "pending":
                    return "⏳";
                case "failed":
                    return "❌";
                case "setup":
                default:
                    return "⚙️";
            }
        };

        const getStatusColor = () => {
            switch (status) {
                case "verified":
                    return "#28a745";
                case "pending":
                    return "#ffc107";
                case "failed":
                    return "#dc3545";
                case "setup":
                default:
                    return "#6c757d";
            }
        };

        const getStatusMessage = () => {
            switch (status) {
                case "verified":
                    return "Your identity has been verified successfully!";
                case "pending":
                    return "Your verification is being processed...";
                case "failed":
                    return `Verification failed: ${error || failureReason || "Please try again with different documents."}`;
                case "setup":
                default:
                    return "Complete your identity verification to unlock all features.";
            }
        };

        return (
            <div
                style={{
                    padding: "15px",
                    borderRadius: "8px",
                    backgroundColor:
                        status === "verified"
                            ? "#d4edda"
                            : status === "failed"
                              ? "#f8d7da"
                              : status === "pending"
                                ? "#fff3cd"
                                : "#e2e3e5",
                    border: `1px solid ${getStatusColor()}`,
                    marginBottom: "10px",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        color: getStatusColor(),
                        fontWeight: "bold",
                    }}
                >
                    <span style={{ fontSize: "20px", marginRight: "10px" }}>
                        {getStatusIcon()}
                    </span>
                    <span>
                        {status.charAt(0).toUpperCase() + status.slice(1)}{" "}
                        Verification
                    </span>
                </div>
                <div style={{ marginTop: "8px", color: "#333" }}>
                    {getStatusMessage()}
                </div>
                {status === "failed" && (
                    <div style={{ marginTop: "10px" }}>
                        <Link
                            to={ROUTES.verifyId}
                            style={{
                                color: "#007bff",
                                textDecoration: "none",
                                fontWeight: "bold",
                            }}
                        >
                            Try Again →
                        </Link>
                    </div>
                )}
            </div>
        );
    };
    // Helper function to clear auto-check
    const clearAutoCheck = () => {
        if (autoCheckInterval.current) {
            clearInterval(autoCheckInterval.current);
            autoCheckInterval.current = null;
        }
        if (initialCheckTimeout.current) {
            clearTimeout(initialCheckTimeout.current);
            initialCheckTimeout.current = null;
        }
    };

    // Manual refresh handler
    const handleManualRefresh = () => {
        if (isRefreshing) return; // Prevent multiple simultaneous requests

        setIsRefreshing(true);
        setLastStatusUpdate("🔄 Checking verification status...");

        // Clear cache to force fresh data
        verificationCache.clear();

        // First trigger the manual status check, then get payload
        manualStatusCheck();
    };

    // Auto-check effect - runs every 2 minutes if not verified
    useEffect(() => {
        // Don't start auto-check until initial load is complete
        if (!initialLoadComplete) return;

        // Clear any existing intervals
        clearAutoCheck();

        // Only auto-check if status is pending or setup (not verified)
        if (
            currentVerificationStatus !== "verified" &&
            currentVerificationStatus !== "approved"
        ) {
            // Initial check after 10 seconds on page load
            initialCheckTimeout.current = setTimeout(() => {
                console.log("🔄 Initial auto status check...");
                getShuftiRefPayload();
            }, 10000);

            // Set up recurring checks every 2 minutes (120 seconds)
            autoCheckInterval.current = setInterval(() => {
                setAutoCheckCount((prev) => {
                    const newCount = prev + 1;
                    console.log(`🔄 Auto status check #${newCount}`);
                    return newCount;
                });
                getShuftiRefPayload();
            }, 120000); // Check every 2 minutes instead of 30 seconds
        }

        // Cleanup function
        return () => {
            clearAutoCheck();
        };
    }, [currentVerificationStatus, initialLoadComplete]);

    // Update local status when prop changes (but only if it's different and initial load is complete)
    useEffect(() => {
        if (initialLoadComplete && shuftiStatus !== currentVerificationStatus) {
            // Only update if we don't have a more recent status
            if (currentVerificationStatus === "loading") {
                setCurrentVerificationStatus(shuftiStatus);
            }
        }
    }, [shuftiStatus, initialLoadComplete]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            clearAutoCheck();
            if (statusUpdateTimeout.current) {
                clearTimeout(statusUpdateTimeout.current);
            }
        };
    }, []);

    // Helper function to get status display
    const getStatusDisplay = () => {
        const status = currentVerificationStatus;
        const isLoading = initialLoading && !cachedData;

        // Show loading state only if we're actually loading and have no cached data
        if (status === "loading" || isLoading) {
            return {
                circle: "circle-dark",
                text: "loading...",
                color: "text-muted",
                component: (
                    <div className="text-muted fs-15px fw-500 d-flex align-items-center">
                        <span
                            className="spinner-border spinner-border-sm me-2"
                            style={{ width: "12px", height: "12px" }}
                            role="status"
                            aria-hidden="true"
                        ></span>
                        Loading...
                    </div>
                ),
            };
        }

        if (status === "approved" || status === "verified") {
            return {
                circle: "circle-success",
                text: "verified",
                color: "text-light",
                component: (
                    <div className="text-light fs-15px fw-500 text-capitalize">
                        verified
                    </div>
                ),
            };
        } else if (status === "pending") {
            return {
                circle: "circle-warning",
                text: "under review",
                color: "text-light",
                component: (
                    <div className="text-light fs-15px fw-500 text-capitalize">
                        under review
                    </div>
                ),
            };
        } else {
            return {
                circle: "circle-dark",
                text: "setup",
                color: "text-light-blue",
                component: (
                    <Link
                        to={ROUTES.verifyId}
                        className="text-light-blue fs-15px fw-bold text-underline text-capitalize"
                    >
                        Start Verification
                    </Link>
                ),
            };
        }
    };

    const statusDisplay = getStatusDisplay();

    // Render
    return (
        <>
            {isChangeEmailModalOpen && (
                <ChangeEmailModal
                    isOpen={isChangeEmailModalOpen}
                    setIsOpen={setIsChangeEmailModalOpen}
                />
            )}
            {isChangeNameModalOpen && (
                <ChangeNameModal
                    isOpen={isChangeNameModalOpen}
                    setIsOpen={setIsChangeNameModalOpen}
                />
            )}
            {isChangeDiscordModalOpen && (
                <ChangeDiscordModal
                    isOpen={isChangeDiscordModalOpen}
                    setIsOpen={setIsChangeDiscordModalOpen}
                />
            )}
            {isCurrencyModalOpen && (
                <SelectCurrencyModal
                    isOpen={isCurrencyModalOpen}
                    setIsOpen={setIsCurrencyModalOpen}
                />
            )}
            <div className="account_details_content w-100">
                <div className="row w-100 mx-auto">
                    <div className="detail_item col-sm-4 col-md-6 br">
                        Display name
                    </div>
                    <div className="detail_item col-sm-8 col-md-6">
                        <div className="d-flex align-items-center justify-content-between">
                            <p>{displayName}</p>
                            <button
                                onClick={() => setIsChangeNameModalOpen(true)}
                                className="btn fs-10px text-success text-underline text-capitalize ms-1"
                            >
                                Change
                            </button>
                        </div>
                    </div>
                </div>
                <div className="row w-100 mx-auto">
                    <div className="detail_item col-sm-4 col-md-6 br">
                        Email address
                    </div>
                    <div className="detail_item col-sm-8 col-md-6">
                        <div className="d-flex align-items-center justify-content-between">
                            <p>{user?.email}</p>
                            <button
                                onClick={() => setIsChangeEmailModalOpen(true)}
                                className="btn fs-10px text-success text-underline text-capitalize ms-1"
                            >
                                Change
                            </button>
                        </div>
                    </div>
                </div>
                <div className="row w-100 mx-auto">
                    <div className="detail_item col-sm-4 col-md-6 br">
                        Password
                    </div>
                    <div className="detail_item col-sm-8 col-md-6">
                        <div className="d-flex align-items-center justify-content-between">
                            <p>*******</p>
                            <button
                                onClick={() => setIsPasswordModalOpen(true)}
                                className="btn fs-10px text-success text-underline text-capitalize ms-1"
                            >
                                Change
                            </button>
                        </div>
                    </div>
                </div>
                <div className="row w-100 mx-auto">
                    <div className="detail_item col-sm-4 col-md-6 br">
                        Discord
                    </div>
                    <div className="detail_item col-sm-8 col-md-6">
                        <div className="d-flex align-items-center justify-content-between">
                            <p>{discordName || "Not Connected"}</p>
                            <button
                                onClick={() =>
                                    setIsChangeDiscordModalOpen(true)
                                }
                                className="btn fs-10px text-success text-underline text-capitalize ms-1"
                            >
                                {discordName ? "Change" : "Connect"}
                            </button>
                        </div>
                    </div>
                </div>
                <div className="row w-100 mx-auto">
                    <div className="detail_item col-sm-4 col-md-6 br">
                        Verification Status
                    </div>
                    <div className="detail_item col-sm-8 col-md-6">
                        <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center gap-2">
                                <div
                                    className={`circle ${statusDisplay.circle}`}
                                />
                                {statusDisplay.component}
                            </div>

                            {/* Show refresh button only if not verified and not loading */}
                            {currentVerificationStatus !== "approved" &&
                                currentVerificationStatus !== "verified" &&
                                currentVerificationStatus !== "loading" &&
                                !initialLoading && (
                                    <button
                                        onClick={handleManualRefresh}
                                        disabled={isRefreshing}
                                        className="btn fs-10px text-info text-underline text-capitalize ms-1 d-flex align-items-center"
                                        style={{
                                            opacity: isRefreshing ? 0.6 : 1,
                                            cursor: isRefreshing
                                                ? "not-allowed"
                                                : "pointer",
                                        }}
                                    >
                                        {isRefreshing ? (
                                            <>
                                                <span
                                                    className="spinner-border spinner-border-sm me-1"
                                                    style={{
                                                        width: "10px",
                                                        height: "10px",
                                                    }}
                                                    role="status"
                                                    aria-hidden="true"
                                                ></span>
                                                Checking...
                                            </>
                                        ) : (
                                            "Refresh"
                                        )}
                                    </button>
                                )}
                        </div>

                        {/* Status update message */}
                        {lastStatusUpdate && (
                            <div
                                className="mt-2 fs-12px"
                                style={{
                                    color: lastStatusUpdate.includes("✅")
                                        ? "#28a745"
                                        : lastStatusUpdate.includes("❌")
                                          ? "#dc3545"
                                          : "#ffc107",
                                    padding: "5px 8px",
                                    backgroundColor: "rgba(255,255,255,0.1)",
                                    borderRadius: "4px",
                                    fontSize: "11px",
                                }}
                            >
                                {lastStatusUpdate}
                            </div>
                        )}

                        {/* Auto-check counter (only show in development) */}
                        {process.env.NODE_ENV === "development" &&
                            autoCheckCount > 0 &&
                            currentVerificationStatus !== "approved" &&
                            currentVerificationStatus !== "verified" &&
                            currentVerificationStatus !== "loading" && (
                                <div className="mt-1 fs-10px text-muted">
                                    Auto-checks: {autoCheckCount} | Next check
                                    in 2 min
                                </div>
                            )}
                    </div>
                </div>
                <div className="row w-100 mx-auto">
                    <div className="detail_item col-sm-4 col-md-6 br">
                        Currency
                    </div>
                    <div className="detail_item col-sm-8 col-md-6">
                        <div
                            className="d-flex align-items-center justify-content-between"
                            style={{ height: 40 }}
                        >
                            <div className="d-flex align-items-center">
                                <div
                                    className="flag_div"
                                    style={{ width: 14, height: 14 }}
                                >
                                    <img
                                        src={
                                            savedCurrency.value !== "EUR"
                                                ? `${process.env.GATSBY_CurrencyIconEndpoint}/${String(savedCurrency.value).toLowerCase()}.png`
                                                : EuropeanFlag
                                        }
                                        alt={savedCurrency.value}
                                    />
                                </div>
                                <p className="ms-2">{savedCurrency.label}</p>
                            </div>
                            <button
                                onClick={() => setIsCurrencyModalOpen(true)}
                                className="btn fs-10px text-success text-underline text-capitalize ms-1"
                            >
                                Change
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
