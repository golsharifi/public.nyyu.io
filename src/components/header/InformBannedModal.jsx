import React from 'react';
import Modal from 'react-modal';
import { Icon } from '@iconify/react';
import styled from 'styled-components';
import { device } from '../../utilities/device';
import { SadFace } from '../../utilities/imgImport';

const InformBannedModal = ({isModalOpen, setIsModalOpen, informMessage={} }) => {
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
            <InformBanned>
                <div className='text-center mb-5 px-5'>
                    <img src={SadFace} alt='Sad' />
                    <p className='mt-3'>
                        {informMessage.first}
                    </p>
                    {informMessage.second &&
                    <p className='mt-3'>
                        As per our
                        <span className='ms-2 txt-green text-underline'>Terms of Use</span>
                        , {informMessage.second}
                    </p>}
                </div>
            </InformBanned>
        </Modal>
    );
};

export default InformBannedModal;

const InformBanned = styled.div`
    img {
        width: 150px;
    }
    p {
        font-size: 18px;
        font-weight: 600;
        &.description {
            font-size: 14px;
        }
    }
    @media screen and (max-width: ${device['phone']}){
        p {
            font-size: 14px;
            font-weight: 500;
            &.description {
                font-size: 12px;
            }
        }
    }
`;