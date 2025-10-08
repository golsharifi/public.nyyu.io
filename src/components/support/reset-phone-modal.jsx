import React from "react";
import { useState } from "react";
import Modal from "react-modal";

import CustomSpinner from "../common/custom-spinner";
import { FormInput } from "../common/FormControl";
import { FaExclamationCircle } from "@react-icons/all-files/fa/FaExclamationCircle";
import { Icon } from '@iconify/react';
import { getCountryCallingCode } from 'react-phone-number-input/input';
import Select from "react-select"

import { CloseIcon } from "../../utilities/imgImport";
import { countryList } from '../../utilities/countryAlpha2';
import { useMutation } from "@apollo/client";
import * as Mutation from '../../apollo/graphqls/mutations/Support';
import { showSuccessAlarm } from "../admin/AlarmModal";

const Countries = countryList.map((item) => {
    return { label: item.name, value: item["alpha-2"] }
});

const selectStyles = {
    option: (provided, state) => ({
        ...provided,
        borderBottom: 'none',
        color: 
            state.isSelected ? 'white' : 
            state.isFocused ? 'black' : 'black',
        backgroundColor: 
            state.isSelected ? 'black' : 
            state.isFocused ? 'gray' : 'white',
        padding: 5
    }),
    singleValue: (provided, state) => {
        return { ...provided };
    }
}

