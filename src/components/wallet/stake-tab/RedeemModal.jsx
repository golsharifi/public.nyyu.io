import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import Modal from 'react-modal';
import { renderNumberFormat } from '../../../utilities/number';
import { NDB } from '../../../utilities/imgImport';
import CustomSpinner from '../../common/custom-spinner';


export default function RedeemModal({isModalOpen, setIsModalOpen, data={}}) {
    const [pending, setPending] = useState(false);

    const closeModal = () => setIsModalOpen(false);
    const handleSubmit = () => {

    };

    const redeemData = [
        {label: 'Total amount', value: renderNumberFormat(1, 'NDB')},
        {label: 'Reward amount', value: renderNumberFormat(2.71, 'WATT')},
        {label: 'Est. APY', value: renderNumberFormat(5.23, '%')},
        {label: 'Stake date', value: '2021-12-16'},
        {label: 'Locked period', value: '60 days'},
        {label: 'Interest end date', value: '2022-02-16'},
        {label: 'Redemption date', value: '2022-02-17 10:00'},
        {label: 'Reward delivery date', value: '2022-02-16'},
    ];

    return (
        <Modal
            isOpen={isModalOpen}
            onRequestClose={closeModal}
            ariaHideApp={false}
            className="pwd-reset-modal"
            overlayClassName="pwd-modal__overlay"
        >
            <div className="pwd-modal__header">
                <div className='d-flex justify-content-center align-items-center'>
                    <img src={NDB} alt="ndb coin" style={{width: 40}} className="m-2" />
                    <h4 className="font-bold m-0">NDB</h4>
                </div>
                <div
                    onClick={closeModal}
                    onKeyDown={closeModal}
                    role="button"
                    tabIndex="0"
                >
                    <Icon icon="ep:close-bold" />
                </div>
            </div>
            <form className="form" onSubmit={(e) => e.preventDefault()}>
                <div className='input'>
                    {redeemData.map((item, index) => (
                        <div key={index} className="d-flex justify-content-between">
                            <p className="fs-14px">{item.label}</p>
                            <p>{item.value}</p>
                        </div>
                    ))}
                    <button className="btn btn-outline-light w-100 rounded-0 fw-bold text-uppercase mt-5 mb-4" style={{height: 47}}
                        onClick={handleSubmit} disabled={pending}
                    >
                        {pending? <CustomSpinner />: 'Redeem'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}