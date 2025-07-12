import React, { useCallback, useReducer, useState, useEffect } from "react";
import { Input } from "../common/FormControl";
import Modal from "react-modal";
import { CloseIcon } from "../../utilities/imgImport";
import { useSignUp2FA } from "../../apollo/model/auth";
import { useMutation } from "@apollo/client";
import {
    REQUEST_2FA,
    DISABLE_2FA,
    CONFIRM_REQUEST_2FA,
} from "../../apollo/graphqls/mutations/Auth";
import CustomSpinner from "../common/custom-spinner";
import { FaExclamationCircle } from "@react-icons/all-files/fa/FaExclamationCircle";
import "react-phone-number-input/style.css";
import ConnectMobile from "./connect-mobile";

// Remove email from the two_factors array since it's always required and automatically enabled
const two_factors = [
    { label: "Authenticator App", method: "app" },
    { label: "SMS", method: "phone" },
];

const initial = {
    result_code: "",
    set_type: -1,
    input_mobile: false,
    loading: false,
    error: false,
};

export default function TwoFactorModal({
    is2FAModalOpen,
    setIs2FAModalOpen,
    email,
    phone,
    twoStep,
    onResult,
    redirect,
}) {
    const [qrcode, setQRCode] = useState("");
    const [selected, setSelected] = useState(0);
    const [state, setState] = useReducer(
        (old, action) => ({ ...old, ...action }),
        initial,
    );
    const { result_code, set_type, input_mobile, loading, error } = state;

    const handleInput = useCallback((e) => {
        e.preventDefault();
        setState({ [e.target.name]: e.target.value });
    }, []);

    useEffect(() => {
        setState({ loading: false });
    }, [twoStep]);

    // for redirecting
    const [signup2faMutation] = useSignUp2FA();

    const [request2FA, { loading: request2FALoading }] = useMutation(
        REQUEST_2FA,
        {
            onCompleted: (data) => {
                if (
                    data.request2FA &&
                    data.request2FA.includes("already processed")
                ) {
                    // Handle the case where request was already processed
                    setState({
                        error: true,
                        loading: false,
                        errorMessage:
                            "A 2FA request is already in progress. Please wait a moment and try again.",
                    });
                    return;
                }
                setQRCode(data.request2FA);
                setState({ set_type: selected, loading: false, error: false });
            },
            // Find the request2FA mutation onError handler in two-factor-modal.jsx and replace with this:

            onError: (error) => {
                console.error("2FA Request Error:", error);

                let errorMessage =
                    "An error occurred while setting up 2FA. Please try again.";

                // Check specific error messages
                if (error.message) {
                    const message = error.message.toLowerCase();

                    if (
                        message.includes("invalid phone number format") ||
                        message.includes("phone number")
                    ) {
                        errorMessage =
                            "Invalid phone number format. Please try again.";
                    } else if (message.includes("country code")) {
                        errorMessage =
                            "Please include the country code with your phone number (e.g., +1 for US, +44 for UK).";
                    } else if (message.includes("format")) {
                        errorMessage =
                            "Invalid phone number format. Please check your number and try again.";
                    } else if (message.includes("invalid 'to' phone number")) {
                        errorMessage =
                            "Invalid phone number. Please check the number format and try again.";
                    } else if (
                        message.includes("twilio") ||
                        message.includes("sms")
                    ) {
                        errorMessage =
                            "Unable to send SMS. Please check your phone number and try again.";
                    } else if (message.includes("already")) {
                        errorMessage =
                            "2FA method already enabled. Please refresh and try again.";
                    } else if (message.includes("verification")) {
                        errorMessage =
                            "Verification failed. Please ensure your account is verified and try again.";
                    } else {
                        // Use the actual error message from backend if it's specific
                        errorMessage = error.message;
                    }
                }

                // Check GraphQL errors for more specific information
                if (error.graphQLErrors && error.graphQLErrors.length > 0) {
                    const graphqlError = error.graphQLErrors[0];
                    if (graphqlError.message) {
                        errorMessage = graphqlError.message;
                    }
                }

                setState({
                    loading: false,
                    error: true,
                    errorMessage: errorMessage,
                    set_type: -1, // Reset to show form again
                });
            },
        },
    );

    const [disable2FA, { loading: disable2FALoading }] = useMutation(
        DISABLE_2FA,
        {
            onCompleted: (data) => {
                console.log("disable2FA completed:", data);
                if (data.disable2FA === "Success") {
                    setState({
                        loading: false,
                        error: false,
                        errorMessage: "",
                    });
                    onResult(true);
                } else {
                    setState({
                        loading: false,
                        error: true,
                        errorMessage: "Failed to disable 2FA method.",
                    });
                }
            },
            onError: (error) => {
                console.log("❌ disable2FA error:", error);
                setState({
                    loading: false,
                    error: true,
                    errorMessage:
                        error.message || "Failed to disable 2FA method.",
                });
            },
        },
    );

    const [confirmRequest2FA, { loading: confirmLoading }] = useMutation(
        CONFIRM_REQUEST_2FA,
        {
            onCompleted: (data) => {
                console.log("confirmRequest2FA completed:", data);
                if (data.confirmRequest2FA.status === "Success") {
                    setState({
                        result_code: "",
                        set_type: -1,
                        input_mobile: false,
                        loading: false,
                        error: false,
                        errorMessage: "",
                    });

                    // Clear QR code
                    setQRCode("");

                    // Reset selected index
                    setSelected(0);

                    // Call onResult with success
                    onResult(true);

                    // Close modal after a brief delay to ensure parent component updates
                    setTimeout(() => {
                        setIs2FAModalOpen(false);
                    }, 100);
                }
            },
            onError: (error) => {
                console.log("❌ confirmRequest2FA error:", error);
                setState(initial);
                onResult(false);
            },
        },
    );

    const sendRequest2FA = (i, mobile = "") => {
        // Clear any previous errors and set loading state
        setState({
            loading: true,
            error: false,
            errorMessage: "",
            set_type: -1, // Reset set_type until successful
        });

        // Add a small delay to prevent rapid successive calls
        setTimeout(() => {
            request2FA({
                variables: {
                    email,
                    method: two_factors[i].method,
                    phone: mobile,
                },
            });
        }, 100);
    };

    const closeModal = () => {
        setIs2FAModalOpen(false);
        setState(initial);
    };

    return (
        <Modal
            isOpen={is2FAModalOpen}
            onRequestClose={() => closeModal()}
            ariaHideApp={false}
            className="twoFA-modal"
            overlayClassName="2fa-modal__overlay"
        >
            <div className="tfa-modal__header">
                <div
                    onClick={() => closeModal()}
                    onKeyDown={() => closeModal()}
                    role="button"
                    tabIndex="0"
                >
                    <img
                        width="14px"
                        height="14px"
                        src={CloseIcon}
                        alt="close"
                    />
                </div>
            </div>
            <div className="twoFA-modal__body">
                {set_type === -1 ? (
                    input_mobile ? (
                        <ConnectMobile
                            confirm={(number) => sendRequest2FA(1, number)}
                            loading={request2FALoading}
                            error={state.errorMessage}
                        />
                    ) : (
                        <div className="tfa-select">
                            <h3 className="tfa-select-title">
                                Secure Your Account with 2-Step Verification
                            </h3>
                            <p className="mt-4 mb-4">
                                A code sent to your email is always required.
                                You must also choose either SMS or an
                                authenticator app for a second verification
                                method.
                            </p>

                            {/* Email 2FA Status - Informational Only */}
                            <div
                                className="tfa-line mb-4"
                                style={{
                                    // backgroundColor: "#f8f9fa",
                                    border: "1px solid #e9ecef",
                                    borderRadius: "8px",
                                    padding: "12px",
                                }}
                            >
                                <div className="tfa-line_labels">
                                    <p className="tfa-line_labels_combined">
                                        <strong>Email:</strong>{" "}
                                        {email.slice(0, 2) +
                                            "***@***" +
                                            email.slice(-2)}
                                    </p>
                                </div>
                                <div className="tfa-line_buttons align-items-center">
                                    <span
                                        className="text-success fw-bold"
                                        style={{ fontSize: "14px" }}
                                    >
                                        ✓ Always Active
                                    </span>
                                </div>
                            </div>

                            <p className="text mt-4 mb-4">
                                Select your second verification method below:
                            </p>

                            <div className="d-flex flex-column justify-content-center align-items-center">
                                {two_factors.map((item, idx) => {
                                    const enable = !!twoStep
                                        ? twoStep?.includes(item.method)
                                        : false;
                                    let available = true;
                                    if (item.method === "phone") {
                                        if (twoStep?.includes("app"))
                                            available = false;
                                    } else if (item.method === "app") {
                                        if (twoStep?.includes("phone"))
                                            available = false;
                                    }
                                    return (
                                        <div key={idx} className="tfa-line">
                                            <div className="tfa-line_labels">
                                                <p className="tfa-line_labels_type">
                                                    {item.label}
                                                </p>
                                                {enable && (
                                                    <p className="tfa-line_labels_preview">
                                                        {item.method ===
                                                            "phone" && phone
                                                            ? "*******" +
                                                              phone.slice(-3)
                                                            : ""}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="tfa-line_buttons">
                                                {enable ? (
                                                    <>
                                                        <button
                                                            className="btn-primary select-tfa d-flex align-items-center justify-content-center"
                                                            onClick={() => {
                                                                setSelected(
                                                                    idx,
                                                                );
                                                                setState({
                                                                    loading: true,
                                                                });
                                                                disable2FA({
                                                                    variables: {
                                                                        method: item.method,
                                                                    },
                                                                });
                                                            }}
                                                        >
                                                            <div
                                                                className={`${
                                                                    selected ===
                                                                        idx &&
                                                                    loading
                                                                        ? "opacity-100"
                                                                        : "opacity-0"
                                                                }`}
                                                            >
                                                                <CustomSpinner />
                                                            </div>
                                                            <div
                                                                className={`${
                                                                    selected ===
                                                                        idx &&
                                                                    loading
                                                                        ? "ms-3"
                                                                        : "pe-4"
                                                                }`}
                                                            >
                                                                Disable
                                                            </div>
                                                        </button>
                                                    </>
                                                ) : available === true ? (
                                                    <button
                                                        disabled={
                                                            (!!twoStep &&
                                                                two_factors[idx]
                                                                    .method ===
                                                                    "app" &&
                                                                twoStep?.includes(
                                                                    "phone",
                                                                )) ||
                                                            (!!twoStep &&
                                                                two_factors[idx]
                                                                    .method ===
                                                                    "phone" &&
                                                                twoStep?.includes(
                                                                    "app",
                                                                ))
                                                        }
                                                        className="btn-primary select-tfa d-flex align-items-center justify-content-center"
                                                        onClick={() => {
                                                            setSelected(idx);
                                                            if (
                                                                item.method ===
                                                                "phone"
                                                            ) {
                                                                setState({
                                                                    input_mobile: true,
                                                                });
                                                            } else {
                                                                sendRequest2FA(
                                                                    idx,
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        <div
                                                            className={`${
                                                                selected ===
                                                                    idx &&
                                                                loading
                                                                    ? "opacity-100"
                                                                    : "opacity-0"
                                                            }`}
                                                        >
                                                            <CustomSpinner />
                                                        </div>
                                                        <div
                                                            className={`${
                                                                selected ===
                                                                    idx &&
                                                                loading
                                                                    ? "ms-3"
                                                                    : "pe-4"
                                                            }`}
                                                        >
                                                            Enable
                                                        </div>
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="btn-primary select-tfa d-flex align-items-center justify-content-center"
                                                        style={{
                                                            opacity: 0.2,
                                                            cursor: "not-allowed",
                                                        }}
                                                        disabled={true}
                                                        title="Cannot enable both Authenticator App and SMS simultaneously"
                                                    >
                                                        <div>Not available</div>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Error display */}
                            {error && (
                                <div className="mt-3 text-center">
                                    <span className="text-danger">
                                        <FaExclamationCircle />{" "}
                                        {state.errorMessage ||
                                            "An error occurred"}
                                    </span>
                                </div>
                            )}
                        </div>
                    )
                ) : (
                    <div className="tfa-confirm">
                        <h3 className="tfa-confirm-title">
                            Enter the 6-digit code
                        </h3>
                        <p className="mt-4 mb-5">
                            {two_factors[selected].method === "app"
                                ? "Enter the 6-digit code from your authenticator app."
                                : two_factors[selected].method === "phone"
                                  ? `We sent a code to ${phone?.slice(0, 3)}*******${phone?.slice(-3)}`
                                  : "Enter the 6-digit code."}
                        </p>
                        {two_factors[selected].method === "app" && qrcode && (
                            <div className="qr-code-container text-center mb-4">
                                <img
                                    src={qrcode}
                                    alt="QR Code for Authenticator App"
                                    style={{ maxWidth: "200px" }}
                                />
                                <p className="mt-2 small">
                                    Scan this QR code with your authenticator
                                    app, then enter the 6-digit code below.
                                </p>
                            </div>
                        )}
                        <div className="tfa-confirm_form">
                            <Input
                                className="result_code"
                                style={
                                    error
                                        ? { border: "1px solid red" }
                                        : { opacity: 1 }
                                }
                                type="text"
                                name="result_code"
                                value={result_code}
                                onChange={handleInput}
                                placeholder="123456"
                            />
                            <div className="result_code_error">
                                {error && (
                                    <span className="errorsapn">
                                        <FaExclamationCircle />{" "}
                                        {"Please input confirm code"}
                                    </span>
                                )}
                            </div>
                            <button
                                className="btn-primary next-step d-flex align-items-center justify-content-center py-2"
                                onClick={() => {
                                    if (!result_code.length)
                                        setState({ error: true });
                                    else {
                                        if (redirect) {
                                            signup2faMutation(
                                                email,
                                                two_factors[selected].method,
                                                result_code,
                                            );
                                        } else {
                                            confirmRequest2FA({
                                                variables: {
                                                    email,
                                                    method: two_factors[
                                                        selected
                                                    ].method,
                                                    code: result_code,
                                                },
                                            });
                                        }
                                    }
                                }}
                                disabled={confirmLoading}
                            >
                                <div
                                    className={`${confirmLoading ? "opacity-100" : "opacity-0"}`}
                                >
                                    <CustomSpinner />
                                </div>
                                <div
                                    className={`fs-20px ${confirmLoading ? "ms-3" : "pe-4"}`}
                                >
                                    Confirm
                                </div>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}
