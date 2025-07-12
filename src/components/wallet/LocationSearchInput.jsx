import React from "react";
import ModernPlacesAutocomplete from "../common/ModernPlacesAutocomplete";

const LocationSearchInput = ({ address, setAddress, className }) => {
    const handleChange = (newAddress) => {
        setAddress(newAddress);
    };

    const handleSelect = (selectedAddress) => {
        setAddress(selectedAddress);
    };

    return (
        <ModernPlacesAutocomplete
            value={address}
            onChange={handleChange}
            onSelect={handleSelect}
            placeholder="Search address"
            className={className}
            theme="dark"
        />
    );
};

export default LocationSearchInput;
