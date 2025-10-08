import React from "react";
import {
    NumericFormat as NumberFormat,
    PatternFormat,
} from "react-number-format";

// Export the new components with old names for backward compatibility
export { NumberFormat, PatternFormat };
export default NumberFormat;

// Utility functions for number formatting
export const roundNumber = (num, decimals = 2) => {
    if (isNaN(num)) return 0;
    return (
        Math.round((num + Number.EPSILON) * Math.pow(10, decimals)) /
        Math.pow(10, decimals)
    );
};

export const formatCurrency = (amount, currency = "USD", locale = "en-US") => {
    if (isNaN(amount)) return "0";
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency,
    }).format(amount);
};

export const formatNumber = (num, options = {}) => {
    if (isNaN(num)) return "0";
    const defaultOptions = {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    };
    return new Intl.NumberFormat("en-US", {
        ...defaultOptions,
        ...options,
    }).format(num);
};

export const parseNumber = (str) => {
    if (typeof str !== "string") return parseFloat(str) || 0;
    // Remove all non-numeric characters except decimal point and minus sign
    const cleaned = str.replace(/[^\d.-]/g, "");
    return parseFloat(cleaned) || 0;
};

// ============= CURRENCY CONVERSION FUNCTIONS =============

// Convert amount using currency rate
export const convertCurrency = (amount, rate = 1) => {
    if (amount === null || amount === undefined || isNaN(amount)) return 0;
    if (rate === null || rate === undefined || isNaN(rate)) rate = 1;
    return Number(amount) * Number(rate);
};

// ============= NUMBER FORMATTING FUNCTIONS =============

// Add numbers with commas for formatting
export const numberWithCommas = (x) => {
    if (x === null || x === undefined || x === "") return "0";
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Pad numbers with leading zeros to specified length
export const numberWithLength = (num, length = 2) => {
    if (num === null || num === undefined) return "00";
    return num.toString().padStart(length, "0");
};

// Add sign to numbers (+ or -)
export const numberSign = (num) => {
    if (num === null || num === undefined || num === 0) return "";
    return num >= 0 ? "+" : "";
};

// Format large numbers with K, M, B suffixes
export const numFormatter = (num) => {
    if (num === null || num === undefined) return "0";
    const absNum = Math.abs(num);

    if (absNum >= 1000000000) {
        return (num / 1000000000).toFixed(1) + "B";
    } else if (absNum >= 1000000) {
        return (num / 1000000).toFixed(1) + "M";
    } else if (absNum >= 1000) {
        return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
};

// Format bytes to human readable format
export const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    if (bytes === null || bytes === undefined) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

// Helper function for rendering formatted numbers
export const renderNumberFormat = (value, options = {}) => {
    const defaultOptions = {
        thousandSeparator: ",",
        decimalScale: 2,
        fixedDecimalScale: false,
        displayType: "text",
    };

    return <NumberFormat value={value} {...defaultOptions} {...options} />;
};

// ============= TIME CONVERSION FUNCTIONS =============

// Convert seconds to days, hours, minutes, seconds object
export const secondsToDhms = (seconds) => {
    if (seconds === null || seconds === undefined || seconds < 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    return { days: d, hours: h, minutes: m, seconds: s };
};

// Convert seconds to a formatted string for display (alias for secondsToString)
export const secondsToDhmsString = (seconds) => {
    const time = secondsToDhms(seconds);
    const parts = [];

    if (time.days > 0) {
        parts.push(`${time.days} day${time.days !== 1 ? "s" : ""}`);
    }
    if (time.hours > 0) {
        parts.push(`${time.hours} hour${time.hours !== 1 ? "s" : ""}`);
    }
    if (time.minutes > 0) {
        parts.push(`${time.minutes} minute${time.minutes !== 1 ? "s" : ""}`);
    }
    if (time.seconds > 0 || parts.length === 0) {
        parts.push(`${time.seconds} second${time.seconds !== 1 ? "s" : ""}`);
    }

    return parts.join(", ");
};

// Convert seconds to readable string format
export const secondsToString = (seconds) => {
    return secondsToDhmsString(seconds); // Use the same implementation
};

// Convert seconds to compact format (like "2d 5h 30m")
export const secondsToCompactString = (seconds) => {
    const time = secondsToDhms(seconds);
    const parts = [];

    if (time.days > 0) parts.push(`${time.days}d`);
    if (time.hours > 0) parts.push(`${time.hours}h`);
    if (time.minutes > 0) parts.push(`${time.minutes}m`);
    if (time.seconds > 0 || parts.length === 0) parts.push(`${time.seconds}s`);

    return parts.join(" ");
};

// ============= PERCENTAGE FUNCTIONS =============

// Calculate percentage
export const calculatePercentage = (value, total) => {
    if (total === 0 || total === null || total === undefined) return 0;
    if (value === null || value === undefined) return 0;
    return (value / total) * 100;
};

// Format percentage with specified decimals
export const formatPercentage = (value, decimals = 1) => {
    if (value === null || value === undefined || isNaN(value)) return "0%";
    return `${roundNumber(value, decimals)}%`;
};

// ============= VALIDATION FUNCTIONS =============

// Check if value is a valid number
export const isValidNumber = (value) => {
    return (
        !isNaN(value) &&
        isFinite(value) &&
        value !== null &&
        value !== undefined
    );
};

// Ensure value is within min/max bounds
export const clampNumber = (value, min = 0, max = Infinity) => {
    if (!isValidNumber(value)) return min;
    return Math.max(min, Math.min(max, value));
};

// ============= REACT COMPONENT WRAPPERS =============

// Wrapper component for easier migration from v4 to v5
export const NumberFormatCustom = React.forwardRef((props, ref) => {
    const { onChange, ...other } = props;

    return (
        <NumberFormat
            {...other}
            getInputRef={ref}
            onValueChange={(values) => {
                onChange({
                    target: {
                        name: props.name,
                        value: values.value,
                    },
                });
            }}
        />
    );
});

// Display name for development
NumberFormatCustom.displayName = "NumberFormatCustom";

// ============= LEGACY ALIASES FOR BACKWARD COMPATIBILITY =============

// These are aliases to maintain backward compatibility with older code
export const numberWithCommaSeparators = numberWithCommas;
export const formatNumberShort = numFormatter;

// Additional legacy exports
export const formatBytesShort = (bytes) => formatBytes(bytes, 0);
export const formatKMB = numFormatter; // Alias for numFormatter
export const addCommasToNumber = numberWithCommas;
export const padWithZeros = numberWithLength;
