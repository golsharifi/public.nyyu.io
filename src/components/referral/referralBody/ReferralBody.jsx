import React, { useState } from 'react';
import { useQuery } from '@apollo/client';

import ReferralResponse from './response';
import CommissionHistory from '../commissionHistory/CommissionHistory';
import ReferralWalletConnector from './ReferralWalletConnector';
import ReferralLink from './ReferralLink';

import { GET_REFERRAL } from '../api/query';
import { ACTIVE_ACTION, UPDATE_ACTION } from '../constants';
import { SPINNER } from '../../../utilities/imgImport';
import { useReferral } from '../ReferralContext';

const ReferralBody = () => {
    
    // responsive status
    const {view } = useReferral();

    // Referral status, 
    //1 - wallet is not connected, 2 - activated
    const [referrer, setReferrer] = useState(null);
    const [action, setAction] = useState(ACTIVE_ACTION);

    // check referrer status
    const {loading} = useQuery(GET_REFERRAL, {
        onCompleted: data => {
            if(data.getReferral) {
                setReferrer(data.getReferral);
            } else {
                /// has no referral code yet
                setReferrer(null);
            }
        },
        onError: err => {
            console.log(err);
        }
    })

    const onChangeReferrer = (_referrer) => {
        setReferrer(_referrer);
        setAction(ACTIVE_ACTION);
    }

    const onChangeWallet = () => {
        setAction(UPDATE_ACTION);
    }

    return (
        <div className='row'>     
            <ReferralResponse /> 
            <CommissionHistory shown={(view === 'all' || view === 'balance')}/>
            {(view === 'all' || view === 'setting') && 
                <div className='col-12 col-lg-8 p-1 p-md-5 py-4 invite-friends-body'>
                    {loading ? 
                        <div className='text-center pt-5'>
                            <img src={SPINNER} width='34px' height='34px' />
                        </div>: 
                        <><div className='d-none d-md-flex align-items-center flex-column my-4 my-md-5'>
                            <h3 className='fw-bold'>INVITE FRIENDS</h3>
                            <h6 className='fs-16px'>Earn commission when your friends purchase NDB</h6>
                        </div>
                        {(referrer === null || referrer.walletConnect === null || action === UPDATE_ACTION) && 
                            <ReferralWalletConnector 
                                referrerInfo={referrer} 
                                setReferrer={onChangeReferrer} 
                                action={action} />}
                        {(referrer && referrer.walletConnect && action === ACTIVE_ACTION) && 
                            <ReferralLink referrerInfo={referrer} onChangeWallet={onChangeWallet}/>}</>
                    }
                </div>
            }
        </div>
    )
}

export default ReferralBody;