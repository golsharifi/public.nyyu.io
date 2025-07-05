import React, { useRef, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "gatsby";
import CopyToClipboard from "react-copy-to-clipboard";

import { RiFileCopyLine } from "@react-icons/all-files/ri/RiFileCopyLine";
import { FaEdit } from "@react-icons/all-files/fa/FaEdit";
import { IoMdArrowDropdown } from "@react-icons/all-files/io/IoMdArrowDropdown";
import { AiFillCaretDown } from "@react-icons/all-files/ai/AiFillCaretDown";

import { CHECK_TIMELOCK } from "../api/query";
import InviteModal from "./inviteModal";
import { isBrowser } from "../../../utilities/auth";
import { ROUTES } from "../../../utilities/routes";

import BASIC from "../../../images/tier_png/basic.svg";
import BRONZE from "../../../images/tier_png/bronze.svg";
import SILVER from "../../../images/tier_png/silver.svg";
import GOLD from "../../../images/tier_png/gold.svg";
import PLAT from "../../../images/tier_png/plat.svg";
import DIA from "../../../images/tier_png/diamond.svg";
import { useQuery } from "@apollo/client";
import { ReactTooltip } from "../../../utilities/tooltip";

const tierImages = [BASIC, BRONZE, SILVER, GOLD, PLAT, DIA];

const shortReferralCode = (code) => {
    if (!code) return "";
    return code.substring(0, 6) + "...";
};

const shortFormatAddr = (addr) => {
    if (!addr) return "";
    return addr.substring(0, 16) + "..." + addr.substring(addr.length - 4);
};

const shortInviteUrl = (url) => {
    if (!url) return "";
    return url.substring(0, 20) + "..." + url.substring(url.length - 6);
};
const timeLockTemplate =
    "sorry the wallet can only be changed once every 24hrs you can change in ";
const inviteText =
    "Hey, I use Nyyu.io to buy NDB tokens. It has great potential! Give it a try and get an extra 10% reward on your purchase.";

export const sendingLinks = [
    {
        name: "Send with Whatsapp",
        link: (url) => {
            return `https://wa.me/?text=${encodeURIComponent(inviteText + " " + url)}`;
        },
    },
    {
        name: "Send with Telegram",
        link: (url) => {
            return `https://telegram.me/share/url?url=${encodeURIComponent(url)}&text=${inviteText}`;
        },
    },
    {
        name: "Post to Facebook",
        link: (url) => {
            return `https://www.facebook.com/sharer.php?u=${encodeURIComponent(url)}`;
        },
    },
    {
        name: "Twitter",
        link: (url) => {
            return `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(inviteText)}`;
        },
    },
];

// default
let timelock = 100;

const ReferralLink = ({ referrerInfo, onChangeWallet }) => {
    const dispatch = useDispatch();
    const tierDiv = useRef(null);
    const tiers = useSelector((state) => state.tiers);
    const user = useSelector((state) => state.auth?.user);

    // const [timelock, setTimelock] = useState(100);
    const [timelockHover, setTimelockHover] = useState("");
    const [codeCopied, setCodeCopied] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);
    const [caretStyle, setCaretStyle] = useState({});
    const [linkModalShow, setLinkModalShow] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    const { referralCode, walletConnect, commissionRate, rate } = referrerInfo;

    useQuery(CHECK_TIMELOCK, {
        onCompleted: (data) => {
            timelock = data.checkTimeLock;
        },
        onError: (err) => {
            console.log(err);
        },
    });

    const onChangeModalShow = (e) => {
        e.stopPropagation();
        setLinkModalShow(!linkModalShow);
    };

    const hideLinkModal = (e) => {
        e.stopPropagation();
        setLinkModalShow(false);
    };

    const handleCodeCopy = () => {
        setCodeCopied(true);
        setTimeout(() => {
            setCodeCopied(false);
        }, 2000);
    };

    const handleLinkCopy = () => {
        setLinkCopied(true);
        setTimeout(() => {
            setLinkCopied(false);
        }, 2000);
    };

    const generateEmailLink = () => {
        const inviteLink = `${process.env.GATSBY_SITE_URL}?referralCode=${referralCode}`;
        return encodeURIComponent(inviteText + " " + inviteLink);
    };

    useEffect(() => {
        if (!isBrowser) {
            return null;
        }

        const countDown = setInterval(() => {
            const hours = Math.floor(timelock / 3600);
            const minutes = Math.floor((timelock % 3600) / 60);
            const _hoverText = `${timeLockTemplate}${hours}hr ${minutes}m`;
            setTimelockHover(_hoverText);
            if (timelock > 0) timelock--;
        }, 1000);

        commissionRate.forEach((_rate, index) => {
            if (_rate === rate) {
                const leftMove =
                    (100 / commissionRate.length) * index +
                    100 / commissionRate.length / 2;
                setCaretStyle({
                    top: "-28px",
                    transform: "translateX(-50%)",
                    left: `${leftMove}%`,
                });
            }
        });
        window.addEventListener("click", hideLinkModal);
        return () => {
            window.removeEventListener("click", hideLinkModal);
            clearInterval(countDown);
        };
    }, [commissionRate]);

    return (
        <div>
            <div className="d-none d-md-flex bg-gray-50 justify-content-around pb-3 pt-4">
                <div className="text-center">
                    <div className="text-transparent fs-13px user-select-none">
                        FRIEND GETS
                    </div>
                    <div
                        ref={tierDiv}
                        className="text-gray fs-18px fw-600 d-flex justify-content-center border border-end-0 border-secondary position-relative"
                    >
                        <div
                            style={caretStyle}
                            className="txt-green fs-13px text-center position-absolute"
                        >
                            <div style={{ lineHeight: "8px" }}>YOU GET</div>
                            <div>
                                <AiFillCaretDown color="#23C865" />
                            </div>
                            <Link
                                to={ROUTES.profile}
                                className="text-decoration-underline position-absolute cursor-pointer"
                                style={{
                                    top: "-3px",
                                    right: "-88%",
                                    fontSize: "10px",
                                    color: "#626161",
                                }}
                            >
                                <button
                                    className="bg-transparent border-0 text-decoration-underline level-up"
                                    onClick={() =>
                                        dispatch({ type: "TIER_TAB" })
                                    }
                                >
                                    Level up
                                </button>
                            </Link>
                        </div>
                        {tiers.length > 0 &&
                            tiers.map((tier) => {
                                return (
                                    <div
                                        className={`border-end border-secondary p-md-2 px-xl-3 py-xl-2 d-flex align-items-center justify-content-around`}
                                        key={tier.level}
                                    >
                                        <img
                                            src={tierImages[tier.level]}
                                            alt={tier.name}
                                            width="12px"
                                            height="12px"
                                            className={`${tier.level === user.tierLevel ? "" : "opacity-20"}`}
                                        />
                                        <span
                                            className={`fs-16px ps-md-1 ps-xl-2 ${tier.level === user.tierLevel ? "text-white" : "text-[#7C7C7C] opacity-20"}`}
                                        >
                                            {commissionRate[tier.level]}%
                                        </span>
                                    </div>
                                );
                            })}
                    </div>
                </div>
                <div className="text-center">
                    <div className="text-transparent fs-13px">FRIEND</div>
                    <div className="text-white fs-16px fw-600 border py-2 px-3 px-xl-4 position-relative">
                        <div
                            className="txt-baseprice fs-13px position-absolute"
                            style={{
                                top: "-34px",
                                right: "-16px",
                                width: "120px",
                            }}
                        >
                            FRIEND GETS
                        </div>
                        10%
                    </div>
                </div>
            </div>
            <div className="d-block d-md-none text-white text-center">
                <div className="d-flex justify-content-around bg-gray-50 py-3 mb-2">
                    <div className="me-4">
                        <div className="opacity-40">You get</div>
                        <div className="fw-600 fs-24px">
                            {commissionRate[user.tierLevel]}%
                        </div>
                    </div>
                    <div className="ms-4">
                        <div className="opacity-40">Friend gets</div>
                        <div className="fw-600 fs-24px">10%</div>
                    </div>
                </div>
                <div className="bg-gray-50 row border border-end-0 border-secondary mx-0">
                    {tiers.length > 0 &&
                        tiers.map((tier) => {
                            return (
                                <div
                                    className={`col-2 border-end border-secondary p-2 d-flex align-items-center justify-content-center`}
                                    key={tier.level}
                                >
                                    <img
                                        src={tierImages[tier.level]}
                                        alt={tier.name}
                                        width="12px"
                                        height="12px"
                                        className={`me-1 ${tier.level === user.tierLevel ? "" : "opacity-20"}`}
                                    />
                                    <span
                                        className={`fs-16px ${tier.level === user.tierLevel ? "text-white" : "text-[#7C7C7C] opacity-20"}`}
                                        style={{ paddingLeft: "3px" }}
                                    >
                                        {commissionRate[tier.level]}%
                                    </span>
                                </div>
                            );
                        })}
                </div>
                <div className="d-flex justify-content-between mt-2">
                    <div></div>
                    <Link
                        to={ROUTES.profile}
                        className="fs-14px txt-green cursor-pointer"
                    >
                        <button
                            className="bg-transparent border-0 text-decoration-underline level-up"
                            onClick={() => dispatch({ type: "TIER_TAB" })}
                        >
                            Level up
                        </button>
                    </Link>
                </div>
            </div>
            <div className="row text-white">
                <div className="col-md-12 col-lg-4 pt-3">
                    <div className="pb-1 fw-13px fw-400">Referral ID</div>
                    <div className="bg-white text-black p-3 position-relative">
                        {shortReferralCode(referralCode)}
                        <CopyToClipboard
                            text={referralCode}
                            onCopy={handleCodeCopy}
                        >
                            <RiFileCopyLine
                                className="position-absolute"
                                size="1.4em"
                                style={{ top: "16px", right: "14px" }}
                                color={codeCopied ? "green" : "black"}
                            />
                        </CopyToClipboard>
                    </div>
                </div>
                <div className="col-md-12 col-lg-8 pt-3">
                    <div className="pb-1 fw-13px fw-400">Connected Wallet</div>
                    <div className="bg-white text-black p-3 position-relative">
                        <span className="d-inline-block text-black">
                            {shortFormatAddr(walletConnect)}
                        </span>
                        <FaEdit
                            onClick={() => {
                                if (timelock === 0) onChangeWallet();
                            }}
                            data-tip="tooltip"
                            data-for="timelock-tooltip"
                            className={`position-absolute ${timelock > 0 ? "opacity-30" : ""}`}
                            size="1.4em"
                            style={{ top: "16px", right: "14px" }}
                        />
                        {timelock > 0 && (
                            <ReactTooltip
                                place="left"
                                type="light"
                                effect="solid"
                                id="timelock-tooltip"
                            >
                                <div
                                    className="text-justify"
                                    style={{
                                        width: "220px",
                                    }}
                                >
                                    {timelockHover}
                                </div>
                            </ReactTooltip>
                        )}
                    </div>
                </div>
            </div>
            <div className="row text-white pt-3 mb-3">
                <div className="pb-1 fw-13px fw-400">Referral link</div>
                <div className="col-12 d-flex">
                    <div className="bg-white text-black p-3 position-relative flex-fill">
                        {shortInviteUrl(
                            `${process.env.GATSBY_SITE_URL}?referralCode=${referralCode}`,
                        )}
                        <CopyToClipboard
                            text={`${process.env.GATSBY_SITE_URL}?referralCode=${referralCode}`}
                            onCopy={handleLinkCopy}
                        >
                            <RiFileCopyLine
                                className="position-absolute cursor-pointer"
                                size="1.4em"
                                style={{ top: "16px", right: "16px" }}
                                color={linkCopied ? "green" : "black"}
                            />
                        </CopyToClipboard>
                    </div>
                    <div
                        className="d-none d-md-block bg-green share position-relative cursor-pointer"
                        onClick={onChangeModalShow}
                    >
                        <span className="text-white fs-16px fw-600">Share</span>
                        &nbsp;
                        <IoMdArrowDropdown color="white" />
                        <div
                            className={`bg-white px-3 py-1 position-absolute ${linkModalShow ? "d-block" : "d-none"}`}
                            style={{
                                top: "110%",
                                right: "0px",
                                width: "200px",
                            }}
                        >
                            {sendingLinks.map((item, key) => {
                                return (
                                    <div key={key}>
                                        {item.action === undefined ? (
                                            <a
                                                href={item.link(
                                                    `${process.env.GATSBY_SITE_URL}?referralCode=${referralCode}`,
                                                )}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`py-2 text-black fs-14px fw-400 cursor-pointer d-block
                                            ${key === sendingLinks.length - 1 ? "" : "border-bottom"}`}
                                            >
                                                {item.name}
                                            </a>
                                        ) : (
                                            <span
                                                className={`py-2 text-black fs-14px fw-400 cursor-pointer d-block
                                        ${key === sendingLinks.length - 1 ? "" : "border-bottom"}`}
                                                onClick={() => {
                                                    setLinkModalShow(false);
                                                    item.action(
                                                        `${process.env.GATSBY_SITE_URL}?referralCode=${referralCode}`,
                                                    );
                                                }}
                                            >
                                                {item.name}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
            <div className="d-none d-md-block text-center pt-4">
                <button className="text-white bg-transparent border border-white referral-button py-2 fw-bold fs-20px">
                    <a
                        href={`https://mail.google.com/mail/u/0/?fs=1&su=${encodeURIComponent("NDB Invitation")}&body=${generateEmailLink()}&tf=cm`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        INVITE VIA EMAIL
                    </a>
                </button>
            </div>
            <div className="d-block d-md-none text-center pt-4">
                <button
                    onClick={() => setIsInviteModalOpen(true)}
                    className="text-white bg-transparent border border-white referral-button py-2 fw-bold fs-20px"
                >
                    INVITE FRIENDS
                </button>
            </div>
            {isInviteModalOpen && (
                <InviteModal
                    isOpen={isInviteModalOpen}
                    setIsOpen={setIsInviteModalOpen}
                    ariaHideApp={false}
                    referralCode={referralCode}
                    inviteText={inviteText}
                />
            )}
        </div>
    );
};

export default ReferralLink;
