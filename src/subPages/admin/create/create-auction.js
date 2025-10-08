import React, { useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "gatsby";
import { Icon } from "@iconify/react";
import validator from "validator";
import NumberFormat from "../../../utilities/number";
import { useQuery } from "@apollo/client";
import dayjs from "../../../utilities/dayjs-config";
import * as Query from "./../../../apollo/graphqls/querys/Auction";

import Seo from "../../../components/seo";
import Stepper from "../../../components/admin/Stepper";
import LayoutForCreate from "../../../components/admin/LayoutForCreate";
import { secondsToDhmsString } from "../../../utilities/number";

import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { MobileDateTimePicker } from "@mui/x-date-pickers/MobileDateTimePicker";
import Select from "react-select";
import { fetch_Avatars } from "../../../store/actions/avatarAction";
import AvatarImage from "./../../../components/admin/shared/AvatarImage";
import { create_Auction } from "../../../store/actions/auctionAction";
import { ROUTES } from "../../../utilities/routes";

const IndexPage = () => {
    const dispatch = useDispatch();
    const avatars = useSelector((state) => state.data);
    const Avatars = Object.values(avatars).map((item) => {
        return { value: item.id, label: item.surname };
    });

    useEffect(() => {
        dispatch(fetch_Avatars());
    }, [dispatch]);

    const [currentStep, setCurrentStep] = useState(1);
    const [showError, setShowError] = useState(false);
    const [pending, setPending] = useState(false);
    const totalTokenAmount = 1000000;
    const prevReservedPrice = 100;

    //------- Round Data and Validation
    // Round Data - Initialize with dayjs objects
    const initialRoundData = {
        roundNumber: "",
        startTime: dayjs(),
        endTime: dayjs().add(1, "hour"),
    };
    const [roundData, setRoundData] = useState(initialRoundData);

    const { data: newRound } = useQuery(Query.GET_NEW_ROUND, {
        fetchPolicy: "network-only",
        onCompleted: () => {
            if (newRound && newRound.getNewRound) {
                setRoundData({
                    ...roundData,
                    roundNumber: newRound.getNewRound,
                });
            }
        },
    });

    const duration = useMemo(() => {
        if (!roundData.startTime || !roundData.endTime) return "";
        if (dayjs(roundData.endTime).isBefore(dayjs(roundData.startTime)))
            return "";
        return dayjs(roundData.endTime).diff(dayjs(roundData.startTime)) + 1000;
    }, [roundData]);

    // Round Data Validation
    const roundDataError = useMemo(() => {
        if (!roundData.roundNumber)
            return { roundNumber: "Round Number is required" };
        if (!roundData.startTime || !dayjs(roundData.startTime).isValid())
            return {
                startTime: "Round Start Time is required and must be valid",
            };
        if (!roundData.endTime || !dayjs(roundData.endTime).isValid())
            return { endTime: "Round End Time is required and must be valid" };
        if (
            dayjs(roundData.endTime).isBefore(dayjs(roundData.startTime)) ||
            dayjs(roundData.endTime).isSame(dayjs(roundData.startTime))
        )
            return { endTime: "Round End Time must be after Start Time" };
        return {};
    }, [roundData]);

    //-------- Token Data and Validation
    // Token Data
    const initialTokenData = { tokenAmount: "", ReservedPrice: "" };
    const [tokenData, setTokenData] = useState(initialTokenData);

    // Token Data Validation
    const tokenDataError = useMemo(() => {
        if (!tokenData.tokenAmount)
            return { tokenAmount: "Token Amount is required" };
        if (!validator.isNumeric(tokenData.tokenAmount))
            return { tokenAmount: "Token Amount must be number" };
        if (!tokenData.ReservedPrice)
            return { ReservedPrice: "Reserved Price is required" };
        if (!validator.isNumeric(tokenData.ReservedPrice))
            return { ReservedPrice: "Reserved Price must be number" };
        return {};
    }, [tokenData]);

    //--------- Avatar Data
    const [avatar, setAuctionAvatar] = useState({});
    const [avatarToken, setAvatarToken] = useState("");

    const avatarError = useMemo(() => {
        if (!avatar.label) return { avatar: "Please select a avatar" };
        if (!avatarToken) return { avatarToken: "Avatar Token is required" };
        return {};
    }, [avatar, avatarToken]);

    const setIDAndTime = () => {
        if (Object.values(roundDataError)[0]) {
            setShowError(true);
            return;
        }
        setCurrentStep(2);
        setShowError(false);
    };

    const setTokenAmountPrice = () => {
        if (Object.values(tokenDataError)[0]) {
            setShowError(true);
            return;
        }
        setCurrentStep(3);
        setShowError(false);
    };

    const setAvatar = () => {
        if (Object.values(avatarError)[0]) {
            setShowError(true);
            return;
        }
        setCurrentStep(4);
        setShowError(false);
    };

    const handleSubmit = async () => {
        setPending(true);
        const createData = {
            startedAt: dayjs(roundData.startTime).valueOf(),
            endedAt: dayjs(roundData.endTime).valueOf(),
            tokenAmount: Number(tokenData.tokenAmount),
            tokenPrice: Number(tokenData.ReservedPrice),
            avatarId: avatar.value,
            avatarToken: Number(avatarToken),
        };
        await dispatch(create_Auction(createData));
        setPending(false);
    };

    return (
        <>
            <Seo title="Create Auction" />
            <main className="create-auction-page">
                <LayoutForCreate>
                    <Link className="close" to={ROUTES.admin}>
                        <Icon icon="codicon:chrome-close" />
                    </Link>
                    <p className="subtitle">Create Auction Round</p>
                    <Stepper
                        currentStep={currentStep}
                        texts={["ID & Time", "Token", "Avatar", "Summary"]}
                    />
                    {currentStep === 1 && (
                        <>
                            <div className="input_div">
                                {showError ? (
                                    Object.values(roundDataError)[0] ? (
                                        <Alert severity="error">
                                            {Object.values(roundDataError)[0]}
                                        </Alert>
                                    ) : (
                                        <Alert severity="success">
                                            Success!
                                        </Alert>
                                    )
                                ) : (
                                    ""
                                )}
                                <div className="row">
                                    <div className="col-md-6">
                                        <p className="form-label">
                                            Round Number
                                        </p>
                                        <input
                                            className="white_input"
                                            readOnly
                                            value={roundData.roundNumber}
                                        />
                                    </div>
                                    <LocalizationProvider
                                        dateAdapter={AdapterDayjs}
                                    >
                                        <div className="col-md-6">
                                            <p
                                                className={`form-label ${showError && roundDataError.startTime ? "error" : ""}`}
                                            >
                                                Round Start Time
                                            </p>
                                            <MobileDateTimePicker
                                                showTodayButton={true}
                                                value={roundData.startTime}
                                                onChange={(newValue) => {
                                                    setRoundData({
                                                        ...roundData,
                                                        startTime: newValue,
                                                    });
                                                }}
                                                renderInput={(params) => (
                                                    <TextField {...params} />
                                                )}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <p
                                                className={`form-label ${showError && roundDataError.endTime ? "error" : ""}`}
                                            >
                                                Round End Time
                                            </p>
                                            <MobileDateTimePicker
                                                showTodayButton
                                                value={roundData.endTime}
                                                onChange={(newValue) => {
                                                    setRoundData({
                                                        ...roundData,
                                                        endTime: newValue,
                                                    });
                                                }}
                                                renderInput={(params) => (
                                                    <TextField {...params} />
                                                )}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <p>Total Time</p>
                                            <input
                                                className="white_input"
                                                readOnly
                                                value={secondsToDhmsString(
                                                    duration / 1000,
                                                )}
                                            />
                                        </div>
                                    </LocalizationProvider>
                                </div>
                            </div>
                            <div className="button_div">
                                <Link
                                    className="btn previous"
                                    to={ROUTES.admin}
                                >
                                    Cancel
                                </Link>
                                <button
                                    className="btn next"
                                    onClick={setIDAndTime}
                                >
                                    Next
                                </button>
                            </div>
                        </>
                    )}
                    {currentStep === 2 && (
                        <>
                            <div className="input_div">
                                {showError ? (
                                    Object.values(tokenDataError)[0] ? (
                                        <Alert severity="error">
                                            {Object.values(tokenDataError)[0]}
                                        </Alert>
                                    ) : (
                                        <Alert severity="success">
                                            Success!
                                        </Alert>
                                    )
                                ) : (
                                    ""
                                )}
                                <div className="row">
                                    <div className="col-md-6">
                                        <p className="form-label">
                                            Token Amount
                                        </p>
                                        <NumberFormat
                                            className="white_input"
                                            value={tokenData.tokenAmount}
                                            onValueChange={(values) => {
                                                setTokenData({
                                                    ...tokenData,
                                                    tokenAmount: values.value,
                                                });
                                            }}
                                            thousandSeparator={true}
                                            placeholder="Enter token amount"
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <p className="form-label">
                                            Reserved Price ($)
                                        </p>
                                        <NumberFormat
                                            className="white_input"
                                            value={tokenData.ReservedPrice}
                                            onValueChange={(values) => {
                                                setTokenData({
                                                    ...tokenData,
                                                    ReservedPrice: values.value,
                                                });
                                            }}
                                            thousandSeparator={true}
                                            placeholder="Enter reserved price"
                                            prefix="$"
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
                                <button
                                    className="btn next"
                                    onClick={setTokenAmountPrice}
                                >
                                    Next
                                </button>
                            </div>
                        </>
                    )}
                    {currentStep === 3 && (
                        <>
                            <div className="input_div">
                                {showError ? (
                                    Object.values(avatarError)[0] ? (
                                        <Alert severity="error">
                                            {Object.values(avatarError)[0]}
                                        </Alert>
                                    ) : (
                                        <Alert severity="success">
                                            Success!
                                        </Alert>
                                    )
                                ) : (
                                    ""
                                )}
                                <div className="row">
                                    <div className="col-md-6">
                                        <p className="form-label">
                                            Select Avatar
                                        </p>
                                        <Select
                                            styles={customSelectStyles}
                                            value={avatar}
                                            onChange={setAuctionAvatar}
                                            options={Avatars}
                                            placeholder="Choose Avatar"
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <p className="form-label">
                                            Avatar Token
                                        </p>
                                        <NumberFormat
                                            className="white_input"
                                            value={avatarToken}
                                            onValueChange={(values) => {
                                                setAvatarToken(values.value);
                                            }}
                                            thousandSeparator={true}
                                            placeholder="Enter avatar token amount"
                                        />
                                    </div>
                                </div>
                                {avatar.value && (
                                    <div className="avatar_preview">
                                        <p className="form-label">
                                            Avatar Preview
                                        </p>
                                        <AvatarImage avatarId={avatar.value} />
                                    </div>
                                )}
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
                                    onClick={setAvatar}
                                >
                                    Next
                                </button>
                            </div>
                        </>
                    )}
                    {currentStep === 4 && (
                        <>
                            <div className="input_div">
                                <div className="row">
                                    <div className="col-sm-4 col-6">
                                        <div className="item">
                                            <p>Round ID</p>
                                            <p>Auto-generated</p>
                                        </div>
                                        <div className="item">
                                            <p>Round Number</p>
                                            <p>{roundData.roundNumber}</p>
                                        </div>
                                        <div className="item">
                                            <p>Round Time</p>
                                            <p>
                                                {secondsToDhmsString(
                                                    duration / 1000,
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="col-sm-5 col-6">
                                        <div className="item">
                                            <p>Token Amount</p>
                                            <p>{tokenData.tokenAmount}</p>
                                        </div>
                                        <div className="item">
                                            <p>Reserved Price</p>
                                            <p>${tokenData.ReservedPrice}</p>
                                        </div>
                                        <div className="item">
                                            <p>Avatar Token</p>
                                            <p>{avatarToken}</p>
                                        </div>
                                    </div>
                                    <div className="col-sm-3">
                                        <div className="item">
                                            <p>Avatar</p>
                                            <p>{avatar.label}</p>
                                        </div>
                                        {avatar.value && (
                                            <AvatarImage
                                                avatarId={avatar.value}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="button_div">
                                <button
                                    className="btn previous"
                                    onClick={() => setCurrentStep(3)}
                                >
                                    Previous
                                </button>
                                <button
                                    className="btn next"
                                    onClick={handleSubmit}
                                    disabled={pending}
                                >
                                    {pending ? "Creating..." : "Create Auction"}
                                </button>
                            </div>
                        </>
                    )}
                </LayoutForCreate>
            </main>
        </>
    );
};

export default IndexPage;

const customSelectStyles = {
    option: (provided, state) => ({
        ...provided,
        color: "white",
        backgroundColor: state.isSelected ? "#0066cc" : "#2d3748",
        "&:hover": {
            backgroundColor: "#4a5568",
        },
    }),
    control: (provided) => ({
        ...provided,
        backgroundColor: "#2d3748",
        borderColor: "#4a5568",
        color: "white",
    }),
    singleValue: (provided) => ({
        ...provided,
        color: "white",
    }),
    menu: (provided) => ({
        ...provided,
        backgroundColor: "#2d3748",
    }),
};
