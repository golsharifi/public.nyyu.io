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

    // Add debug logging for step two
    console.log("🔍 DEBUG - Step Two:", {
        currentStep: verification.step,
        docStatus: verification.shuftReferencePayload?.docStatus,
        canRender:
            verification.shuftReferencePayload?.docStatus === "SUCCESS" ||
            verification.step === 1,
    });

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

    // Updated render condition: allow rendering if we're at step 1 OR if docStatus is SUCCESS
    // This fixes the issue where step 2 wouldn't render after document upload
    if (
        verification.shuftReferencePayload?.docStatus === "SUCCESS" ||
        verification.step === 1
    ) {
        return (
            <>
                <div className={`${!loading && "d-none"}`}>
                    <Loading />
                </div>
                <div
                    className={`col-sm-12 col-10 mx-auto mt-3 mt-sm-0 ${loading && "d-none"}`}
                >
                    <h4 className="text-center mt-5 mt-sm-2 mb-4">
                        Verify your identity
                    </h4>
                    <div className="text-center">
                        <div className="d-block d-sm-none">
                            <div className="txt-green text-uppercase fw-bold fs-18px mb-3">
                                step 2
                            </div>
                            <div className="text-light fs-14px">
                                Personal Information
                            </div>
                        </div>
                        <img
                            className="d-sm-block d-none"
                            src={VerifyIdStep2}
                            onLoad={() => setLoading(false)}
                            alt="step indicator"
                        />
                    </div>
                    <div className="my-sm-5 verify-step2">
                        <div className="row">
                            <div className="col-md-6">
                                <p className="form-label mt-4">First Name</p>
                                <input
                                    className="form-control"
                                    type="text"
                                    value={verification.firstName}
                                    onChange={(e) =>
                                        verification.setFirstName(
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Enter first name"
                                />
                                <div className="text-danger mt-2 fs-12px">
                                    {firstNameError}
                                </div>
                            </div>
                            <div className="col-md-6">
                                <p className="form-label mt-4">Surname</p>
                                <input
                                    className="form-control"
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
                        </div>
                        <div className="row">
                            <div className="col-md-6">
                                <p className="form-label mt-4">
                                    Date of Birth (MM/DD/YYYY)
                                </p>
                                <LocalizationProvider
                                    dateAdapter={AdapterDayjs}
                                >
                                    <MobileDatePicker
                                        value={dayjs(verification.dob)}
                                        onChange={(newValue) =>
                                            verification.setDob(
                                                newValue?.valueOf(),
                                            )
                                        }
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                fullWidth
                                                className="form-control"
                                            />
                                        )}
                                    />
                                </LocalizationProvider>
                                <div className="text-danger mt-2 fs-12px">
                                    {dateError}
                                </div>
                            </div>
                            <div className="col-md-6">
                                <p className="form-label mt-4">Gender</p>
                                <Select
                                    options={GENDER_LIST}
                                    value={verification.gender}
                                    onChange={(v) => verification.setGender(v)}
                                    placeholder="Select gender"
                                />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-6">
                                <p className="form-label mt-4">
                                    Document Expiry (MM/DD/YYYY)
                                </p>
                                <LocalizationProvider
                                    dateAdapter={AdapterDayjs}
                                >
                                    <MobileDatePicker
                                        value={dayjs(verification.expiryDate)}
                                        onChange={(newValue) =>
                                            verification.setExpiryDate(
                                                newValue?.valueOf(),
                                            )
                                        }
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                fullWidth
                                                className="form-control"
                                            />
                                        )}
                                    />
                                </LocalizationProvider>
                                <div className="text-danger mt-2 fs-12px">
                                    {dateError}
                                </div>
                            </div>
                        </div>
                        <div className="d-flex justify-content-center gap-3 my-5 col-md-12">
                            <button
                                className="btn btn-outline-light rounded-0 px-5 py-2 text-uppercase fw-500 col-sm-3 col-6"
                                onClick={() => verification.previousStep()}
                            >
                                Previous
                            </button>
                            <button
                                className="btn btn-success rounded-0 px-5 py-2 text-uppercase fw-500 text-light col-sm-3 col-6"
                                onClick={onNextButtonClick}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // If neither condition is met, show loading or return null
    return <Loading />;
}
