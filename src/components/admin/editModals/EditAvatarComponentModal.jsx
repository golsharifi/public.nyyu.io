import React, { useState, useMemo } from "react";
import { useDispatch } from "react-redux";
import { Icon } from "@iconify/react";
import Modal from "react-modal";
import _ from "lodash";
import NumberFormat from "../../../utilities/number";
import parse from "html-react-parser";

import Stepper2 from "../../../components/admin/Stepper2";

import Alert from "@mui/material/Alert";
import Select from "react-select";
import {
    EmptyAvatar,
    BaseExpression,
    BaseHair,
} from "../../../utilities/imgImport";
import { useGetUserTierQuery } from "../../../apollo/model/userTier";
import { update_Avatar_Component } from "../../../store/actions/avatarAction";

const categories = [
    { value: "hairStyle", label: "Hair Style" },
    { value: "facialStyle", label: "Facial Style" },
    { value: "expression", label: "Expression" },
    { value: "hat", label: "Hat" },
    { value: "other", label: "Other" },
];

const EditAvatarComponentModal = ({
    isModalOpen,
    setIsModalOpen,
    datum = {},
}) => {
    const dispatch = useDispatch();
    const [currentStep, setCurrentStep] = useState(1);
    const [showError, setShowError] = useState(false);
    const [error, setError] = useState("");
    const [pending, setPending] = useState(false);

    //------- Avatar and Validation
    // Avatar
    const [category, setCategory] = useState(
        categories.filter((item) => item.value === datum.groupId)[0],
    );
    const initialAvatarData = {
        filename: datum.groupId + datum.compId,
        svg: datum.svg,
        top: datum.top,
        left: datum.left,
        width: datum.width,
        groupId: datum.groupId,
    };
    const [svgFile, setSvgFile] = useState(initialAvatarData);

    // Avatar Data Validation
    const avatarError = useMemo(() => {
        if (!category.value) return { category: "Please select category" };
        if (!svgFile.svg) return { file: "Please select avatar component" };
        return {};
    }, [category, svgFile]);

    //-------- Price Data and Validation
    // Price Data
    const initialPriceData = {
        price: datum.price,
        limitation: datum.limited,
        tier: {},
    };
    const [avatarInfo, setAvatarInfo] = useState(initialPriceData);

    //Price Data Validation
    const avatarInfoError = useMemo(() => {
        if (!avatarInfo.tier.value && avatarInfo.tier.value !== 0)
            return { tier: "User Tier is required" };
        return {};
    }, [avatarInfo]);

    // tiers from the backend
    let tiers = [];
    const userTiersResults = useGetUserTierQuery();

    if (userTiersResults.data) {
        tiers = userTiersResults.data.getUserTiers.map((item) => {
            return { value: item.level, label: item.name };
        });
        tiers = _.orderBy(tiers, ["value"], ["asc"]);
    }

    const selectAvatarComponent = (event) => {
        event.preventDefault();
        const file = event.target.files[0];

        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const svg = e.target.result;
                if (file.type.indexOf("svg") > 0) {
                    setSvgFile({
                        ...svgFile,
                        svg,
                        filename: file.name,
                        groupId: category.value,
                    });
                    setError("");
                } else {
                    setError("Only SVG file can be uploaded");
                    setSvgFile(initialAvatarData);
                }
            };
            reader.readAsText(file);
        }
    };
    // console.log(svgFile.svg);

    const setAvatarData = () => {
        if (Object.values(avatarError)[0]) {
            setShowError(true);
            return;
        }
        setCurrentStep(2);
        setShowError(false);
    };

    const setPriceData = () => {
        if (Object.values(avatarInfoError)[0]) {
            setShowError(true);
            return;
        }
        setCurrentStep(3);
        setShowError(false);
    };

    const handleSubmit = async () => {
        setPending(true);
        await dispatch(
            update_Avatar_Component({
                groupId: svgFile.groupId,
                compId: datum.compId,
                tierLevel: avatarInfo.tier.value,
                price: avatarInfo.price,
                limited: avatarInfo.limitation,
                svg: svgFile.svg,
                width: svgFile.width,
                top: svgFile.top,
                left: svgFile.left,
            }),
        );
        setPending(false);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <Modal
            isOpen={isModalOpen}
            onRequestClose={closeModal}
            ariaHideApp={false}
            className="edit_avatarComponent_modal"
            overlayClassName="pwd-modal__overlay"
        >
            <div className="pwd-modal__header mb-3">
                <p style={{ fontSize: 22 }}>Edit Avatar Component</p>
                <div
                    onClick={closeModal}
                    onKeyDown={closeModal}
                    role="button"
                    tabIndex="0"
                >
                    <Icon icon="ep:close-bold" />
                </div>
            </div>
            <Stepper2 currentStep={currentStep} texts={["New Item", "Price"]} />
            {currentStep === 1 && (
                <>
                    <div className="input_div">
                        {showError ? (
                            Object.values(avatarError)[0] ? (
                                <Alert severity="error">
                                    {Object.values(avatarError)[0]}
                                </Alert>
                            ) : (
                                <Alert severity="success">
                                    Success! Please click Next Button
                                </Alert>
                            )
                        ) : (
                            ""
                        )}
                        {error ? <Alert severity="error">{error}</Alert> : ""}
                        <div className="row">
                            <div className="col-sm-4">
                                <p>Category</p>
                                <Select
                                    className="black_input mb-3"
                                    value={category}
                                    onChange={(selected) => {
                                        setCategory(selected);
                                        setSvgFile({
                                            ...initialAvatarData,
                                            groupId: selected.value,
                                        });
                                    }}
                                    options={categories}
                                    styles={customSelectStyles}
                                />
                                <p>Upload File</p>
                                <div className="upload">
                                    <p
                                        className="file_name"
                                        title={svgFile.filename}
                                    >
                                        {svgFile.filename}
                                    </p>
                                    <p className="upload_btn">
                                        <label htmlFor="avatar">
                                            <span>
                                                <Icon icon="lucide:upload" />
                                            </span>
                                        </label>
                                        <input
                                            type="file"
                                            name="avatar"
                                            id="avatar"
                                            accept=".svg"
                                            hidden
                                            onChange={selectAvatarComponent}
                                        />
                                    </p>
                                </div>
                            </div>
                            <div id="position" className="col-sm-4">
                                <div className="mb-3">
                                    <p>Top (%)</p>
                                    <input
                                        className="black_input"
                                        type="number"
                                        max={100}
                                        min={-100}
                                        value={svgFile.top}
                                        onChange={(e) =>
                                            setSvgFile({
                                                ...svgFile,
                                                top: Number(e.target.value),
                                            })
                                        }
                                    />
                                </div>
                                <div className="mb-3">
                                    <p>Left (%)</p>
                                    <input
                                        className="black_input"
                                        type="number"
                                        max={100}
                                        min={-100}
                                        value={svgFile.left}
                                        onChange={(e) =>
                                            setSvgFile({
                                                ...svgFile,
                                                left: Number(e.target.value),
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <p>Width (%)</p>
                                    <input
                                        className="black_input"
                                        type="number"
                                        max={200}
                                        min={0}
                                        value={svgFile.width}
                                        onChange={(e) =>
                                            setSvgFile({
                                                ...svgFile,
                                                width: Number(e.target.value),
                                            })
                                        }
                                    />
                                </div>
                            </div>
                            <div className="col-sm-4">
                                <div className="profile m-auto">
                                    <div className="image_div">
                                        {category.value === "hairStyle" ||
                                        !category.value ? (
                                            <img
                                                src={EmptyAvatar}
                                                alt="Background Avatar"
                                            />
                                        ) : (
                                            ""
                                        )}
                                        {category.value === "expression" ? (
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
                                        {category.value === "hat" ||
                                        category.value === "other" ||
                                        category.value === "facialStyle" ? (
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
                                        {svgFile.svg ? (
                                            <div
                                                style={{
                                                    top: `${svgFile.top}%`,
                                                    left: `${svgFile.left}%`,
                                                    width: `${svgFile.width}%`,
                                                }}
                                            >
                                                {parse(svgFile.svg)}
                                            </div>
                                        ) : (
                                            ""
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="button_div">
                        <button className="btn previous" onClick={closeModal}>
                            Cancel
                        </button>
                        <button className="btn next" onClick={setAvatarData}>
                            Next
                        </button>
                    </div>
                </>
            )}
            {currentStep === 2 && (
                <>
                    <div className="input_div">
                        {showError ? (
                            Object.values(avatarInfoError)[0] ? (
                                <Alert severity="error">
                                    {Object.values(avatarInfoError)[0]}
                                </Alert>
                            ) : (
                                <Alert severity="success">
                                    Success! Please click Next Button
                                </Alert>
                            )
                        ) : (
                            ""
                        )}
                        <div className="row">
                            <div className="col-sm-4">
                                <p>
                                    Price{" "}
                                    {Number(avatarInfo.price) === 0
                                        ? "(Free)"
                                        : ""}
                                </p>
                                <NumberFormat
                                    className={`black_input`}
                                    placeholder="Enter number"
                                    thousandSeparator={true}
                                    allowNegative={false}
                                    value={avatarInfo.price}
                                    onValueChange={(values) =>
                                        setAvatarInfo({
                                            ...avatarInfo,
                                            price: values.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="col-sm-4">
                                <p>
                                    Limitation{" "}
                                    {Number(avatarInfo.limitation) === 0
                                        ? "(Unlimited)"
                                        : ""}
                                </p>
                                <NumberFormat
                                    className={`black_input`}
                                    placeholder="Enter number"
                                    thousandSeparator={true}
                                    allowNegative={false}
                                    value={avatarInfo.limitation}
                                    onValueChange={(values) =>
                                        setAvatarInfo({
                                            ...avatarInfo,
                                            limitation: values.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="col-sm-4">
                                <p>Tier</p>
                                <Select
                                    className="black_input mb-3"
                                    value={avatarInfo.tier}
                                    onChange={(selected) => {
                                        setAvatarInfo({
                                            ...avatarInfo,
                                            tier: selected,
                                        });
                                    }}
                                    options={tiers}
                                    styles={customSelectStyles}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="button_div">
                        <button
                            className="btn previous"
                            onClick={() => setCurrentStep(1)}
                        >
                            Previous
                        </button>
                        <button className="btn next" onClick={setPriceData}>
                            Next
                        </button>
                    </div>
                </>
            )}
            {currentStep === 3 && (
                <>
                    <div className="input_div">
                        {showError ? (
                            Object.values(avatarInfoError)[0] ? (
                                <Alert severity="error">
                                    {Object.values(avatarInfoError)[0]}
                                </Alert>
                            ) : (
                                <Alert severity="success">
                                    Success! Please click Next Button
                                </Alert>
                            )
                        ) : (
                            ""
                        )}
                        <div className="row">
                            <div className="col-md-6">
                                <p>
                                    Price:{" "}
                                    <span>
                                        {Number(avatarInfo.price) === 0
                                            ? "0 = Free"
                                            : avatarInfo.price}
                                    </span>
                                </p>
                                <p>
                                    Limitation:{" "}
                                    <span>
                                        {Number(avatarInfo.limitation) === 0
                                            ? "0 = Unlimited"
                                            : avatarInfo.limitation}
                                    </span>
                                </p>
                                <p>
                                    Tier: <span>{avatarInfo.tier.label}</span>
                                </p>
                            </div>
                            <div className="col-md-6">
                                <div className="profile m-auto">
                                    <div className="image_div">
                                        {category.value === "hairStyle" ||
                                        !category.value ? (
                                            <img
                                                src={EmptyAvatar}
                                                alt="Background Avatar"
                                            />
                                        ) : (
                                            ""
                                        )}
                                        {category.value === "expression" ? (
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
                                        {category.value === "hat" ||
                                        category.value === "other" ||
                                        category.value === "facialStyle" ? (
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
                                        {svgFile.svg ? (
                                            <div
                                                style={{
                                                    top: `${svgFile.top}%`,
                                                    left: `${svgFile.left}%`,
                                                    width: `${svgFile.width}%`,
                                                }}
                                            >
                                                {parse(svgFile.svg)}
                                            </div>
                                        ) : (
                                            ""
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="button_div">
                        <button
                            className="btn previous"
                            onClick={() => setCurrentStep(2)}
                        >
                            Previous
                        </button>
                        <button
                            className="btn next"
                            disabled={pending}
                            onClick={handleSubmit}
                        >
                            {pending ? "Saving. . ." : "Save"}
                        </button>
                    </div>
                </>
            )}
        </Modal>
    );
};

export default EditAvatarComponentModal;

const customSelectStyles = {
    option: (provided, state) => ({
        ...provided,
        color: "white",
        backgroundColor: state.isSelected ? "#23c865" : "#1e1e1e",
    }),
    control: (provided) => ({
        ...provided,
        backgroundColor: "#1e1e1e",
        borderWidth: 0,
        borderRadius: 0,
        fontSize: 14,
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
