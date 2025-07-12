import React, { useState } from "react"

const Accordion = ({ question, date, answer }) => {
    const [active, setActive] = useState(false)

    const handleClick = () => {
        const activeAccordions = document.querySelectorAll(".accordion.active")
        activeAccordions.forEach((accordion) => accordion.classList.remove("active"))

        setActive(!active)
    }

    return (
        <div className={`accordion ${active ? "active" : ""}`}>
            <button
                type="button"
                className="accordion__toggler w-100 d-flex justify-content-between"
                onClick={() => handleClick()}
            >
                <span>
                    {question}
                    {date && <div className="fw-normal text-secondary mt-3">{date}</div>}
                </span>
                <span className="sign" />
            </button>

            <div className="accordion__content">{answer}</div>
        </div>
    )
}

export default Accordion
