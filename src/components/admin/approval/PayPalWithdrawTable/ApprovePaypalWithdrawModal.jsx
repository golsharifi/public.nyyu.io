import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@apollo/client";
import Modal from 'react-modal';
import { CloseIcon } from "../../../../utilities/imgImport";
import { Icon } from "@iconify/react";
import _ from 'lodash';
import Select, { components } from 'react-select';
import * as Query from '../../../../apollo/graphqls/querys/Approval'
import { renderNumberFormat } from '../../../../utilities/number';
import CustomSpinner from "../../../common/custom-spinner";
import { showSuccessAlarm, showFailAlarm } from "../../AlarmModal";
import { usePaypalWithdraw } from "./usePaypalWithdraw";
import * as Mutation from '../../../../apollo/graphqls/mutations/Approval';

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

const ApproveBankDepositModal = ({ isOpen, setIsOpen, datum }) => {
    const paypalWithdraw = usePaypalWithdraw();

    const [withdrawData, setWithdrawData] = useState({});
    const [status, setStatus] = useState(STATUSES[0]);
    const [deniedReason, setDeniedReason] = useState('');
    const [confirmCode, setConfirmCode] = useState({
        sent: false,
        value: ''
    });
    const [showError, setShowError] = useState(false);
    const [pending, setPending] = useState(false);

    const loading = _.isEmpty(withdrawData) || !confirmCode.sent;

    const disabled = status.value === 2 && !deniedReason;

    const error = useMemo(() => {
        if(!confirmCode.value) return 'Confirmation code is required';
        return '';
    }, [confirmCode.value]);

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

    useQuery(Query.GET_PAYPAL_WITHDRAW_BY_ID_BY_ADMIN, {
        variables: {
            id: datum.id
        },
        onCompleted: data => {
            if(data.getPaypalWithdrawByIdByAdmin) {
                setWithdrawData(data.getPaypalWithdrawByIdByAdmin);
            }
        },
        onError: err => {
            showFailAlarm('Action failed', err.message);
            setIsOpen(false);
        }
    });

    const [confirmPaypalWithdrawMutation] = useMutation(Mutation.CONFIRM_PAYPAL_WITHDRAW, {
        onCompleted: data => {
            if(data.confirmPaypalWithdraw) {
                paypalWithdraw.updateDatum({ ...datum, status: status.value });
                showSuccessAlarm('Action done successfully');
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
        const confirmData = {
            id: datum.id,
            status: status.value,
            deniedReason: deniedReason,
            code: confirmCode.value
        };
        confirmPaypalWithdrawMutation({
            variables: { ...confirmData }
        });        
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
                    <h4 className='mt-3'>Approve PayPal Withdraw</h4>
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
                        <div className="row mb-2">
                            <p className="col-6 text-muted">Recipient <span className="txt-green">Paypal</span> Email</p>
                            <p className="col-6 text-end text-break">{withdrawData.receiver}</p>
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
                                    {withdrawData.status === 3 && <span className="txt-green">SENT FUNDS</span>}
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
                                <p className="text-muted mt-2">Code</p>
                                <input className="black_input"
                                    value={confirmCode.value}
                                    onChange={e => setConfirmCode({ ...confirmCode, value: e.target.value})}
                                />
                                <p className="txt-green fs-12px">Confirmation code sent to ADMIN</p>
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

export default ApproveBankDepositModal;

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