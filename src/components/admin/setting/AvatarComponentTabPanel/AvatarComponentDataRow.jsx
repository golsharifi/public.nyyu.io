import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import parse from "html-react-parser";
import { Icon } from "@iconify/react";
import { device } from "../../../../utilities/device";
import { width } from "./columnWidth";
import ConfirmModal from "../../ConfirmModal";
import EditAvatarComponentModal from "../../editModals/EditAvatarComponentModal";
import { delete_Avatar_Component } from "../../../../store/actions/avatarAction";
import {
    EmptyAvatar,
    BaseHair,
    BaseExpression,
} from "../../../../utilities/imgImport";

const AvatarComponentDataRow = ({ datum = {} }) => {
    const dispatch = useDispatch();
    const { userTiers } = useSelector((state) => state);

    const [show, setShow] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [deletePending, setDeletePending] = useState(false);

    const deleteAvatarComponent = async () => {
        setDeletePending(true);
        const deleteData = {
            groupId: datum.groupId,
            compId: datum.compId,
        };
        await dispatch(delete_Avatar_Component(deleteData));
        setDeletePending(false);
        setIsConfirmOpen(false);
    };

    return (
        <>
            <DataRow>
                <div className="image">
                    <Main>
                        <div className="image_avatar_div mx-auto">
                            {datum.groupId === "hairStyle" || !datum.groupId ? (
                                <img
                                    src={EmptyAvatar}
                                    alt="Background Avatar"
                                />
                            ) : (
                                ""
                            )}
                            {datum.groupId === "expression" ? (
                                <>
                                    <img
                                        src={EmptyAvatar}
                                        alt="Background Avatar"
                                    />
                                    <div
                                        style={{
                                            top: "-9%",
                                            left: "-3%",
                                            width: "108%",
                                        }}
                                    >
                                        <img src={BaseHair} alt="base hair" />
                                    </div>
                                </>
                            ) : (
                                ""
                            )}
                            {datum.groupId === "hat" ||
                            datum.groupId === "other" ||
                            datum.groupId === "facialStyle" ? (
                                <>
                                    <img
                                        src={EmptyAvatar}
                                        alt="Background Avatar"
                                    />
                                    <div
                                        style={{
                                            top: "-9%",
                                            left: "-3%",
                                            width: "108%",
                                        }}
                                    >
                                        <img src={BaseHair} alt="base hair" />
                                    </div>
                                    <div
                                        style={{
                                            top: "31%",
                                            left: "25%",
                                            width: "53%",
                                        }}
                                    >
                                        <img
                                            src={BaseExpression}
                                            alt="base expression"
                                        />
                                    </div>
                                </>
                            ) : (
                                ""
                            )}
                            {datum.svg ? (
                                <div
                                    style={{
                                        top: `${datum.top}%`,
                                        left: `${datum.left}%`,
                                        width: `${datum.width}%`,
                                    }}
                                >
                                    {parse(datum.svg)}
                                </div>
                            ) : (
                                ""
                            )}
                        </div>
                    </Main>
                </div>
                <div className="groupId">
                    <Main>
                        <p className="text-uppercase">
                            {datum.groupId} {datum.compId}
                        </p>
                    </Main>
                </div>
                <div className="position">
                    <Main>
                        <p>Top: {datum.top}</p>
                        <p>Left: {datum.left}</p>
                        <p>Width: {datum.width}</p>
                    </Main>
                </div>
                <div className="config">
                    <Main>
                        <p>Price: {datum.price}</p>
                        <p>Limit: {datum.limited}</p>
                        <p>
                            Tier Level:{" "}
                            <span className="text-uppercase">
                                {userTiers[datum.tierLevel]?.name}
                            </span>
                        </p>
                    </Main>
                </div>
                <div className="edit">
                    <Main>
                        <p>
                            <span className="edit">
                                <Icon
                                    icon="clarity:note-edit-line"
                                    onClick={() => setIsEditOpen(true)}
                                />
                            </span>
                            <span className="delete">
                                <Icon
                                    icon="akar-icons:trash-can"
                                    onClick={() => setIsConfirmOpen(true)}
                                />
                            </span>
                        </p>
                    </Main>
                </div>
            </DataRow>
            <DataRowForMobile>
                <div>
                    <UnitRowForMobile>
                        <div className="left" style={{ width: "10%" }}>
                            <div className="image_avatar_div mx-auto">
                                {datum.groupId === "hairStyle" ||
                                !datum.groupId ? (
                                    <img
                                        src={EmptyAvatar}
                                        alt="Background Avatar"
                                    />
                                ) : (
                                    ""
                                )}
                                {datum.groupId === "expression" ? (
                                    <>
                                        <img
                                            src={EmptyAvatar}
                                            alt="Background Avatar"
                                        />
                                        <div
                                            style={{
                                                top: "-9%",
                                                left: "-3%",
                                                width: "108%",
                                            }}
                                        >
                                            <img
                                                src={BaseHair}
                                                alt="base hair"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    ""
                                )}
                                {datum.groupId === "hat" ||
                                datum.groupId === "other" ||
                                datum.groupId === "facialStyle" ? (
                                    <>
                                        <img
                                            src={EmptyAvatar}
                                            alt="Background Avatar"
                                        />
                                        <div
                                            style={{
                                                top: "-9%",
                                                left: "-3%",
                                                width: "108%",
                                            }}
                                        >
                                            <img
                                                src={BaseHair}
                                                alt="base hair"
                                            />
                                        </div>
                                        <div
                                            style={{
                                                top: "31%",
                                                left: "25%",
                                                width: "53%",
                                            }}
                                        >
                                            <img
                                                src={BaseExpression}
                                                alt="base expression"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    ""
                                )}
                                {datum.svg ? (
                                    <div
                                        style={{
                                            top: `${datum.top}%`,
                                            left: `${datum.left}%`,
                                            width: `${datum.width}%`,
                                        }}
                                    >
                                        {parse(datum.svg)}
                                    </div>
                                ) : (
                                    ""
                                )}
                            </div>
                        </div>
                        <div className="left" style={{ width: "60%" }}>
                            <p
                                className="text-white"
                                style={{ fontSize: 16, fontWeight: "700" }}
                            >
                                {datum.tokenName}
                            </p>
                        </div>
                        <div className="right">
                            <p>
                                <span className="edit">
                                    <Icon
                                        icon="clarity:note-edit-line"
                                        onClick={() => setIsEditOpen(true)}
                                    />
                                </span>
                            </p>
                        </div>
                        <div className="right">
                            <p>
                                <span className="delete">
                                    <Icon
                                        icon="akar-icons:trash-can"
                                        onClick={() => setIsConfirmOpen(true)}
                                    />
                                </span>
                            </p>
                        </div>
                        <div className="right">
                            <p>
                                <span style={{ fontSize: 16 }}>
                                    <Icon
                                        icon={
                                            show
                                                ? "ant-design:caret-up-filled"
                                                : "ant-design:caret-down-filled"
                                        }
                                        data-bs-toggle="collapse"
                                        data-bs-target={`#id${datum.compId}`}
                                        onClick={() => setShow(!show)}
                                    />
                                </span>
                            </p>
                        </div>
                    </UnitRowForMobile>
                </div>
                <div id={`id${datum.compId}`} className="collapse">
                    <UnitRowForMobile>
                        <div className="left">
                            <p style={{ color: "dimgrey" }}>ID</p>
                        </div>
                        <div className="right">
                            <p>
                                {datum.groupId} {datum.compId}
                            </p>
                        </div>
                    </UnitRowForMobile>
                    <UnitRowForMobile>
                        <div className="left">
                            <p style={{ color: "dimgrey" }}>Position</p>
                        </div>
                        <div className="right">
                            <p>Top: {datum.top}</p>
                            <p>Left: {datum.left}</p>
                            <p>Width: {datum.width}</p>
                        </div>
                    </UnitRowForMobile>
                    <UnitRowForMobile>
                        <div className="left">
                            <p style={{ color: "dimgrey" }}>Config</p>
                        </div>
                        <div className="right">
                            <p>Price: {datum.price}</p>
                            <p>Limit: {datum.limited}</p>
                            <p>
                                Tier Level:{" "}
                                <span className="text-uppercase">
                                    {userTiers[datum.tierLevel]?.name}
                                </span>
                            </p>
                        </div>
                    </UnitRowForMobile>
                </div>
            </DataRowForMobile>
            {isEditOpen && (
                <EditAvatarComponentModal
                    isModalOpen={isEditOpen}
                    setIsModalOpen={setIsEditOpen}
                    datum={datum}
                />
            )}
            <ConfirmModal
                isModalOpen={isConfirmOpen}
                setIsModalOpen={setIsConfirmOpen}
                confirmData={datum.groupId + datum.compId}
                doAction={deleteAvatarComponent}
                pending={deletePending}
                desc="Please check if this component is beging used."
            />
        </>
    );
};

