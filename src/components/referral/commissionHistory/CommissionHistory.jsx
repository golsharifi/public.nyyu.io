import { useQuery } from '@apollo/client';
import React, { useState } from 'react';
import { GET_EARNING } from '../api/query';
import CommissionBalance from './CommissionBalance';
import InvitedList from './InvitedList';

const CommissionHistory = ({shown}) => {
    
    // invited user list
    const [ invitedList, setInvitedList ] = useState([]);
    // total earned
    const [ totalEarned, setTotalEarned ] = useState(0);

    // getting invited list - user name/earned
    const {loading} = useQuery(GET_EARNING, {
        onCompleted: data => {
            if(data?.getReferredUsers) {
                const earnings = data.getReferredUsers;
                setInvitedList(earnings);
                if(earnings.length === 0) setTotalEarned(0);
                else {
                    let earned = 0;
                    earnings.forEach(user => {
                        earned += user.amount;
                    });
                    setTotalEarned(earned);
                }
            }
        }
    });
    
    return <div className={`col-12 col-lg-4 py-4 pe-lg-4 border-response 
                                ${invitedList.length === 0 ? 'referral-history':'referral-history-list'}
                                ${shown ? 'd-block':'d-none'}`}>
        <CommissionBalance loading={loading} totalEarned={totalEarned} />
        <InvitedList loading={loading} invitedList={invitedList} />
    </div>
}

export default CommissionHistory;