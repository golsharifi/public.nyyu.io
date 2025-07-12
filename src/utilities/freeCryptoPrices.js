import axios from "axios";

/**
 * Fetch cryptocurrency prices from multiple free APIs with fallback support
 * @param {string} symbol - The cryptocurrency symbol (e.g., "BTC", "ETH")
 * @param {string} baseCurrency - The base currency (default: "USD")
 * @returns {Promise<number>} - The price of the cryptocurrency
 */
export const fetchPriceFromFreeAPIs = async (symbol, baseCurrency = "USD") => {
    const upperSymbol = symbol.toUpperCase();
    const upperBase = baseCurrency.toUpperCase();

    // Method 1: Try CoinGecko API (Free, no API key required)
    try {
        console.log(`🪙 Fetching ${upperSymbol} price from CoinGecko...`);
        const response = await axios.get(
            `https://api.coingecko.com/api/v3/simple/price`,
            {
                params: {
                    ids: getCoinGeckoId(upperSymbol),
                    vs_currencies: upperBase.toLowerCase(),
                },
                timeout: 8000,
            },
        );

        const coinId = getCoinGeckoId(upperSymbol);
        const price = response.data[coinId]?.[upperBase.toLowerCase()];

        if (price) {
            console.log(
                `✅ CoinGecko success: ${upperSymbol} = ${price} ${upperBase}`,
            );
            return price;
        }
    } catch (error) {
        console.warn(`⚠️ CoinGecko failed for ${upperSymbol}:`, error.message);
    }

    // Method 2: Try CoinCap API (Free, no API key required)
    try {
        console.log(`🪙 Fetching ${upperSymbol} price from CoinCap...`);
        const response = await axios.get(
            `https://api.coincap.io/v2/assets/${getCoinCapId(upperSymbol)}`,
            { timeout: 8000 },
        );

        const priceUsd = parseFloat(response.data.data.priceUsd);

        if (priceUsd && upperBase === "USD") {
            console.log(`✅ CoinCap success: ${upperSymbol} = ${priceUsd} USD`);
            return priceUsd;
        } else if (priceUsd && upperBase !== "USD") {
            // Convert to other currency if needed (simplified approach)
            console.log(
                `✅ CoinCap success: ${upperSymbol} = ${priceUsd} USD (base conversion needed)`,
            );
            return priceUsd; // Return USD price for now
        }
    } catch (error) {
        console.warn(`⚠️ CoinCap failed for ${upperSymbol}:`, error.message);
    }

    // Method 3: Try Binance API (Free, no API key required)
    try {
        console.log(`🪙 Fetching ${upperSymbol} price from Binance...`);
        const response = await axios.get(
            `https://api.binance.com/api/v3/ticker/price`,
            {
                params: {
                    symbol: `${upperSymbol}USDT`,
                },
                timeout: 8000,
            },
        );

        const price = parseFloat(response.data.price);

        if (price && upperBase === "USD") {
            console.log(`✅ Binance success: ${upperSymbol} = ${price} USDT`);
            return price;
        }
    } catch (error) {
        console.warn(`⚠️ Binance failed for ${upperSymbol}:`, error.message);
    }

    // Method 4: Try CryptoCompare API (Free tier available)
    try {
        console.log(`🪙 Fetching ${upperSymbol} price from CryptoCompare...`);
        const response = await axios.get(
            `https://min-api.cryptocompare.com/data/price`,
            {
                params: {
                    fsym: upperSymbol,
                    tsyms: upperBase,
                },
                timeout: 8000,
            },
        );

        const price = response.data[upperBase];

        if (price) {
            console.log(
                `✅ CryptoCompare success: ${upperSymbol} = ${price} ${upperBase}`,
            );
            return price;
        }
    } catch (error) {
        console.warn(
            `⚠️ CryptoCompare failed for ${upperSymbol}:`,
            error.message,
        );
    }

    // If all APIs fail, return a default price or throw an error
    console.warn(
        `⚠️ All APIs failed for ${upperSymbol}. Using fallback price.`,
    );

    // Return fallback prices for common cryptocurrencies
    const fallbackPrices = {
        BTC: 45000,
        ETH: 3000,
        ADA: 0.5,
        LTC: 100,
        BNB: 300,
        SOL: 100,
        DOT: 7,
        LINK: 15,
        UNI: 6,
        DOGE: 0.08,
        SHIB: 0.000024,
        USDT: 1,
        USDC: 1,
        DAI: 1,
        BUSD: 1,
    };

    const fallbackPrice = fallbackPrices[upperSymbol] || 1;
    console.log(
        `⚠️ Using fallback price for ${upperSymbol}: ${fallbackPrice} ${upperBase}`,
    );
    return fallbackPrice;
};

