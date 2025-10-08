import React from "react";
import { useState } from "react";
import Modal from "react-modal";
import { useMutation } from "@apollo/client";
import { FaExclamationCircle } from "@react-icons/all-files/fa/FaExclamationCircle";

import * as Mutation from "../../apollo/graphqls/mutations/Support";
import { CONFIRM_GOOGLE_AUTH_RESET } from "../../apollo/graphqls/mutations/Auth";
import CustomSpinner from "../common/custom-spinner";
import { FormInput } from "../common/FormControl";
import { CloseIcon } from "../../utilities/imgImport";
import { showSuccessAlarm, showFailAlarm } from "../admin/AlarmModal";

export default function ResetAuthenticatorModal({
    isOpen,
    setIsOpen,
    secret,
    token,
}) {
    const [sentCode, setSentCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [verifyCode, setVerifyCode] = useState("");
    const [verifyPending, setVerifyPending] = useState(false);
    const [mailVerify, setMailVerify] = useState({
        sent: false,
        error: "",
        email: "",
    });

    const [sendVerifyCode] = useMutation(Mutation.SEND_VERIFY_CODE, {
        onCompleted: (data) => {
            if (data.sendVerifyCode !== "Failed") {
                setMailVerify({
                    ...mailVerify,
                    error: "",
                    email: data.sendVerifyCode,
                    sent: true,
                });
            } else {
                setMailVerify({
                    ...mailVerify,
                    error: "Cannot get verify code",
                    email: "",
                    sent: false,
                });
            }
        },
        onError: (err) => {
            setMailVerify({
                ...mailVerify,
                error: err.message,
                email: "",
                sent: false,
            });
        },
    });

    const resetModal = () => {
        setSentCode("");
        setLoading(false);
    };

    const [confirmResetGoogleAuth] = useMutation(CONFIRM_GOOGLE_AUTH_RESET, {
        onCompleted: (data) => {
            if (data.confirmGoogleAuthReset === "Success") {
                showSuccessAlarm("Google Authenticator has been updated.");
                setIsOpen(false);
            } else {
                // close modal
                setError("Cannot Reset Google Authenticator.");
            }
            resetModal();
        },
        onError: (error) => {
            // show message and close modal
            setError(error.message);
            resetModal();
        },
    });

    const getVerifyCode = () => {
        if (verifyPending) return;
        setMailVerify({ ...mailVerify, error: "", email: "", sent: false });
        setVerifyPending(true);
        setTimeout(() => {
            setVerifyPending(false);
        }, 6000);
        sendVerifyCode();
    };

    const handleSubmit = (e) => {
        e.stopPropagation();
        setLoading(true);
        confirmResetGoogleAuth({
            variables: {
                googleCode: sentCode,
                mailCode: verifyCode,
                token,
            },
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={() => setIsOpen(false)}
            className="support-modal border-0"
            overlayClassName="support-modal__overlay"
            ariaHideApp={false}
        >
            <div className="support-modal__header justify-content-end">
                <div
                    onClick={() => setIsOpen(false)}
                    onKeyDown={() => setIsOpen(false)}
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
            <div className="my-5">
                <div className="text-center">
                    <p className="text-capitalize fs-30px fw-bold lh-36px">
                        Get codes from authenticator app
                    </p>
                    <p className="fs-16px mt-2 text-light fw-normald mb-3">
                        Scan the QR code below or mannually type the secret key
                        into your authenticator app.
                    </p>
                    <img src={secret} width={120} alt="qr code" />
                    <p>
                        <small className="fw-bold">Scan the Code</small>
                    </p>
                </div>

                <div className="col-12 col-sm-10 col-md-8 col-lg-6 mx-auto text-light my-1">
                    <form action="form">
                        <div className="form-group mb-3">
                            <FormInput
                                type="text"
                                label="Auth code"
                                value={sentCode}
                                onChange={(e) => setSentCode(e.target.value)}
                                autoComplete="off"
                                placeholder="Enter code"
                            />
                        </div>
                        <div className="form-group">
                            <FormInput
                                type="text"
                                label="Email verification code"
                                value={verifyCode}
                                onChange={(e) => setVerifyCode(e.target.value)}
                                placeholder="Enter code"
                            />
                        </div>
                        <div className="fs-12px d-flex">
                            <span
                                className={
                                    mailVerify.error ? "text-danger" : ""
                                }
                            >
                                {mailVerify.sent &&
                                    `The code has been sent to ${mailVerify.email}`}
                                {mailVerify.error !== "" && mailVerify.error}
                            </span>
                            <span
                                className={
                                    "fw-500 cursor-pointer ms-auto " +
                                    (verifyPending ? "txt-grey" : "txt-green")
                                }
                                onClick={getVerifyCode}
                            >
                                Get Code
                            </span>
                        </div>
                        <div className="my-3">
                            {error && (
                                <span className="errorsapn">
                                    <FaExclamationCircle /> {error}
                                </span>
                            )}
                            <button
                                type="submit"
                                className="btn-primary w-100 text-uppercase d-flex align-items-center justify-content-center py-2"
                                disabled={loading || sentCode === ""}
                                onClick={handleSubmit}
                            >
                                <div
                                    className={`${
                                        loading ? "opacity-100" : "opacity-0"
                                    }`}
                                >
                                    <CustomSpinner />
                                </div>
                                <div
                                    className={`fs-20px ${
                                        loading ? "ms-3" : "pe-4"
                                    }`}
                                >
                                    verify
                                </div>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Modal>
    );
}
