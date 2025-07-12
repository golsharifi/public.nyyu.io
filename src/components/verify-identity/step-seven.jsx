import React, { useEffect, useState } from "react";
import { useMutation } from "@apollo/client";
import { navigate } from "gatsby";
import { ROUTES } from "../../utilities/routes";
import { VerifyIdStep7 } from "../../utilities/imgImport";
import { SEND_VERIFY_REQUEST, INSERT_UPDATE_REFERENCE } from "./kyc-webservice";
import { useVerification } from "./verification-context";
import Loading from "../common/Loading";
import CustomSpinner from "../common/custom-spinner";

export default function StepSeven() {
    const verification = useVerification();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Use your backend mutations
    const [insertUpdateReference] = useMutation(INSERT_UPDATE_REFERENCE);
    const [sendVerifyRequestMutation] = useMutation(SEND_VERIFY_REQUEST);

    const sendVerificationRequest = async () => {
        try {
            console.log("🚀 Starting document verification...");
            verification.setSubmitting(true);
            setError(null);

            // First, create/update the reference (keep this part)
            await insertUpdateReference({
                variables: {
                    reference: `verification-${Date.now()}`,
                },
            });

            console.log(
                "✅ Reference created, now sending verification request...",
            );

            // Now use your backend mutation instead of direct Shufti Pro call
            const result = await sendVerifyRequestMutation({
                variables: {
                    country: verification.country?.value || "US",
                    fullAddr: verification.address || "Test Address",
                    firstName: verification.firstName || "Test",
                    middleName: "",
                    lastName: verification.surname || "User",
                },
            });

            console.log("✅ Verification request successful:", result.data);

            if (result.data?.sendVerifyRequest) {
                console.log(
                    "✅ Verification submitted with reference:",
                    result.data.sendVerifyRequest,
                );
                // Success message will be shown automatically
            } else {
                throw new Error(
                    "Verification request failed - no reference returned",
                );
            }
        } catch (error) {
            console.error("🚨 Verification error:", error);

            const errorMessage =
                error.graphQLErrors?.[0]?.message ||
                error.networkError?.message ||
                error.message ||
                "Unknown verification error";

            setError(errorMessage);
        } finally {
            verification.setSubmitting(false);
        }
    };

    useEffect(() => {
        // Check if already verified
        if (
            verification.shuftReferencePayload?.event ===
            "verification.accepted"
        ) {
            navigate(ROUTES.profile);
            return;
        }

        // Start verification process
        sendVerificationRequest();
    }, []);

    return (
        <>
            <div className={`${!loading && "d-none"}`}>
                <Loading />
            </div>
            <div
                className={`col-sm-12 col-11 mx-auto mt-3 mt-sm-0 ${loading && "d-none"}`}
            >
                <h4 className="text-center mt-5 mt-sm-2 mb-4">
                    Verify your identity
                </h4>
                <div className="text-center">
                    <img
                        className="d-sm-block d-none"
                        src={VerifyIdStep7}
                        onLoad={() => setLoading(false)}
                        alt="step indicator"
                    />
                </div>
                <div className="my-sm-5 py-sm-5 verify-step1">
                    {error ? (
                        <div className="text-center">
                            <p className="fs-16px fw-bold text-danger mb-3">
                                Verification Error
                            </p>
                            <p className="fs-14px text-light mb-4">{error}</p>
                            <button
                                onClick={sendVerificationRequest}
                                className="btn btn-warning rounded-0 px-3 py-2 text-uppercase fw-500 text-dark"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : (
                        <div className="text-center">
                            <p className="fs-25px fw-bold text-light d-sm-block d-none my-sm-0 my-5">
                                {verification.submitting
                                    ? "Processing document verification..."
                                    : "Thank you, your verification result will be sent to your email soon."}
                            </p>
                            <p className="fs-16px fw-bold text-light d-block d-sm-none">
                                {verification.submitting
                                    ? "Processing verification..."
                                    : "Thank you, your verification result will be sent to your email soon."}
                            </p>
                            <p className="fs-14px px-sm-2 px-4 mt-3">
                                As solely the data processor, Nyyu acknowledges
                                your right to request access, erasure, and
                                retention of your data.
                                <div className="d-sm-block d-none">
                                    <br />
                                </div>
                                Contact our Data Compliance Officer at{" "}
                                <span className="text-success">
                                    info@nyyu.io
                                </span>
                            </p>
                        </div>
                    )}

                    <div className="d-flex justify-content-center gap-3 mt-5 col-md-12">
                        <button
                            disabled={verification.submitting}
                            onClick={() => navigate(ROUTES.profile)}
                            className="btn btn-success rounded-0 px-3 py-2 text-uppercase fw-500 text-light col-md-6 col-12"
                        >
                            {verification.submitting ? (
                                <div className="d-flex align-items-center justify-content-center gap-2">
                                    <div>
                                        <CustomSpinner sm />
                                    </div>
                                    <div>processing</div>
                                </div>
                            ) : (
                                "Back to Profile"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
