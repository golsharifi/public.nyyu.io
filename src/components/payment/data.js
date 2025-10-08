import { fetchTickerFromFreeAPIs } from "../../utilities/freeCryptoPrices";

export const QUOTE = "USDT";
export const TICKER_24hr_FREE = fetchTickerFromFreeAPIs;

// Add the missing TICKER_24hr export for backward compatibility
export const TICKER_24hr = fetchTickerFromFreeAPIs;

export const TRUST_URL =
    "https://link.trustwallet.com/open_url?coin_id=60&url=https://nyyu.io";
