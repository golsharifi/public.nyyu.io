import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useMutation } from "@apollo/client";
import { FaExclamationCircle } from "@react-icons/all-files/fa/FaExclamationCircle";
import validator from "validator";
import Modal from "react-modal";

import * as Mutation from '../../apollo/graphqls/mutations/Support';
import { RESET_PASSWORD } from "../../apollo/graphqls/mutations/Auth";
import { CloseIcon } from "../../utilities/imgImport";
import { passwordValidatorOptions } from "../../utilities/staticData";
import CustomSpinner from "../common/custom-spinner";
import { FormInput } from "../common/FormControl";
import { showSuccessAlarm } from "../admin/AlarmModal";


export default function ResetPasswordModal({ isOpen, setIsOpen }) {
    const { user } = useSelector(state => state.auth);
    
    // Containers
    const [error, setError] = useState("");
    const [pendingRequest, setPendingRequest] = useState(false);
    
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    
    
    const [ verifyCode, setVerifyCode ] = useState("");
    const [ verifyPending, setVerifyPending ] = useState(false);
    const [ mailVerify, setMailVerify ] = useState({
        sent: false, error: '', email: ''
    });
    const loading = !user.email && !mailVerify.sent;

    const [resetPassword] = useMutation(RESET_PASSWORD, {
        onCompleted: (res) => {
            setPendingRequest(false);
            setIsOpen(false);
            if(res.resetPassword === 'Success') {
                showSuccessAlarm('Password reset successfully');
            }
            else {
                setError("Unknown error occurred in server.");
            }
        },
        onError: err => {
            setError(err.message);
        }
    });

    const [ sendVerifyCode ] = useMutation(
        Mutation.SEND_VERIFY_CODE, {
            onCompleted: data => {
                if(data.sendVerifyCode !== 'Failed') {
                    setMailVerify({...mailVerify, error: '', email: data.sendVerifyCode, sent: true});
                } else {
                    setMailVerify({...mailVerify, error: 'Cannot get verify code', email: '', sent: false});
                }
            },
            onError: err => {
                setMailVerify({...mailVerify, error: err.message, email: '', sent: false});
            }
        }
    )

    const submit = (e) => {
        e.preventDefault();
        setError("");
        setPendingRequest(false);
        let error = false;
        if (!mailVerify.sent) {
            setError("Please enter the code!");
            return (error = true);
        }
        if (!newPassword || !validator.isStrongPassword(newPassword, passwordValidatorOptions)) {
            setError(
                "Password must contain at least 8 characters, including UPPER/lowercase and numbers!"
            );
            return (error = true);
        }
        if (!confirmNewPassword || newPassword !== confirmNewPassword) {
            setError("Password doest not match it's repeat!");
            return (error = true);
        }
        if (!error) {
            setPendingRequest(true);

            resetPassword({
                variables: {
                    email: user.email,
                    code: verifyCode,
                    newPassword: newPassword,
                },
            });
        }
    };
 
    const getVerifyCode = () => {
        if(verifyPending) return;
        setMailVerify({...mailVerify, error: '', email: '', sent: false});
        setVerifyPending(true);
        setTimeout(() => {
            setVerifyPending(false);
        }, 6000);
        sendVerifyCode();
    }

    // Render
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={() => setIsOpen(false)}
            className="support-modal border-0"
            overlayClassName="support-modal__overlay"
        >
            <div className="support-modal__header justify-content-end">
                <div
                    onClick={() => setIsOpen(false)}
                    onKeyDown={() => setIsOpen(false)}
                    role="button"
                    tabIndex="0"
                >
                    <img width="14px" height="14px" src={CloseIcon} alt="close" />
                </div>
            </div>
            <div className="my-5">
                {loading ? (
                    <div className="text-center">
                        <CustomSpinner />
                    </div>
                ) : (
                    <div>
                        <div className="text-center">
                            <p className="text-capitalize fs-30px fw-bold lh-36px">
                                reset password
                            </p>
                            <p className="fs-16px mt-2 text-light fw-normald">
                                To secure your account, please complete the following verification
                            </p>
                        </div>

                        <div className="col-12 col-sm-10 col-md-8 col-lg-6 mx-auto text-light my-5">
                            <form action="form">
                                <div className="form-group">
                                    <FormInput
                                        type="text"
                                        label="Email verification code"
                                        value={verifyCode}
                                        onChange={(e) => setVerifyCode(e.target.value)}
                                        autoComplete='off'
                                        placeholder="Enter code"
                                    />
                                </div>
                                <div className="fs-12px d-flex">
                                    <span className={(mailVerify.error ? "text-danger" : "")}>
                                        {mailVerify.sent && 
                                            `The code has been sent to ${mailVerify.email}`
                                        }
                                        {mailVerify.error !== '' && mailVerify.error}
                                    </span>
                                    <span 
                                        className={"fw-500 cursor-pointer ms-auto " + (verifyPending ? "txt-grey" : "txt-green") }
                                        onClick={getVerifyCode}
                                    >
                                        Get Code
                                    </span>
                                </div>
                                <div className="form-group mb-3">
                                    <FormInput
                                        type={showPassword ? "text" : "password"}
                                        label="New password"
                                        placeholder="Enter new password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <FormInput
                                        type={showPassword ? "text" : "password"}
                                        label="Confirm new password"
                                        placeholder="Confirm new password"
                                        value={confirmNewPassword}
                                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                                    />
                                </div>
                                <label className="d-flex align-items-center gap-2">
                                    <input
                                        type="checkbox"
                                        value={showPassword}
                                        className="form-check-input bg-transparent border mt-0"
                                        onChange={() => setShowPassword(!showPassword)}
                                    />
                                    <div className="keep-me-signed-in-text">Show password</div>
                                </label>
                                <div className="mb-5 mt-4">
                                    {error && (
                                        <span className="errorsapn">
                                            <FaExclamationCircle /> {error}
                                        </span>
                                    )}
                                    <button
                                        type="submit"
                                        className="btn btn-outline-light rounded-0 w-100 text-uppercase d-flex align-items-center justify-content-center py-2"
                                        disabled={pendingRequest}
                                        onClick={submit}
                                    >
                                        <div
                                            className={`${
                                                pendingRequest ? "opacity-100" : "opacity-0"
                                            }`}
                                        >
                                            <CustomSpinner />
                                        </div>
                                        <div
                                            className={`fs-20px ${
                                                pendingRequest ? "ms-3" : "pe-4"
                                            }`}
                                        >
                                            submit
                                        </div>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}
