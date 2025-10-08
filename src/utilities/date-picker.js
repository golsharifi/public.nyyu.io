import React, { useState, useRef, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

// Export the new DayPicker component
export { DayPicker };

// Legacy DayPickerInput compatibility component
export const DayPickerInput = ({
    value,
    onDayChange,
    placeholder = "Select a date",
    format = "MM/dd/yyyy",
    disabled = false,
    className = "",
    style = {},
    dayPickerProps = {},
    inputProps = {},
    ...props
}) => {
    const [selected, setSelected] = useState(value);
    const [inputValue, setInputValue] = useState(
        value ? formatDate(value, format) : "",
    );
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Update internal state when value prop changes
    useEffect(() => {
        setSelected(value);
        setInputValue(value ? formatDate(value, format) : "");
    }, [value, format]);

    // Handle date selection
    const handleSelect = (day) => {
        setSelected(day);
        setInputValue(day ? formatDate(day, format) : "");
        setIsOpen(false);

        if (onDayChange) {
            onDayChange(day);
        }
    };

    // Handle input change
    const handleInputChange = (e) => {
        const newValue = e.target.value;
        setInputValue(newValue);

        // Try to parse the date
        const parsedDate = parseDate(newValue, format);
        if (parsedDate && isValidDate(parsedDate)) {
            setSelected(parsedDate);
            if (onDayChange) {
                onDayChange(parsedDate);
            }
        }
    };

    // Handle click outside to close
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div
            ref={containerRef}
            className={`day-picker-input ${className}`}
            style={{ position: "relative", ...style }}
            {...props}
        >
            <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onFocus={() => setIsOpen(true)}
                placeholder={placeholder}
                disabled={disabled}
                className="day-picker-input__field"
                style={{
                    padding: "8px 12px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    fontSize: "14px",
                    width: "100%",
                    ...inputProps.style,
                }}
                {...inputProps}
            />

            {isOpen && (
                <div
                    className="day-picker-input__overlay"
                    style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        zIndex: 1000,
                        backgroundColor: "white",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                        marginTop: "2px",
                    }}
                >
                    <DayPicker
                        mode="single"
                        selected={selected}
                        onSelect={handleSelect}
                        defaultMonth={selected}
                        {...dayPickerProps}
                    />
                </div>
            )}
        </div>
    );
};

// Utility functions for date formatting and parsing
export const formatDate = (date, format = "MM/dd/yyyy") => {
    if (!date) return "";

    const d = new Date(date);
    if (!isValidDate(d)) return "";

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    switch (format) {
        case "MM/dd/yyyy":
            return `${month}/${day}/${year}`;
        case "dd/MM/yyyy":
            return `${day}/${month}/${year}`;
        case "yyyy-MM-dd":
            return `${year}-${month}-${day}`;
        case "MMM dd, yyyy":
            return d.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        default:
            return d.toLocaleDateString();
    }
};

export const parseDate = (dateString, format = "MM/dd/yyyy") => {
    if (!dateString) return null;

    try {
        // Handle different formats
        switch (format) {
            case "MM/dd/yyyy": {
                const [month, day, year] = dateString.split("/");
                return new Date(
                    parseInt(year),
                    parseInt(month) - 1,
                    parseInt(day),
                );
            }
            case "dd/MM/yyyy": {
                const [day, month, year] = dateString.split("/");
                return new Date(
                    parseInt(year),
                    parseInt(month) - 1,
                    parseInt(day),
                );
            }
            case "yyyy-MM-dd": {
                const [year, month, day] = dateString.split("-");
                return new Date(
                    parseInt(year),
                    parseInt(month) - 1,
                    parseInt(day),
                );
            }
            default:
                return new Date(dateString);
        }
    } catch {
        return null;
    }
};

export const isValidDate = (date) => {
    return date instanceof Date && !isNaN(date.getTime());
};

// Range picker component
export const DayPickerRange = ({
    from,
    to,
    onRangeChange,
    numberOfMonths = 2,
    ...props
}) => {
    const [range, setRange] = useState({ from, to });

    useEffect(() => {
        setRange({ from, to });
    }, [from, to]);

    const handleSelect = (selectedRange) => {
        setRange(selectedRange || {});
        if (onRangeChange) {
            onRangeChange(selectedRange);
        }
    };

    return (
        <DayPicker
            mode="range"
            selected={range}
            onSelect={handleSelect}
            numberOfMonths={numberOfMonths}
            {...props}
        />
    );
};

// Modern styled day picker with better defaults
export const ModernDayPicker = ({ className = "", style = {}, ...props }) => {
    return (
        <div
            className={`modern-day-picker ${className}`}
            style={{
                "--rdp-cell-size": "40px",
                "--rdp-accent-color": "#0066cc",
                "--rdp-background-color": "#ffffff",
                "--rdp-outline": "2px solid var(--rdp-accent-color)",
                "--rdp-outline-selected": "2px solid rgba(0, 102, 204, 0.75)",
                ...style,
            }}
        >
            <DayPicker showOutsideDays fixedWeeks {...props} />
        </div>
    );
};
