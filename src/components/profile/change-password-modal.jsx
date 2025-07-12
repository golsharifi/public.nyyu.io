import React, { useState } from "react"
import Modal from "react-modal"

import { FormInput } from "../common/FormControl"
import { useChangePassword } from "../../apollo/model/auth"
import CustomSpinner from "../common/custom-spinner"

import { CloseIcon } from "../../utilities/imgImport"
import { passwordValidatorOptions } from "../../utilities/staticData"
import validator from "validator"
import { FaExclamationCircle } from "@react-icons/all-files/fa/FaExclamationCircle";

export default function ProfileChangePasswordModal({
    isPasswordModalOpen,
    setIsPasswordModalOpen,
}) {
    // Containers
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [passwordError, setPasswordError] = useState("")
    const [confirmPasswordError, setConfirmPasswordError] = useState("")
    const [changePasswordMutation, changePasswordResults] = useChangePassword()
    const pending = changePasswordResults.loading
    const webserviceError =
        changePasswordResults?.data?.changePassword === "Failed"
    const successfullRequest =
        changePasswordResults?.data?.changePassword === "Success"
    const [passwordVisible, setPasswordVisible] = useState(false)
    // Methods
    const changeUserPassword = (e) => {
        e.preventDefault()
        setPasswordError("")
        setConfirmPasswordError("")
        let error = false
        if (
            !password ||
            !validator.isStrongPassword(password, passwordValidatorOptions)
        ) {
            setPasswordError(
                "Password must contain at least 8 characters, including UPPER/lowercase and numbers!"
            )
            error = true
        }
        if (
            !confirmPassword ||
            !validator.isStrongPassword(
                confirmPassword,
                passwordValidatorOptions
            )
        ) {
            setConfirmPasswordError(
                "Password must contain at least 8 characters, including UPPER/lowercase and numbers!"
            )
            error = true
        }
        if (confirmPassword !== password) {
            setConfirmPasswordError("Password does not match its repeate!")
            error = true
        }
        if (!error) changePasswordMutation(password)
    }
    return (
        <Modal
            isOpen={isPasswordModalOpen}
            onRequestClose={() => setIsPasswordModalOpen(false)}
            className="pwd-modal"
            overlayClassName="pwd-modal__overlay"
            ariaHideApp={false}
        >
            <div className="pwd-modal__header">
                change your password
                <div
                    onClick={() => setIsPasswordModalOpen(false)}
                    onKeyDown={() => setIsPasswordModalOpen(false)}
                    role="button"
                    tabIndex="0"
                >
                    <img
                        width="14px"
                        height="14px"
                        src={CloseIcon}
                        alt="close"
                    />
                </div>
            </div>
            <form className="form">
                <div className="form-group position-relative">
                    <FormInput
                        type={passwordVisible ? "text" : "password"}
                        label="New Password"
                        value={password}
                        placeholder="Enter password"
                        onChange={(e) => setPassword(e.target.value)}
                        error={passwordError}
                    />
                </div>
                <div className="form-group position-relative">
                    <FormInput
                        type={passwordVisible ? "text" : "password"}
                        label="Confirm New Password"
                        value={confirmPassword}
                        placeholder="Re-enter password"
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        error={confirmPasswordError}
                    />
                </div>
                <div>
                    <label className="d-flex align-items-center gap-2">
                        <input
                            type="checkbox"
                            value={passwordVisible}
                            className="form-check-input p-0 m-0"
                            onChange={() => setPasswordVisible(!passwordVisible)}
                        />
                        <div className="keep-me-signed-in-text">
                            Show password
                        </div>
                    </label>
                </div>
                <div className="pwd-modal__footer mt-4">
                    {webserviceError && (
                        <span className="errorsapn">
                            <FaExclamationCircle />{" "}
                            Something went wrong, Please try again!
                        </span>
                    )}
                    {successfullRequest && (
                        <div className="txt-green text-left">
                            <FaExclamationCircle />{" "}
                            Password changed successfully!
                        </div>
                    )}
                    <button
                        className="btn-primary w-100 text-uppercase d-flex align-items-center justify-content-center py-2"
                        disabled={pending}
                        onClick={changeUserPassword}
                    >
                        <div
                            className={`${pending ? "opacity-100" : "opacity-0"}`}
                        >
                            <CustomSpinner />
                        </div>
                        <div className={`${pending ? "ms-3" : "pe-4"}`}>
                            save
                        </div>
                    </button>
                    <button
                        className="btn-cancel fs-18px pointer-cursor mx-auto mt-3"
                        onClick={(e) => {
                            e.preventDefault()
                            setIsPasswordModalOpen(false)
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </Modal>
    )
}
