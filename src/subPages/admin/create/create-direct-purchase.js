import React, { useState, useMemo } from "react";
import { useDispatch } from "react-redux";
import { Link } from "gatsby";
import { Icon } from "@iconify/react";
import { useQuery } from "@apollo/client";
import validator from "validator";
import NumberFormat from "../../../utilities/number";
import dayjs from "../../../utilities/dayjs-config";

import Seo from "../../../components/seo";
import Stepper from "../../../components/admin/Stepper";
import LayoutForCreate from "../../../components/admin/LayoutForCreate";
import { secondsToDhmsString } from "../../../utilities/number";

import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { MobileDateTimePicker } from "@mui/x-date-pickers/MobileDateTimePicker";
import * as Query from "../../../apollo/graphqls/querys/Auction";
import { create_New_Presale } from "../../../store/actions/auctionAction";

const IndexPage = () => {
    const dispatch = useDispatch();

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

    useQuery(Query.GET_NEW_ROUND, {
        fetchPolicy: "network-only",
        onCompleted: (data) => {
            if (data.getNewRound) {
                setRoundData({ ...roundData, roundNumber: data.getNewRound });
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
    let roundDataError = {};
    roundDataError = useMemo(() => {
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
    const initialTokenData = {
        tokenAmount: "",
        ReservedPrice: "",
        totalTokenAmount: "",
        prevReservedPrice: "",
    };
    const [tokenData, setTokenData] = useState(initialTokenData);

    // Token Data Validation
    const tokenDataError = useMemo(() => {
        if (!tokenData.tokenAmount)
            return { tokenAmount: "Token Amount is required" };
        if (isNaN(tokenData.tokenAmount))
            return { tokenAmount: "Token Amount must be a number" };
        if (!tokenData.ReservedPrice)
            return { ReservedPrice: "Reserved Price is required" };
        if (isNaN(tokenData.ReservedPrice))
            return { ReservedPrice: "Reserved Price must be a number" };
        return {};
    }, [tokenData]);

    //-------- Task Data and Validation
    // Task Data
    const [taskData, setTaskData] = useState([{ task: "", url: "" }]);

    // Task Data Validation
    const taskDataError = useMemo(() => {
        const hasEmptyTasks = taskData.some((item) => !item.task.trim());
        if (hasEmptyTasks) return { item: "All tasks must be filled" };
        return {};
    }, [taskData]);

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

    const setTasks = () => {
        if (taskDataError.item) {
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
            conditions: taskData,
        };
        await dispatch(create_New_Presale(createData));
        setPending(false);
    };

    return (
        <>
            <Seo title="Create Direct Purchase" />
            <main className="create-direct-purchase-page">
                <LayoutForCreate>
                    <Link className="close" to="/admin">
                        <Icon icon="codicon:chrome-close" />
                    </Link>
                    <p className="subtitle">Create Direct Purchase Round</p>
                    <Stepper
                        currentStep={currentStep}
                        texts={["ID & Time", "Token", "Condition"]}
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
                                                className="datePicker1"
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
                                <Link className="btn previous" to="/admin">
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
                                    taskDataError.item ? (
                                        <Alert severity="error">
                                            {taskDataError.item}
                                        </Alert>
                                    ) : (
                                        <Alert severity="success">
                                            Success!
                                        </Alert>
                                    )
                                ) : (
                                    ""
                                )}
                                <div className="conditions_div">
                                    {taskData.map((item, index) => (
                                        <div
                                            key={index}
                                            className="condition_item"
                                        >
                                            <div className="row">
                                                <div className="col-md-5">
                                                    <p className="form-label">
                                                        Task {index + 1}
                                                    </p>
                                                    <input
                                                        className="white_input"
                                                        type="text"
                                                        value={item.task}
                                                        onChange={(e) => {
                                                            const newTaskData =
                                                                [...taskData];
                                                            newTaskData[
                                                                index
                                                            ].task =
                                                                e.target.value;
                                                            setTaskData(
                                                                newTaskData,
                                                            );
                                                        }}
                                                        placeholder="Enter task description"
                                                    />
                                                </div>
                                                <div className="col-md-5">
                                                    <p className="form-label">
                                                        URL (Optional)
                                                    </p>
                                                    <input
                                                        className="white_input"
                                                        type="url"
                                                        value={item.url}
                                                        onChange={(e) => {
                                                            const newTaskData =
                                                                [...taskData];
                                                            newTaskData[
                                                                index
                                                            ].url =
                                                                e.target.value;
                                                            setTaskData(
                                                                newTaskData,
                                                            );
                                                        }}
                                                        placeholder="Enter URL"
                                                    />
                                                </div>
                                                <div className="col-md-2">
                                                    {taskData.length > 1 && (
                                                        <button
                                                            className="btn-remove"
                                                            onClick={() => {
                                                                const newTaskData =
                                                                    taskData.filter(
                                                                        (
                                                                            _,
                                                                            i,
                                                                        ) =>
                                                                            i !==
                                                                            index,
                                                                    );
                                                                setTaskData(
                                                                    newTaskData,
                                                                );
                                                            }}
                                                        >
                                                            <Icon icon="mdi:delete" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <Icon
                                        className={`add_icon ${taskDataError.item ? "error" : ""}`}
                                        icon="akar-icons:plus"
                                        onClick={() =>
                                            setTaskData([
                                                ...taskData,
                                                { task: "", url: "" },
                                            ])
                                        }
                                    />
                                </div>
                            </div>
                            <div className="button_div">
                                <button
                                    className="btn previous"
                                    onClick={() => setCurrentStep(2)}
                                >
                                    Previous
                                </button>
                                <button className="btn next" onClick={setTasks}>
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
                                            <p>Tasks Count</p>
                                            <p>{taskData.length}</p>
                                        </div>
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
                                    {pending ? "Creating..." : "Create"}
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
