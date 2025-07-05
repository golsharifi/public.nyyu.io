import Webcam from "react-webcam"
import Loading from "../common/Loading"
import React, { useRef, useState } from "react"
import CustomSpinner from "../common/custom-spinner"
import { useVerification } from "./verification-context"
import { SelfieImg, VerifyIdStep6 } from "../../utilities/imgImport"

export default function StepSix() {
    // Containers
    const verification = useVerification()
    const webcamRef = useRef(null)
    const [loading, setLoading] = useState(true)
    const [openWebcam, setOpenWebcam] = useState(false)

    // Methods
    const capture = async () => {
        const fooImage = webcamRef.current.getScreenshot();
        verification.faceProof.setSelfieImage(fooImage);
        return setOpenWebcam(false)
    }

    // Render
    verification.shuftReferencePayload?.selfieStatus === true && verification.nextStep()
    return (
        <>
            <div className={`${!loading && "d-none"}`}>
                <Loading />
            </div>
            <div className={`col-sm-12 col-11 mx-auto mt-3 mt-sm-0 ${loading && "d-none"}`}>
                <h4 className="text-center  mt-5 mt-sm-2 mb-4">Verify your identity</h4>
                <div className="text-center">
                    <div className="d-block d-sm-none">
                        <div className="txt-green text-uppercase fw-bold fs-18px mb-3">step 4</div>
                        <div className="text-light fs-14px fw-bold">Face verification</div>
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
                            Face the camera. Have good lighting and face the camera straight on.
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
                                alt="seflie"
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
                        ) : (
                            <button
                                className="btn btn-success rounded-0 px-3 py-2 text-uppercase fw-500 text-light col-sm-3 col-6"
                                onClick={() => {
                                    setOpenWebcam(true)
                                    verification.faceProof.setSelfieImage(null)
                                }}
                            >
                                {verification.faceProof.selfieImage ? "retake" : "open camera"}
                            </button>
                        )}
                        {verification.faceProof.selfieImage && !openWebcam && (
                            <button
                                disabled={verification.submitting}
                                className="btn btn-outline-light rounded-0 px-3 py-2 text-uppercase fw-500 col-sm-3 col-6"
                                onClick={() => verification.nextStep()}
                            >
                                {verification.submitting ? (
                                    <div className="mt-3px">
                                        <CustomSpinner />
                                    </div>
                                ) : (
                                    "next"
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