export default AvatarComponentDataRow;

const DataRow = styled.div`
    min-height: 100px;
    padding: 8px 2px;
    border-bottom: 1px solid #464646;
    display: flex;
    justify-content: space-between;
    flex-flow: row wrap;
    svg {
        cursor: pointer;
    }

    & > div.image {
        width: ${width.image};
    }
    & > div.groupId {
        width: ${width.groupId};
    }
    & > div.position {
        width: ${width.position};
    }
    & > div.config {
        width: ${width.config};
    }
    & > div.edit {
        width: ${width.edit};

        p {
            display: flex;
            justify-content: space-evenly;
            span {
                font-size: 22px;
                &.edit {
                    color: #23c865;
                }
                &.delete {
                    color: #f32d2d;
                }
            }
        }
    }

    div.groupId,
    div.position,
    div.config {
        display: flex;
        align-items: center;
    }

    @media screen and (max-width: ${device["phone"]}) {
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
    min-height: 50px;
    border-bottom: 1px solid #464646;
    padding: 16px;
    display: none;
    svg {
        cursor: pointer;
    }
    @media screen and (max-width: ${device["phone"]}) {
        display: flex;
        flex-direction: column;
    }
`;

const UnitRowForMobile = styled.div`
    display: flex;
    justify-content: space-between;
    & > div.left {
        width: 40%;
    }
    & > div.right {
        p {
            text-align: right;
            span {
                font-size: 22px;
                &.edit {
                    color: #23c865;
                }
                &.delete {
                    color: #f32d2d;
                }
            }
        }
    }
`;
