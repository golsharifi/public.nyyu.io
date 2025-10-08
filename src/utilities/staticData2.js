import {
    BTC,
    ETH,
    BNB,
    USDC,
    USDT,
    // DAI,
    SOL,
    DOGE,
    SHIB,
    // ADA,
    BUSD,
    NDB,
} from "./imgImport";

export const Letter_N = `<svg width="147" height="122" viewBox="0 0 147 122" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.1601 0H134.439V12.1601H146.599V121.57H97.9896V24.3202H48.6405V121.57H0V12.1601H12.1601V0Z" fill="#1E1E1E"/>
</svg>`
export const Letter_Y = `<svg width="146" height="122" viewBox="0 0 146 122" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0.0310059 0H48.641V36.4803H60.801V48.6404H85.121V36.4803H97.281V0H145.922V48.61H133.762V60.7701H121.601V72.9302H97.281V121.571H48.641V72.9302H24.321V60.7701H12.16V48.61H0V0H0.0310059Z" fill="#1E1E1E"/>
</svg>`
export const Letter_U = `<svg width="147" height="122" viewBox="0 0 147 122" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M134.44 121.571H12.16V109.411H0V0H48.61V97.251H97.959V0H146.6V109.411H134.44V121.571Z" fill="#1E1E1E"/>
</svg>`

