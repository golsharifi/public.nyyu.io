import React, { useEffect, useState } from "react";
import useCountDown from "react-countdown-hook";
import { SuccesImage } from "../../utilities/imgImport";

export default function Successful({ title, timeout = 3, callback }) {
    // Countdown
    const initialTime = timeout * 1000;
    const interval = 1000;
    const [startedCounting, setStartedCounting] = useState(false);
    const [timeLeft, { start: startTimer }] = useCountDown(
        initialTime,
        interval
    );

    // Methods
    useEffect(() => startTimer(), []);
    useEffect(() => {
        setStartedCounting(true);
        if (startedCounting) if (timeLeft === 0) callback();
    }, [timeLeft]);
    // Render
    return (
        <div className="text-center p-4">
            <div className="text-danger mb-4">
                <img src={SuccesImage} alt="Success image" />
            </div>
            <div className="text-capitalize text-light fs-28px fw-bold text-success">
                {title}
            </div>
            <div className="text-light fs-18px fw-500 mt-2">
                You will be redirected in {Math.floor(timeLeft / 1000)} ...
            </div>
        </div>
    );
}
