import React, { useEffect, useState } from "react"
import { numberWithLength } from "../../utilities/number"


const CountDownDeposit = ({ deadline, pending }) => {
    const [curTime, setCurTime] = useState({
        hours: 0,
        minutes: 0,
        seconds: 0,
    })

    const [expired, setExpired] = useState(false);

    const msToTime = (difference) => {
        const seconds = Math.floor((difference / 1000) % 60)
        const minutes = Math.floor((difference / (1000 * 60)) % 60)
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
        setCurTime({
            hours: hours < 10 ? "0" + hours : hours,
            minutes: minutes < 10 ? "0" + minutes : minutes,
            seconds: seconds < 10 ? "0" + seconds : seconds,
        })
    }

    useEffect(() => {
        const depositTimer = setInterval(() => {
            const currentTimeMilliSeconds = new Date().getTime()
            const difference = deadline - currentTimeMilliSeconds
            if(difference > 1000) {
                msToTime(difference);
            } else {
                setExpired(true);
            }
        }, 1000)
        return () => {
            clearInterval(depositTimer)
        }
    }, [deadline])

    return (
    <>
        {expired?
            <h5 className='text-warning text-uppercase'>Expired</h5> :
            <div
                className={`countdown-wrapper d-flex ${
                    !pending && " justify-content-md-end"
                } justify-content-center`}
            >
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
        }
    </>
    )
}

export default CountDownDeposit
