import React, { useEffect, useState } from "react"
import { numberWithLength } from "../../utilities/number"

const CountDownPending = ({ deadline, actionAfterDeadline }) => {
    const [curTime, setCurTime] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    })

    const msToTime = (difference) => {
        const seconds = Math.floor((difference / 1000) % 60)
        const minutes = Math.floor((difference / (1000 * 60)) % 60)
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
        const days = Math.floor((difference / (1000 * 60 * 60 * 24)));
        setCurTime({
            days: days < 10 ? "0" + days : days,
            hours: hours < 10 ? "0" + hours : hours,
            minutes: minutes < 10 ? "0" + minutes : minutes,
            seconds: seconds < 10 ? "0" + seconds : seconds,
        })
    }

    useEffect(() => {
        const id = setInterval(() => {
            const currentTimeMilliSeconds = new Date().getTime()
            const difference = deadline - currentTimeMilliSeconds;
            if(difference > 1000) {
                msToTime(difference)
            } else {
                actionAfterDeadline();
            }
        }, 1000)
        return () => {
            clearInterval(id)
        }
    }, [deadline])

    return (
        <div className="countdown-pending-wrapper d-flex justify-content-center">
            <div className="time-section">
                <p className="time">{numberWithLength(curTime.days, 2)}</p>
                <small className="time-text">day</small>
            </div>
            <div className="time-section">
                <p className="time">&nbsp;:&nbsp;</p>
            </div>
            <div className="time-section">
                <p className="time">{numberWithLength(curTime.hours, 2)}</p>
                <small className="time-text">hrs</small>
            </div>
            <div className="time-section">
                <p className="time">&nbsp;:&nbsp;</p>
            </div>
            <div className="time-section">
                <p className="time">{numberWithLength(curTime.minutes, 2)}</p>
                <small className="time-text">min</small>
            </div>
            <div className="time-section">
                <p className="time">&nbsp;:&nbsp;</p>
            </div>
            <div className="time-section">
                <p className="time">{numberWithLength(curTime.seconds, 2)}</p>
                <small className="time-text">sec</small>
            </div>
        </div>
    )
}

export default CountDownPending
