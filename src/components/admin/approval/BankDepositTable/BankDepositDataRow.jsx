import React, { useState } from 'react';
import styled from 'styled-components';
import { Icon } from '@iconify/react';
import { renderNumberFormat } from '../../../../utilities/number';
import { device } from '../../../../utilities/device';
import { width } from './columnWidth';
import ApproveBankDepositModal from './ApproveBankDepositModal';

const RoundDataRow = ({ datum }) => {
    const [show, setShow] = useState(false);
    const [isApproveOpen, setIsApproveOpen] = useState(false);

    return (
        <>
            <DataRow>
                <div className='reference'>
                    <Main>
                        <p>{datum.uid}</p>
                    </Main>
                </div>
                <div className='email'>
                    <Main>
                        <p>{datum.email? datum.email: <span className='text-danger'>Deleted User</span>}</p>
                    </Main>
                </div>
                <div className='amount'>
                    <Main>
                        <p>{renderNumberFormat(datum.amount, datum.fiatType)}</p>
                    </Main>
                </div>
                <div className='usdAmount'>
                    <Main>
                        <p>{renderNumberFormat(datum.usdAmount)}</p>
                    </Main>
                </div>
                <div className='fee'>
                    <Main>
                        <p>{renderNumberFormat(datum.fee)}</p>
                    </Main>
                </div>
                <div className='deposited'>
                    <Main>
                        <p>{renderNumberFormat(datum.deposited)}</p>
                    </Main>
                </div>
                <div className='approve'>
                    <Main>
                        {datum.status?
                            <p className='txt-green text-center' style={{fontSize: 30}}>
                                <Icon icon='healthicons:yes-outline' style={{cursor: 'unset'}} />
                            </p>:
                            <button className='text-warning bg-transparent border-0' onClick={() => setIsApproveOpen(true)}
                                disabled={!datum.email}
                            >Approve</button>
                        }
                    </Main>
                </div>
            </DataRow>
            <DataRowForMobile>
                <div>
                    <UnitRowForMobile>
                        <div className='left'>
                            <p style={{fontSize: 16, fontWeight: 700, color: 'white'}}>Reference</p>
                            <p style={{color: 'white'}}>{datum.uid}</p>
                        </div>
                        <div className='right'>
                            {datum.status?
                                <p className='txt-green text-center' style={{fontSize: 30}}>
                                    <Icon icon='healthicons:yes-outline' style={{cursor: 'unset'}} />
                                </p>:
                                <button className='text-warning bg-transparent border-0' onClick={() => setIsApproveOpen(true)}
                                    disabled={!datum.email}
                                >Approve</button>
                            }
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
                            <p>User Email</p>
                        </div>
                        <div className='right'>
                            <p>{datum.email? datum.email: <span className='text-danger'>Deleted User</span>}</p>
                        </div>
                    </UnitRowForMobile>
                    <UnitRowForMobile>
                        <div className='left'>
                            <p>Deposit Amount</p>
                        </div>
                        <div className='right'>
                            <p>{renderNumberFormat(datum.amount, datum.fiatType)}</p>
                        </div>
                    </UnitRowForMobile>
                    <UnitRowForMobile>
                        <div className='left'>
                            <p>USD Amount</p>
                        </div>
                        <div className='right'>
                            <p>{renderNumberFormat(datum.usdAmount)}</p>
                        </div>
                    </UnitRowForMobile>
                    <UnitRowForMobile>
                        <div className='left'>
                            <p>Fee (USD)</p>
                        </div>
                        <div className='right'>
                            <p>{renderNumberFormat(datum.fee)}</p>
                        </div>
                    </UnitRowForMobile>
                    <UnitRowForMobile>
                        <div className='left'>
                            <p>Deposited (USD)</p>
                        </div>
                        <div className='right'>
                            <p>{renderNumberFormat(datum.deposited)}</p>
                        </div>
                    </UnitRowForMobile>
                </div>
            </DataRowForMobile>
            {isApproveOpen && <ApproveBankDepositModal isOpen={isApproveOpen} setIsOpen={setIsApproveOpen} datum={datum} />}
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

    &>div.reference {width: ${width.reference}; padding-left: 16px;}
    &>div.email {width: ${width.email};}
    &>div.amount {width: ${width.amount};}
    &>div.usdAmount {width: ${width.usdAmount};}
    &>div.fee {width: ${width.fee};}
    &>div.deposited {width: ${width.deposited};}
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