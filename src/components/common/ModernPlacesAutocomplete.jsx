import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Icon } from "@iconify/react";

const ModernPlacesAutocomplete = ({
    value = "",
    onChange,
    onSelect,
    placeholder = "Search address",
    className = "",
    theme = "light", // "light" or "dark"
}) => {
    const inputRef = useRef(null);
    const autocompleteRef = useRef(null);
    const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadGoogleMaps = async () => {
            try {
                const apiKey = process.env.GATSBY_GOOGLE_MAPS_API_KEY;

                console.log(
                    "ModernPlacesAutocomplete - Google Maps API Key check:",
                    {
                        hasKey: !!apiKey,
                        keyPreview: apiKey
                            ? `${apiKey.substring(0, 10)}***`
                            : "undefined",
                        keyLength: apiKey ? apiKey.length : 0,
                        environment: process.env.NODE_ENV,
                    },
                );

                // Check if Google Maps API key is available
                if (!apiKey || apiKey === "undefined" || apiKey.trim() === "") {
                    throw new Error(
                        "Google Maps API key not configured. Please check GATSBY_GOOGLE_MAPS_API_KEY environment variable.",
                    );
                }

                // Check if already loaded
                if (window.google?.maps?.places?.Autocomplete) {
                    setIsGoogleMapsLoaded(true);
                    setIsLoading(false);
                    return;
                }

                // Load the script
                await loadGoogleMapsScript(apiKey);
                setIsGoogleMapsLoaded(true);
                setIsLoading(false);
            } catch (err) {
                console.error("Failed to load Google Maps:", err);
                setError(err.message);
                setIsLoading(false);

                // Disable Google Maps functionality gracefully
                setIsGoogleMapsLoaded(false);
            }
        };

        loadGoogleMaps();
    }, []);

    useEffect(() => {
        if (
            isGoogleMapsLoaded &&
            inputRef.current &&
            !autocompleteRef.current
        ) {
            try {
                // Initialize the autocomplete
                autocompleteRef.current =
                    new window.google.maps.places.Autocomplete(
                        inputRef.current,
                        {
                            types: ["address"],
                            fields: [
                                "place_id",
                                "formatted_address",
                                "address_components",
                                "geometry",
                            ],
                        },
                    );

                // Add listener for place selection
                autocompleteRef.current.addListener("place_changed", () => {
                    const place = autocompleteRef.current.getPlace();
                    if (place.formatted_address && place.geometry) {
                        onSelect?.(place.formatted_address);
                    }
                });

                // Style the dropdown after a short delay
                setTimeout(() => {
                    const pacContainer =
                        document.querySelector(".pac-container");
                    if (pacContainer) {
                        pacContainer.style.backgroundColor = "white";
                        pacContainer.style.color = "#333";
                        pacContainer.style.zIndex = "9999";
                    }
                }, 100);
            } catch (err) {
                console.error("Failed to initialize autocomplete:", err);
                setError("Failed to initialize address search");
            }
        }
    }, [isGoogleMapsLoaded, onSelect]);

    const loadGoogleMapsScript = (apiKey) => {
        return new Promise((resolve, reject) => {
            // Check if script already exists
            const existingScript = document.querySelector(
                'script[src*="maps.googleapis.com"]',
            );
            if (existingScript) {
                const checkLoaded = () => {
                    if (window.google?.maps?.places?.Autocomplete) {
                        resolve();
                    } else {
                        setTimeout(checkLoaded, 100);
                    }
                };
                checkLoaded();
                return;
            }

            // Create new script
            const script = document.createElement("script");
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
            script.async = true;
            script.defer = true;

            script.onload = () => {
                const checkLoaded = () => {
                    if (window.google?.maps?.places?.Autocomplete) {
                        resolve();
                    } else {
                        setTimeout(checkLoaded, 100);
                    }
                };
                checkLoaded();
            };

            script.onerror = () => {
                reject(new Error("Failed to load Google Maps script"));
            };

            document.head.appendChild(script);
        });
    };

    const handleInputChange = (e) => {
        onChange?.(e.target.value);
    };

    // Loading state
    if (isLoading) {
        return (
            <LoadingContainer className={className} theme={theme}>
                <div className="d-flex align-items-center">
                    <Icon icon="eos-icons:loading" className="me-2" />
                    <span>Loading address search...</span>
                </div>
            </LoadingContainer>
        );
    }

    // Error state - fallback to manual input
    if (error) {
        return (
            <FallbackContainer className={className} theme={theme}>
                <div id="search_div" className="d-flex align-items-center">
                    <p className="ps-2">
                        <Icon icon="fa6-solid:location-dot" />
                    </p>
                    <input
                        type="text"
                        value={value}
                        onChange={handleInputChange}
                        placeholder={`${placeholder} (manual entry)`}
                        className="location-search-input form-control border-0"
                    />
                </div>
                <small className="text-muted ps-4">
                    Address autocomplete unavailable - please enter manually
                </small>
            </FallbackContainer>
        );
    }

    // Normal state with Google Maps autocomplete
    return (
        <AutocompleteContainer className={className} theme={theme}>
            <div id="search_div" className="d-flex align-items-center">
                <p className="ps-2">
                    <Icon icon="akar-icons:search" />
                </p>
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    className="location-search-input form-control border-0"
                />
            </div>
        </AutocompleteContainer>
    );
};

export default ModernPlacesAutocomplete;

const BaseContainer = styled.div`
    position: relative;

    div#search_div {
        height: 47px;
        input {
            font-size: 13px;
        }
    }

    p {
        margin: 0;
    }
`;

const AutocompleteContainer = styled(BaseContainer)`
    div#search_div {
        background-color: ${(props) =>
            props.theme === "dark" ? "inherit" : "white"};
        border: 1px solid
            ${(props) => (props.theme === "dark" ? "#444" : "#ddd")};
        border-radius: 4px;
        padding: 0;

        input.location-search-input {
            background-color: transparent;
            border: none;
            outline: none;
            color: ${(props) => (props.theme === "dark" ? "white" : "black")};
            padding: 8px 12px;

            &::placeholder {
                color: ${(props) =>
                    props.theme === "dark"
                        ? "rgba(255,255,255,0.6)"
                        : "rgba(0,0,0,0.6)"};
            }
        }
    }

    p {
        color: ${(props) => (props.theme === "dark" ? "white" : "black")};
        margin: 0;
    }
`;

const FallbackContainer = styled(BaseContainer)`
    div#search_div {
        background-color: ${(props) =>
            props.theme === "dark" ? "inherit" : "white"};
        input {
            background-color: ${(props) =>
                props.theme === "dark" ? "inherit" : "white"};
            color: ${(props) => (props.theme === "dark" ? "white" : "black")};
        }
    }

    p {
        color: ${(props) => (props.theme === "dark" ? "white" : "black")};
    }

    small {
        color: ${(props) => (props.theme === "dark" ? "#ccc" : "#666")};
    }
`;

const LoadingContainer = styled(BaseContainer)`
    padding: 20px;
    text-align: center;
    background-color: ${(props) =>
        props.theme === "dark" ? "#2a2a2a" : "#f8f9fa"};
    border: 1px solid
        ${(props) => (props.theme === "dark" ? "#444" : "#dee2e6")};
    border-radius: 4px;
    color: ${(props) => (props.theme === "dark" ? "white" : "black")};
`;
