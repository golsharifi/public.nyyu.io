import React, { useState } from "react";
import useDeepCompareEffect from "use-deep-compare-effect";
import Select from "react-select";
import Loading from "../common/Loading";
import AlarmModal, {
    showFailAlarm,
    showSuccessAlarm,
} from "../admin/AlarmModal";
import { useMutation } from "@apollo/client";

import { ACCEPTED_IMAGE_FORMAT, useVerification } from "./verification-context";
import { VerificationCountriesList } from "../../utilities/countries-list";
import { UPLOAD_DOCUMENT } from "./kyc-webservice";
import {
    NewDoc,
    Pass,
    Unpass1,
    Unpass2,
    VerifyIdStep1,
} from "../../utilities/imgImport";
import { VerificationDocumentTypes } from "../../utilities/staticData";

export default function StepOne() {
    // Containers
    const verification = useVerification();
    const [loading, setLoading] = useState(true);
    const [docType, setDocType] = useState(VerificationDocumentTypes[0]);
    const [error, setError] = useState("");
    const [uploading, setUploading] = useState(false);

    // Add this debug logging to see what's happening
    console.log("🔍 DEBUG - Step One:", {
        currentStep: verification.step,
        shuftReferencePayload: verification.shuftReferencePayload,
        docStatus: verification.shuftReferencePayload?.docStatus,
        addrStatus: verification.shuftReferencePayload?.addrStatus,
        conStatus: verification.shuftReferencePayload?.conStatus,
        selfieStatus: verification.shuftReferencePayload?.selfieStatus,
    });

    // Add the upload mutation
    const [uploadDocumentMutation] = useMutation(UPLOAD_DOCUMENT, {
        onCompleted: (data) => {
            console.log("✅ Document uploaded successfully:", data);
            setUploading(false);
            // showSuccessAlarm("Document uploaded successfully!");

            // Move to next step immediately after successful upload
            console.log("🔄 Moving to next step...");
            verification.nextStep();
        },
        onError: (error) => {
            console.error("❌ Document upload failed:", error);
            setUploading(false);
            showFailAlarm("Document upload failed", error.message);
        },
    });

    // Methods
    const handleFileUpload = (e) => {
        verification.documentProof.handleDragDropEvent(e);
        verification.documentProof.setFiles(e, "w");
    };

    useDeepCompareEffect(() => {
        const file = verification.documentProof.files[0];
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
    }, [verification.documentProof.files]);

    const onDocTypeSelected = (e) => {
        setDocType(e);
        verification.setUsedDocType(e.value);
    };

    // Add the upload handler for the Next button
    const handleNextClick = async () => {
        const file = verification.documentProof.files[0];
        if (!file) {
            showFailAlarm("Please upload a document first");
            return;
        }

        if (error) {
            showFailAlarm("Please fix the file format error");
            return;
        }

        try {
            console.log(
                "🚀 Uploading document:",
                file.name,
                "Size:",
                file.size,
                "Type:",
                file.type,
            );
            setUploading(true);

            // Use the actual File object directly
            await uploadDocumentMutation({
                variables: {
                    document: file,
                },
            });
        } catch (error) {
            console.error("❌ Upload failed:", error);
            setUploading(false);
            showFailAlarm("Upload failed", error.message);
        }
    };

    return (
        <>
            <AlarmModal />
            <div className={`${!loading && "d-none"}`}>
                <Loading />
            </div>
            <div
                className={`col-sm-12 col-10 mx-auto mt-3 mt-sm-0 ${
                    loading && "d-none"
                }`}
            >
                <h4 className="text-center  mt-5 mt-sm-2 mb-4">
                    Verify your identity
                </h4>
                <div className="text-center">
                    <div className="d-block d-sm-none">
                        <div className="txt-green text-uppercase fw-bold fs-18px mb-3">
                            step 1
                        </div>
                        <div className="text-light fs-14px">
                            Identity document
                        </div>
                    </div>
                    <img
                        className="d-sm-block d-none"
                        src={VerifyIdStep1}
                        onLoad={() => setLoading(false)}
                        alt="step indicator"
                    />
                </div>
                <div className="my-sm-5 verify-step1">
                    <div className="col-12 d-flex flex-sm-row flex-column gap-sm-5 gap-0">
                        <div className="col-md-6 col-12">
                            <p className="form-label mt-4">Document type</p>
                            <Select
                                options={VerificationDocumentTypes}
                                value={docType}
                                onChange={(v) => onDocTypeSelected(v)}
                                placeholder="Document type"
                            />
                            <p className="form-label mt-4">Issuing country</p>
                            <Select
                                options={VerificationCountriesList}
                                value={verification.country}
                                onChange={(v) => verification.setCountry(v)}
                                placeholder="Choose country"
                            />
                            <div className="requirements">
                                <p className="fs-14px">Photo requirements:</p>
                                <div className="d-flex align-items-center gap-2 ms-2 item">
                                    <div className="small-white-dot" />
                                    <p>Upload the entire document clearly</p>
                                </div>
                                <div className="d-flex align-items-center gap-2 ms-2 item">
                                    <div className="small-white-dot" />
                                    <p>Do not fold the document</p>
                                </div>
                                <div className="d-flex align-items-center gap-2 ms-2 item">
                                    <div className="small-white-dot" />
                                    <p>No image from another image or device</p>
                                </div>
                                <div className="d-flex align-items-center gap-2 ms-2 item">
                                    <div className="small-white-dot" />
                                    <p>No paper-based document</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 col-12">
                            <div className="my-0 mt-lg-4">
                                <div className="upload-doc">
                                    <div
                                        className="my-5 mb-sm-3 mt-sm-0"
                                        id="file-upload-wrapper"
                                    >
                                        <label
                                            htmlFor="file-upload-input"
                                            className="file-upload cursor-pointer"
                                            onDragEnter={
                                                verification.documentProof
                                                    .handleDragDropEvent
                                            }
                                            onDragOver={
                                                verification.documentProof
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
                                                {verification.documentProof
                                                    .files[0] ? (
                                                    <>
                                                        <p className="mt-30px text-center">
                                                            {
                                                                verification
                                                                    .documentProof
                                                                    .files[0]
                                                                    .name
                                                            }{" "}
                                                            <span className="txt-green fw-normal">
                                                                selected
                                                            </span>
                                                        </p>
                                                        {error ===
                                                            "Not_supported" && (
                                                            <p className="text-center">
                                                                <small
                                                                    style={{
                                                                        color: "red",
                                                                    }}
                                                                >
                                                                    PDF, PNG, or
                                                                    JPG file
                                                                    formats only
                                                                </small>
                                                            </p>
                                                        )}
                                                    </>
                                                ) : (
                                                    <>
                                                        <p className="file-browse">
                                                            Drag & drop files
                                                            here or{" "}
                                                            <span className="fw-normal">
                                                                browse
                                                            </span>
                                                        </p>
                                                        <p className="text-center">
                                                            <small>
                                                                PDF, PNG, or JPG
                                                                file formats
                                                                only
                                                            </small>
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="upload-rule__img">
                                <img src={Pass} alt="pass" />
                                <img
                                    className="mx-3"
                                    src={Unpass1}
                                    alt="pass"
                                />
                                <img src={Unpass2} alt="pass" />
                            </div>
                        </div>
                    </div>

                    <div className="my-5 ">
                        <div className="d-flex justify-content-center gap-3 col-md-12">
                            <button
                                className="btn btn-outline-light rounded-0 py-2 text-uppercase fw-500 col-sm-3 col-6"
                                onClick={() => window.history.back()}
                            >
                                back
                            </button>
                            <button
                                disabled={
                                    verification.documentProof.files.length ===
                                        0 ||
                                    error ||
                                    uploading
                                }
                                className="btn btn-success rounded-0 py-2 text-uppercase fw-500 text-light col-sm-3 col-6"
                                onClick={handleNextClick}
                            >
                                {uploading ? "Uploading..." : "Next"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