export default function ResetPhoneModal({ isOpen, setIsOpen }) {
    
    // some state vars
    const [ country, setCountry ] = useState(null);
    const [ countryCode, setCountryCode ] = useState("");
    const [ sentCode, setSentCode ] = useState("");
    const [ mobile, setMobile ] = useState("");
    const [ error, setError] = useState(null);   
    const [ loading, setLoading ] = useState(false);
    
    const [ pending, setPending ] = useState(false);
    const [ phoneVerify, setPhoneVerify ] = useState({
        sent:false, error: ''
    });
    const [ token, setToken ] = useState("");

    const [ verifyCode, setVerifyCode ] = useState("");
    const [ verifyPending, setVerifyPending ] = useState(false);
    const [ mailVerify, setMailVerify ] = useState({
        sent: false, error: '', email: ''
    });

    const [ sendVerifyCode ] = useMutation(
        Mutation.SEND_VERIFY_CODE, {
            onCompleted: data => {
                if(data.sendVerifyCode !== 'Failed') {
                    setMailVerify({...mailVerify, error: '', email: data.sendVerifyCode, sent: true});
                } else {
                    setMailVerify({...mailVerify, error: 'Cannot get verify code', email: '', sent: false});
                }
            },
            onError: err => {
                setMailVerify({...mailVerify, error: err.message, email: '', sent: false});
            }
        }
    )

    const [requesetPhone2FA] = useMutation(
        Mutation.REQUEST_PHONE_2FA, {
            onCompleted: data => {
                if(data.requestPhone2FA !== "Failed") {
                    setPhoneVerify({...phoneVerify, sent: true, error: ''});
                    setToken(data.requestPhone2FA);
                } else {
                    setPhoneVerify({...phoneVerify, sent: false, error: 'Cannot get SMS code'});
                }
            },
            onError: err => {
                setPhoneVerify({...phoneVerify, sent: false, error: err.message});
            }
        }
    )

    const [confirmPhone2FA] = useMutation(
        Mutation.CONFIRM_PHONE_2FA, {
            onCompleted: data => {
                if(data.confirmPhone2FA === 'Success') {
                    showSuccessAlarm('New phone number is verified.');
                    setIsOpen(false);
                } else {
                    setError('Invalid two-step verification code');    
                }
                setLoading(false);
            },
            onError: err => {
                setLoading(false);
                setError(err.message);
            }
        }
    )

    const handleSubmit = () => {
        setLoading(true);
        confirmPhone2FA({
            variables: {
                mailCode: verifyCode.trim(),
                smsCode: sentCode.trim(),
                token
            }
        })
    }

    const getCode = () => {
        if(pending) return;    
        setPhoneVerify({...phoneVerify, sent: false, error: ''});
        setPending(true);
        setTimeout(() => {
            setPending(false);
        }, 6000);
        requesetPhone2FA({
            variables: {
                phone: mobile
            }
        })
    }

    const getVerifyCode = () => {
        if(verifyPending) return;
        setMailVerify({...mailVerify, error: '', email: '', sent: false});
        setVerifyPending(true);
        setTimeout(() => {
            setVerifyPending(false);
        }, 6000);
        sendVerifyCode();
    }

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={() => setIsOpen(false)}
            className="support-modal border-0"
            overlayClassName="support-modal__overlay"
        >
            <div className="support-modal__header justify-content-end">
                <div
                    onClick={() => setIsOpen(false)}
                    onKeyDown={() => setIsOpen(false)}
                    role="button"
                    tabIndex="0"
                >
                    <img
                        width="14px"
                        height="14px"
                        src={CloseIcon}
                        alt="close"
                    />
                </div>
            </div>
            <div className="my-5">
                <div className="text-center">
                    <p className="text-capitalize fs-30px fw-bold lh-36px">
                        reset phone verification
                    </p>
                    <p className="fs-16px mt-2 text-light fw-normald">
                        To secure your account, please complete the following
                        verification
                    </p>
                </div>

                <div className="col-12 col-sm-10 col-md-8 col-lg-7 mx-auto text-light my-5">
                    <form action="form">
                        <div className="form-group">
                            <FormInput
                                type="text"
                                label="Email verification code"
                                value={verifyCode}
                                onChange={(e) => setVerifyCode(e.target.value)}
                                autoComplete='off'
                                placeholder="Enter code"
                            />
                        </div>
                        <div className="fs-12px d-flex">
                            <span className={(mailVerify.error ? "text-danger" : "")}>
                                {mailVerify.sent && 
                                    `The code has been sent to ${mailVerify.email}`
                                }
                                {mailVerify.error !== '' && mailVerify.error}
                            </span>
                            <span 
                                className={"fw-500 cursor-pointer ms-auto " + (verifyPending ? "txt-grey" : "txt-green") }
                                onClick={getVerifyCode}
                            >
                                Get Code
                            </span>
                        </div>
                        <div className="input_mobile form-group mb-4">
                            <div className="mobile-input-field mt-1">
                                <label className="mb-2">Select country</label>
                                <div className="country-code-select mb-4">
                                    <Icon icon="akar-icons:search" className="search-icon text-light" />
                                    <Select
                                        className="mb-2"
                                        styles={selectStyles}
                                        options={Countries}
                                        value={country}
                                        onChange={(selected) => {
                                            const code = `+${getCountryCallingCode(selected?.value)} `
                                            setCountry(selected)
                                            setCountryCode(code)
                                            setMobile(code)
                                        }}
                                        placeholder='Country'
                                    />
                                </div>
                                <FormInput
                                    type="text"
                                    label="New phone number"
                                    value={mobile}
                                    onChange={(e) => {
                                        const input = e.target.value;
                                        setMobile(countryCode + input.substr(countryCode.length))
                                    }}
                                    placeholder='Phone number'
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <FormInput
                                type="text"
                                label="New phone number verification"
                                value={sentCode}
                                onChange={(e) => setSentCode(e.target.value)}
                                placeholder="Enter code"
                            />
                        </div>
                        <div className="fs-12px d-flex">
                                <span className={(phoneVerify.error ? "text-danger" : "")}>
                                    {phoneVerify.sent && 
                                        `The code has been sent`
                                    }
                                    {phoneVerify.error !== '' && phoneVerify.error}
                                </span>
                                <span 
                                    className={"fw-500 cursor-pointer ms-auto " + (pending ? "txt-grey" : "txt-green") }
                                    onClick={getCode}
                                >
                                    Get Code
                                </span>
                        </div>
                        <div className="my-5">
                            {error && (
                                <span className="errorsapn">
                                    <FaExclamationCircle />{" "}
                                    {error}
                                </span>
                            )}
                            <button
                                type="submit"
                                className="btn-primary w-100 text-uppercase d-flex align-items-center justify-content-center py-2"
                                disabled={verifyCode.length < 6 || mailVerify.error !== '' || phoneVerify.error !== '' || loading || (sentCode.length < 6)}
                                onClick={handleSubmit}
                            >
                                <div
                                    className={`${
                                        loading ? "opacity-100" : "opacity-0"
                                    }`}
                                >
                                    <CustomSpinner />
                                </div>
                                <div
                                    className={`fs-20px ${
                                        loading ? "ms-3" : "pe-4"
                                    }`}
                                >
                                    verify
                                </div>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Modal>
    );
}

