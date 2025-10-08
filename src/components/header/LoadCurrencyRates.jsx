import { useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setCurrencyRates } from "../../store/actions/bidAction";

export default function LoadCurrencyRates() {
    const dispatch = useDispatch();
    const currencyRates = useSelector((state) => state.currencyRates);
    const hasAttemptedRef = useRef(false);

    const loadRates = useCallback(async () => {
        // Prevent multiple simultaneous requests
        if (hasAttemptedRef.current) return;
        hasAttemptedRef.current = true;

        console.log("🚀 LoadCurrencyRates: Loading currency exchange rates...");

        // Skip if rates already loaded
        if (currencyRates && Object.keys(currencyRates).length > 0) {
            console.log("✅ LoadCurrencyRates: Rates already loaded, skipping");
            return;
        }

        // Method 1: Try Free API first (most reliable)
        try {
            console.log("🆓 LoadCurrencyRates: Trying free API...");
            const res = await axios.get(
                "https://api.exchangerate-api.com/v4/latest/USD",
                {
                    timeout: 8000,
                    headers: {
                        Accept: "application/json",
                    },
                },
            );

            if (res.data && res.data.rates) {
                console.log(
                    "✅ LoadCurrencyRates: Free API success! Loaded",
                    Object.keys(res.data.rates).length,
                    "exchange rates",
                );
                console.log(
                    "🇰🇪 LoadCurrencyRates: KES rate:",
                    res.data.rates.KES || "Not available",
                );
                dispatch(setCurrencyRates(res.data.rates));
                return;
            }
        } catch (err) {
            console.error(
                "❌ LoadCurrencyRates: Free API failed:",
                err.message,
            );
        }

        // Method 2: Try ExchangeRate API (Premium) only if API key exists
        if (process.env.GATSBY_EXCHANGE_RATE_API_KEY) {
            try {
                console.log("💰 LoadCurrencyRates: Trying ExchangeRate API...");
                const res = await axios.get(
                    `https://v6.exchangerate-api.com/v6/${process.env.GATSBY_EXCHANGE_RATE_API_KEY}/latest/USD`,
                    { timeout: 10000 },
                );

                if (res.data && res.data.conversion_rates) {
                    console.log(
                        "✅ LoadCurrencyRates: ExchangeRate API success!",
                    );
                    dispatch(setCurrencyRates(res.data.conversion_rates));
                    return;
                }
            } catch (err) {
                console.error(
                    "❌ LoadCurrencyRates: ExchangeRate API failed:",
                    err.message,
                );
            }
        }

        console.log(
            "⚠️ LoadCurrencyRates: All APIs failed - using USD as default",
        );
    }, [dispatch, currencyRates]);

    useEffect(() => {
        console.log(
            "🔄 LoadCurrencyRates: Component mounted, loading rates...",
        );
        loadRates();
    }, [loadRates]);

    useEffect(() => {
        // Only attempt once more if no rates loaded after initial mount
        if (!currencyRates || Object.keys(currencyRates).length === 0) {
            console.log(
                "🔄 LoadCurrencyRates: No rates loaded, attempting to fetch...",
            );
            const timer = setTimeout(() => {
                hasAttemptedRef.current = false;
                loadRates();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [currencyRates, loadRates]);

    return null;
}
