import React, { useState, useReducer, useMemo, useEffect } from "react";
import { Link } from "gatsby";
import { Input } from "../common/FormControl";
import { useSignIn2FA } from "../../apollo/model/auth";
import CustomSpinner from "../common/custom-spinner";
import { FaExclamationCircle } from "@react-icons/all-files/fa/FaExclamationCircle";
import Countdown from "react-countdown";

const EXPIRE_TIME = 60 * 1000;

const VerifyMutliFA = ({
    twoStep,
    tempToken,
    email,
    returnToSignIn,
    resend,
    loading,
    onSuccess, // Add onSuccess prop
    onError, // Add onError prop
}) => {
    const [code, setCode] = useReducer(
        (old, action) => ({ ...old, ...action }),
        {
            app: "",
            phone: "",
            email: "",
        },
    );

    const [codeError, setCodeError] = useState("");
    const [waitingCode, setWaitingCode] = useState(false);

    const [signin2faMutation, signin2faMutationResults] = useSignIn2FA();

    const createdAt = useMemo(() => {
        if (!loading) return Date.now();
    }, [loading]);

    useEffect(() => {
        if (!loading) setWaitingCode(true);
    }, [loading]);

    // Handle 2FA completion
    useEffect(() => {
        console.log(
            "🔐 VerifyMutliFA: Checking mutation results",
            signin2faMutationResults,
        );

        if (signin2faMutationResults.data) {
            const result = signin2faMutationResults.data.confirm2FA;
            console.log("🔐 VerifyMutliFA: 2FA result", result);

            if (result?.status === "Success") {
                console.log(
                    "✅ VerifyMutliFA: 2FA Success - calling onSuccess callback",
                );

                // Call onSuccess callback if provided
                if (onSuccess && typeof onSuccess === "function") {
                    setTimeout(() => {
                        onSuccess();
                    }, 100);
                } else {
                    console.warn(
                        "⚠️ VerifyMutliFA: onSuccess callback not provided or not a function",
                    );
                }
            } else if (result?.status === "Failed") {
                console.log("❌ VerifyMutliFA: 2FA Failed");

                // Call onError callback if provided
                if (onError && typeof onError === "function") {
                    onError(result?.token || "2FA verification failed");
                }
            }
        }

        // Handle GraphQL errors
        if (signin2faMutationResults.error) {
            console.error(
                "🚨 VerifyMutliFA: 2FA Error",
                signin2faMutationResults.error,
            );

            if (onError && typeof onError === "function") {
                onError("2FA verification failed due to network error");
            }
        }
    }, [
        signin2faMutationResults.data,
        signin2faMutationResults.error,
        onSuccess,
        onError,
    ]);

    // Renderer callback with condition
    const countDownRenderer = ({ seconds, completed }) => {
        if (completed) {
            // Render a completed state
            setWaitingCode(false);
            return <span></span>;
        } else {
            // Render a countdown
            return (
                <>
                    {seconds !== 0 && (
                        <span className="text-success" style={{ minWidth: 70 }}>
                            ({seconds} Sec)
                        </span>
                    )}
                </>
            );
        }
    };

    const confirmCodeClick = (e) => {
        e.preventDefault();
        let error = false;
        setCodeError("");

        console.log("🔐 VerifyMutliFA: confirmCodeClick called");
        console.log("🔐 Current code state:", code);
        console.log("🔐 TwoStep requirements:", twoStep);

        // Validate codes for each required step
        const missingCodes = [];
        twoStep.forEach((step) => {
            if (!code[step] || code[step].trim() === "") {
                missingCodes.push(step);
            }
        });

        if (missingCodes.length > 0) {
            setCodeError(`Please enter code for: ${missingCodes.join(", ")}`);
            error = true;
        }

        if (!error) {
            console.log("🔐 VerifyMutliFA: Submitting 2FA codes");

            const codesArray = twoStep.map((step) => {
                return {
                    key: step,
                    value: code[step],
                };
            });

            console.log("🔐 VerifyMutliFA: Codes array:", codesArray);

            signin2faMutation(email, tempToken, codesArray);
        }
    };

    const pending = signin2faMutationResults.loading;
    const webserviceError =
        signin2faMutationResults?.data?.confirm2FA?.status === "Failed";

    return (
        <>
            <h3 className="signup-head mb-5">Authenticate</h3>
            <form className="form">
                {twoStep &&
                    Array.isArray(twoStep) &&
                    twoStep.map(
                        (step) =>
                            step && (
                                <div key={step}>
                                    <p>
                                        Confirmation code (
                                        <span className="text-capitalize fw-bold">
                                            {step}
                                        </span>
                                        )
                                    </p>
                                    <div className="form-group">
                                        <Input
                                            name="code"
                                            type="text"
                                            value={code[step]}
                                            onChange={(e) =>
                                                setCode({
                                                    [step]: e.target.value,
                                                })
                                            }
                                            autoComplete="off"
                                            placeholder="Enter code"
                                        />
                                        {codeError && (
                                            <span className="errorsapn">
                                                <FaExclamationCircle />{" "}
                                                {codeError}
                                            </span>
                                        )}
                                    </div>
                                    <div
                                        className="form-group text-white d-flex justify-content-end align-items-center"
                                        style={{ minHeight: 32 }}
                                    >
                                        <button
                                            type="button"
                                            disabled={loading || waitingCode}
                                            className={`signup-link btn mt-0 pe-0 me-1 py-0 text-capitalize cursor-pointer ${
                                                loading
                                                    ? "text-secondary"
                                                    : "text-success text-underline noBorder"
                                            }`}
                                            onClick={(e) => resend && resend(e)}
                                        >
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="mt-4px">
                                                    {loading ? (
                                                        <CustomSpinner sm />
                                                    ) : (
                                                        <></>
                                                    )}
                                                </div>
                                                <div>Resend</div>
                                            </div>
                                        </button>
                                        {!loading && (
                                            <Countdown
                                                date={createdAt + EXPIRE_TIME}
                                                renderer={countDownRenderer}
                                            />
                                        )}
                                    </div>
                                </div>
                            ),
                    )}
                <div className="mt-5 mb-2">
                    {webserviceError && (
                        <span className="errorsapn">
                            <FaExclamationCircle />{" "}
                            {signin2faMutationResults?.data?.confirm2FA?.token}
                        </span>
                    )}
                    <button
                        type="submit"
                        className="btn-primary w-100 text-uppercase d-flex align-items-center justify-content-center py-2"
                        disabled={pending}
                        onClick={confirmCodeClick}
                    >
                        <div
                            className={`${pending ? "opacity-100" : "opacity-0"}`}
                        >
                            <CustomSpinner />
                        </div>
                        <div className={`${pending ? "ms-3" : "pe-4"}`}>
                            confirm code
                        </div>
                    </button>
                </div>
            </form>
            <p className="text-white text-center">
                Return to{" "}
                <Link
                    to="#"
                    className="signup-link"
                    onClick={() => returnToSignIn()}
                >
                    Sign in
                </Link>
            </p>
        </>
    );
};

export default VerifyMutliFA;
