import React from "react";
import parse from 'html-react-parser';
import {Letter_N, Letter_Y, Letter_U} from '../../utilities/staticData2';

const Loading = ({ position }) => {
    const style = position ? {
        position
    } : null;

    return (
        <div style={style} className="lds-ellipsis">
            <div className='letter letter_N'>
                {parse(Letter_N)}
            </div>
            <div className='letter letter_Y1'>
                {parse(Letter_Y)}
            </div>
            <div className='letter letter_Y2'>
                {parse(Letter_Y)}
            </div>
            <div className='letter letter_U'>
                {parse(Letter_U)}
            </div>
        </div>
    )
}

export default Loading