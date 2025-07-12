import React, { useState } from "react";
import { useVerification } from "./verification-context";
import ModernPlacesAutocomplete from "../common/ModernPlacesAutocomplete";

const LocationSearchInput = () => {
    const verification = useVerification();
    const [address, setAddress] = useState("");

    const handleChange = (newAddress) => {
        setAddress(newAddress);
        verification.setAddress(newAddress);
    };

    const handleSelect = (selectedAddress) => {
        setAddress(selectedAddress);
        verification.setAddress(selectedAddress);
    };

    return (
        <ModernPlacesAutocomplete
            value={address}
            onChange={handleChange}
            onSelect={handleSelect}
            placeholder="Search your address"
            theme="light"
        />
    );
};

export default LocationSearchInput;
