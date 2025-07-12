import { isBrowser } from "./auth";

export const ROUTES = {
    app: '/app/',
    signIn: "/app/signin/",
    signUp: "/app/signup/",
    selectFigure: "/app/select-figure/",
    verifyFailed: "/app/verify-failed/",
    verifyEmail: "/app/verify-email/",
    verifyCompany: "/app/verify-company/",
    verifyId: "/app/verify-id/",
    profile: "/app/profile/",
    changePassword: "/app/change-password/",
    forgotPassword: "/app/forgot-password/",
    payment: "/app/payment/",
    auction: "/app/auction/",
    home: "/",
    faq: "/app/support/",
    wallet: "/app/wallet/",
    admin: "/admin",
    presale_auction: "/pre-sale/auction/",
    presale_home: "/pre-sale/home/",
    referral: '/app/referral'
}

export const isRedirectUrl = isBrowser && window.location.href.includes("token=");

export const navLinks = [
    {
        to: ROUTES.wallet,
        active: [ROUTES.wallet, ROUTES.creditDeposit],
        title: 'wallet'
    },
    {
        to: ROUTES.auction,
        active: [ROUTES.auction, ROUTES.payment],
        title: 'sale'
    },
    {
        to: ROUTES.profile,
        active: [ROUTES.profile],
        title: 'profile'
    },
    {
        to: ROUTES.faq,
        active: [ROUTES.faq],
        title: 'support'
    },
    {
        to: ROUTES.referral,
        active: [ROUTES.referral],
        title: 'invite & earn'
    }
]