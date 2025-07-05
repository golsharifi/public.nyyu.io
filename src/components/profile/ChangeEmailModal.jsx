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
    // Containers
    const [error, setError] = useState("");
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(true);
    const [loadingConfirmation, setLoadingConfirmation] = useState(false);

    // Webserver
    const [changeEmail] = useMutation(CHANGE_EMAIL, {
        onCompleted: (data) => {
            if (data.changeEmail === "Success") setLoading(false);
        },
    });
    const [confirmChangeEmail] = useMutation(CONFIRM_CHANGE_EMAIL, {
        onCompleted: (data) => {
            if (data.confirmChangeEmail === 1)
                return logout(() => {
                    navigate(ROUTES.home);
                });
            return setError("Something went wrong");
        },
        onError: (error) => setError(error.message),
    });

    useEffect(() => {
        setLoading(true);
        changeEmail();
    }, []);

    // Methods
    const onConfirmEmailChange = async (e) => {
        e.preventDefault();
        setError("");
        if (!(code || email)) return setError("Please fill out all the fields");
        if (!validator.isEmail(email)) return setError("Invalid email address");
        setLoadingConfirmation(true);
        await confirmChangeEmail({
            variables: {
                newEmail: email,
                code,
            },
        }).catch((error) => setError(error.message));
        setLoadingConfirmation(false);
    };

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
                    <img
                        width="14px"
                        height="14px"
                        src={CloseIcon}
                        alt="close"
                    />
                </div>
            </div>
            {loading ? (
                <div className="text-center mx-auto my-5 py-5">
                    <CustomSpinner />
                </div>
            ) : (
                <div className="py-4">
                    <div className="text-center">
                        <p className="text-capitalize fs-30px fw-bold lh-36px">
                            Verification
                        </p>
                        <p className="fs-16px mt-3 text-light fw-normald px-sm-5 px-0">
                            We have sent you an email.
                        </p>
                    </div>
                    <div className="col-12 col-sm-10 col-md-8 col-lg-6 mx-auto text-light mt-4">
                        <form action="form">
                            <div className="form-group mb-3">
                                <FormInput
                                    type="text"
                                    label="New Email"
                                    placeholder="Enter a new email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <FormInput
                                    type="text"
                                    label="Enter code"
                                    placeholder="Enter code"
                                    autoComplete='off'
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                />
                            </div>
                            <div className="mt-4 mb-3">
                                {error && (
                                    <span className="errorsapn">
                                        <div className="d-flex align-items-center gap-1">
                                            <div className="mt-1px">
                                                <FaExclamationCircle
                                                    className="align-middle"
                                                />{" "}
                                            </div>
                                            <div>{error}</div>
                                        </div>
                                    </span>
                                )}
                                <button
                                    type="submit"
                                    disabled={loadingConfirmation}
                                    className="btn btn-outline-light rounded-0 w-100 text-uppercase d-flex align-items-center justify-content-center py-2 mt-2"
                                    onClick={onConfirmEmailChange}
                                >
                                    <div
                                        className={`mt-auto ${
                                            loadingConfirmation
                                                ? "opacity-100"
                                                : "opacity-0"
                                        }`}
                                    >
                                        <CustomSpinner sm />
                                    </div>
                                    <div
                                        className={`fs-20px fw-bold ${
                                            loadingConfirmation
                                                ? "ms-3"
                                                : "pe-4"
                                        }`}
                                    >
                                        confirm
                                    </div>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Modal>
    );
}
