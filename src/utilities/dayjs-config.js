import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import localizedFormat from "dayjs/plugin/localizedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";
import advancedFormat from "dayjs/plugin/advancedFormat";
import weekday from "dayjs/plugin/weekday";
import weekOfYear from "dayjs/plugin/weekOfYear";
import weekYear from "dayjs/plugin/weekYear";
import quarterOfYear from "dayjs/plugin/quarterOfYear";
import isLeapYear from "dayjs/plugin/isLeapYear";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isBetween from "dayjs/plugin/isBetween";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";

// Import locale
import "dayjs/locale/en";

// Configure dayjs with all necessary plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localizedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
dayjs.extend(weekday);
dayjs.extend(weekOfYear);
dayjs.extend(weekYear);
dayjs.extend(quarterOfYear);
dayjs.extend(isLeapYear);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(isBetween);
dayjs.extend(duration);
dayjs.extend(relativeTime);

// Set default locale
dayjs.locale("en");

// Ensure formats object exists for localization
// This prevents the "Cannot read properties of undefined (reading 'replace')" error
const ensureFormats = () => {
    if (dayjs.Ls && dayjs.Ls.en) {
        if (!dayjs.Ls.en.formats) {
            dayjs.Ls.en.formats = {};
        }

        // Ensure all required format keys exist
        const defaultFormats = {
            LTS: "h:mm:ss A",
            LT: "h:mm A",
            L: "MM/DD/YYYY",
            LL: "MMMM D, YYYY",
            LLL: "MMMM D, YYYY h:mm A",
            LLLL: "dddd, MMMM D, YYYY h:mm A",
            l: "M/D/YYYY",
            ll: "MMM D, YYYY",
            lll: "MMM D, YYYY h:mm A",
            llll: "ddd, MMM D, YYYY h:mm A",
        };

        // Only add missing formats, don't overwrite existing ones
        Object.keys(defaultFormats).forEach((key) => {
            if (!dayjs.Ls.en.formats[key]) {
                dayjs.Ls.en.formats[key] = defaultFormats[key];
            }
        });
    }
};

// Call the function to ensure formats are set up
ensureFormats();

// Also set up a global error handler for dayjs operations
const originalFormat = dayjs.prototype.format;
dayjs.prototype.format = function (template) {
    try {
        return originalFormat.call(this, template);
    } catch (error) {
        console.warn("Dayjs format error:", error);
        return this.toISOString();
    }
};

export default dayjs;
