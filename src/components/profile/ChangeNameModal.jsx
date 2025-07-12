import { useMutation, useQuery } from "@apollo/client";
import { FaExclamationCircle } from "@react-icons/all-files/fa/FaExclamationCircle";
import React from "react";
import { useState } from "react";
import { isBrowser } from "react-device-detect";
import Modal from "react-modal";
import NumberFormat from "../../utilities/number";
import { CloseIcon } from "../../utilities/imgImport";
import CustomSpinner from "../common/custom-spinner";
import { FormInput } from "../common/FormControl";
import { CHANGE_BUY_NAME, GET_ALL_BUY_NAME_PRICES } from "./profile-queries";
import Successful from "./Successful";

export default function ChangeNameModal({ isOpen, setIsOpen }) {
    // Containers
    const [loading, setLoading] = useState(true);
    const [confirmationLoading, setConfirmationLoading] = useState(false);
    const [error, setError] = useState("");
    const [newName, setNewName] = useState("");
    const [successful, setSuccessful] = useState(false);
    const [allBuyNamePrices, setAllBuyNamePrices] = useState(null);
    const [cost, setCost] = useState(0.0);
    const ndbPriceUSD = 0.01;

    // Webserver
    const [changeBuyName] = useMutation(CHANGE_BUY_NAME, {
        onCompleted: (data) => {
            if (data.changeBuyName === "1") setSuccessful(true);
            setConfirmationLoading(false);
        },
        onError: (error) => {
            setError(error.message);
            setConfirmationLoading(false);
        },
    });

    useQuery(GET_ALL_BUY_NAME_PRICES, {
        onCompleted: (data) => {
            setAllBuyNamePrices(data.getAllBuyNamePrices);
            setLoading(false);
        },
        onError: (error) => {
            setAllBuyNamePrices([]);
            setLoading(false);
            console.log(error);
        },
    });

    // Methods
    const containsSpecialCharacter = (text) => {
        const format = /[ `!@#$%^&*()_+\-=\]{};':"\\|,.<>?~]/;
        return format.test(text);
    };

    const onNewNameChange = (e) => {
        const { value } = e.target;
        setNewName(value);
        if (value.length !== 0) {
            if (value.length > 10) {
                const fooCost =
                    allBuyNamePrices[allBuyNamePrices.length - 1]?.price;
                if (fooCost) return setCost(fooCost);
            }

            const matchedPriceNameItems = allBuyNamePrices.filter(
                (item) => item.numOfChars === value.length,
            );
            if (matchedPriceNameItems && matchedPriceNameItems?.length) {
                const fooCost = matchedPriceNameItems[0].price;
                if (fooCost) return setCost(fooCost);
            }
        }
        return setCost(0.0);
    };
    const submitNameChange = (e) => {
        e.preventDefault();
        setError("");
        if (!newName) return setError("New name cannot be empty");
        if (containsSpecialCharacter(newName))
            return setError("Cannot include special characters");

        setConfirmationLoading(true);
        changeBuyName({
            variables: {
                newName: newName,
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
                        title="Name Changed Successfully"
                        callback={() =>
                            isBrowser && window.location.reload(false)
                        }
                    />
                </div>
            ) : loading ? (
                <div className="text-center mx-auto my-5 py-5">
                    <CustomSpinner />
                </div>
            ) : (
                <div className="py-4">
                    <div className="text-center">
                        <p className="text-capitalize fs-30px fw-bold lh-36px">
                            Name change
                        </p>
                        <p className="fs-16px mt-3 text-light fw-normald px-sm-5 px-0">
                            Name change will cost NDB coins, and it will be
                            drawn from your wallet
                        </p>
                    </div>
                    <div className="col-12 col-sm-10 col-md-8 col-lg-6 mx-auto text-light mt-4">
                        <form action="form">
                            <div className="form-group">
                                <FormInput
                                    type="text"
                                    label="New Name"
                                    value={newName}
                                    onChange={onNewNameChange}
                                    placeholder="Enter a new name"
                                />
                            </div>
                            <div className="text-end">
                                Price:
                                <NumberFormat
                                    className="text-success fw-bold px-1"
                                    thousandSeparator={true}
                                    value={cost / ndbPriceUSD}
                                    displayType="text"
                                />
                                NDB
                            </div>

                            <div className="mb-3 mt-4">
                                {error && (
                                    <span className="errorsapn">
                                        <FaExclamationCircle /> {error}
                                    </span>
                                )}
                                <button
                                    type="submit"
                                    className="btn btn-outline-light rounded-0 w-100 text-uppercase d-flex align-items-end justify-content-center py-2 mt-1"
                                    onClick={submitNameChange}
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
