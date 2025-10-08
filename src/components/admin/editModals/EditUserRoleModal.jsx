import React, { useState } from "react";
import { useDispatch } from "react-redux";
import Select from "react-select";
import Modal from "react-modal";
import { Icon } from "@iconify/react";
import { change_User_Role } from "../../../store/actions/userAction";
import { Roles } from "../../../utilities/staticData";

const EditUserRoleModal = ({ isModalOpen, setIsModalOpen, datum }) => {
    const dispatch = useDispatch();
    const isAdmin = datum?.role.includes("ROLE_ADMIN");
    const [userRole, setUserRole] = useState(isAdmin ? Roles[1] : Roles[0]);
    const [pending, setPending] = useState(false);

    const handleChangeUserRole = async (e) => {
        e.preventDefault();
        setPending(true);
        const updateData = {
            id: datum.id,
            email: datum.email,
            role: userRole.value,
        };
        await dispatch(change_User_Role(updateData));
        setPending(false);
        setIsModalOpen(false);
    };

    return (
        <Modal
            isOpen={isModalOpen}
            onRequestClose={() => setIsModalOpen(false)}
            ariaHideApp={false}
            className="pwd-reset-modal"
            overlayClassName="pwd-modal__overlay"
        >
            <div className="pwd-modal__header">
                <p>Role Change</p>
                <div
                    onClick={() => setIsModalOpen(false)}
                    onKeyDown={() => setIsModalOpen(false)}
                    role="button"
                    tabIndex="0"
                >
                    <Icon icon="ep:close-bold" />
                </div>
            </div>
            <form className="form" onSubmit={(e) => e.preventDefault()}>
                <div className="input">
                    <p className="mt-4" style={{ fontSize: 12 }}>
                        Role
                    </p>
                    <Select
                        className="black_input"
                        value={userRole}
                        onChange={(selected) => {
                            setUserRole(selected);
                        }}
                        options={Roles}
                        styles={customSelectStyles}
                    />
                </div>
                <div className="pwd-modal__footer mt-5">
                    <button
                        className="btn previous"
                        onClick={() => setIsModalOpen(false)}
                    >
                        Cancel
                    </button>
                    <button className="btn next" onClick={handleChangeUserRole}>
                        {pending ? "Changing. . ." : "Change Role"}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default EditUserRoleModal;

const customSelectStyles = {
    option: (provided, state) => ({
        ...provided,
        color: "white",
        backgroundColor: state.isSelected ? "#23c865" : "#1e1e1e",
        fontSize: 14,
    }),
    control: (provided) => ({
        ...provided,
        backgroundColor: "#1e1e1e",
        border: "none",
        borderRadius: 0,
    }),
    menu: (provided) => ({
        ...provided,
        backgroundColor: "#1e1e1e",
        border: "1px solid white",
    }),
    singleValue: (provided) => ({
        ...provided,
        color: "white",
    }),
    input: (provided) => ({
        ...provided,
        color: "white",
    }),
};
