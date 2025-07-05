import React from "react";
import { useState } from "react";
import Select from "react-select";
import dayjs from "../../utilities/dayjs-config";
import { VerifyIdStep2 } from "../../utilities/imgImport";
import Loading from "../common/Loading";
import { useVerification } from "./verification-context";
import TextField from "@mui/material/TextField";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";

const GENDER_LIST = [
    { label: "Female", value: "F" },
    { label: "Male", value: "M" },
];

export default function StepTwo() {
    // Containers
    const verification = useVerification();
    const [firstNameError, setFirstNameError] = useState("");
    const [surnameError, setSurnameError] = useState("");
    const [dateError, setDateError] = useState("");
    const [loading, setLoading] = useState(true);

    const onNextButtonClick = (e) => {
        e.preventDefault();
        setFirstNameError("");
        setSurnameError("");
        setDateError("");
        let error = false;

        if (!verification.firstName) {
            error = true;
            setFirstNameError("Please fill out the first name field");
        }
        if (!verification.surname) {
            error = true;
            setSurnameError("Please fill out the surname field");
        }
        if (!verification.dob) {
            error = true;
            setDateError("Please fill out the date of birth field");
        }
        if (!verification.expiryDate) {
            error = true;
            setDateError("Please fill out the date of expiry field");
        }
        if (!error) return verification.nextStep();
    };

    // Render
    if (verification.shuftReferencePayload?.docStatus === "SUCCESS") {
        return (
            <div className="step-2">
                <img
                    src={VerifyIdStep2}
                    alt="verify-step-2"
                    onLoad={() => setLoading(false)}
                />
                <Loading loading={loading} />
                <div className="input_div">
                    <div className="row">
                        <div className="col-md-6">
                            <p className="form-label">First Name</p>
                            <input
                                className="white_input"
                                type="text"
                                value={verification.firstName}
                                onChange={(e) =>
                                    verification.setFirstName(e.target.value)
                                }
                                placeholder="Enter first name"
                            />
                            <div className="text-danger mt-2 fs-12px">
                                {firstNameError}
                            </div>
                        </div>
                        <div className="col-md-6">
                            <p className="form-label">Surname</p>
                            <input
                                className="white_input"
                                type="text"
                                value={verification.surname}
                                onChange={(e) =>
                                    verification.setSurname(e.target.value)
                                }
                                placeholder="Enter surname"
                            />
                            <div className="text-danger mt-2 fs-12px">
                                {surnameError}
                            </div>
                        </div>
                        {/* Gender selection - commented out as in original
                        <div className="col-md-6">
                            <p className="form-label">Gender</p>
                            <Select
                                value={verification.gender}
                                onChange={verification.setGender}
                                options={GENDER_LIST}
                                placeholder="Select gender"
                            />
                            <div className="text-danger mt-2 fs-12px">
                                {genderError}
                            </div>
                        </div> */}
                    </div>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <div>
                            <p className="form-label mt-4">Date of Birth</p>
                            <MobileDatePicker
                                showTodayButton
                                value={
                                    verification.dob
                                        ? dayjs(verification.dob)
                                        : null
                                }
                                onChange={(newValue) => {
                                    if (newValue && dayjs(newValue).isValid()) {
                                        verification.setDob(
                                            newValue.toLocaleDateString(
                                                "fr-CA",
                                            ),
                                        );
                                    }
                                }}
                                renderInput={(params) => (
                                    <TextField {...params} />
                                )}
                            />
                            <div className="text-danger mt-2 fs-12px">
                                {dateError}
                            </div>
                        </div>
                        <div>
                            <p className="form-label mt-4">Expiry Date</p>
                            <MobileDatePicker
                                showTodayButton
                                value={
                                    verification.expiryDate
                                        ? dayjs(verification.expiryDate)
                                        : null
                                }
                                onChange={(newValue) => {
                                    if (newValue && dayjs(newValue).isValid()) {
                                        verification.setExpiryDate(
                                            newValue.toLocaleDateString(
                                                "fr-CA",
                                            ),
                                        );
                                    }
                                }}
                                renderInput={(params) => (
                                    <TextField {...params} />
                                )}
                            />
                            <div className="text-danger mt-2 fs-12px">
                                {dateError}
                            </div>
                        </div>
                    </LocalizationProvider>
                </div>
                <div className="btn_div">
                    <button
                        className="btn white"
                        onClick={verification.previousStep}
                    >
                        Previous
                    </button>
                    <button className="btn blue" onClick={onNextButtonClick}>
                        Next
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="step-2">
            <div className="loading-state">
                <p>Processing document verification...</p>
                <Loading loading={true} />
            </div>
        </div>
    );
}
