import { useMutation } from "@apollo/client";
import { FaExclamationCircle } from "@react-icons/all-files/fa/FaExclamationCircle";
import React, { useState } from "react";
import { isBrowser } from "react-device-detect";
import Modal from "react-modal";
import { CloseIcon } from "../../utilities/imgImport";
import CustomSpinner from "../common/custom-spinner";
import { FormInput } from "../common/FormControl";
import { ADD_DISCORD } from "./profile-queries";
import Successful from "./Successful";

export default function ChangeNameModal({ isOpen, setIsOpen, discordName = '' }) {
    // Containers
    const [confirmationLoading, setConfirmationLoading] = useState(false);
    const [error, setError] = useState("");
    const [newName, setNewName] = useState(discordName);
    const [successful, setSuccessful] = useState(false);

    // Webserver
    const [addDiscordMutation] = useMutation(ADD_DISCORD, {
        onCompleted: (data) => {
            if (data.addDiscord) {
                setSuccessful(true)
            } else {
                setError("Add_Discord_Failed");
            };
            setConfirmationLoading(false);
        },
        onError: (error) => {
            setError(error.message);
            setConfirmationLoading(false);
        },
    });

    // Methods
    const checkRegEx = (text) => {
        const format = /^.{2,32}#[0-9]{4}$/gm;
        return format.test(text);
    };

    const onNewNameChange = (e) => {
        const { value } = e.target;
        setNewName(value);
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");
        if (!newName) return setError("New name cannot be empty");
        if (!checkRegEx(newName))
            return setError("Please make sure you copy the full user name in the format \"Example#1234\"");

        setConfirmationLoading(true);
        addDiscordMutation({
            variables: {
                username: newName,
            },
        });
    };

    // Render
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={() => setIsOpen(false)}
            className="support-modal"
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

            {successful ? (
                <div className="my-5">
                    <Successful
                        title="Discord Username Changed Successfully"
                        callback={() =>
                            isBrowser && window.location.reload(false)
                        }
                    />
                </div>
            ) : (
                <div className="py-4">
                    <div className="text-center">
                        <p className="text-capitalize fs-30px fw-bold lh-36px">
                            Discord username change
                        </p>
                        <p className="fs-16px mt-3 text-light fw-normald px-sm-5 px-0">
                            This Discord user name will allow us to assign you a role on our Discord server with respect to your tier.
                        </p>
                    </div>
                    <div className="col-12 col-sm-10 col-md-8 col-lg-6 mx-auto text-light mt-4">
                        <form action="form">
                            <div className="form-group">
                                <FormInput
                                    type="text"
                                    label=""
                                    value={newName}
                                    onChange={onNewNameChange}
                                    placeholder="Enter a new Discord Username"
                                />
                            </div>

                            <div className="mb-3 mt-5">
                                {error && (
                                    <span className="errorsapn">
                                        <FaExclamationCircle />{" "}
                                        {error !== "Add_Discord_Failed"? error: (
                                            <span className="text-danger">
                                                This username seems to already be linked to an account.{" "}
                                                Please contact support on our <a className="text-underline" href="https://discord.gg/w8DvXCNbyU" target="_blank">Discord</a> to resolve the issue.
                                            </span>
                                        )}
                                    </span>
                                )}
                                <button
                                    type="submit"
                                    className="btn btn-outline-light rounded-0 w-100 text-uppercase d-flex align-items-end justify-content-center py-2 mt-1"
                                    onClick={handleSubmit}
                                    disabled={confirmationLoading}
                                >
                                    <div
                                        className={`${
                                            confirmationLoading
                                                ? "opacity-100"
                                                : "opacity-0"
                                        }`}
                                    >
                                        <CustomSpinner sm />
                                    </div>
                                    <div
                                        className={`fs-20px fw-bold ${
                                            confirmationLoading
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
