import { navigate } from "gatsby";
import React, { useEffect, useState } from "react";
import useCountDown from "react-countdown-hook";
import { Icon } from "@iconify/react";
import { ROUTES } from "../../utilities/routes";

export default function PaymentSuccessful({
    timeout = 5,
    callback = () => navigate(ROUTES.auction),
}) {
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
            <div className="mb-4">
                <Icon icon="akar-icons:circle-check" className="text-success" style={{width: 100, height: 100}} />
            </div>
            <div className="text-capitalize fs-28px fw-bold text-success">
                payment successful
            </div>
            <div className="text-light fs-18px fw-500 mt-2">
                You will be redirected in {Math.floor(timeLeft / 1000)} ...
            </div>
        </div>
    );
}
