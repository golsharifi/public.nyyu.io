import Webcam from "react-webcam";
import Loading from "../common/Loading";
import React, { useRef, useState } from "react";
import { useVerification } from "./verification-context";
import { SelfieImg, VerifyIdStep6 } from "../../utilities/imgImport";
import { useMutation } from "@apollo/client";
import { UPLOAD_SELFIE } from "./kyc-webservice";
import { showFailAlarm, showSuccessAlarm } from "../admin/AlarmModal";

export default function StepSix() {
    // Containers
    const verification = useVerification();
    const webcamRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [openWebcam, setOpenWebcam] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Add the upload mutation
    const [uploadSelfieMutation] = useMutation(UPLOAD_SELFIE, {
        onCompleted: (data) => {
            console.log("✅ Selfie uploaded successfully:", data);
            setUploading(false);
            showSuccessAlarm("Selfie uploaded successfully!");
            verification.nextStep();
        },
        onError: (error) => {
            console.error("❌ Selfie upload failed:", error);
            setUploading(false);
            showFailAlarm("Selfie upload failed", error.message);
        },
    });

    // Methods
    const capture = async () => {
        const fooImage = webcamRef.current.getScreenshot();
        verification.faceProof.setSelfieImage(fooImage);
        return setOpenWebcam(false);
    };

    // Convert base64 to File object
    const base64ToFile = (base64String, fileName) => {
        const arr = base64String.split(",");
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], fileName, { type: mime });
    };

    // Handle next click to upload selfie
    const handleNextClick = async () => {
        if (!verification.faceProof.selfieImage) {
            showFailAlarm("Please take a selfie first");
            return;
        }

        try {
            console.log("🚀 Uploading selfie...");
            setUploading(true);

            // Convert base64 to File
            const selfieFile = base64ToFile(
                verification.faceProof.selfieImage,
                "selfie.jpg",
            );

            await uploadSelfieMutation({
                variables: {
                    selfie: selfieFile,
                },
            });
        } catch (error) {
            console.error("❌ Error in handleNextClick:", error);
            setUploading(false);
            showFailAlarm("Upload failed", error.message);
        }
    };

    // Render
    verification.shuftReferencePayload?.selfieStatus === true &&
        verification.nextStep();
    return (
        <>
            <div className={`${!loading && "d-none"}`}>
                <Loading />
            </div>
            <div
                className={`col-sm-12 col-11 mx-auto mt-3 mt-sm-0 ${loading && "d-none"}`}
            >
                <h4 className="text-center  mt-5 mt-sm-2 mb-4">
                    Verify your identity
                </h4>
                <div className="text-center">
                    <div className="d-block d-sm-none">
                        <div className="txt-green text-uppercase fw-bold fs-18px mb-3">
                            step 4
                        </div>
                        <div className="text-light fs-14px fw-bold">
                            Face verification
                        </div>
                    </div>
                    <img
                        className="d-sm-block d-none"
                        src={VerifyIdStep6}
                        onLoad={() => setLoading(false)}
                        alt="step indicator"
                    />
                </div>
                <div className="my-sm-5 verify-step1">
                    <div className="text-center mt-3 mt-sm-0">
                        <p className="fs-16px">
                            Face the camera. Have good lighting and face the
                            camera straight on.
                        </p>
                        <p className="fs-16px">
                            Make sure your face is visible, including the ears.
                        </p>
                        {openWebcam ? (
                            <div className="mx-auto col-sm-8 col-12">
                                <Webcam
                                    audio={false}
                                    ref={webcamRef}
                                    screenshotFormat="image/jpeg"
                                    className="mt-4"
                                    style={{
                                        width: "100%",
                                        height: "auto",
                                    }}
                                />
                            </div>
                        ) : (
                            <img
                                className="selfie-img mt-4"
                                src={
                                    verification.faceProof.selfieImage
                                        ? verification.faceProof.selfieImage
                                        : SelfieImg
                                }
                                alt="selfie"
                            />
                        )}
                    </div>
                    <div className="d-flex justify-content-center gap-2 mt-5 col-md-12">
                        {!verification.faceProof.selfieImage && (
                            <button
                                className="btn btn-outline-light rounded-0 px-3 py-2 text-uppercase fw-500 col-sm-3 col-6"
                                onClick={() => window.history.back()}
                            >
                                back
                            </button>
                        )}
                        {openWebcam ? (
                            <button
                                className="btn btn-success rounded-0 px-3 py-2 text-uppercase fw-500 text-light col-sm-3 col-6"
                                onClick={capture}
                            >
                                take photo
                            </button>
                        ) : verification.faceProof.selfieImage ? (
                            <>
                                <button
                                    className="btn btn-outline-light rounded-0 px-3 py-2 text-uppercase fw-500 col-sm-3 col-6"
                                    onClick={() => {
                                        setOpenWebcam(true);
                                        verification.faceProof.setSelfieImage(
                                            null,
                                        );
                                    }}
                                >
                                    retake
                                </button>
                                <button
                                    className="btn btn-success rounded-0 px-3 py-2 text-uppercase fw-500 text-light col-sm-3 col-6"
                                    onClick={handleNextClick}
                                    disabled={uploading}
                                >
                                    {uploading ? "Uploading..." : "Next"}
                                </button>
                            </>
                        ) : (
                            <button
                                className="btn btn-success rounded-0 px-3 py-2 text-uppercase fw-500 text-light col-sm-3 col-6"
                                onClick={() => {
                                    setOpenWebcam(true);
                                    verification.faceProof.setSelfieImage(null);
                                }}
                            >
                                take selfie
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
