import React from 'react';
import jq from 'jquery';
import styled from 'styled-components';
import { device } from './../../utilities/device';
import { SuccesImage, FailImage } from '../../utilities/imgImport';

const AlarmModal = () => {
    return (
        <>
            <div style={{display: 'none!important'}}>
                <button type="button" id="success_alarm_btn" data-bs-toggle="modal" data-bs-target="#alarmSuccessModal" style={{display: 'none'}}>
                </button>
                <button type="button" id="fail_alarm_btn" data-bs-toggle="modal" data-bs-target="#alarmFailModal" style={{display: 'none'}}>
                </button>
            </div>
            <AlarmModalContainer>
                <div className="modal fade" id="alarmSuccessModal">
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div id="success" className="modal-content">
                            <button type="button" className="btn-close" data-bs-dismiss="modal" style={{display: 'none'}}></button>
                            <div className="modal-body">
                                <div className='icon'>
                                    <img src={SuccesImage} alt="" />
                                </div>
                                <div className='inform'>
                                    The NDB token pre-sale: NDB token will help you gain access to the NDB Ecosystem and allows the acquisition of some of its utilities, such as NFTs.
                                </div>
                                <div className='subInform'></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal fade" id="alarmFailModal">
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div id="fail" className="modal-content">
                            <button type="button" className="btn-close" data-bs-dismiss="modal" style={{display: 'none'}}></button>
                            <div className="modal-body">
                                <div className='icon'>
                                    <img src={FailImage} alt="fail" />
                                </div>
                                <div className='inform'>
                                    
                                </div>
                                <div className='subInform'>
                                    
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </AlarmModalContainer>
        </>
    );
};

export default AlarmModal;

export const showSuccessAlarm = (inform = 'Action made successfully', subInform = '') => {
    jq('div#alarmSuccessModal').find('div.inform').html(inform);
    jq('div#alarmSuccessModal').find('div.subInform').html(subInform);
    jq('#success_alarm_btn').trigger('click');
};

export const showFailAlarm = (inform = 'Action failed', subInform = 'Ops! Something went wrong! Try again!') => {
    jq('div#alarmFailModal').find('div.inform').html(inform);
    jq('div#alarmFailModal').find('div.subInform').html(subInform);
    jq('#fail_alarm_btn').trigger('click');
};

export const closeAlarmModal = () => {
    jq('button.btn-close').trigger('click');
};

const AlarmModalContainer = styled.div`
    div {
        color: white;
        text-align: center;
    }
    div#success {
        background-color: #23c865;
    }
    div#fail {
        background-color: #1e1e1e;
    }
    div.modal-content {
        border-radius: 0;
        border: 1px solid white;
        div.modal-body {
            padding: 3rem;
            div.icon>img {
                display: block;
                margin: auto;
                width: 120px;
            }
            div.inform {
                font-size: 32px;
                font-weight: 600;
                margin-top: 40px;
            }
            div.subInform {
                font-size: 16px;
                height: 50px;
                color: lightgrey;
            }
            @media screen and (max-width: ${device['laptop']}) {
                padding: 1rem;
                div.icon>img {
                    width: 90px;
                }
                div.inform {
                    font-size: 24px;
                }
                div.subInform {
                    font-size: 18px;
                }
            }
            @media screen and (max-width: ${device['phone']}) {
                padding: 1rem;
                div.icon>img {
                    width: 60px;
                }
                div.inform {
                    font-size: 18px;
                }
                div.subInform {
                    font-size: 12px;
                    height: 25px;
                }
            }
        }
    }
`;