import React, { useState } from "react";
import useDeepCompareEffect from "use-deep-compare-effect";
import Loading from "../common/Loading";
import { ACCEPTED_IMAGE_FORMAT, useVerification } from "./verification-context";
import {
    NewDoc,
    VerifyIdStep5,
    ConsentPass,
    ConsentUnpass1,
    ConsentUnPass2,
} from "../../utilities/imgImport";
import AlarmModal, {
    showFailAlarm,
    showSuccessAlarm,
} from "../admin/AlarmModal";
import { useMutation } from "@apollo/client";
import { UPLOAD_CONSENT } from "./kyc-webservice";

export default function StepFive() {
    // Containers
    const verification = useVerification();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [uploading, setUploading] = useState(false);

    // Add the upload mutation
    const [uploadConsentMutation] = useMutation(UPLOAD_CONSENT, {
        onCompleted: (data) => {
            console.log("✅ Consent document uploaded successfully:", data);
            setUploading(false);
            showSuccessAlarm("Consent document uploaded successfully!");
            verification.nextStep();
        },
        onError: (error) => {
            console.error("❌ Consent document upload failed:", error);
            setUploading(false);
            showFailAlarm("Consent document upload failed", error.message);
        },
    });

    // Methods
    const handleFileUpload = (e) => {
        verification.consentProof.handleDragDropEvent(e);
        verification.consentProof.setFiles(e, "w");
    };

    useDeepCompareEffect(() => {
        const file = verification.consentProof.files[0];
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
    }, [verification.consentProof.files]);

    // Add the upload handler for the Next button
    const handleNextClick = async () => {
        const file = verification.consentProof.files[0];
        if (!file) {
            showFailAlarm("Please upload a consent document first");
            return;
        }

        if (error) {
            showFailAlarm("Please fix the file format error");
            return;
        }

        try {
            console.log(
                "🚀 Uploading consent document:",
                file.name,
                "Size:",
                file.size,
                "Type:",
                file.type,
            );
            setUploading(true);

            await uploadConsentMutation({
                variables: {
                    consent: file,
                },
            });
        } catch (error) {
            console.error("❌ Error in handleNextClick:", error);
            setUploading(false);
            showFailAlarm("Upload failed", error.message);
        }
    };

    // Render
    verification.shuftReferencePayload?.conStatus === true &&
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
                            step 3
                        </div>
                        <div className="text-light fs-14px fw-bold">
                            Consent verification
                        </div>
                    </div>
                    <img
                        className="d-sm-block d-none"
                        src={VerifyIdStep5}
                        onLoad={() => setLoading(false)}
                        alt="step indicator"
                    />
                </div>
                <div className="my-sm-5 verify-step1">
                    <div className="col-12 d-flex flex-sm-row flex-column gap-sm-5 gap-0">
                        <div className="col-md-6 col-12 mt-5 mt-sm-0">
                            <p>
                                Write the following text on a blank paper,{" "}
                                <br />
                                upload its photo along with your face.
                            </p>
                            <p className="my-3 fw-bold">
                                {verification.consentText}
                            </p>
                            <div className="requirements mt-0">
                                <p className="fs-14px">Photo requirements:</p>
                                <div className="d-flex align-items-center gap-2 ms-2 item">
                                    <div className="small-white-dot"></div>
                                    <p>
                                        Hold the written consent next to your
                                        face
                                    </p>
                                </div>
                                <div className="d-flex align-items-center gap-2 ms-2 item">
                                    <div className="small-white-dot"></div>
                                    <p>Upload the entire document clearly</p>
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
                                                verification.consentProof
                                                    .handleDragDropEvent
                                            }
                                            onDragOver={
                                                verification.consentProof
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
                                                {verification.consentProof
                                                    .files[0] ? (
                                                    <div className="mt-4">
                                                        <p className="upload-result">
                                                            {
                                                                verification
                                                                    .consentProof
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
                                        {verification.consentProof.files[0] ? (
                                            error ? (
                                                <div className="file-error">
                                                    <img
                                                        src={ConsentUnPass2}
                                                        className="me-2"
                                                        alt="error"
                                                    />
                                                    Not supported format
                                                </div>
                                            ) : (
                                                <div className="file-success">
                                                    <img
                                                        src={ConsentPass}
                                                        className="me-2"
                                                        alt="success"
                                                    />
                                                    Successfully attached
                                                </div>
                                            )
                                        ) : (
                                            <div className="file-unpass">
                                                <img
                                                    src={ConsentUnpass1}
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
                                !verification.consentProof.files[0] ||
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
