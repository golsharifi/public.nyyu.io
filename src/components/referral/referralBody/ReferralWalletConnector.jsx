import React, { useState } from 'react';
import { FaArrowLeft } from '@react-icons/all-files/fa/FaArrowLeft';
import { useMutation } from '@apollo/client';

import WalletSelector from '../../common/wallet/WalletSelector';
import { ACTIVATE_REFERRER, CHANGE_COMMISSION_WALLET } from '../api/mutation';
import CustomSpinner from '../../common/custom-spinner';
import { ACTIVE_ACTION, UPDATE_ACTION } from '../constants';

const ReferralWalletConnector = ({referrerInfo, setReferrer, action}) => {
    
    const [error, setError] = useState(null);

    // selected wallet 
    const [selectedWallet, setSelectedWallet] = useState('internal');
    const [walletAddress, setWalletAddress] = useState(null);
    const onWalletChanged = (wallet) => {
        setSelectedWallet(wallet.selectedWallet);
        setWalletAddress(wallet.address);
    }

    // getting activate code
    const [activateReferrer, { loading: activateLoading }] = useMutation(ACTIVATE_REFERRER, {
        onCompleted: data => {
            if(data.activateReferralCode) {
                /// referral code 
                const { code, referralWallet, rate, commissionRate } = data.activateReferralCode;
                setReferrer({
                    referralCode: code, walletConnect: referralWallet, rate, commissionRate
                });
            } else {
                // cannot get code
                setError('Cannot get referral code.');
            }
        },
        onError: err => {
            setError(err.message);
        }
    });

    const [changeReferrerWallet, { loading: updateLoading }] = useMutation(CHANGE_COMMISSION_WALLET, {
        onCompleted: data => {
            if(data.changeReferralCommissionWallet) {
                const { status, referralWallet } = data.changeReferralCommissionWallet;
                if(status) {
                    setReferrer({...referrerInfo, walletConnect: referralWallet});
                } else {
                    setError('Cannot update referral wallet.');    
                }
            } else {
                setError('Cannot update referral wallet.');
            }
        },
        onError: err => {
            setError(err.message);
        }
    })

    const onActivateClicked = () => {
        // check loading
        if(activateLoading || updateLoading) return;
        
        // check wallet 
        setError(null);
        // internal wallet is not supported now
        if(selectedWallet === 'internal') {
            if(action === ACTIVE_ACTION) {
                activateReferrer({variables: {
                    wallet: "0x0000000000000000000000000000000000000000"
                }});
            } else if(action === UPDATE_ACTION) {
                changeReferrerWallet({variables: {
                    wallet: "0x0000000000000000000000000000000000000000"
                }})
            } else {
                setError('Unknown error.')
            }
            return;
        }
        // check wallet address is exists
        if(!walletAddress) {
            setError('Please connect wallet.');
            return;
        }

        if(action === ACTIVE_ACTION) {
            activateReferrer({variables: {
                wallet: walletAddress
            }});
        } else if (action === UPDATE_ACTION) {
            if(referrerInfo?.walletConnect === walletAddress) {
                setReferrer({...referrerInfo});
            }
            changeReferrerWallet({variables: {
                wallet: walletAddress
            }})
        } else {
            setError('Unknown error.')
        }
    }

    const onPrevious = () => {
        if(selectedWallet === 'external') {
            // go back to select wallet
            setSelectedWallet('internal');
        } else if(action === UPDATE_ACTION) {
            // go back to link
            setReferrer({...referrerInfo});
        }
    }
    
    return <div className='text-white'>
        <div className='d-none d-md-flex justify-content-start mb-4'>
            <button 
                className='bg-transparent border-0 ps-0' 
                onClick={onPrevious}
            >
                <div className='d-flex align-items-center'>
                    {(selectedWallet === 'external' || action === UPDATE_ACTION) && 
                        <><FaArrowLeft />&nbsp;</>
                    }
                    <span>Connect your wallet</span>
                </div>
            </button>
        </div>
        <div className='d-flex d-md-none justify-content-center border-bottom pb-2 mb-4 position-relative'>
            {(selectedWallet === 'external' || action === UPDATE_ACTION) && 
                <span className='position-absolute' style={{top: '0', left: '8px'}}><FaArrowLeft />&nbsp;</span>
            }
            <button 
                className='bg-transparent border-0' 
                onClick={onPrevious}
            >
                <div className='d-flex align-items-center'>
                    <span>CONNECT YOUR WALLET</span>
                </div>
            </button>
        </div>
        <div className=''>
            {error && <div className='text-danger'>{error}</div>}
            <WalletSelector 
                walletChanged={onWalletChanged} 
                selectedWallet={selectedWallet}
            />
        </div>
        <div className='pt-4'>
            <button 
                onClick={onActivateClicked}
                className='d-flex align-items-center justify-content-center referral-button py-2 bg-transparent text-white fw-bold border border-white fs-22px mx-auto'
            >
                {(activateLoading || updateLoading) ? <CustomSpinner sm={{width: '10px', height: '10px'}} />:<></>}
                <div className={`fs-20px ${(activateLoading || updateLoading) ? 'ms-3' : 'pe-4'}`}>
                    {action === ACTIVE_ACTION && 'ACTIVATE INVITE & EARN'}
                    {action === UPDATE_ACTION && 'UPDATE'}
                </div>
            </button>
        </div>
    </div>
}

export default ReferralWalletConnector;