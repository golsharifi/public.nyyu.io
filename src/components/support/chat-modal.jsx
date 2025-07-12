import React from "react"
import {GloabIcon, AttachmentIcon, MenuIcon} from "../../utilities/imgImport"

export default function ChatModal({isOpen, setIsOpen}) {
    return (
        <div className={`chat-modal d-flex flex-column justify-content-between ${isOpen ? "d-block" : "d-none"}`}>
            <div className="chat-modal-header">
                <div className="d-flex align-items-center justify-content-end">
                    <img src={GloabIcon} alt="Glob Icon"/>
                    <svg
                        className="down-arrow"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                        onClick={() => setIsOpen(false)}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </div>
            </div>
            <div className="chat-modal-footer">
                <div className="d-flex align-items-center justify-content-between">
                    <img className="attachment" src={AttachmentIcon}
                         alt="Attachment Icon"/>
                    <input type="text" className="form-control input p-2 mx-2" placeholder="Enter your question"
                           aria-label="Enter your question"/>
                    <img src={MenuIcon}
                         alt="Menu Icon"/>
                </div>
            </div>
        </div>
    )
}
