import React, { useEffect, useReducer, useState } from "react";
import { navigate } from "gatsby";
import { useMutation } from "@apollo/client";
import AuthLayout from "../common/AuthLayout";
import VerifyMutliFA from "../auth/verify-multiFA";
import TwoFactorModal from "../profile/two-factor-modal";
import CustomSpinner from "../common/custom-spinner";
import { ROUTES } from "../../utilities/routes";
import { setAuthToken } from "../../utilities/auth";
import AlarmModal, {
    showSuccessAlarm,
    showFailAlarm,
} from "../admin/AlarmModal";
import * as GraphQL from "../../apollo/graphqls/mutations/Auth";
import * as SupportMutations from "../../apollo/graphqls/mutations/Support"; // Add this line

// Enhanced reducer for better state management
const initialState = {
    email: "",
    twoStep: [],
    tempToken: "",
    tfaOpen: false,
    success: false,
    loading: true,
    error: null,
    mobileCallback: false,
    redirectUrl: null,
    processed: false, // Add flag to prevent reprocessing
};

const stateReducer = (state, action) => {
    switch (action.type) {
        case "SET_LOADING":
            return { ...state, loading: action.payload };
        case "SET_ERROR":
            return {
                ...state,
                error: action.payload,
                loading: false,
                processed: true,
            };
        case "SET_SUCCESS":
            return {
                ...state,
                ...action.payload,
                success: true,
                loading: false,
                error: null,
                processed: true,
            };
        case "SET_TFA_OPEN":
            return {
                ...state,
                tfaOpen: action.payload,
                loading: false,
                processed: true,
            };
        case "SET_MOBILE_CALLBACK":
            return {
                ...state,
                mobileCallback: true,
                loading: false,
                processed: true,
            };
        case "RESET_STATE":
            return { ...initialState, loading: true, processed: false };
        default:
            return state;
    }
};

