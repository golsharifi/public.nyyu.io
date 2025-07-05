import React from "react";
import { useState } from "react";
import Modal from "react-modal";

import CustomSpinner from "../common/custom-spinner";
import { FaExclamationCircle } from "@react-icons/all-files/fa/FaExclamationCircle";
import { CloseIcon } from "../../utilities/imgImport";

export default function SubmitRequestModal({ isOpen, setIsOpen }) {
    const [loading] = useState(false);
    const [error] = useState("");
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
            <div className="mt-2">
                <div className="col-12 col-sm-10 mx-auto text-light mt-3">
                    <div className="form-group">
                        <textarea
                            placeholder="Type a message"
                            className="rounded-0 col-12 bg-transparent text-light border border-secondary fs-14px p-3"
                            rows={12}
                        ></textarea>
                    </div>
                </div>
                <div className="col-12 col-sm-10 col-md-8 col-lg-6 mx-auto text-light mt-3">
                    <form>
                        <div className="mt-4 mb-3">
                            {error && (
                                <span className="errorsapn">
                                    <FaExclamationCircle />{" "}
                                    {error}
                                </span>
                            )}
                            <button
                                type="submit"
                                className="btn btn-outline-light rounded-0 w-100 text-uppercase d-flex align-items-center justify-content-center py-1 fw-500"
                                disabled={loading}
                            >
                                <div
                                    className={`${
                                        loading ? "opacity-100" : "opacity-0"
                                    }`}
                                >
                                    <CustomSpinner />
                                </div>
                                <div
                                    className={`fs-14px ${
                                        loading ? "ms-3" : "pe-4"
                                    }`}
                                >
                                    submit a request
                                </div>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Modal>
    );
}