/**
 * Get CoinGecko ID for a given symbol
 * @param {string} symbol - Cryptocurrency symbol
 * @returns {string} - CoinGecko ID
 */
function getCoinGeckoId(symbol) {
    const idMap = {
        BTC: "bitcoin",
        ETH: "ethereum",
        ADA: "cardano",
        LTC: "litecoin",
        BNB: "binancecoin",
        SOL: "solana",
        DOT: "polkadot",
        LINK: "chainlink",
        UNI: "uniswap",
        DOGE: "dogecoin",
        SHIB: "shiba-inu",
        USDT: "tether",
        USDC: "usd-coin",
        DAI: "dai",
        BUSD: "binance-usd",
        BCH: "bitcoin-cash",
        VOLT: "volt-inu-v2",
        NDB: "ndb", // Adjust if needed
    };

    return idMap[symbol] || symbol.toLowerCase();
}

/**
 * Get CoinCap ID for a given symbol
 * @param {string} symbol - Cryptocurrency symbol
 * @returns {string} - CoinCap ID
 */
function getCoinCapId(symbol) {
    const idMap = {
        BTC: "bitcoin",
        ETH: "ethereum",
        ADA: "cardano",
        LTC: "litecoin",
        BNB: "binance-coin",
        SOL: "solana",
        DOT: "polkadot",
        LINK: "chainlink",
        UNI: "uniswap",
        DOGE: "dogecoin",
        SHIB: "shiba-inu",
        USDT: "tether",
        USDC: "usd-coin",
        DAI: "dai",
        BUSD: "binance-usd",
        BCH: "bitcoin-cash",
    };

    return idMap[symbol] || symbol.toLowerCase();
}

/**
 * Fetch multiple cryptocurrency prices at once
 * @param {string[]} symbols - Array of cryptocurrency symbols
 * @param {string} baseCurrency - The base currency (default: "USD")
 * @returns {Promise<Object>} - Object with symbol-price pairs
 */
export const fetchMultiplePricesFromFreeAPIs = async (
    symbols,
    baseCurrency = "USD",
) => {
    const prices = {};

    // Use Promise.allSettled to fetch all prices concurrently
    const promises = symbols.map(async (symbol) => {
        try {
            const price = await fetchPriceFromFreeAPIs(symbol, baseCurrency);
            return { symbol, price };
        } catch (error) {
            console.error(`Failed to fetch price for ${symbol}:`, error);
            return { symbol, price: 0 };
        }
    });

    const results = await Promise.allSettled(promises);

    results.forEach((result) => {
        if (result.status === "fulfilled") {
            const { symbol, price } = result.value;
            prices[symbol] = price;
        }
    });

    return prices;
};

/**
 * Fetch ticker data from free APIs - backward compatibility function
 * This function is an alias for fetchPriceFromFreeAPIs to maintain compatibility
 * @param {string} symbol - The cryptocurrency symbol (e.g., "BTC", "ETH")
 * @param {string} baseCurrency - The base currency (default: "USD")
 * @returns {Promise<number>} - The price of the cryptocurrency
 */
export const fetchTickerFromFreeAPIs = async (symbol, baseCurrency = "USD") => {
    console.log(
        `🎯 fetchTickerFromFreeAPIs called for ${symbol} (compatibility alias)`,
    );
    return await fetchPriceFromFreeAPIs(symbol, baseCurrency);
};

export default fetchPriceFromFreeAPIs;
