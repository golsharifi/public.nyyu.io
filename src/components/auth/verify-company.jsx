import { Link, navigate } from "gatsby";
import React, { useReducer, useCallback, useState } from "react";
import { Icon } from "@iconify/react";
import dayjs from "../../utilities/dayjs-config";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { MobileDateTimePicker } from "@mui/x-date-pickers/MobileDateTimePicker";
import SimpleHeader from "../header/simple-header";
import { Input } from "../common/FormControl";
import TextField from "@mui/material/TextField";
import { Trees } from "../../utilities/imgImport";
import { ROUTES } from "../../utilities/routes";
import PrivacyPolicy from "../verify-identity/privacy-policy";
import languages from "../../assets/lang/languages.json";
import SelectLang from "../verify-identity/select-lang";
import Seo from "../seo";

const Verifier = ({ isFirst }) => {
    const [state, setState] = useReducer(
        (old, action) => ({ ...old, ...action }),
        {
            business_name: "",
            email: "",
            us_citizen: true,
        },
    );
    const { business_name, email } = state;

    const handleInput = useCallback((e) => {
        e.preventDefault();
        setState({ [e.target.name]: e.target.value });
    }, []);

    return (
        <div className="d-flex justify-content-center verifiers">
            <div className="mx-2 input-name">
                <Input
                    type="text"
                    name="business_name"
                    label={isFirst ? "Full Name" : null}
                    value={business_name}
                    onChange={handleInput}
                    placeholder="Enter name"
                />
            </div>
            <div className="mx-2 input-name">
                <Input
                    type="text"
                    name="email"
                    label={isFirst ? "Email" : null}
                    value={email}
                    onChange={handleInput}
                    placeholder="Enter email"
                />
            </div>
            <div className="us-citizen-radio mx-2">
                <p className="form-label us-citizen-radio_title">
                    {isFirst ? "Holds US Citizenship or Residency" : ""}
                </p>
                <form
                    className="us-citizen-radio_buttons"
                    onChange={(e) => setState({ us_citizen: e.target.value })}
                >
                    <label className="container">
                        Yes
                        <input
                            type="radio"
                            id="yes"
                            defaultChecked
                            name="us_citizen"
                            value={true}
                        />
                        <span className="checkmark"></span>
                    </label>
                    <label className="container">
                        No
                        <input
                            type="radio"
                            id="no"
                            name="us_citizen"
                            value={false}
                        />
                        <span className="checkmark"></span>
                    </label>
                </form>
            </div>
        </div>
    );
};

