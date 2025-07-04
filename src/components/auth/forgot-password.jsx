import React from "react";
import { Link, navigate } from "gatsby";
import { FormInput } from "../common/FormControl";
import validator from "validator";
import AuthLayout from "../common/AuthLayout";
import { useForgotPassword } from "../../apollo/model/auth";
import { useAuth } from "../../hooks/useAuth";
import CustomSpinner from "../common/custom-spinner";
import { useState } from "react";
import { FaExclamationCircle } from "@react-icons/all-files/fa/FaExclamationCircle";
import Seo from "../seo";

const ForgetPassword = () => {
    // Containers
    const auth = useAuth();
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");

    // Authentication
    if (auth?.isAuthenticated) navigate("/app/profile");

    // Webservice
    const [forgotPwdMutation, forgotPwdMutationResults] = useForgotPassword();
    const pending = forgotPwdMutationResults.loading;

    // Methods
    const sendForgotPasswordCode = (e) => {
        e.preventDefault();
        setEmailError("");
        let error = false;
        if (!email || !validator.isEmail(email)) {
            setEmailError("Invalid email address");
            error = true;
        }
        if (!error) forgotPwdMutation(email);
    };

    return (
        <>
            <Seo title="Forgot Password" />
            <AuthLayout>
                <h3 className="signup-head mb-0">Forgot password</h3>
                <form className="form">
                    <div className="form-group">
                        <FormInput
                            name="email"
                            type="text"
                            placeholder="Enter email"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="mt-5">
                        {emailError && (
                            <span className="errorsapn">
                                <FaExclamationCircle /> {emailError}
                            </span>
                        )}
                        {forgotPwdMutationResults?.data === null && (
                            <span className="errorsapn">
                                <FaExclamationCircle /> We were unable to find
                                the user.
                            </span>
                        )}
                        <button
                            type="submit"
                            className="btn-primary w-100 text-uppercase d-flex align-items-center justify-content-center py-2 mb-3"
                            disabled={pending}
                            onClick={sendForgotPasswordCode}
                        >
                            <div
                                className={`${pending ? "opacity-100" : "opacity-0"}`}
                            >
                                <CustomSpinner />
                            </div>
                            <div className={`${pending ? "ms-3" : "pe-4"}`}>
                                submit
                            </div>
                        </button>
                    </div>
                </form>
                <p className="text-white text-center">
                    Return to{" "}
                    <Link to="/app/signin" className="signup-link">
                        Sign in
                    </Link>
                </p>
            </AuthLayout>
        </>
    );
};

export default ForgetPassword;