export const SUPPORTED_COINS = [
    {
        value: "BTC",
        label: "BTC",
        icon: BTC,
        networks: [
            { label: "Bitcoin", value: "BTC", network: "BTC", address: "" },
            // { label: 'Bitcoin/BTCB Token (BC Chain)', value: 'BTC.BEP2', network: 'BEP2' },
            { label: "Bitcoin/BTCB Token (BSC Chain)", value: "BTC.BEP20", network: "BEP20", address: ""},
            // { label: 'Bitcoin (Lightning Network)', value: 'BTC.LN', network: 'LN' },
        ],
    },
    {
        value: "ETH",
        label: "ETH",
        icon: ETH,
        networks: [
            { label: "Ethereum", value: "ETH", network: "ERC20", address: "0x64ff637fb478863b7468bc97d30a5bf3a428a1fd"},
            // { label: 'Ethereum (BC Chain)', value: 'ETH.BEP2', network: 'BEP2' },
            { label: "Ethereum Token (BSC Chain)", value: "ETH.BEP20", network: "BEP20", address: "0x2170ed0880ac9a755fd29b2688956bd959f933f8"},
        ],
    },
    {
        value: "BNB",
        label: "BNB",
        icon: BNB,
        networks: [
            // { label: 'BNB Coin (Mainnet)', value: 'BNB', network: 'BNB' },
            { label: "BNB Coin (BSC Chain)", value: "BNB.BSC", network: "BEP20", address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"},
            { label: "BNB Coin (ERC20)", value: "BNB.ERC20", network: "ERC20", address: "0xB8c77482e45F1F44dE1745F52C74426C631bDD52"},
        ],
    },
    {
        value: "USDC",
        label: "USDC",
        icon: USDC,
        networks: [
            { label: "USD Coin (ERC20)", value: "USDC", network: "ERC20", address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"},
            { label: "USD Coin (BSC Chain)", value: "USDC.BEP20", network: "BEP20", address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d"},
            // { label: "USD Coin (Tron/TRC20)", value: "USDC.TRC20", network: "TRC20", address: ""},
        ],
    },
    {
        value: "USDT",
        label: "USDT",
        icon: USDT,
        networks: [
            // { label: "Tether USD (Tron/TRC20)", value: "USDT.TRC20", network: "TRC20", address: ""},
            { label: "Tether USD (ERC20)", value: "USDT.ERC20", network: "ERC20", address: "0xdac17f958d2ee523a2206206994597c13d831ec7"},
            // { label: "Tether USD (Omni Layer)", value: "USDT", network: "USDT", address: ""},
            // { label: 'Tether USD (BC Chain)', value: 'USDT.BEP2', network: 'BEP2' },
            { label: "Tether USD (BSC Chain)", value: "USDT.BEP20", network: "BEP20", address: "0x55d398326f99059ff775485246999027b3197955" },
            { label: "Tether USD (Solana)", value: "USDT.SOL", network: "SOL" , address: ""},
            // { label: "TetherUSD (Waves Token)", value: "USDT.Waves", network: "Waves", address: ""},
        ],
    },
    // {
    //     value: "DAI",
    //     label: "DAI",
    //     icon: DAI,
    //     networks: [
    //         { label: "Dai (ERC20)", value: "DAI", network: "ERC20", address: "0x6b175474e89094c44da98b954eedeac495271d0f" },
    //         { label: "Dai Token (BSC Chain)", value: "DAI.BEP20", network: "BEP20", address: "0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3" },
    //     ],
    // },
    // {
    //     value: "DOGE",
    //     label: "DOGE",
    //     icon: DOGE,
    //     networks: [
    //         { label: "Dogecoin", value: "DOGE", network: "DOGE" },
    //         { label: "Dogecoin (BSC Chain)", value: "DOGE.BEP20", network: "BEP20", address: "0xba2ae424d960c26247dd6c32edc70b295c744c43"},
    //     ],
    // },
    // {
    //     value: "SHIB",
    //     label: "SHIB",
    //     icon: SHIB,
    //     networks: [
    //         { label: "SHIBA INU (ERC20)", value: "SHIB", network: "ERC20", address: "0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce"},
    //         { label: "SHIBA INU (BSC Chain)", value: "SHIB.BEP20", network: "BEP20", address: "0x2859e4544c4bb03966803b044a93563bd2d0dd4d"},
    //     ],
    // },
    {
        value: "SOL",
        label: "SOL",
        icon: SOL,
        networks: [
            { label: "Solana", value: "SOL", network: "SOL", address: "" }
        ],
    },
    // {
    //     value: "ADA",
    //     label: "ADA",
    //     icon: ADA,
    //     networks: [
    //         { label: "ADA Cardano (BC Chain)", value: "ADA.BEP2", network: "BEP2" }
    //     ],
    // },
    {
        value: "BUSD",
        label: "BUSD",
        icon: BUSD,
        networks: [
            { label: "Binance USD (ERC20)", value: "BUSD", network: "ERC20", address: "0x4Fabb145d64652a948d72533023f6E7A623C7C53" },
            { label: "BUSD Token (BSC Chain)", value: "BUSD.BEP20", network: "BEP20", address: "0xe9e7cea3dedca5984780bafc599bd69add087d56" }
        ],
    },
    {
        value: "NDB",
        label: "NDB",
        icon: NDB,
        networks: [
            { label: "NDB (BSC Chain)", value: "NDB.BEP20", network: "BEP20", }
        ]
    },
];

export const CURRENCIES = `USD,AUD,BRL,CAD,CHF,CLP,CNY,CZK,DKK,EUR,GBP,HKD,HUF,IDR,ILS,INR,JPY,KRW,MXN,MYR,NOK,NZD,
        PHP,PKR,PLN,RUB,SEK,SGD,THB,TRY,TWD,ZAR,AED,BGN,HRK,MUR,RON,ISK,NGN,COP,ARS,PEN,
        VND,UAH,BOB,ALL,AMD,AZN,BAM,BDT,BHD,BMD,BYN,CRC,CUP,DOP,DZD,EGP,GEL,GHS,GTQ,HNL,
        IQD,IRR,JMD,JOD,KES,KGS,KHR,KWD,KZT,LBP,LKR,MAD,MDL,MKD,MMK,MNT,NAD,NIO,NPR,OMR,
        PAB,QAR,RSD,SAR,SSP,TND,TTD,UGX,UYU,UZS,VES`;


export const SUPPORTED_CURRENCIES = [
    {
        "id": 2781,
        "name": "United States Dollar",
        "sign": "$",
        "symbol": "USD"
    },
    {
        "id": 2782,
        "name": "Australian Dollar",
        "sign": "$",
        "symbol": "AUD"
    },
    {
        "id": 2783,
        "name": "Brazilian Real",
        "sign": "R$",
        "symbol": "BRL"
    },
    {
        "id": 2784,
        "name": "Canadian Dollar",
        "sign": "$",
        "symbol": "CAD"
    },
    {
        "id": 2785,
        "name": "Swiss Franc",
        "sign": "Fr",
        "symbol": "CHF"
    },
    {
        "id": 2786,
        "name": "Chilean Peso",
        "sign": "$",
        "symbol": "CLP"
    },
    {
        "id": 2787,
        "name": "Chinese Yuan",
        "sign": "¥",
        "symbol": "CNY"
    },
    {
        "id": 2788,
        "name": "Czech Koruna",
        "sign": "Kč",
        "symbol": "CZK"
    },
    {
        "id": 2789,
        "name": "Danish Krone",
        "sign": "kr",
        "symbol": "DKK"
    },
    {
        "id": 2790,
        "name": "Euro",
        "sign": "€",
        "symbol": "EUR"
    },
    {
        "id": 2791,
        "name": "Pound Sterling",
        "sign": "£",
        "symbol": "GBP"
    },
    {
        "id": 2792,
        "name": "Hong Kong Dollar",
        "sign": "$",
        "symbol": "HKD"
    },
    {
        "id": 2793,
        "name": "Hungarian Forint",
        "sign": "Ft",
        "symbol": "HUF"
    },
    {
        "id": 2794,
        "name": "Indonesian Rupiah",
        "sign": "Rp",
        "symbol": "IDR"
    },
    {
        "id": 2795,
        "name": "Israeli New Shekel",
        "sign": "₪",
        "symbol": "ILS"
    },
    {
        "id": 2796,
        "name": "Indian Rupee",
        "sign": "₹",
        "symbol": "INR"
    },
    {
        "id": 2797,
        "name": "Japanese Yen",
        "sign": "¥",
        "symbol": "JPY"
    },
    {
        "id": 2798,
        "name": "South Korean Won",
        "sign": "₩",
        "symbol": "KRW"
    },
    {
        "id": 2799,
        "name": "Mexican Peso",
        "sign": "$",
        "symbol": "MXN"
    },
    {
        "id": 2800,
        "name": "Malaysian Ringgit",
        "sign": "RM",
        "symbol": "MYR"
    },
    {
        "id": 2801,
        "name": "Norwegian Krone",
        "sign": "kr",
        "symbol": "NOK"
    },
    {
        "id": 2802,
        "name": "New Zealand Dollar",
        "sign": "$",
        "symbol": "NZD"
    },
    {
        "id": 2803,
        "name": "Philippine Peso",
        "sign": "₱",
        "symbol": "PHP"
    },
    {
        "id": 2804,
        "name": "Pakistani Rupee",
        "sign": "₨",
        "symbol": "PKR"
    },
    {
        "id": 2805,
        "name": "Polish Złoty",
        "sign": "zł",
        "symbol": "PLN"
    },
    {
        "id": 2806,
        "name": "Russian Ruble",
        "sign": "₽",
        "symbol": "RUB"
    },
    {
        "id": 2807,
        "name": "Swedish Krona",
        "sign": "kr",
        "symbol": "SEK"
    },
    {
        "id": 2808,
        "name": "Singapore Dollar",
        "sign": "S$",
        "symbol": "SGD"
    },
    {
        "id": 2809,
        "name": "Thai Baht",
        "sign": "฿",
        "symbol": "THB"
    },
    {
        "id": 2810,
        "name": "Turkish Lira",
        "sign": "₺",
        "symbol": "TRY"
    },
    {
        "id": 2811,
        "name": "New Taiwan Dollar",
        "sign": "NT$",
        "symbol": "TWD"
    },
    {
        "id": 2812,
        "name": "South African Rand",
        "sign": "R",
        "symbol": "ZAR"
    },
    {
        "id": 2813,
        "name": "United Arab Emirates Dirham",
        "sign": "د.إ",
        "symbol": "AED"
    },
    {
        "id": 2814,
        "name": "Bulgarian Lev",
        "sign": "лв",
        "symbol": "BGN"
    },
    {
        "id": 2815,
        "name": "Croatian Kuna",
        "sign": "kn",
        "symbol": "HRK"
    },
    {
        "id": 2816,
        "name": "Mauritian Rupee",
        "sign": "₨",
        "symbol": "MUR"
    },
    {
        "id": 2817,
        "name": "Romanian Leu",
        "sign": "lei",
        "symbol": "RON"
    },
    {
        "id": 2818,
        "name": "Icelandic Króna",
        "sign": "kr",
        "symbol": "ISK"
    },
    {
        "id": 2819,
        "name": "Nigerian Naira",
        "sign": "₦",
        "symbol": "NGN"
    },
    {
        "id": 2820,
        "name": "Colombian Peso",
        "sign": "$",
        "symbol": "COP"
    },
    {
        "id": 2821,
        "name": "Argentine Peso",
        "sign": "$",
        "symbol": "ARS"
    },
    {
        "id": 2822,
        "name": "Peruvian Sol",
        "sign": "S/.",
        "symbol": "PEN"
    },
    {
        "id": 2823,
        "name": "Vietnamese Dong",
        "sign": "₫",
        "symbol": "VND"
    },
    {
        "id": 2824,
        "name": "Ukrainian Hryvnia",
        "sign": "₴",
        "symbol": "UAH"
    },
    {
        "id": 2832,
        "name": "Bolivian Boliviano",
        "sign": "Bs.",
        "symbol": "BOB"
    },
    {
        "id": 3526,
        "name": "Albanian Lek",
        "sign": "L",
        "symbol": "ALL"
    },
    {
        "id": 3527,
        "name": "Armenian Dram",
        "sign": "֏",
        "symbol": "AMD"
    },
    {
        "id": 3528,
        "name": "Azerbaijani Manat",
        "sign": "₼",
        "symbol": "AZN"
    },
    {
        "id": 3529,
        "name": "Bosnia-Herzegovina Convertible Mark",
        "sign": "KM",
        "symbol": "BAM"
    },
    {
        "id": 3530,
        "name": "Bangladeshi Taka",
        "sign": "৳",
        "symbol": "BDT"
    },
    {
        "id": 3531,
        "name": "Bahraini Dinar",
        "sign": ".د.ب",
        "symbol": "BHD"
    },
    {
        "id": 3532,
        "name": "Bermudan Dollar",
        "sign": "$",
        "symbol": "BMD"
    },
    {
        "id": 3533,
        "name": "Belarusian Ruble",
        "sign": "Br",
        "symbol": "BYN"
    },
    {
        "id": 3534,
        "name": "Costa Rican Colón",
        "sign": "₡",
        "symbol": "CRC"
    },
    {
        "id": 3535,
        "name": "Cuban Peso",
        "sign": "$",
        "symbol": "CUP"
    },
    {
        "id": 3536,
        "name": "Dominican Peso",
        "sign": "$",
        "symbol": "DOP"
    },
    {
        "id": 3537,
        "name": "Algerian Dinar",
        "sign": "د.ج",
        "symbol": "DZD"
    },
    {
        "id": 3538,
        "name": "Egyptian Pound",
        "sign": "£",
        "symbol": "EGP"
    },
    {
        "id": 3539,
        "name": "Georgian Lari",
        "sign": "₾",
        "symbol": "GEL"
    },
    {
        "id": 3540,
        "name": "Ghanaian Cedi",
        "sign": "₵",
        "symbol": "GHS"
    },
    {
        "id": 3541,
        "name": "Guatemalan Quetzal",
        "sign": "Q",
        "symbol": "GTQ"
    },
    {
        "id": 3542,
        "name": "Honduran Lempira",
        "sign": "L",
        "symbol": "HNL"
    },
    {
        "id": 3543,
        "name": "Iraqi Dinar",
        "sign": "ع.د",
        "symbol": "IQD"
    },
    {
        "id": 3544,
        "name": "Iranian Rial",
        "sign": "﷼",
        "symbol": "IRR"
    },
    {
        "id": 3545,
        "name": "Jamaican Dollar",
        "sign": "$",
        "symbol": "JMD"
    },
    {
        "id": 3546,
        "name": "Jordanian Dinar",
        "sign": "د.ا",
        "symbol": "JOD"
    },
    {
        "id": 3547,
        "name": "Kenyan Shilling",
        "sign": "Sh",
        "symbol": "KES"
    },
    {
        "id": 3548,
        "name": "Kyrgystani Som",
        "sign": "с",
        "symbol": "KGS"
    },
    {
        "id": 3549,
        "name": "Cambodian Riel",
        "sign": "៛",
        "symbol": "KHR"
    },
    {
        "id": 3550,
        "name": "Kuwaiti Dinar",
        "sign": "د.ك",
        "symbol": "KWD"
    },
    {
        "id": 3551,
        "name": "Kazakhstani Tenge",
        "sign": "₸",
        "symbol": "KZT"
    },
    {
        "id": 3552,
        "name": "Lebanese Pound",
        "sign": "ل.ل",
        "symbol": "LBP"
    },
    {
        "id": 3553,
        "name": "Sri Lankan Rupee",
        "sign": "Rs",
        "symbol": "LKR"
    },
    {
        "id": 3554,
        "name": "Moroccan Dirham",
        "sign": "د.م.",
        "symbol": "MAD"
    },
    {
        "id": 3555,
        "name": "Moldovan Leu",
        "sign": "L",
        "symbol": "MDL"
    },
    {
        "id": 3556,
        "name": "Macedonian Denar",
        "sign": "ден",
        "symbol": "MKD"
    },
    {
        "id": 3557,
        "name": "Myanma Kyat",
        "sign": "Ks",
        "symbol": "MMK"
    },
    {
        "id": 3558,
        "name": "Mongolian Tugrik",
        "sign": "₮",
        "symbol": "MNT"
    },
    {
        "id": 3559,
        "name": "Namibian Dollar",
        "sign": "$",
        "symbol": "NAD"
    },
    {
        "id": 3560,
        "name": "Nicaraguan Córdoba",
        "sign": "C$",
        "symbol": "NIO"
    },
    {
        "id": 3561,
        "name": "Nepalese Rupee",
        "sign": "₨",
        "symbol": "NPR"
    },
    {
        "id": 3562,
        "name": "Omani Rial",
        "sign": "ر.ع.",
        "symbol": "OMR"
    },
    {
        "id": 3563,
        "name": "Panamanian Balboa",
        "sign": "B/.",
        "symbol": "PAB"
    },
    {
        "id": 3564,
        "name": "Qatari Rial",
        "sign": "ر.ق",
        "symbol": "QAR"
    },
    {
        "id": 3565,
        "name": "Serbian Dinar",
        "sign": "дин.",
        "symbol": "RSD"
    },
    {
        "id": 3566,
        "name": "Saudi Riyal",
        "sign": "ر.س",
        "symbol": "SAR"
    },
    {
        "id": 3567,
        "name": "South Sudanese Pound",
        "sign": "£",
        "symbol": "SSP"
    },
    {
        "id": 3568,
        "name": "Tunisian Dinar",
        "sign": "د.ت",
        "symbol": "TND"
    },
    {
        "id": 3569,
        "name": "Trinidad and Tobago Dollar",
        "sign": "$",
        "symbol": "TTD"
    },
    {
        "id": 3570,
        "name": "Ugandan Shilling",
        "sign": "Sh",
        "symbol": "UGX"
    },
    {
        "id": 3571,
        "name": "Uruguayan Peso",
        "sign": "$",
        "symbol": "UYU"
    },
    {
        "id": 3572,
        "name": "Uzbekistan Som",
        "sign": "so'm",
        "symbol": "UZS"
    },
    {
        "id": 3573,
        "name": "Sovereign Bolivar",
        "sign": "Bs.",
        "symbol": "VES"
    }
];

export const Currencies = (SUPPORTED_CURRENCIES.map(item => ({label: item.symbol, value: item.symbol, sign: item.sign})));

export const ERC20_ABI = [
    {
        "constant": true,
        "inputs": [],
        "name": "name",
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_spender",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_from",
                "type": "address"
            },
            {
                "name": "_to",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "transferFrom",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [
            {
                "name": "",
                "type": "uint8"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_owner",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "name": "balance",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "symbol",
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_to",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_owner",
                "type": "address"
            },
            {
                "name": "_spender",
                "type": "address"
            }
        ],
        "name": "allowance",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "payable": true,
        "stateMutability": "payable",
        "type": "fallback"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "spender",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Approval",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "from",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Transfer",
        "type": "event"
    }
]