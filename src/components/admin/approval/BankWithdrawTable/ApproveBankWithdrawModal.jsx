import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import _ from 'lodash';
import Modal from 'react-modal';
import { CloseIcon } from "../../../../utilities/imgImport";
import { Icon } from "@iconify/react";
import Select, { components } from 'react-select';
import * as Query from '../../../../apollo/graphqls/querys/Approval';
import * as Mutation from '../../../../apollo/graphqls/mutations/Approval';
import { renderNumberFormat } from '../../../../utilities/number';
import CustomSpinner from "../../../common/custom-spinner";
import { showFailAlarm, showSuccessAlarm } from "../../AlarmModal";
import { useBankWithdraw } from "./useBankWithdraw";
import { countryList } from "../../../../utilities/countryAlpha2";

const countries = _.mapKeys(countryList, 'alpha-2');

const STATUSES = [
    { label: 'APPROVE', value: 1 },  
    { label: 'DENY', value: 2 },  
];

const DropdownIndicator = props => {
    return (
      <components.DropdownIndicator {...props}>
        <Icon icon='ant-design:caret-down-filled' />
      </components.DropdownIndicator>
    );
};

const ApproveBankWithdrawModal = ({ isOpen, setIsOpen, datum }) => {
    const bankWithdraw = useBankWithdraw();

    const [withdrawData, setWithdrawData] = useState({});
    const [status, setStatus] = useState(STATUSES[0]);
    const [deniedReason, setDeniedReason] = useState('');
    const [confirmCode, setConfirmCode] = useState({
        sent: false,
        value: ''
    });
    const [showError, setShowError] = useState(false);
    const [pending, setPending] = useState(false);
    
    const metaData = useMemo(() => {
        if(!withdrawData.metadata) return null;
        return JSON.parse(withdrawData?.metadata);
    }, [withdrawData]);

    const error = useMemo(() => {
        if(!confirmCode.value && status.value === 1) return 'Confirmation code is required';
        return '';
    }, [confirmCode.value, status.value]);

    const loading = _.isEmpty(withdrawData) || !confirmCode.sent;

    const disabled = status.value === 2 && !deniedReason;

    const [sendWithdrawConfirmCodeMutation] = useMutation(Mutation.SEND_WITHDRAW_CONFIRM_CODE, {
        onCompleted: data => {
            if(data.sendWithdrawConfirmCode) {
                setConfirmCode({ ...confirmCode, sent: true });
            }
        },
        onError: err => {
            showFailAlarm('Sending confirmation code failed', err.message);
            setIsOpen(false);
        }
    });

    useEffect(() => {
        sendWithdrawConfirmCodeMutation();
    }, [sendWithdrawConfirmCodeMutation]);

    useQuery(Query.GET_BANK_WITHDRAW_REQUEST_BY_ID_BY_ADMIN, {
        variables: {
            id: datum.id
        },
        onCompleted: data => {
            if(data.getBankWithdrawRequestByIdByAdmin) {
                setWithdrawData(data.getBankWithdrawRequestByIdByAdmin);
            }
        },
        onError: err => {
            showFailAlarm('Action failed', err.message);
            setIsOpen(false);
        }
    });

    const [approveBankWithdrawRequestMutation] = useMutation(Mutation.APPROVE_BANK_WITHDRAW_REQUEST, {
        onCompleted: data => {
            if(data.ApproveBankWithdrawRequest) {
                showSuccessAlarm('Bank Withdraw Request approved');
                bankWithdraw.updateDatum({ ...datum, status: status.value });
            }
            setPending(false);
            setIsOpen(false);
        },
        onError: err => {
            // console.log(err);
            showFailAlarm('Action failed', err.message);
            setPending(false);
            setIsOpen(false);
        }
    });

    const [denyBankWithdrawRequestMutation] = useMutation(Mutation.DENY_BANK_WITHDRAW_REQUEST, {
        onCompleted: data => {
            if(data.denyBankWithdrawRequest) {
                showSuccessAlarm('Bank Withdraw Request denied');
                bankWithdraw.updateDatum({ ...datum, status: status.value });
            }
            setPending(false);
            setIsOpen(false);
        },
        onError: err => {
            // console.log(err);
            showFailAlarm('Action failed', err.message);
            setPending(false);
            setIsOpen(false);
        }
    });

    const handleSubmit = async () => {
        if(error) {
            setShowError(true);
            return;
        }
        setPending(true);
        if(status.value === 1) {
            approveBankWithdrawRequestMutation({
                variables: {
                    id: datum.id,
                    code: confirmCode.value
                }
            });
        } else {
            denyBankWithdrawRequestMutation({
                variables: { id: datum.id, reason: deniedReason}
            });
        }
    };

    const closeModal = () => {
        setIsOpen(false);
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={closeModal}
            className="support-modal"
            overlayClassName="deposit-widthdraw-modal__overlay"
            ariaHideApp={false}
        >
            <div className="support-modal__header justify-content-end">
                <div
                    onClick={closeModal}
                    onKeyDown={closeModal}
                    role="button"
                    tabIndex="0"
                >
                    <img
                        width="14px"
                        height="14px"
                        src={CloseIcon}
                        alt="close"
                    />
                </div>
            </div>
            <div className='width2'>
                <div className="text-center">
                    <h4 className='mt-3'>Approve Bank Withdraw</h4>
                    <p>
                        <span className="text-muted me-2">User's email:</span> {datum.email}
                    </p>
                </div>
                {loading?
                    <div className="text-center my-4">
                        <CustomSpinner />
                    </div>:
                    <div className='mt-3'>
                        <div className="row mb-2">
                            <p className="col-6 text-muted">Token Amount</p>
                            <p className="col-6 text-end">{renderNumberFormat(Number(withdrawData.tokenAmount).toFixed(8), withdrawData.sourceToken)}</p>
                        </div>
                        <div className="row mb-2">
                            <p className="col-6 text-muted">Withdraw Amount</p>
                            <p className="col-6 text-end">{renderNumberFormat(Number(withdrawData.withdrawAmount).toFixed(2), withdrawData.targetCurrency)}</p>
                        </div>
                        <hr className='text-white' />
                        <div className="row mb-2">
                            <p className="col-6 text-muted">Transfer Mode</p>
                            <p className="col-6 text-end">
                                {withdrawData.mode === 1 && 'Domestic Transfer'}
                                {withdrawData.mode === 2 && 'Foreign Transfer'}
                            </p>
                        </div>
                        <div className="row mb-2">
                            <p className="col-6 text-muted">Country</p>
                            <p className="col-6 text-end text-break">{countries[withdrawData.country]?.name}</p>
                        </div>
                        <div className="row mb-2">
                            <p className="col-6 text-muted">Holder Name</p>
                            <p className="col-6 text-end text-break">{withdrawData.holderName}</p>
                        </div>
                        <div className="row mb-2">
                            <p className="col-6 text-muted">Bank Name</p>
                            <p className="col-6 text-end text-break">{withdrawData.bankName}</p>
                        </div>
                        {!_.isEmpty(metaData) && (
                            <>
                                <hr className='text-white' />
                                {Object.keys(metaData).map((key, index) => (
                                    <div className="row mb-2" key={index}>
                                        <p className="col-6 text-muted">{key}</p>
                                        <p className="col-6 text-end text-break">{metaData[key]}</p>
                                    </div>
                                ))}
                                <hr className='text-white' />
                            </>
                        )}
                        <div className="row mb-2">
                            <p className="col-6 text-muted">Recipient Address</p>
                            <p className="col-6 text-end text-break">{withdrawData.address}</p>
                        </div>
                        <div className="row mb-2">
                            <p className="col-6 text-muted">Recipient Post Code</p>
                            <p className="col-6 text-end text-break">{withdrawData.postCode}</p>
                        </div>
                        <div className="row mb-2">
                            <p className="col-6 text-muted">Requested Time</p>
                            <p className="col-6 text-end">
                                {new Date(withdrawData.requestedAt).toLocaleDateString()}
                                <span className="ms-2">{new Date(withdrawData.requestedAt).toLocaleTimeString()}</span>
                            </p>
                        </div>
                        {withdrawData.status !== 0 &&
                            <>
                                <p className="text-center my-3 font-30px fw-bold">
                                    {withdrawData.status === 1 && <span className="txt-green">APPROVED</span>}
                                    {withdrawData.status === 2 && <span className="text-danger">DENIED</span>}
                                </p>
                                <div className="row">
                                    <p className="col-6 text-muted">Confirmed Time</p>
                                    <p className="col-6 text-end">
                                        {new Date(withdrawData.confirmedAt).toLocaleDateString()}
                                        <span className="ms-2">{new Date(withdrawData.confirmedAt).toLocaleTimeString()}</span>
                                    </p>
                                </div>
                                {withdrawData.status === 2 && withdrawData.deniedReason && (
                                    <>
                                        <p className="text-muted">Denied Reason</p>
                                        <p className="text-break">{withdrawData.deniedReason}</p>
                                    </>
                                )}
                                <button className="btn btn-outline-light rounded-0 my-5 fw-bold w-100" style={{height: 47}} onClick={closeModal}>
                                    CLOSE
                                </button>
                            </>
                        }
                        {withdrawData.status === 0 && (
                            <>
                                <Select
                                    className='black_input mt-2'
                                    options={STATUSES}
                                    value={status}
                                    onChange={selected => {
                                        setStatus(selected);
                                    }}
                                    styles={customSelectStyles}
                                    components={{
                                        IndicatorSeparator: null,
                                        DropdownIndicator,
                                    }}
                                />
                                {status.value === 2 &&
                                    <>
                                        <p className="mt-2 text-muted">Denied Reason</p>
                                        <input className="black_input" value={deniedReason} onChange={e => setDeniedReason(e.target.value)} />
                                        {!deniedReason && <p className="text-warning font-14px">Denied reason required</p>}
                                    </>
                                }
                                {status.value === 1 &&
                                <>
                                    <p className="text-muted mt-2">Code</p>
                                    <input className="black_input"
                                        value={confirmCode.value}
                                        onChange={e => setConfirmCode({ ...confirmCode, value: e.target.value})}
                                    />
                                    <p className="txt-green fs-12px">Confirmation code sent to ADMIN</p>
                                </>}
                                <p className="text-danger mt-3">
                                    {showError && error}
                                </p>
                                <button className="btn btn-outline-light rounded-0 my-5 fw-bold w-100" style={{height: 47}}
                                    onClick={handleSubmit}
                                    disabled={disabled}
                                >
                                    {pending? <CustomSpinner />: 'CONFIRM'}
                                </button>
                            </>
                        )}
                    </div>
                }
            </div>
        </Modal>
    );
};

export default ApproveBankWithdrawModal;

const customSelectStyles = {
    option: (provided, state) => ({
        ...provided,
        color: "white",
        backgroundColor: state.isSelected ? "#000000" : undefined,
        fontSize: 14,
        borderBottom: "1px solid dimgrey",
        cursor: "pointer",
        ":hover": {
            backgroundColor: "inherit",
        },
    }),
    control: (provided) => ({
        ...provided,
        backgroundColor: "#1e1e1e",
        border: "none",
        borderRadius: 0,
        height: 47,
        cursor: "pointer",
    }),
    menu: (provided) => ({
        ...provided,
        backgroundColor: "#1e1e1e",
        border: "1px solid white",
        borderRadius: 0
    }),
    menuList: (provided) => ({
        ...provided,
        margin: 0,
        padding: 0,
    }),
    valueContainer: (provided) => ({
        ...provided,
        padding: 0,
    }),
    singleValue: (provided) => ({
        ...provided,
        color: "white",
        marginLeft: 10,
    }),
    placeholder: (provided) => ({
        ...provided,
        color: "dimgrey",
    }),
};