const VerifyCompany = () => {
    const [langKey, setLangKey] = useState("en");
    const language = languages[langKey];
    const [state, setState] = useReducer(
        (old, action) => ({ ...old, ...action }),
        {
            step: -1,
            file: null,
            fileOpen: false,
            business_name: "",
            incop_date: dayjs(), // Initialize with dayjs object
            register_num: "",
            verifiers: ["1"],
        },
    );
    const { step, business_name, incop_date, verifiers } = state;

    const [agree, setAgree] = useState(false);

    const handleInput = useCallback((e) => {
        e.preventDefault();
        setState({ [e.target.name]: e.target.value });
    }, []);

    return (
        <>
            <Seo title="Verify Company" />
            <main className="verify-company">
                <SimpleHeader />
                <section>
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-6">
                                <div className="text_div">
                                    <SelectLang
                                        langKey={langKey}
                                        setLangKey={setLangKey}
                                    />
                                    <div className="icon">
                                        <Icon icon="fa:building" />
                                    </div>
                                    <p className="title">
                                        {language.verifyCorporation}
                                    </p>
                                    <p className="subtitle">
                                        {language.provideCorporationInfo}
                                    </p>
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="steps">
                                    {step === -1 && (
                                        <div className="step step0">
                                            <p className="caption">
                                                {language.beforeWeStart}
                                            </p>
                                            <PrivacyPolicy
                                                agree={agree}
                                                setAgree={setAgree}
                                                language={language}
                                            />
                                            <div className="btn_div">
                                                <Link
                                                    className="btn white"
                                                    to={ROUTES.home}
                                                >
                                                    {language.cancel}
                                                </Link>
                                                <button
                                                    className="btn blue"
                                                    disabled={!agree}
                                                    onClick={() =>
                                                        setState({ step: 0 })
                                                    }
                                                >
                                                    {language.start}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {step === 0 && (
                                        <div className="step step1 verify-step1">
                                            <div className="col-md-12">
                                                <Input
                                                    type="text"
                                                    name="business_name"
                                                    label="Business Name"
                                                    value={business_name}
                                                    onChange={handleInput}
                                                    placeholder="Name"
                                                />
                                                <p className="form-label mt-3">
                                                    Incorporation Date
                                                </p>
                                                <LocalizationProvider
                                                    dateAdapter={AdapterDayjs}
                                                >
                                                    <MobileDateTimePicker
                                                        inputFormat="yyyy-MM-dd"
                                                        value={incop_date}
                                                        onChange={(
                                                            newValue,
                                                        ) => {
                                                            setState({
                                                                incop_date:
                                                                    newValue ||
                                                                    dayjs(),
                                                            });
                                                        }}
                                                        renderInput={(
                                                            params,
                                                        ) => (
                                                            <TextField
                                                                {...params}
                                                            />
                                                        )}
                                                    />
                                                </LocalizationProvider>
                                            </div>
                                            <div className="btn_div">
                                                <button
                                                    className="btn white"
                                                    onClick={() =>
                                                        setState({ step: -1 })
                                                    }
                                                >
                                                    {language.previous}
                                                </button>
                                                <button
                                                    className="btn blue"
                                                    disabled={
                                                        !business_name.trim()
                                                    }
                                                    onClick={() =>
                                                        setState({ step: 1 })
                                                    }
                                                >
                                                    {language.next}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {step === 1 && (
                                        <div className="step step2">
                                            <p className="caption">
                                                Add Authorized Signatories
                                            </p>
                                            <p className="note">
                                                Every signatory will need to
                                                verify their identity
                                                individually.
                                            </p>
                                            {verifiers.map(
                                                (verifier, index) => (
                                                    <Verifier
                                                        key={index}
                                                        isFirst={index === 0}
                                                    />
                                                ),
                                            )}
                                            <div className="add_verifier">
                                                <Icon
                                                    icon="akar-icons:plus"
                                                    onClick={() =>
                                                        setState({
                                                            verifiers: [
                                                                ...verifiers,
                                                                verifiers.length +
                                                                    1,
                                                            ],
                                                        })
                                                    }
                                                />
                                                <p>Add another signatory</p>
                                            </div>
                                            <div className="btn_div">
                                                <button
                                                    className="btn white"
                                                    onClick={() =>
                                                        setState({ step: 0 })
                                                    }
                                                >
                                                    {language.previous}
                                                </button>
                                                <button
                                                    className="btn blue"
                                                    onClick={() =>
                                                        setState({ step: 2 })
                                                    }
                                                >
                                                    {language.next}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {step === 2 && (
                                        <div className="step step3">
                                            <p className="caption">
                                                Upload a document
                                            </p>
                                            <p className="note">
                                                Please upload a document that
                                                proves your business
                                                registration.
                                            </p>
                                            <div className="upload_div">
                                                <input
                                                    type="file"
                                                    id="document-upload"
                                                    onChange={(e) =>
                                                        setState({
                                                            file: e.target
                                                                .files[0],
                                                        })
                                                    }
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                />
                                                <label
                                                    htmlFor="document-upload"
                                                    className="upload-label"
                                                >
                                                    <Icon icon="material-symbols:upload" />
                                                    <span>
                                                        {state.file
                                                            ? state.file.name
                                                            : "Choose file to upload"}
                                                    </span>
                                                </label>
                                            </div>
                                            <div className="btn_div">
                                                <button
                                                    className="btn white"
                                                    onClick={() =>
                                                        setState({ step: 1 })
                                                    }
                                                >
                                                    {language.previous}
                                                </button>
                                                <button
                                                    className="btn blue"
                                                    disabled={!state.file}
                                                    onClick={() => {
                                                        // Handle file upload and form submission
                                                        console.log(
                                                            "Submitting company verification...",
                                                        );
                                                        navigate(ROUTES.home);
                                                    }}
                                                >
                                                    Submit Verification
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="trees">
                            <img src={Trees} alt="trees" />
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
};

export default VerifyCompany;
