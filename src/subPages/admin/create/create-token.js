import React, { useState, useMemo } from "react";
import { useDispatch } from "react-redux";
import { Link } from "gatsby";
import { Icon } from "@iconify/react";
import parse from "html-react-parser";
import Alert from "@mui/material/Alert";

import Seo from "../../../components/seo";
import Stepper2 from "../../../components/admin/Stepper2";
import LayoutForCreate from "../../../components/admin/LayoutForCreate";
import { create_Token } from "../../../store/actions/tokenAction";

const IndexPage = () => {
    const dispatch = useDispatch();

    const [currentStep, setCurrentStep] = useState(1);
    const [showError, setShowError] = useState(false);
    const [error, setError] = useState("");
    const [pending, setPending] = useState(false);

    //------- Token Details and Validation
    // Token Details
    const [details, setDetails] = useState({
        name: "",
        address: "",
        symbol: "",
        network: "",
    });

    // Token Details Data Validation
    const detailsError = useMemo(() => {
        if (!details.name) return { name: "Token Name is required" };
        if (!details.address) return { address: "Token Address is required" };
        if (!details.symbol) return { symbol: "Token Symbol is required" };
        if (!details.network) return { network: "Token Network is required" };
        return {};
    }, [details]);

    //-------- Token Icon and Validation
    // Token Icon
    const initialIconData = { filename: "", svg: "" };
    const [svgFile, setSvgFile] = useState(initialIconData);

    // Token Icon Validation
    const tokenIconError = useMemo(() => {
        if (!svgFile.filename) return "Please upload the Token Icon";
        return "";
    }, [svgFile]);

    const selectTokenIcon = (event) => {
        event.preventDefault();
        const file = event.target.files[0];

        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const svg = e.target.result;
                if (file.type.indexOf("svg") > 0) {
                    setSvgFile({ ...svgFile, svg, filename: file.name });
                    setError("");
                } else {
                    setError("Only SVG file can be uploaded");
                    setSvgFile(initialIconData);
                }
            };
            reader.readAsText(file);
        }
    };
    // console.log(svgFile.svg)

    const setTokenDetailsData = () => {
        if (Object.values(detailsError)[0]) {
            setShowError(true);
            return;
        }
        setCurrentStep(2);
        setShowError(false);
    };

    const setTokenIconData = () => {
        if (tokenIconError) {
            setShowError(true);
            return;
        }
        setCurrentStep(3);
        setShowError(false);
    };

    const handleSubmit = async () => {
        setPending(true);
        const createData = {
            tokenName: details.name,
            tokenSymbol: details.symbol,
            network: details.network,
            address: details.address,
            symbol: svgFile.svg,
        };
        await dispatch(create_Token(createData));
        setPending(false);
    };

    return (
        <>
            <Seo title="Create Token" />
            <main className="create-token-page">
                <LayoutForCreate>
                    <Link className="close" to="/admin">
                        <Icon icon="codicon:chrome-close" />
                    </Link>
                    <p className="subtitle">Add Token</p>
                    <Stepper2
                        currentStep={currentStep}
                        texts={["Details", "Icon"]}
                    />
                    {currentStep === 1 && (
                        <>
                            <div className="input_div">
                                {showError ? (
                                    Object.values(detailsError)[0] ? (
                                        <Alert severity="error">
                                            {Object.values(detailsError)[0]}
                                        </Alert>
                                    ) : (
                                        <Alert severity="success">
                                            Success! Please click Next Button
                                        </Alert>
                                    )
                                ) : (
                                    ""
                                )}
                                <div className="div1">
                                    <div>
                                        <p>Token Name</p>
                                        <input
                                            className={`black_input ${showError && detailsError.name ? "error" : ""}`}
                                            value={details.name}
                                            onChange={(e) =>
                                                setDetails({
                                                    ...details,
                                                    name: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <p>Token Address</p>
                                        <input
                                            className={`black_input ${showError && detailsError.address ? "error" : ""}`}
                                            value={details.address}
                                            onChange={(e) =>
                                                setDetails({
                                                    ...details,
                                                    address: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="div1 mt-3">
                                    <div>
                                        <p>Token Symbol</p>
                                        <input
                                            className={`black_input ${showError && detailsError.symbol ? "error" : ""}`}
                                            value={details.symbol}
                                            onChange={(e) =>
                                                setDetails({
                                                    ...details,
                                                    symbol: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <p>Token Network</p>
                                        <input
                                            className={`black_input ${showError && detailsError.network ? "error" : ""}`}
                                            value={details.network}
                                            onChange={(e) =>
                                                setDetails({
                                                    ...details,
                                                    network: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="button_div">
                                <Link className="btn previous" to="/admin">
                                    Cancel
                                </Link>
                                <button
                                    className="btn next"
                                    onClick={setTokenDetailsData}
                                >
                                    Next
                                </button>
                            </div>
                        </>
                    )}
                    {currentStep === 2 && (
                        <>
                            <div className="input_div row">
                                <div className="col-lg-6">
                                    {showError ? (
                                        tokenIconError ? (
                                            <Alert severity="error">
                                                {tokenIconError}
                                            </Alert>
                                        ) : (
                                            <Alert severity="success">
                                                Success! Please click Next
                                                Button
                                            </Alert>
                                        )
                                    ) : (
                                        ""
                                    )}
                                    {error ? (
                                        <Alert severity="error">{error}</Alert>
                                    ) : (
                                        ""
                                    )}
                                    <div>
                                        <p>Upload Token Icon</p>
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
                                                    onChange={selectTokenIcon}
                                                />
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-6">
                                    <div className="preview-icon">
                                        <div>{parse(svgFile.svg)}</div>
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
                                    onClick={setTokenIconData}
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
                                    tokenIconError ? (
                                        <Alert severity="error">
                                            {tokenIconError}
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
                                    <div className="col-sm-4 mb-4">
                                        <div className="preview-icon">
                                            <div style={{ border: "none" }}>
                                                {parse(svgFile.svg)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-sm-5 mb-3">
                                        <div className="item">
                                            <p>Token Name</p>
                                            <p className="desc">
                                                {details.name}
                                            </p>
                                        </div>
                                        <div className="item mt-3">
                                            <p>Token Address</p>
                                            <p className="desc">
                                                {details.address}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="col-sm-3">
                                        <div className="item">
                                            <p>Token Symbol</p>
                                            <p className="desc">
                                                {details.symbol}
                                            </p>
                                        </div>
                                        <div className="item mt-3">
                                            <p>Token Network</p>
                                            <p className="desc">
                                                {details.network}
                                            </p>
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
                                    onClick={handleSubmit}
                                    disabled={pending}
                                >
                                    {pending ? "Saving. . ." : "Save"}
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
