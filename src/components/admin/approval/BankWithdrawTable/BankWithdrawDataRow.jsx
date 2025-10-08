import React, { useState } from 'react';
import styled from 'styled-components';
import { Icon } from '@iconify/react';
import { renderNumberFormat } from '../../../../utilities/number';
import { device } from '../../../../utilities/device';
import { width } from './columnWidth';
import ApproveBankWithdrawModal from './ApproveBankWithdrawModal';

const RoundDataRow = ({ datum }) => {
    const [show, setShow] = useState(false);
    const [isApproveOpen, setIsApproveOpen] = useState(false);
    
    return (
        <>
            <DataRow>
                <div className='email'>
                    <Main>
                        <p>{datum.email? datum.email: <span className='text-danger'>Deleted User</span>}</p>
                    </Main>
                </div>
                <div className='sourceToken'>
                    <Main>
                        <p>{renderNumberFormat(Number(datum.tokenAmount).toFixed(8), datum.sourceToken)}</p>
                    </Main>
                </div>
                <div className='amount'>
                    <Main>
                        <p>{renderNumberFormat(Number(datum.withdrawAmount).toFixed(2), datum.targetCurrency)}</p>
                    </Main>
                </div>
                <div className='requestedAt'>
                    <Main>
                        <p>{new Date(datum.requestedAt).toLocaleDateString()}</p>
                        <p>{new Date(datum.requestedAt).toLocaleTimeString()}</p>
                    </Main>
                </div>
                <div className='approve'>
                    <Main>
                        <button className='bg-transparent border-0' onClick={() => setIsApproveOpen(true)}
                            disabled={!datum.email}
                        >
                            {datum.status === 0 && <span className='text-warning'>Approve</span>}
                            {datum.status === 1 && <span className='txt-green font-30px'><Icon icon='healthicons:yes-outline' /></span>}
                            {datum.status === 2 && <span className='text-danger font-30px'><Icon icon='clarity:no-access-line' /></span>}
                        </button>
                    </Main>
                </div>
            </DataRow>
            <DataRowForMobile>
                <div>
                    <UnitRowForMobile>
                        <div className='left'>
                            <p style={{fontSize: 16, fontWeight: 700, color: 'white'}}>User's email</p>
                            <p style={{color: 'white'}}>{datum.email? datum.email: <span className='text-danger'>Deleted User</span>}</p>
                        </div>
                        <div className='right'>
                            <button className='bg-transparent border-0' onClick={() => setIsApproveOpen(true)}
                                disabled={!datum.email}
                            >
                                {datum.status === 0 && <span className='text-warning'>Approve</span>}
                                {datum.status === 1 && <span className='txt-green font-30px'><Icon icon='healthicons:yes-outline' /></span>}
                                {datum.status === 2 && <span className='text-danger font-30px'><Icon icon='clarity:no-access-line' /></span>}
                            </button>
                        </div>
                        <div className='right'>
                            <p style={{fontSize: 16}}>
                                <span><Icon icon={show? "ant-design:caret-up-filled": "ant-design:caret-down-filled"} data-bs-toggle="collapse" data-bs-target={`#id${datum.id}`} onClick={() => setShow(!show)} /></span>
                            </p>
                        </div>
                    </UnitRowForMobile>
                </div>
                <div id={`id${datum.id}`} className="collapse">
                    <UnitRowForMobile>
                        <div className='left'>
                            <p>Token Amount</p>
                        </div>
                        <div className='right'>
                            <p>{renderNumberFormat(Number(datum.tokenAmount).toFixed(8), datum.sourceToken)}</p>
                        </div>
                    </UnitRowForMobile>
                    <UnitRowForMobile>
                        <div className='left'>
                            <p>Withdraw Amount</p>
                        </div>
                        <div className='right'>
                            <p>{renderNumberFormat(Number(datum.withdrawAmount).toFixed(2), datum.targetCurrency)}</p>
                        </div>
                    </UnitRowForMobile>
                    <UnitRowForMobile>
                        <div className='left'>
                            <p>Request Time</p>
                        </div>
                        <div className='right'>
                            <p>{new Date(datum.requestedAt).toLocaleDateString()}</p>
                            <p>{new Date(datum.requestedAt).toLocaleTimeString()}</p>
                        </div>
                    </UnitRowForMobile>
                </div>
            </DataRowForMobile>
            {isApproveOpen && <ApproveBankWithdrawModal isOpen={isApproveOpen} setIsOpen={setIsApproveOpen} datum={datum} />}
        </>
    );
};

export default RoundDataRow;

const DataRow = styled.div`
    min-height: 80px;
    padding: 8px 2px;
    border-bottom: 1px solid #464646;
    display: flex;
    justify-content: space-between;
    flex-flow: row wrap;
    svg {
        cursor: pointer;
    }


    &>div.email {width: ${width.email}; padding-left: 16px;}
    &>div.sourceToken {width: ${width.sourceToken};}
    &>div.amount {width: ${width.amount};}
    &>div.requestedAt {width: ${width.requestedAt};}
    &>div.approve {width: ${width.approve};}

    @media screen and (max-width: ${device['phone']}){
        display: none;
    }
`;

const Main = styled.div`
    height: 65px;
    display: flex;
    flex-direction: column;
    justify-content: center;
`;

// For Mobile
const DataRowForMobile = styled.div`
    min-height: 80px;
    border-bottom: 1px solid #464646;
    padding: 16px;
    display: none;    
    svg {
        cursor: pointer;
    }
    @media screen and (max-width: ${device['phone']}){
        display: flex;
        flex-direction: column;
    } 
`;

const UnitRowForMobile = styled.div`
    display: flex;
    justify-content: space-between;
    &>div.left {
        width: 60%;
    }
    &>div.right {
        p {
            text-align: right;
        }
    }
`;