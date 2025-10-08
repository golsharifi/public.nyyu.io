import React, { useState, useMemo } from "react";
import { Icon } from "@iconify/react";
import { Input } from "../common/FormControl";
import Select from "react-select";
import { countryList } from "../../utilities/countryAlpha2";
import { getCountryCallingCode } from "react-phone-number-input/input";
import CustomSpinner from "../common/custom-spinner";

const Countries = countryList.map((item) => ({
    label: item.name,
    value: item["alpha-2"],
    flag: `https://flagcdn.com/24x18/${item["alpha-2"].toLowerCase()}.png`,
}));

export default function ConnectMobile({
    confirm,
    loading,
    error: confirmError,
}) {
    const [country, setCountry] = useState(null);
    const [countryCode, setCountryCode] = useState("");
    const [mobile, setMobile] = useState("");
    const [showError, setShowError] = useState(false);

    // Enhanced phone number validation
    const error = useMemo(() => {
        // Don't show validation errors if only country code is present
        if (!mobile || mobile.trim() === "" || mobile === countryCode.trim()) {
            return null; // Allow empty or just country code
        }

        if (!mobile.startsWith("+")) {
            return "Phone number must include country code (e.g., +1234567890)";
        }

        // Remove all non-digit characters except '+'
        const digitsOnly = mobile.replace(/[^\d]/g, "");

        if (digitsOnly.length < 7) {
            return "Phone number is too short";
        }

        if (digitsOnly.length > 15) {
            return "Phone number is too long";
        }

        // E.164 format validation - but allow space after country code
        const cleanMobile = mobile.replace(/\s/g, ""); // Remove spaces for validation
        const e164Pattern = /^\+[1-9]\d{1,14}$/;
        if (!e164Pattern.test(cleanMobile)) {
            return "Please enter a valid phone number with country code";
        }

        return null;
    }, [mobile, countryCode]);

    const handleSubmit = () => {
        // Check if we have a valid phone number (not just country code)
        if (!mobile || mobile.trim() === "" || mobile === countryCode.trim()) {
            setShowError(true);
            return;
        }

        if (error) {
            setShowError(true);
            return;
        }

        // Additional validation before confirming
        if (!country) {
            setShowError(true);
            return;
        }

        console.log("📱 Submitting phone number:", mobile);
        // Remove spaces before sending to backend
        const cleanMobile = mobile.replace(/\s/g, "");
        confirm(cleanMobile);
    };

    const handlePhoneChange = (e) => {
        const input = e.target.value;

        // If user types without selecting country first, try to detect
        if (!countryCode && input.startsWith("+")) {
            setMobile(input);
        } else if (countryCode) {
            // Ensure the country code stays at the beginning
            if (input.startsWith(countryCode)) {
                setMobile(input);
            } else {
                // If user deleted part of country code, reset to just country code
                if (input.length < countryCode.length) {
                    setMobile(countryCode);
                } else {
                    // Append new input to country code
                    const newDigits = input.replace(/[^\d]/g, "");
                    const countryDigits = countryCode.replace(/[^\d]/g, "");
                    const userDigits = newDigits.substring(
                        countryDigits.length,
                    );
                    setMobile(countryCode + userDigits);
                }
            }
        } else {
            setMobile(input);
        }

        // Clear error when user starts typing
        if (showError) {
            setShowError(false);
        }
    };

    const handleCountryChange = (selected) => {
        try {
            const callingCode = getCountryCallingCode(selected?.value);
            const code = `+${callingCode} `; // Added space after country code
            setCountry(selected);
            setCountryCode(code);
            setMobile(code);
            console.log("📱 Selected country:", selected.label, "Code:", code);
        } catch (error) {
            console.error("Error getting country calling code:", error);
        }
    };

    return (
        <div className="input_mobile form-group">
            <h4 className="text-center">Connect Mobile</h4>
            <div className="mobile-input-field mt-3">
                <div className="country-code-select">
                    {/* <Icon
                        icon="akar-icons:search"
                        className="search-icon text-light"
                    /> */}
                    <Select
                        className="mb-2"
                        options={Countries}
                        value={country}
                        onChange={handleCountryChange}
                        placeholder="Select Country"
                        isSearchable={true}
                        formatOptionLabel={(option, { context }) => {
                            return (
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                    }}
                                >
                                    <img
                                        src={option.flag}
                                        alt={option.label}
                                        style={{
                                            width: "24px",
                                            height: "18px",
                                            marginRight: "8px",
                                            borderRadius: "2px",
                                        }}
                                    />
                                    <span>{option.label}</span>
                                </div>
                            );
                        }}
                        styles={{
                            control: (provided) => ({
                                ...provided,
                                backgroundColor: "#2a2a2a",
                                borderColor: "#444",
                                "&:hover": {
                                    borderColor: "#666",
                                },
                            }),
                            option: (provided, state) => ({
                                ...provided,
                                backgroundColor: state.isFocused
                                    ? "#3a3a3a"
                                    : "#2a2a2a",
                                color: "white",
                            }),
                            singleValue: (provided) => ({
                                ...provided,
                                display: "flex",
                                alignItems: "center",
                                color: "white",
                                overflow: "visible",
                            }),
                            valueContainer: (provided) => ({
                                ...provided,
                                maxHeight: "40px",
                            }),
                            placeholder: (provided) => ({
                                ...provided,
                                color: "#888",
                            }),
                            input: (provided) => ({
                                ...provided,
                                color: "white",
                            }),
                        }}
                    />
                </div>
                <Input
                    type="text"
                    value={mobile}
                    onChange={handlePhoneChange}
                    placeholder={
                        countryCode
                            ? `${countryCode}123456789`
                            : "Select country first"
                    }
                    style={{
                        backgroundColor: "#2a2a2a",
                        borderColor: error && showError ? "#dc3545" : "#444",
                        color: "white",
                    }}
                />
                {showError && error && (
                    <p
                        className="text-danger mb-2 mt-1"
                        style={{ fontSize: "14px" }}
                    >
                        {error}
                    </p>
                )}
                {confirmError && (
                    <p
                        className="text-danger mb-2 mt-1"
                        style={{ fontSize: "14px" }}
                    >
                        {confirmError}
                    </p>
                )}
            </div>
            <p className="mb-4 text-light">
                You will receive an SMS code to the number above
            </p>
            <button
                className={`btn-primary next-step w-100 d-flex align-items-center justify-content-center py-2 ${!country || error || loading ? "opacity-50" : ""}`}
                onClick={handleSubmit}
                disabled={
                    !country ||
                    !mobile ||
                    mobile === countryCode.trim() ||
                    !!error ||
                    loading
                }
            >
                <div className={`${loading ? "opacity-100" : "opacity-0"}`}>
                    <CustomSpinner />
                </div>
                <div className={`fs-20px ${loading ? "ms-3" : "pe-4"}`}>
                    Confirm Number
                </div>
            </button>
        </div>
    );
}
