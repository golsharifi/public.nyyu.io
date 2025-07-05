import React from "react";
import { useState } from "react";
import Modal from "react-modal";

import CustomSpinner from "../common/custom-spinner";
import { CloseIcon } from "../../utilities/imgImport";

export default function UnlockAccountModal({ isOpen, setIsOpen }) {
    const [loading] = useState(false);
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
            <div className="my-5">
                <div className="col-12 col-sm-10 col-md-8 mx-auto text-light my-5">
                    <div className="text-center">
                        <p className="text-capitalize fs-30px fw-bold lh-30px">
                            reactivate account
                        </p>
                        <p className="fs-16px text-light fw-normald mt-5">
                            For security purposes, please update your password
                            and ensure that your email, phone verification or
                            Google Authenticator can only be accessed by you.
                            The process may take up to 3 business days . Please
                            remain patient while the information is being
                            reviewed.
                        </p>
                    </div>

                    <form>
                        <div className="my-5 col-md-9 mx-auto">
                            <button
                                type="submit"
                                className="btn-primary w-100 text-uppercase d-flex align-items-center justify-content-center py-2"
                                disabled={loading}
                                // onClick={signUserIn}
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
                                    reactivate
                                </div>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Modal>
    );
}
