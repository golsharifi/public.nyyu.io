// Add this to your main store/store.js file or create a new file: src/utils/forceCurrencyLoader.js

import store from "../store/store";
import { setCurrencyRates } from "../store/actions/bidAction";

// Force load currency rates immediately when app starts
const forceCurrencyRates = async () => {
    console.log("🚀 FORCE: Loading currency rates immediately...");

    // Method 1: Try Currency Freaks API (Premium)
    if (process.env.GATSBY_CURRENCY_FREAKS_API_KEY) {
        try {
            console.log("💰 FORCE: Trying Currency Freaks API...");
            const res = await fetch(
                "https://api.currencyfreaks.com/latest?" +
                    new URLSearchParams({
                        apikey: process.env.GATSBY_CURRENCY_FREAKS_API_KEY,
                        base: "USD",
                    }),
                {
                    method: "GET",
                    timeout: 10000,
                },
            );

            if (res.ok) {
                const data = await res.json();
                if (data && data.rates) {
                    console.log(
                        "✅ FORCE: Currency Freaks success! Loaded",
                        Object.keys(data.rates).length,
                        "exchange rates",
                    );
                    console.log(
                        "🇰🇪 FORCE: KES rate:",
                        data.rates.KES || "Not available",
                    );
                    store.dispatch(setCurrencyRates(data.rates));
                    return;
                }
            }
        } catch (err) {
            console.error("❌ FORCE: Currency Freaks failed:", err.message);
        }
    }

    // Method 2: Try ExchangeRate API (Premium)
    if (process.env.GATSBY_EXCHANGE_RATE_API_KEY) {
        try {
            console.log("💰 FORCE: Trying ExchangeRate API...");
            const res = await fetch(
                `https://v6.exchangerate-api.com/v6/${process.env.GATSBY_EXCHANGE_RATE_API_KEY}/latest/USD`,
                {
                    method: "GET",
                    timeout: 10000,
                },
            );

            if (res.ok) {
                const data = await res.json();
                if (data && data.conversion_rates) {
                    console.log(
                        "✅ FORCE: ExchangeRate API success! Loaded",
                        Object.keys(data.conversion_rates).length,
                        "exchange rates",
                    );
                    console.log(
                        "🇰🇪 FORCE: KES rate:",
                        data.conversion_rates.KES || "Not available",
                    );
                    store.dispatch(setCurrencyRates(data.conversion_rates));
                    return;
                }
            }
        } catch (err) {
            console.error("❌ FORCE: ExchangeRate API failed:", err.message);
        }
    }

    // Method 3: Try Fixer.io (Premium)
    if (process.env.GATSBY_FIXER_API_KEY) {
        try {
            console.log("💰 FORCE: Trying Fixer.io...");
            const res = await fetch(
                "https://api.fixer.io/latest?" +
                    new URLSearchParams({
                        access_key: process.env.GATSBY_FIXER_API_KEY,
                        base: "USD",
                    }),
                {
                    method: "GET",
                    timeout: 10000,
                },
            );

            if (res.ok) {
                const data = await res.json();
                if (data && data.rates) {
                    console.log(
                        "✅ FORCE: Fixer.io success! Loaded",
                        Object.keys(data.rates).length,
                        "exchange rates",
                    );
                    console.log(
                        "🇰🇪 FORCE: KES rate:",
                        data.rates.KES || "Not available",
                    );
                    store.dispatch(setCurrencyRates(data.rates));
                    return;
                }
            }
        } catch (err) {
            console.error("❌ FORCE: Fixer.io failed:", err.message);
        }
    }

    // Method 4: Try Free APIs (No API Key Required)
    const freeAPIs = [
        "https://api.exchangerate-api.com/v4/latest/USD",
        "https://open.er-api.com/v6/latest/USD",
    ];

    for (const apiUrl of freeAPIs) {
        try {
            console.log("🆓 FORCE: Trying free API:", apiUrl);
            const res = await fetch(apiUrl, {
                method: "GET",
                timeout: 8000,
                headers: {
                    Accept: "application/json",
                    "User-Agent":
                        "Mozilla/5.0 (compatible; CurrencyConverter/1.0)",
                },
            });

            if (res.ok) {
                const data = await res.json();
                if (data && data.rates) {
                    console.log(
                        "✅ FORCE: Free API success! Loaded",
                        Object.keys(data.rates).length,
                        "exchange rates",
                    );
                    console.log(
                        "🇰🇪 FORCE: KES rate:",
                        data.rates.KES || "Not available",
                    );
                    store.dispatch(setCurrencyRates(data.rates));
                    return;
                }
            }
        } catch (err) {
            console.error("❌ FORCE: Free API failed:", err.message);
        }
    }

    // No fallback - when all APIs fail, keep empty rates (USD will be default)
    console.log(
        "⚠️ FORCE: All currency APIs failed - will display values in USD",
    );
    console.log(
        "💵 FORCE: No exchange rates loaded, all values will show in USD",
    );
};

// Run immediately
if (typeof window !== "undefined") {
    forceCurrencyRates();
}

export default forceCurrencyRates;