const OAuth2RedirectHandler = ({ type, dataType, data }) => {
    const [state, dispatch] = useReducer(stateReducer, initialState);
    const [retryCount, setRetryCount] = useState(0);
    const maxRetries = 3;

    // Add this mutation hook inside the component
    const [sendVerifyCodeMutation, { loading: resendLoading }] = useMutation(
        SupportMutations.SEND_VERIFY_CODE,
        {
            onCompleted: (data) => {
                if (data.sendVerifyCode && data.sendVerifyCode !== "Failed") {
                    showSuccessAlarm(
                        "Verification codes sent successfully",
                        `New 2FA codes have been sent to ${data.sendVerifyCode}`,
                    );
                } else {
                    showFailAlarm(
                        "Failed to send codes",
                        "Unable to send verification codes. Please try again",
                    );
                }
            },
            onError: (error) => {
                console.error("🚨 Send verification code error:", error);
                showFailAlarm(
                    "Failed to send codes",
                    error.message || "Network error occurred. Please try again",
                );
            },
        },
    );

    // Mobile OAuth detection
    const detectMobile = () => {
        if (typeof window === "undefined") return false;
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isMobile =
            /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(
                userAgent,
            );
        const isFlutter = userAgent.includes("flutter");
        return isMobile || isFlutter;
    };

    // Enhanced URL parameter parsing
    const parseOAuthData = (data) => {
        if (!data) {
            console.log("🔍 parseOAuthData: No data provided");
            return null;
        }

        try {
            console.log("🔍 parseOAuthData: Raw data:", data);

            // Handle both encoded and non-encoded data
            const decodedData = decodeURIComponent(data);
            console.log("🔍 parseOAuthData: Decoded data:", decodedData);

            const parts = decodedData.split("*");
            console.log("🔍 parseOAuthData: Split parts:", parts);

            if (parts.length < 1) {
                console.log("🔍 parseOAuthData: Not enough parts");
                return null;
            }

            const result = {
                email: parts[0],
                twoStep: parts.slice(1).filter((step) => step && step.trim()),
            };

            console.log("🔍 parseOAuthData: Parsed result:", result);
            return result;
        } catch (error) {
            console.error("🚨 Error parsing OAuth data:", error);
            return null;
        }
    };

    // Handle mobile deep link callback
    const handleMobileCallback = (token, email, twoStep = []) => {
        // Only treat as mobile if explicitly from mobile environment
        const isMobile = detectMobile();
        const isActualMobileApp =
            window.flutter_inappwebview || window.ReactNativeWebView;

        // Don't treat regular browser on mobile as mobile app
        if (!isActualMobileApp) {
            console.log(
                "🌐 Regular browser detected, not treating as mobile app",
            );
            return false;
        }

        console.log("📱 Actual mobile app detected, handling mobile callback");

        if (window.flutter_inappwebview) {
            // Flutter InAppWebView callback
            window.flutter_inappwebview.callHandler("oauth_success", {
                token,
                email,
                twoStep,
                timestamp: Date.now(),
            });
            return true;
        }

        if (window.ReactNativeWebView) {
            // React Native WebView callback
            window.ReactNativeWebView.postMessage(
                JSON.stringify({
                    type: "oauth_success",
                    token,
                    email,
                    twoStep,
                    timestamp: Date.now(),
                }),
            );
            return true;
        }

        // Custom mobile scheme redirect (only for actual mobile apps)
        if (process.env.GATSBY_MOBILE_DEEP_LINK_SCHEME && isActualMobileApp) {
            const mobileUrl = `${process.env.GATSBY_MOBILE_DEEP_LINK_SCHEME}://oauth/callback?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}&twoStep=${encodeURIComponent(twoStep.join(","))}`;
            window.location.href = mobileUrl;
            return true;
        }

        return false;
    };

    // Process OAuth response
    useEffect(() => {
        // Prevent reprocessing if already processed
        if (state.processed) {
            console.log("🔐 OAuth already processed, skipping");
            return;
        }

        console.log("🔐 Processing OAuth response:", { type, dataType, data });

        // Reset state on new request
        dispatch({ type: "RESET_STATE" });

        // Add delay to ensure proper state initialization
        const processTimeout = setTimeout(async () => {
            try {
                // Check for URL-based OAuth callback (fixes XMLHttpRequest errors)
                if (typeof window !== "undefined") {
                    const urlParams = new URLSearchParams(
                        window.location.search,
                    );
                    const urlToken = urlParams.get("token");
                    const urlError = urlParams.get("error");
                    const urlCode = urlParams.get("code");
                    const urlState = urlParams.get("state");

                    // Handle URL-based OAuth responses first
                    if (urlError) {
                        console.log("❌ OAuth URL Error:", urlError);
                        dispatch({
                            type: "SET_ERROR",
                            payload: `OAuth error: ${urlError}`,
                        });
                        setTimeout(() => {
                            navigate(
                                `${ROUTES.signIn}?error=${encodeURIComponent(urlError)}`,
                            );
                        }, 3000);
                        return;
                    }

                    if (urlToken) {
                        console.log("✅ OAuth URL Token received");
                        setAuthToken(urlToken);
                        const isMobileHandled = handleMobileCallback(
                            urlToken,
                            "",
                            [],
                        );
                        if (!isMobileHandled) {
                            navigate(ROUTES.selectFigure);
                        } else {
                            dispatch({ type: "SET_MOBILE_CALLBACK" });
                        }
                        return;
                    }

                    if (urlCode) {
                        console.log(
                            "🔐 OAuth authorization code received, exchanging for token",
                        );
                        try {
                            // Use fetch instead of XMLHttpRequest to prevent errors
                            const response = await fetch(
                                `${process.env.GATSBY_API_BASE_URL}/oauth2/token`,
                                {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                        Accept: "application/json",
                                    },
                                    body: JSON.stringify({
                                        code: urlCode,
                                        state: urlState,
                                        redirectUri: `${window.location.origin}/oauth2/redirect`,
                                    }),
                                    credentials: "include",
                                },
                            );

                            if (!response.ok) {
                                throw new Error(
                                    `HTTP ${response.status}: ${response.statusText}`,
                                );
                            }

                            const result = await response.json();

                            if (result.token) {
                                setAuthToken(result.token);
                                const isMobileHandled = handleMobileCallback(
                                    result.token,
                                    result.email || "",
                                    [],
                                );
                                if (!isMobileHandled) {
                                    navigate(ROUTES.selectFigure);
                                } else {
                                    dispatch({ type: "SET_MOBILE_CALLBACK" });
                                }
                                return;
                            } else {
                                throw new Error(
                                    "No token received from server",
                                );
                            }
                        } catch (fetchError) {
                            console.error(
                                "🚨 Token exchange error:",
                                fetchError,
                            );
                            dispatch({
                                type: "SET_ERROR",
                                payload: `Token exchange failed: ${fetchError.message}`,
                            });
                            return;
                        }
                    }
                }

                // Handle prop-based OAuth responses (your existing logic)
                if (type === "success") {
                    if (dataType && data) {
                        // Parse OAuth data
                        const parsedData = parseOAuthData(data);

                        if (parsedData) {
                            const { email, twoStep } = parsedData;

                            console.log("✅ OAuth Success - Parsed data:", {
                                email,
                                twoStep,
                            });
                            console.log("🔍 2FA Steps found:", twoStep.length);

                            // For web browsers, always handle 2FA properly
                            if (twoStep && twoStep.length > 0) {
                                console.log(
                                    "🔐 2FA required - showing 2FA interface",
                                );
                                dispatch({
                                    type: "SET_SUCCESS",
                                    payload: {
                                        tempToken: dataType,
                                        email,
                                        twoStep,
                                    },
                                });
                                return; // Don't proceed to mobile callback
                            }

                            // Only check mobile callback if no 2FA required
                            const isMobileHandled = handleMobileCallback(
                                dataType,
                                email,
                                twoStep,
                            );

                            if (isMobileHandled) {
                                dispatch({ type: "SET_MOBILE_CALLBACK" });
                                return;
                            }

                            // For web without 2FA, proceed directly
                            console.log(
                                "✅ No 2FA required - proceeding to login",
                            );
                            setAuthToken(dataType);
                            navigate(ROUTES.selectFigure);
                        } else {
                            // No 2FA required - direct login
                            console.log("✅ OAuth Success - Direct login");
                            setAuthToken(dataType);

                            // Handle mobile callback for direct login
                            const isMobileHandled = handleMobileCallback(
                                dataType,
                                data || "",
                                [],
                            );

                            if (!isMobileHandled) {
                                navigate(ROUTES.selectFigure);
                            } else {
                                dispatch({ type: "SET_MOBILE_CALLBACK" });
                            }
                        }
                    } else {
                        // Fallback for legacy success format
                        console.log("✅ OAuth Success - Legacy format");
                        navigate(ROUTES.selectFigure);
                    }
                } else if (type === "error" || type === "failed") {
                    console.log("❌ OAuth Error:", { dataType, data });

                    if (dataType === "No2FA") {
                        // User exists but 2FA is not enabled
                        dispatch({
                            type: "SET_TFA_OPEN",
                            payload: true,
                        });
                        dispatch({
                            type: "SET_SUCCESS",
                            payload: {
                                email: data,
                                twoStep: [],
                            },
                        });
                    } else {
                        // Other errors - redirect to sign in with error message
                        console.log("❌ OAuth Error:", { dataType, data });

                        // Parse query parameters for enhanced error information
                        const urlParams = new URLSearchParams(
                            window.location.search,
                        );
                        const errorType = urlParams.get("type");
                        const errorMessage = urlParams.get("message");
                        const errorData = urlParams.get("data");

                        // Handle provider mismatch specifically
                        if (errorType === "PROVIDER_MISMATCH") {
                            const providerMessage =
                                errorMessage ||
                                `This email is already registered with ${errorData}. Please use ${errorData} to login.`;
                            navigate(
                                `${ROUTES.signIn}?error=provider_mismatch&message=${encodeURIComponent(providerMessage)}&provider=${encodeURIComponent(errorData || "")}`,
                            );
                        } else {
                            // Handle other OAuth errors (your existing logic)
                            const fallbackMessage =
                                dataType && data
                                    ? `${dataType}: ${data}`
                                    : errorMessage ||
                                      "OAuth authentication failed";
                            navigate(
                                `${ROUTES.signIn}?error=${encodeURIComponent(fallbackMessage)}`,
                            );
                        }
                    }
                } else {
                    console.log("❓ Unknown OAuth response type:", type);
                    dispatch({
                        type: "SET_ERROR",
                        payload: "Unknown OAuth response type",
                    });
                }
            } catch (error) {
                console.error("🚨 Error processing OAuth response:", error);

                if (retryCount < maxRetries) {
                    console.log(
                        `🔄 Retrying OAuth callback processing (${retryCount + 1}/${maxRetries})`,
                    );
                    setRetryCount((prev) => prev + 1);

                    // Retry after delay
                    setTimeout(() => {
                        dispatch({ type: "RESET_STATE" });
                    }, 2000);
                } else {
                    dispatch({
                        type: "SET_ERROR",
                        payload: error.message || "Unknown error occurred",
                    });
                }
            }
        }, 100);

        return () => clearTimeout(processTimeout);
    }, [type, dataType, data, state.processed, retryCount]); // Add retryCount to dependencies
    // Retry mechanism for failed OAuth
    const handleRetry = () => {
        if (retryCount < maxRetries) {
            setRetryCount((prev) => prev + 1);
            dispatch({ type: "RESET_STATE" });
            // Trigger re-processing
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            navigate(ROUTES.signIn);
        }
    };

    // Error boundary fallback
    const handleError = (error) => {
        console.error("🚨 OAuth component error:", error);
        dispatch({
            type: "SET_ERROR",
            payload: "An unexpected error occurred during authentication",
        });
    };

    // Loading state
    if (state.loading) {
        return (
            <AuthLayout>
                <div className="text-center p-4">
                    <CustomSpinner />
                    <div className="text-light fs-18px fw-500 mt-3">
                        Processing OAuth authentication...
                    </div>
                </div>
                <AlarmModal />
            </AuthLayout>
        );
    }

    // Mobile callback handled
    if (state.mobileCallback) {
        return (
            <AuthLayout>
                <div className="text-center p-4">
                    <div className="text-success fs-24px fw-bold mb-3">
                        ✅ Authentication Successful
                    </div>
                    <div className="text-light fs-16px">
                        You can now close this window and return to the app.
                    </div>
                </div>
                <AlarmModal />
            </AuthLayout>
        );
    }

    // Error state
    if (state.error) {
        return (
            <AuthLayout>
                <div className="text-center p-4">
                    <div className="text-danger fs-24px fw-bold mb-3">
                        ❌ Authentication Failed
                    </div>
                    <div className="text-light fs-16px mb-4">{state.error}</div>
                    {retryCount < maxRetries && (
                        <div className="d-flex gap-3 justify-content-center">
                            <button
                                className="btn btn-outline-light"
                                onClick={handleRetry}
                            >
                                Retry ({maxRetries - retryCount} attempts left)
                            </button>
                            <button
                                className="btn btn-light"
                                onClick={() => navigate(ROUTES.signIn)}
                            >
                                Back to Sign In
                            </button>
                        </div>
                    )}
                    {retryCount >= maxRetries && (
                        <button
                            className="btn btn-light"
                            onClick={() => navigate(ROUTES.signIn)}
                        >
                            Back to Sign In
                        </button>
                    )}
                </div>
                <AlarmModal />
            </AuthLayout>
        );
    }

    // Success state with 2FA
    return (
        <AuthLayout>
            {state.success && state.twoStep.length > 0 && (
                <VerifyMutliFA
                    twoStep={state.twoStep}
                    email={state.email}
                    tempToken={state.tempToken}
                    returnToSignIn={() => navigate(ROUTES.signIn)}
                    onError={handleError}
                    onSuccess={() => {
                        navigate(ROUTES.wallet, { replace: true });
                    }}
                    resend={() => {
                        // Use the SEND_VERIFY_CODE mutation from Support - this one actually works!
                        sendVerifyCodeMutation();
                    }}
                    loading={resendLoading}
                />
            )}

            {state.tfaOpen && (
                <TwoFactorModal
                    is2FAModalOpen={state.tfaOpen}
                    setIs2FAModalOpen={(isOpen) => {
                        if (!isOpen) {
                            navigate(ROUTES.signIn);
                        } else {
                            dispatch({ type: "SET_TFA_OPEN", payload: isOpen });
                        }
                    }}
                    email={state.email}
                    twoStep={state.twoStep}
                    onResult={(success) => {
                        if (success) {
                            dispatch({ type: "SET_TFA_OPEN", payload: false });
                            navigate(ROUTES.wallet); // Navigate to wallet instead of sign in
                        } else {
                            navigate(ROUTES.verifyFailed);
                        }
                    }}
                    redirect={true}
                    onError={handleError}
                />
            )}
            <AlarmModal />
        </AuthLayout>
    );
};

export default OAuth2RedirectHandler;
