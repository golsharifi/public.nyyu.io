import React from 'react';
import Modal from 'react-modal';
import { Icon } from '@iconify/react';
import styled from 'styled-components';
import { device } from '../../utilities/device';

const InformMaintenanceModal = ({isModalOpen, setIsModalOpen }) => {
    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <Modal
            isOpen={isModalOpen}
            onRequestClose={closeModal}
            ariaHideApp={false}
            className="inform-banned-modal"
            overlayClassName="pwd-modal__overlay"
        >
            <div className="pwd-modal__header">
                <p></p>
                <div
                    onClick={closeModal}
                    onKeyDown={closeModal}
                    role="button"
                    tabIndex="0"
                >
                    <Icon icon="ep:close-bold" />
                </div>
            </div>
            <InformMaintenance>
                <div className='text-center mb-5 px-3'>
                    <h4>Welcome to NYYU</h4>
                    <p className='mt-5'>
                        Our server is currently under maintenance.
                    </p>
                    <p className='mt-1'>
                        You will be able to access it soon.
                    </p>
                    <p className='mt-3'>
                        We are sorry for any inconvenience you may have.
                    </p>
                    <p className='mt-3'>
                        If you need any assistance, please contact us on our official
                        <a className="txt-green ms-1" href="https://t.me/ndbtechnology" target="_blank" rel="noreferrer">Telegram</a> or 
                        <a className="txt-green ms-1" href="https://discord.gg/UzM34fQWqF" target="_blank" rel="noreferrer">Discord</a> chats. You can also reach us by email at
                        <a className='txt-green ms-1' href="mailto:support@nyyu.io">support@nyyu.io</a>.
                    </p>
                </div>
            </InformMaintenance>
        </Modal>
    );
};

export default InformMaintenanceModal;

const InformMaintenance = styled.div`
    img {
        width: 150px;
    }
    p {
        font-size: 16px;
        font-weight: 500;
        &.description {
            font-size: 14px;
        }
    }
    @media screen and (max-width: ${device['phone']}){
        p {
            font-size: 13px;
            font-weight: 400;
            &.description {
                font-size: 12px;
            }
        }
    }
`;