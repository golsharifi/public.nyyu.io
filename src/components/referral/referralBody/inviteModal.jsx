import React from "react";
import Modal from "react-modal";

import { sendingLinks } from "./ReferralLink";
import { CloseIcon } from "../../../utilities/imgImport";

export default function InviteModal({ isOpen, setIsOpen, referralCode, inviteText }) {

    const generateEmailLink = (url) => {
        return encodeURIComponent(inviteText + ' ' + url);
    }

    const links = [...sendingLinks, {
        name: 'SEND VIA EMAIL',
        link: (url) => {
            return `https://mail.google.com/mail/u/0/?fs=1&su=${encodeURIComponent('NDB Invitation')}&body=${generateEmailLink(url)}&tf=cm`
        }
    }]

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={() => setIsOpen(false)}
            className="support-modal border-0"
            overlayClassName="support-modal__overlay"
        >
            <div className="support-modal__header justify-content-between align-items-center mb-2">
                <div className="fw-600 fs-24px">INVITE FRIENDS</div>
                <div
                    onClick={() => setIsOpen(false)}
                    onKeyDown={() => setIsOpen(false)}
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
            <div className="mt-5">
                {links.map((link, key) => {
                    return (
                        <div key={key} className='border-2 border-white text-center py-2 mb-2'>
                            <a 
                                href={link.link(`${process.env.GATSBY_SITE_URL}?referralCode=${referralCode}`)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white fs-22px fw-600"
                            >
                                {link.name.toUpperCase()}
                            </a>
                        </div>
                    )
                })}
            </div>
        </Modal>
    );
}
