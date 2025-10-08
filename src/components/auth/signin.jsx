import React, { useReducer, useState } from "react";
import { Link, navigate } from "gatsby";
import validator from "validator";
import {
    passwordValidatorOptions,
    social_links,
} from "../../utilities/staticData";
import { FormInput } from "../common/FormControl";
import AuthLayout from "../common/AuthLayout";
import CustomSpinner from "../common/custom-spinner";
import { FaExclamationCircle } from "@react-icons/all-files/fa/FaExclamationCircle";
import { ROUTES } from "../../utilities/routes";
import * as GraphQL from "../../apollo/graphqls/mutations/Auth";
import { useMutation } from "@apollo/client";
import VerifyMutliFA from "./verify-multiFA";
import TwoFactorModal from "../profile/two-factor-modal";
import Seo from "../seo";
import { useEffect } from "react"; // Add this if not already imported
import { getOAuthUrl } from "../../utilities/staticData"; // Add this import

const Signin = () => {
    const [state, setState] = useReducer(
        (old, action) => ({ ...old, ...action }),
        {
            email: "",
            pwd: "",
            remember: false,
            emailError: "",
            pwdError: "",
            authError: false,
            pwdVisible: false,
            tempToken: "",
            twoStep: [],
            tfaOpen: false,
            urlError: "",
            suggestedProvider: "",
        },
    );

    const {
        email,
        pwd,
        remember,
        emailError,
        pwdError,
        authError,
        pwdVisible,
        tempToken,
        twoStep,
        tfaOpen,
        urlError,
        suggestedProvider,
    } = state;

    // Handle URL parameters for OAuth errors
    useEffect(() => {
        if (typeof window !== "undefined") {
            const urlParams = new URLSearchParams(window.location.search);
            const error = urlParams.get("error");
            const message = urlParams.get("message");
            const provider = urlParams.get("provider");

            if (error === "provider_mismatch" && message) {
                setState({
                    urlError: decodeURIComponent(message),
                    suggestedProvider: provider || "",
                });
            } else if (error && error !== "provider_mismatch") {
                setState({
                    urlError: decodeURIComponent(error),
                    suggestedProvider: "",
                });
            }

            // Clear URL parameters after reading them
            if (error) {
                const newUrl = window.location.pathname;
                window.history.replaceState({}, document.title, newUrl);
            }
        }
    }, []);

    // Helper function to get OAuth login URL for specific provider
    const getProviderLoginUrl = (provider) => {
        return getOAuthUrl(provider, false);
    };

    const [success, setSuccess] = useState(false);

    const [signinMutation, { loading }] = useMutation(GraphQL.SIGNIN, {
        retry: 1,
        onCompleted: (data) => {
            console.log("🔐 Initial signin response:", data);
            console.log("🔐 Signin status:", data.signin?.status);
            console.log(
                "🔐 Signin token:",
                data.signin?.token ? "Present" : "Missing",
            );
            console.log("🔐 TwoStep methods:", data.signin?.twoStep);

            setState({
                tempToken: data.signin.token,
                twoStep: data.signin.twoStep,
            });

            if (data.signin.status === "Failed") {
                console.log("❌ Signin failed:", data.signin.token);
                setState({ authError: true });
                setSuccess(false);
                if (
                    data.signin.token ===
                    "Please enable a two-step verification"
                ) {
                    console.log("🔐 Opening 2FA modal");
                    setState({ tfaOpen: true });
                } else if (
                    data.signin.token ===
                    "The account's email address is not verified"
                ) {
                    console.log("📧 Email not verified - redirecting");
                    navigate(ROUTES.verifyEmail + email);
                }
            } else if (data.signin.status === "Success") {
                console.log("✅ Signin success - showing 2FA form");
                setSuccess(true);
            }
        },
        onError: (error) => {
            console.error("🚨 Signin mutation error:", error);
        },
    });

    // Methods
    const signUserIn = (e) => {
        e.preventDefault();
        setState({
            emailError: "",
            pwdError: "",
            urlError: "",
            suggestedProvider: "",
        });
        let error = false;
        if (!email || !validator.isEmail(email)) {
            setState({ emailError: "Invalid email address" });
            error = true;
        }
        if (
            !pwd ||
            !validator.isStrongPassword(pwd, passwordValidatorOptions)
        ) {
            setState({
                pwdError:
                    "Password must contain at least 8 characters, including UPPER/lowercase and numbers!",
            });
            error = true;
        }

        if (!error)
            signinMutation({
                variables: {
                    email,
                    password: pwd,
                },
            });
    };

    return (
        <>
            <Seo title="Sign In" />
            <AuthLayout>
                <TwoFactorModal
                    is2FAModalOpen={tfaOpen}
                    setIs2FAModalOpen={(res) => setState({ tfaOpen: res })}
                    email={email}
                    twoStep={twoStep}
                    onResult={(r) => {
                        if (r) {
                            setState({ tfaOpen: false, authError: false });
                            // After 2FA setup, try signin again automatically
                            console.log(
                                "✅ 2FA setup completed - attempting signin again",
                            );
                            signinMutation({
                                variables: {
                                    email,
                                    password: pwd,
                                },
                            });
                        } else navigate(ROUTES.verifyFailed);
                    }}
                    redirect={false}
                />
                {success ? (
                    // This is the section to replace in src/components/auth/signin.jsx
                    // Find the VerifyMutliFA component usage and replace it with:

                    <VerifyMutliFA
                        twoStep={twoStep}
                        email={email}
                        tempToken={tempToken}
                        returnToSignIn={() => setSuccess(false)}
                        resend={(e) => signUserIn(e)}
                        loading={loading}
                        onSuccess={() => {
                            console.log(
                                "🎉 2FA completed successfully from Sign In - navigating to wallet",
                            );
                            // Reset success state and let the auth system handle navigation
                            setSuccess(false);
                            // The navigation will be handled by the useSignIn2FA hook
                        }}
                        onError={(error) => {
                            console.error("❌ 2FA Error from Sign In:", error);
                            // You can show an error message here or reset the form
                            setSuccess(false);
                            // Optionally show an error message to the user
                        }}
                    />
                ) : (
                    <>
                        <h3 className="signup-head mb-4">Sign In</h3>
                        <form className="form">
                            <div className="form-group">
                                <FormInput
                                    name="email"
                                    type="text"
                                    label="Email"
                                    value={email}
                                    onChange={(e) =>
                                        setState({ email: e.target.value })
                                    }
                                    placeholder="Enter email"
                                    error={emailError}
                                />
                            </div>
                            <div className="form-group position-relative">
                                <FormInput
                                    type={pwdVisible ? "text" : "password"}
                                    label="Password"
                                    value={pwd}
                                    onChange={(e) =>
                                        setState({ pwd: e.target.value })
                                    }
                                    placeholder="Enter password"
                                    error={pwdError}
                                />
                            </div>
                            <div className="form-group d-flex justify-content-between align-items-center">
                                <label className="d-flex align-items-center gap-2">
                                    <input
                                        type="checkbox"
                                        value={pwdVisible}
                                        className="form-check-input"
                                        onChange={() =>
                                            setState({
                                                pwdVisible: !pwdVisible,
                                            })
                                        }
                                    />
                                    <div className="keep-me-signed-in-text">
                                        Show password
                                    </div>
                                </label>
                                <Link
                                    className="txt-green forget-pwd"
                                    to={ROUTES.forgotPassword}
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="form-group  mb-5">
                                <label className="d-flex align-items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name="remember"
                                        value={remember}
                                        className="form-check-input"
                                        onChange={() =>
                                            setState({ remember: !remember })
                                        }
                                    />
                                    <div className="keep-me-signed-in-text">
                                        Keep me signed in in this device
                                    </div>
                                </label>
                            </div>

                            {/* OAuth Provider Mismatch Error - Add this BEFORE existing authError */}
                            {urlError && (
                                <div className="mb-3">
                                    <div className="alert alert-warning d-flex align-items-start border-warning bg-warning bg-opacity-10">
                                        <FaExclamationCircle className="me-2 mt-1 text-warning" />
                                        <div className="flex-grow-1">
                                            <div className="fw-bold mb-2 text-warning">
                                                Account Already Registered
                                            </div>
                                            <div className="mb-3 text-light">
                                                {urlError}
                                            </div>
                                            {suggestedProvider && (
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-warning d-flex align-items-center gap-2"
                                                    onClick={() => {
                                                        const url =
                                                            getProviderLoginUrl(
                                                                suggestedProvider,
                                                            );
                                                        if (url) {
                                                            window.location.href =
                                                                url;
                                                        } else {
                                                            console.error(
                                                                `OAuth URL not found for provider: ${suggestedProvider}`,
                                                            );
                                                        }
                                                    }}
                                                >
                                                    {/* Optional: Add provider icon */}
                                                    Continue with{" "}
                                                    {suggestedProvider
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        suggestedProvider.slice(
                                                            1,
                                                        )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {authError && (
                                <span className="errorsapn">
                                    <FaExclamationCircle /> {tempToken}
                                </span>
                            )}
                            <button
                                type="submit"
                                className="btn-primary w-100 text-uppercase d-flex align-items-center justify-content-center py-2"
                                disabled={loading}
                                onClick={signUserIn}
                            >
                                <div
                                    className={`${loading ? "opacity-100" : "opacity-0"}`}
                                >
                                    <CustomSpinner />
                                </div>
                                <div className={`${loading ? "ms-3" : "pe-4"}`}>
                                    sign in
                                </div>
                            </button>
                        </form>
                        <ul className="social-links">
                            {social_links.map((item, idx) => (
                                <li key={idx}>
                                    <a href={item.to}>
                                        <img src={item.icon} alt="icon" />
                                    </a>
                                </li>
                            ))}
                        </ul>
                        <p className="text-white text-center">
                            Do not have an account?{" "}
                            <Link to="/app/signup" className="signup-link">
                                Sign up
                            </Link>
                        </p>
                    </>
                )}
            </AuthLayout>
        </>
    );
};

export default Signin;
