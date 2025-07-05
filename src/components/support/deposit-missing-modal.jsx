import React from "react";
import { useState } from "react";
import Modal from "react-modal";

import CustomSpinner from "../common/custom-spinner";
import { FormInput } from "../common/FormControl";
import { FaExclamationCircle } from "@react-icons/all-files/fa/FaExclamationCircle";
import { CloseIcon } from "../../utilities/imgImport";
import { useMutation } from "@apollo/client";
import * as Mutation from '../../apollo/graphqls/mutations/Support';
import { showSuccessAlarm } from "../admin/AlarmModal";

export default function DepositMissingModal({ isOpen, setIsOpen }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // payload
    const [ payload, setPayload ] = useState({});

    const [unknownMemoRecovery] = useMutation(
        Mutation.UNKNOWN_MEMO_RECOVERY, {
            onCompleted: data => {
                if(data.unknownMemoRecovery === 'Success') {
                    showSuccessAlarm('Your request has been sent.');
                    setIsOpen(false);
                } else {
                    setError('Cannot send your request.');
                }
                setLoading(false);
            },
            onError: err => {
                setError(err.message);
                setLoading(false);
            }
        }
    )

    const handleSubmit = () => {
        setLoading(true);
        unknownMemoRecovery({
            variables: {
                ...payload,
                depositAmount: Number(payload.depositAmount),
                receiverAddr: ''
            }
        })
    }

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
                <div className="text-center">
                    <p className="text-capitalize fs-30px fw-bold lh-36px">
                        unkown memo/tag recovery
                    </p>
                    <p className="fs-16px mt-2 text-light fw-normald">
                        Please fill in the application form and we will assist
                        you in retrieving your assets
                    </p>
                </div>
                <div className="col-12 col-sm-10 col-md-8 col-lg-6 mx-auto text-light mt-5">
                    <form action="form">
                        <div className="form-group">
                            <FormInput
                                type="text"
                                label="Coin"
                                placeholder="Choose your deposit coin"
                                value={payload.coin || ""}
                                onChange={e => {
                                    setPayload({...payload, coin: e.target.value})
                                }}
                            />
                        </div>
                        <div className="form-group">
                            <FormInput
                                type="text"
                                label="Deposit Amount"
                                placeholder="Input your deposit amount"
                                value={payload.depositAmount || ''}
                                onChange={e => {
                                    setPayload({...payload, depositAmount: e.target.value})
                                }}
                            />
                        </div>
                        <div className="form-group">
                            <FormInput
                                type="text"
                                label="TxID/TxHash"
                                placeholder="Enter your TxID/TxHash"
                                value={payload.txId || ''}
                                onChange={e => {
                                    setPayload({...payload, txId: e.target.value})
                                }}
                            />
                            <div className="fst-italic fw-normal text-light fs-12px my-3">
                                Please note that in order to maximize the
                                security of your assets, they will be returned
                                to the source address once retrieved.
                            </div>
                        </div>
                        <div className="mt-4 mb-3">
                            {error && (
                                <span className="errorsapn">
                                    <FaExclamationCircle />{" "}
                                    {error}
                                </span>
                            )}
                            <button
                                type="submit"
                                className="btn-primary w-100 text-uppercase d-flex align-items-center justify-content-center py-2"
                                disabled={loading}
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
                                    submit
                                </div>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Modal>
    );
}
