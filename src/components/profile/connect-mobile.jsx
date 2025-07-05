import React, { useState, useMemo } from "react"
// import validator from "validator";
import { Icon } from '@iconify/react'
import { Input } from "../common/FormControl"
import Select from "react-select"
import { countryList } from "../../utilities/countryAlpha2"
import { getCountryCallingCode } from "react-phone-number-input/input"

const Countries = countryList.map((item) => {
    return { label: item.name, value: item["alpha-2"] }
});

export default function ConnectMobile({ confirm }) {
    const [country, setCountry] = useState(null)
    const [countryCode, setCountryCode] = useState("")
    const [mobile, setMobile] = useState("")
    const [showError, setShowError] = useState(false);

    const error = useMemo(() => {
        if(!mobile) return 'Phone number is required';
    }, [mobile]);

    const handleSubmit = () => {
        if(error) {
            setShowError(true);
            return;
        }
        confirm(mobile);
    }
    return (
        <div className="input_mobile form-group">
            <h4 className="text-center">Connect Mobile</h4>
            <div className="mobile-input-field mt-3">
                <div className="country-code-select">
                    <Icon icon="akar-icons:search" className="search-icon text-light" />
                    <Select
                        className="mb-2"
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
                <Input
                    type="text"
                    value={mobile}
                    onChange={(e) => {
                        const input = e.target.value
                        setMobile(countryCode + input.substr(countryCode.length))
                    }}
                    placeholder='Phone number'
                />
                <p className="text-danger mb-2">{showError && error}</p>
            </div>
            <p className="mb-4">You will receive a sms code to the number above</p>
            <button className="btn-primary next-step w-100" onClick={handleSubmit}>
                Confirm Number
            </button>
        </div>
    )
}
