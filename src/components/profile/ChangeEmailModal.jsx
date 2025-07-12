import { useMutation } from "@apollo/client";
import { FaExclamationCircle } from "@react-icons/all-files/fa/FaExclamationCircle";
import { navigate } from "gatsby";
import React, { useEffect } from "react";
import { useState } from "react";
import Modal from "react-modal";
import { logout } from "../../utilities/auth";
import { CloseIcon } from "../../utilities/imgImport";
import { ROUTES } from "../../utilities/routes";
import CustomSpinner from "../common/custom-spinner";
import { FormInput } from "../common/FormControl";
import { CHANGE_EMAIL, CONFIRM_CHANGE_EMAIL } from "./profile-queries";
import validator from "validator";

export default function ChangeEmailModal({ isOpen, setIsOpen }) {
    // State for two-step process
    const [step, setStep] = useState(1); // 1 = enter new email, 2 = enter verification code
    const [error, setError] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [sendingCode, setSendingCode] = useState(false);

    // Webserver mutations
    const [requestEmailChange] = useMutation(CHANGE_EMAIL, {
        onCompleted: (data) => {
            setSendingCode(false);
            if (data.changeEmail === "Success") {
                setStep(2);
                setError("");
            } else {
                setError("Failed to send verification code. Please try again.");
            }
        },
        onError: (error) => {
            setSendingCode(false);
            setError(error.message);
        },
    });

    const [confirmChangeEmail] = useMutation(CONFIRM_CHANGE_EMAIL, {
        onCompleted: (data) => {
            setLoading(false);
            if (data.confirmChangeEmail === 1) {
                return logout(() => {
                    navigate(ROUTES.home);
                });
            }
            return setError("Something went wrong");
        },
        onError: (error) => {
            setLoading(false);
            setError(error.message);
        },
    });

    // Reset modal state when opened/closed
    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setError("");
            setNewEmail("");
            setVerificationCode("");
            setLoading(false);
            setSendingCode(false);
        }
    }, [isOpen]);

    // Step 1: Submit new email
    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!newEmail) {
            return setError("Please enter a new email address");
        }
        if (!validator.isEmail(newEmail)) {
            return setError("Please enter a valid email address");
        }

        setSendingCode(true);
        requestEmailChange({
            variables: {
                newEmail: newEmail.trim(),
            },
        });
    };

    // Step 2: Submit verification code
    const handleCodeSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!verificationCode) {
            return setError("Please enter the verification code");
        }

        setLoading(true);
        await confirmChangeEmail({
            variables: {
                newEmail: newEmail.trim(),
                code: verificationCode.trim(),
            },
        });
    };

    const closeModal = () => {
        setIsOpen(false);
        setStep(1);
        setError("");
        setNewEmail("");
        setVerificationCode("");
        setLoading(false);
        setSendingCode(false);
    };

    const goBackToStep1 = () => {
        setStep(1);
        setError("");
        setVerificationCode("");
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={closeModal}
            className="twoFA-modal"
            overlayClassName="2fa-modal__overlay"
            ariaHideApp={false}
        >
            <div className="tfa-modal__header">
                <div
                    onClick={closeModal}
                    onKeyDown={closeModal}
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
                <div className="text-center mb-4">
                    <h3 className="fs-24px fw-bold mb-3">
                        {step === 1
                            ? "Change Email Address"
                            : "Email Verification"}
                    </h3>
                    <p className="fs-16px text-light mb-4">
                        {step === 1
                            ? "Enter your new email address. We'll send a verification code to your current email."
                            : `Enter the verification code sent to your current email address.`}
                    </p>
                </div>

                {step === 1 ? (
                    // Step 1: Enter new email
                    <div className="col-12 col-sm-10 col-md-8 col-lg-6 mx-auto">
                        <form onSubmit={handleEmailSubmit}>
                            <div className="form-group mb-4">
                                <FormInput
                                    type="email"
                                    label="New Email Address"
                                    placeholder="Enter your new email address"
                                    value={newEmail}
                                    onChange={(e) =>
                                        setNewEmail(e.target.value)
                                    }
                                    autoComplete="email"
                                />
                            </div>

                            {error && (
                                <div className="mb-3">
                                    <span className="errorsapn">
                                        <div className="d-flex align-items-center gap-1">
                                            <div className="mt-1px">
                                                <FaExclamationCircle className="align-middle" />
                                            </div>
                                            <div>{error}</div>
                                        </div>
                                    </span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={sendingCode || !newEmail}
                                className="btn-primary w-100 text-uppercase d-flex align-items-center justify-content-center py-2"
                            >
                                <div
                                    className={`${sendingCode ? "opacity-100" : "opacity-0"}`}
                                >
                                    <CustomSpinner />
                                </div>
                                <div
                                    className={`fs-16px ${sendingCode ? "ms-3" : "pe-4"}`}
                                >
                                    {sendingCode
                                        ? "Sending..."
                                        : "Send Verification Code"}
                                </div>
                            </button>
                        </form>
                    </div>
                ) : (
                    // Step 2: Enter verification code
                    <div className="col-12 col-sm-10 col-md-8 col-lg-6 mx-auto">
                        <div
                            className="mb-4 p-3 border rounded text-center"
                            style={{
                                backgroundColor: "rgba(255, 255, 255, 0.05)",
                                color: "white",
                            }}
                        >
                            <small className="text">New Email:</small>
                            <div className="fw-bold">{newEmail}</div>
                        </div>

                        <form onSubmit={handleCodeSubmit}>
                            <div className="form-group mb-4">
                                <FormInput
                                    type="text"
                                    label="Verification Code"
                                    placeholder="Enter 6-digit code"
                                    value={verificationCode}
                                    onChange={(e) =>
                                        setVerificationCode(e.target.value)
                                    }
                                    autoComplete="one-time-code"
                                    maxLength="6"
                                />
                            </div>

                            {error && (
                                <div className="mb-3">
                                    <span className="errorsapn">
                                        <div className="d-flex align-items-center gap-1">
                                            <div className="mt-1px">
                                                <FaExclamationCircle className="align-middle" />
                                            </div>
                                            <div>{error}</div>
                                        </div>
                                    </span>
                                </div>
                            )}

                            <div className="d-flex gap-3">
                                <button
                                    type="button"
                                    onClick={goBackToStep1}
                                    className="btn btn-outline-light w-50 text-uppercase py-2"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !verificationCode}
                                    className="btn-primary w-50 text-uppercase d-flex align-items-center justify-content-center py-2"
                                >
                                    <div
                                        className={`${loading ? "opacity-100" : "opacity-0"}`}
                                    >
                                        <CustomSpinner />
                                    </div>
                                    <div
                                        className={`fs-16px ${loading ? "ms-3" : "pe-4"}`}
                                    >
                                        {loading ? "Verifying..." : "Confirm"}
                                    </div>
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </Modal>
    );
}
