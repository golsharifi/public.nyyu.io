import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "../utilities/dayjs-config";

// Create a configured instance of AdapterDayjs
const CustomAdapterDayjs = new AdapterDayjs({
    locale: "en",
    formats: {
        // Default formats that MUI expects
        year: "YYYY",
        month: "MMMM",
        monthShort: "MMM",
        dayOfMonth: "D",
        dayOfMonthFull: "DD",
        weekday: "dddd",
        weekdayShort: "ddd",
        hours12h: "hh",
        hours24h: "HH",
        minutes: "mm",
        seconds: "ss",
        fullDateTime12h: "MM/DD/YYYY hh:mm A",
        fullDateTime24h: "MM/DD/YYYY HH:mm",
        keyboardDate: "MM/DD/YYYY",
        keyboardDateTime12h: "MM/DD/YYYY hh:mm A",
        keyboardDateTime24h: "MM/DD/YYYY HH:mm",
    },
});

export default CustomAdapterDayjs;
