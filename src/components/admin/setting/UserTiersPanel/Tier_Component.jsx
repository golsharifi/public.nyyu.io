import React, { useState } from "react";
import { useDispatch } from "react-redux";
import styled from "styled-components";
import svgToDataURL from "svg-to-dataurl";
import { Icon } from "@iconify/react";
import NumberFormat from "../../../../utilities/number";
import { device } from "../../../../utilities/device";
import ConfirmModal from "../../ConfirmModal";
import EditUserTierModal from "./../../editModals/EditUserTierModal";
import { delete_User_Tier } from "../../../../store/actions/userTierAction";

const TierComponent = ({ tier = {} }) => {
    const dispatch = useDispatch();
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const deleteUserTier = async () => {
        dispatch(delete_User_Tier(tier.level));
        setIsConfirmOpen(false);
    };

    return (
        <>
            <Container className="component">
                <div className="image">
                    <img src={svgToDataURL(tier.svg)} alt={tier.name} />
                </div>
                <div className="name">
                    <p>{tier.name}</p>
                </div>
                <div className="threshold">
                    <NumberFormat
                        value={tier.point}
                        displayType={"text"}
                        thousandSeparator={true}
                        renderText={(value, props) => <p {...props}>{value}</p>}
                    />
                </div>
                <div className="txnFee">
                    <NumberFormat
                        value={0.1}
                        displayType={"text"}
                        suffix={" %"}
                        thousandSeparator={true}
                        renderText={(value, props) => <p {...props}>{value}</p>}
                    />
                </div>
                <div className="edit">
                    <p>
                        <span className="edit">
                            <Icon
                                icon="clarity:note-edit-line"
                                onClick={() => setIsEditOpen(true)}
                            />
                        </span>
                    </p>
                    <p>
                        <span className="delete">
                            <Icon
                                icon="akar-icons:trash-can"
                                onClick={() => setIsConfirmOpen(true)}
                            />
                        </span>
                    </p>
                </div>
            </Container>
            <EditUserTierModal
                isModalOpen={isEditOpen}
                setIsModalOpen={setIsEditOpen}
                tier={tier}
            />
            <ConfirmModal
                isModalOpen={isConfirmOpen}
                setIsModalOpen={setIsConfirmOpen}
                confirmData={tier.name}
                doAction={deleteUserTier}
            />
        </>
    );
};

export default TierComponent;

const Container = styled.div`
    min-height: 75px;
    border: 1px solid #464646;
    border-top: none;
    display: flex;
    align-items: center;
    justify-content: space-between;

    & > div.image {
        width: 7%;
        img {
            width: 45px;
            height: 45px;
            display: block;
            margin: auto;
        }
    }
    & > div.name {
        width: 26%;
    }
    & > div.threshold {
        width: 25%;
        display: flex;
        justify-content: space-between;
        padding-right: 2%;
    }
    & > div.txnFee {
        width: 35%;
        display: flex;
        justify-content: space-between;
        padding-right: 2%;
    }
    & > div.edit {
        width: 10%;
        display: flex;
        justify-content: space-around;
        p span {
            font-size: 22px;
            cursor: pointer;
            &.edit {
                color: #23c865;
            }
            &.delete {
                color: #f32d2d;
            }
        }
    }
    @media screen and (max-width: ${device["laptop-md"]}) {
        & > div {
            p span {
                font-size: 18px;
            }
        }
    }
    @media screen and (max-width: ${device["tablet"]}) {
        & > div.image {
            width: 10%;
        }
        & > div.name {
            width: 20%;
        }
    }
    @media screen and (max-width: ${device["phone"]}) {
        & > div.image {
            width: 15%;
            img {
                width: 30px;
                height: 30px;
            }
        }
        & > div.name {
            width: 30%;
        }
        & > div.threshold {
            width: 30%;
        }
        & > div.edit {
            width: 20%;
        }
    }
`;
