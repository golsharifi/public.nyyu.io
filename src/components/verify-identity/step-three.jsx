import Select from "react-select";
import React, { useState, useEffect } from "react";
import useDeepCompareEffect from "use-deep-compare-effect";
import AlarmModal, {
    showFailAlarm,
    showSuccessAlarm,
} from "../admin/AlarmModal";
import { useMutation } from "@apollo/client";
import {
    NewDoc,
    Pass,
    Unpass1,
    Unpass2,
    VerifyIdStep3,
} from "../../utilities/imgImport";
import Loading from "../common/Loading";
import { VerificationCountriesList } from "../../utilities/countries-list";
import { VerificationStepThreeDocumentTypes } from "../../utilities/staticData";
import { ACCEPTED_IMAGE_FORMAT, useVerification } from "./verification-context";
import { UPLOAD_ADDRESS } from "./kyc-webservice";

export default function StepThree() {
    // Containers
    const verification = useVerification();
    const [loading, setLoading] = useState(true);
    const [docTypes, setDocTypes] = useState([]);
    const [docType, setDocType] = useState([]);
    const [error, setError] = useState("");
    const [uploading, setUploading] = useState(false);

    // Add the upload mutation
    const [uploadAddressMutation] = useMutation(UPLOAD_ADDRESS, {
        onCompleted: (data) => {
            console.log("✅ Address document uploaded successfully:", data);
            setUploading(false);
            showSuccessAlarm("Address document uploaded successfully!");
            verification.nextStep();
        },
        onError: (error) => {
            console.error("❌ Address document upload failed:", error);
            setUploading(false);
            showFailAlarm("Address document upload failed", error.message);
        },
    });

    // Methods
    const handleFileUpload = (e) => {
        verification.addressProof.handleDragDropEvent(e);
        verification.addressProof.setFiles(e, "w");
    };

    useEffect(() => {
        // filter already used document
        const filteredDocTypes = VerificationStepThreeDocumentTypes.filter(
            (elem) => {
                return elem.value !== verification.usedDocType;
            },
        );
        setDocTypes(filteredDocTypes);
        setDocType(filteredDocTypes[0]);
    }, [verification.usedDocType]);

    useDeepCompareEffect(() => {
        const file = verification.addressProof.files[0];
        const extension = file?.type;
        if (!file) {
            return;
        } else if (!ACCEPTED_IMAGE_FORMAT.includes(extension)) {
            setError("Not_supported");
            showFailAlarm(
                "Wrong file format",
                "You can only upload PNG, JPG, JPEG or PDF",
            );
        } else {
            setError("");
        }
    }, [verification.addressProof.files]);

    // Add the upload handler for the Next button
    const handleNextClick = async () => {
        const file = verification.addressProof.files[0];
        if (!file) {
            showFailAlarm("Please upload an address document first");
            return;
        }

        if (error) {
            showFailAlarm("Please fix the file format error");
            return;
        }

        try {
            console.log(
                "🚀 Uploading address document:",
                file.name,
                "Size:",
                file.size,
                "Type:",
                file.type,
            );
            setUploading(true);

            await uploadAddressMutation({
                variables: {
                    document: file,
                },
            });
        } catch (error) {
            console.error("❌ Error in handleNextClick:", error);
            setUploading(false);
            showFailAlarm("Upload failed", error.message);
        }
    };

    // Render
    verification.shuftReferencePayload?.addrStatus === true &&
        verification.nextStep();
    return (
        <>
            <div className={`${!loading && "d-none"}`}>
                <Loading />
            </div>
            <div
                className={`col-sm-12 col-10 mx-auto mt-3 mt-sm-0 ${loading && "d-none"}`}
            >
                <h4 className="text-center  mt-5 mt-sm-2 mb-4">
                    Verify your identity
                </h4>
                <div className="text-center">
                    <div className="d-block d-sm-none">
                        <div className="txt-green text-uppercase fw-bold fs-18px mb-3">
                            step 2
                        </div>
                        <div className="text-light fs-14px fw-bold">
                            Address verification
                        </div>
                        <div className="text-light fs-12px">
                            Upload a document proving your residence
                        </div>
                    </div>
                    <img
                        className="d-sm-block d-none"
                        src={VerifyIdStep3}
                        onLoad={() => setLoading(false)}
                        alt="step indicator"
                    />
                </div>
                <div className="my-sm-5 verify-step1">
                    <div className="col-12 d-flex flex-sm-row flex-column gap-sm-5 gap-0">
                        <div className="col-md-6 col-12 mt-5 mt-sm-0">
                            <p>
                                Upload a document that confirms your address
                                information.
                            </p>
                            <p className="my-3 form-label">
                                Address Document Type
                            </p>
                            <Select
                                className="react-select"
                                classNamePrefix="react-select"
                                value={docType}
                                options={docTypes}
                                onChange={(e) => setDocType(e)}
                            />
                            <div className="requirements mt-3">
                                <p className="fs-14px">
                                    Document requirements:
                                </p>
                                <div className="d-flex align-items-center gap-2 ms-2 item">
                                    <div className="small-white-dot"></div>
                                    <p>Must clearly show your full address</p>
                                </div>
                                <div className="d-flex align-items-center gap-2 ms-2 item">
                                    <div className="small-white-dot"></div>
                                    <p>
                                        Document must be recent (within 3
                                        months)
                                    </p>
                                </div>
                                <div className="d-flex align-items-center gap-2 ms-2 item">
                                    <div className="small-white-dot"></div>
                                    <p>All corners and edges must be visible</p>
                                </div>
                                <div className="d-flex align-items-center gap-2 ms-2 item">
                                    <div className="small-white-dot"></div>
                                    <p>No image from another image or device</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 col-12">
                            <div className="my-0">
                                <div className="upload-doc">
                                    <div
                                        className="my-5 mb-sm-3 mt-sm-0"
                                        id="file-upload-wrapper"
                                    >
                                        <label
                                            htmlFor="file-upload-input"
                                            className="file-upload cursor-pointer"
                                            onDragEnter={
                                                verification.addressProof
                                                    .handleDragDropEvent
                                            }
                                            onDragOver={
                                                verification.addressProof
                                                    .handleDragDropEvent
                                            }
                                            onDrop={handleFileUpload}
                                        >
                                            <input
                                                type="file"
                                                id="file-upload-input"
                                                className="d-none"
                                                accept=".png, .jpg, .jpeg, .pdf"
                                                onChange={handleFileUpload}
                                            />
                                            <div className="py-3 px-0">
                                                <div className="new-doc mx-auto">
                                                    <img
                                                        src={NewDoc}
                                                        className="w-50"
                                                        alt="new doc"
                                                    />
                                                </div>
                                                {verification.addressProof
                                                    .files[0] ? (
                                                    <div className="mt-4">
                                                        <p className="upload-result">
                                                            {
                                                                verification
                                                                    .addressProof
                                                                    .files[0]
                                                                    .name
                                                            }
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="mt-4">
                                                        <p className="upload-text-1">
                                                            Choose file
                                                        </p>
                                                        <p className="upload-text-2">
                                                            or drag it here
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </label>
                                    </div>
                                    <div className="file-success-wrapper py-2">
                                        {verification.addressProof.files[0] ? (
                                            error ? (
                                                <div className="file-error">
                                                    <img
                                                        src={Unpass2}
                                                        className="me-2"
                                                        alt="error"
                                                    />
                                                    Not supported format
                                                </div>
                                            ) : (
                                                <div className="file-success">
                                                    <img
                                                        src={Pass}
                                                        className="me-2"
                                                        alt="success"
                                                    />
                                                    Successfully attached
                                                </div>
                                            )
                                        ) : (
                                            <div className="file-unpass">
                                                <img
                                                    src={Unpass1}
                                                    className="me-2"
                                                    alt="upload required"
                                                />
                                                You need to upload
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="d-flex justify-content-center gap-2 mt-5 col-md-12">
                        <button
                            className="btn btn-outline-light rounded-0 px-3 py-2 text-uppercase fw-500 col-sm-3 col-6"
                            onClick={() => window.history.back()}
                        >
                            back
                        </button>
                        <button
                            className="btn btn-success rounded-0 px-3 py-2 text-uppercase fw-500 text-light col-sm-3 col-6"
                            onClick={handleNextClick}
                            disabled={
                                uploading ||
                                !verification.addressProof.files[0] ||
                                error
                            }
                        >
                            {uploading ? "Uploading..." : "Next"}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
