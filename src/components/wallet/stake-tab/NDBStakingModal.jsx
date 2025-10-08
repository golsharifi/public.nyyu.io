import React, { useState } from "react";
import { Icon } from "@iconify/react";
import Modal from "react-modal";
import NumberFormat from "../../../utilities/number";
import { Checkbox } from "@mui/material";
import { renderNumberFormat } from "../../../utilities/number";
import { NDB } from "../../../utilities/imgImport";
import CustomSpinner from "../../common/custom-spinner";

const label = { inputProps: { "aria-label": "Checkbox for agreement" } };

export default function NDBStakingModal({
    isModalOpen,
    setIsModalOpen,
    data = {},
}) {
    const [pending, setPending] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [stakingAmount, setStakingAmount] = useState("");

    const closeModal = () => setIsModalOpen(false);
    const handleSubmit = () => {};

    return (
        <Modal
            isOpen={isModalOpen}
            onRequestClose={closeModal}
            ariaHideApp={false}
            className="pwd-reset-modal"
            overlayClassName="pwd-modal__overlay"
        >
            <div className="pwd-modal__header">
                <div className="d-flex justify-content-center align-items-center">
                    <h4 className="font-bold">NDB Staking</h4>
                </div>
                <div
                    onClick={closeModal}
                    onKeyDown={closeModal}
                    role="button"
                    tabIndex="0"
                >
                    <Icon icon="ep:close-bold" />
                </div>
            </div>
            <form className="form" onSubmit={(e) => e.preventDefault()}>
                <div className="input">
                    <div className="black_input d-flex justify-content-between align-items-center ps-2">
                        <div>
                            <img
                                src={NDB}
                                alt="ndb coin"
                                style={{ width: 40 }}
                                className="m-2"
                            />
                            <NumberFormat
                                className="border-0 bg-transparent text-white"
                                value={stakingAmount}
                                thousandSeparator={true}
                                onValueChange={(values) => {
                                    setStakingAmount(values.value);
                                }}
                                allowNegative={false}
                                decimalScale={8}
                                placeholder="Enter the amount"
                            />
                        </div>
                        <p
                            className="btn"
                            aria-hidden="true"
                            onClick={() => {
                                // setStakingAmount(roundNumber())
                            }}
                        >
                            <span className="txt-green">MAX</span>
                        </p>
                    </div>
                    <div className="my-3">
                        <h5 className="text-white">Locked amount limitation</h5>
                        <div className="d-flex justify-content-between">
                            <p className="fs-14px">Minimum</p>
                            <p>{renderNumberFormat(1, "NDB")}</p>
                        </div>
                        <div className="d-flex justify-content-between">
                            <p className="fs-14px">Maximum</p>
                            <p>{renderNumberFormat(8, "NDB")}</p>
                        </div>
                    </div>
                    <hr className="txt-grey my-2" />
                    <div className="my-3">
                        <h5 className="text-white">Summary</h5>
                        <div className="d-flex justify-content-between">
                            <p className="fs-14px">Interest period</p>
                            <p>1 day</p>
                        </div>
                        <div className="d-flex justify-content-between">
                            <p className="fs-14px">Redemption period</p>
                            <p>1 day</p>
                        </div>
                        <div className="d-flex justify-content-between">
                            <p className="fs-14px">Est. APY</p>
                            <p>{renderNumberFormat(5.23, "%")}</p>
                        </div>
                    </div>
                    <hr className="txt-grey my-2" />
                    <div className="d-flex align-items-center my-3">
                        <Checkbox
                            {...label}
                            color="success"
                            id="agree_for_ndb_saving"
                            value={agreed}
                            onChange={(e) => setAgreed(e.target.checked)}
                            sx={{
                                color: "#23c865",
                                "&.Mui-checked": {
                                    color: "#23c865",
                                },
                                padding: 0,
                            }}
                        />
                        <label
                            htmlFor="agree_for_ndb_saving"
                            className="fs-13px ms-2"
                        >
                            I have read and agree to ndb savings service
                            agreement
                        </label>
                    </div>
                    <button
                        className="btn btn-outline-light w-100 rounded-0 fw-bold text-uppercase my-4"
                        style={{ height: 47 }}
                        onClick={handleSubmit}
                        disabled={pending || !agreed}
                    >
                        {pending ? <CustomSpinner /> : "Stake"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
