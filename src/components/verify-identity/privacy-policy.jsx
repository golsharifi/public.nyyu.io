import React, { useState } from "react"
import { Link } from "gatsby"
import Modal from "react-modal"
import { Icon } from "@iconify/react"
import PrivacyPolicyContent from "./PrivacyPolicyContent";

export default function PrivacyPolicy({ agree, setAgree, lang }) {
    const [open, setOpen] = useState(false)
    return (
        <div className="mt-5 privacy-policy">
            <div className="privacy-policy-checkout">
                <button
                    id='agree_policy'
                    onClick={() => setAgree(!agree)}
                    className={agree ? "check-box check-box_checked" : "check-box"}
                >
                    {agree && <Icon icon="akar-icons:check" />}
                </button>
                <label className="ms-3" htmlFor='agree_policy'>{lang?.agree}</label>
            </div>
            <Link to="#" className="txt-green link" onClick={() => setOpen(true)}>
                Privacy Policy
            </Link>
            <Modal
                isOpen={open}
                onRequestClose={() => setOpen(false)}
                ariaHideApp={false}
                className="privacy-policy-modal"
                overlayClassName="privacy-policy-modal__overlay"
            >
                <PrivacyPolicyContent />
                <div className="privacy-policy-modal__footer">
                    <button
                        className="btn-decline me-2 mb-2"
                        onClick={() => {
                            setAgree(false)
                            setOpen(false)
                        }}
                    >
                        Decline
                    </button>
                    <button
                        className="btn-accept me-2 mb-2"
                        onClick={() => {
                            setAgree(true)
                            setOpen(false)
                        }}
                    >
                        Accept
                    </button>
                </div>
            </Modal>
        </div>
    )
}