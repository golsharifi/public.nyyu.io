import React, { useState, useEffect } from 'react';
import { isBrowser } from '../../../utilities/auth';
import { useReferral } from '../ReferralContext';

const ReferralResponse = () => {
    
    const {view, setView, setXl} = useReferral();
    const onViewClick = (viewMode) => {
        setView(viewMode);
    }

    useEffect(() => {
        // mounted
        if(!isBrowser) return;
        
        const handleResize = () => {
            if(window.innerWidth <= 1024 && window.wide === 'all') {
                setView('balance');
                window.wide = 'balance';
            }
            if(window.innerWidth > 1024 && window.wide !== 'all') {
                setView('all');
                window.wide = 'all';
            }

            if(window.innerWidth > 1200) {
                setXl(true);
            } else {
                setXl(false);
            }
        }
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        }
    }, []);
    
    return (
        <div className="d-flex d-lg-none justify-content-between">
            <button 
                onClick={() => onViewClick('balance')}
                className={`w-100 me-2 py-2 text-white fw-700 fs-14px border border-white ${view === 'balance' ? 'bg-green':'bg-transparent'}`}
            >
                BALANCE
            </button>
            <button 
                onClick={() => onViewClick('setting')}
                className={`w-100 ms-2 py-2 text-white fw-700 fs-14px border border-white ${view === 'setting' ? 'bg-green':'bg-transparent'}`}
            >
                SETTING
            </button>
        </div>
    )
}

export default ReferralResponse;