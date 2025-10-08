import React, { useState, useEffect } from "react";
import { Link, navigate } from "gatsby";
import { useQuery } from "@apollo/client";

import Seo from "../components/seo";
import { Certik, Hero2 } from "../utilities/imgImport";
import CountDown from "../components/common/countdown";
import Header from "../components/header";
import Footer from "../components/footer";
import PaypalRedirect from "../components/payment/PaypalRedirect";
import { numberWithCommas } from "../utilities/number";
import { useAuth } from "../hooks/useAuth";
import { ROUTES, isRedirectUrl } from "../utilities/routes";
import ReferToFriendsModal from "../components/home/refer-to-friends-modal";
import Loading from "../components/common/FadeLoading";
import { GET_CURRENT_ROUND } from "../apollo/graphqls/querys/Auction";
import CountDownPending from "../components/common/countdown-pending";
import { isBrowser } from "../utilities/auth";
import CurrentCapProgressBar from "../components/shared/CurrentCapProgressBar";

const IndexPage = () => {
    // Containers
    const auth = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [currentRound, setCurrentRound] = useState(null);
    const [referralCode, setReferralCode] = useState(null);
    const [isClient, setIsClient] = useState(false);

    // Hydration-safe client-side rendering
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Custom hook to get URL parameters - only run on client
    useEffect(() => {
        if (!isClient) return;

        if (typeof window !== "undefined") {
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get("referralCode");
            setReferralCode(code);
        }
    }, [isClient]);

    // For catching the redirect Url from Paypal.
    useEffect(() => {
        if (isRedirectUrl) setLoading(true);
    }, []);

    // Webservice
    useQuery(GET_CURRENT_ROUND, {
        onCompleted: (data) => {
            if (isRedirectUrl) return;
            setCurrentRound(data?.getCurrentRound);
            return setLoading(false);
        },
        onError: (err) => {
            console.log(err.message);
            setLoading(false);
        },
    });

    const auctionRound = currentRound?.auction?.round;
    const auctionStatus = currentRound?.auction?.status;
    const auctionTotalToken = currentRound?.auction?.totalToken;
    const auctionSold = currentRound?.auction?.sold;
    const auctionStart = currentRound?.auction?.startedAt;
    const auctionEnd = currentRound?.auction?.endedAt;

    const presaleRound = currentRound?.presale?.round;
    const presaleStatus = currentRound?.presale?.status;
    const presaleTotalToken = currentRound?.presale?.tokenAmount;
    const presaleSold = currentRound?.presale?.sold;
    const presaleStart = currentRound?.presale?.startedAt;
    const presaleEnd = currentRound?.presale?.endedAt;

    // Handle referral code logic - only run on client
    useEffect(() => {
        if (!isClient || !isBrowser) return;

        if (
            referralCode !== null &&
            referralCode !== undefined &&
            referralCode !== ""
        ) {
            // store referral code
            localStorage.setItem("referralCode", referralCode);
            // redirect to signup page
            navigate(ROUTES.signUp);
        } else {
            // debugging - only remove if no referral code in URL
            if (referralCode === null) {
                localStorage.removeItem("referralCode");
            }
        }
    }, [referralCode, isClient]);

    // Server-side rendering safety
    if (!isClient) {
        return (
            <div>
                <Seo title="Home" />
                <div className="home-page">
                    <Header />
                    <section className="home-section mt-5 mt-sm-0 d-flex flex-column justify-content-center">
                        <div className="container d-flex flex-column justify-content-xl-center justify-content-start mt-5 mt-md-0 mb-3">
                            <div className="row m-0">
                                <div className="left-part col-md-6 px-0 pe-sm-auto">
                                    <div className="text-light home-page-no-active-round d-flex flex-column justify-content-center h-100">
                                        <div className="title">Loading...</div>
                                    </div>
                                </div>
                                <div className="col-md-1 d-none d-sm-block"></div>
                                <div className="right-part col-md-5 d-none d-md-flex">
                                    <img
                                        src={Hero2}
                                        alt="home hero"
                                        className="hero-image img-fluid"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                    <Footer />
                </div>
            </div>
        );
    }

    // Methods
    const placeABidButtonClick = () =>
        auth?.isAuthenticated
            ? navigate(ROUTES.auction)
            : navigate(ROUTES.signIn);

    const handleActionAfterDeadline = (status = 1) => {
        if (status === 1) {
            navigate(ROUTES.auction);
        } else {
            setCurrentRound(null);
        }
    };

    const auctionStartedContent = (
        <div className="left-part col-md-6 px-0 pe-sm-auto">
            <h3 className="home-title d-sm-block d-none">
                <div>
                    <span className="txt-green">round {auctionRound}</span> ends
                    in
                </div>
                <CountDown
                    deadline={auctionStatus === 2 ? auctionEnd : auctionStart}
                    actionAfterDeadline={() =>
                        handleActionAfterDeadline(auctionStatus)
                    }
                />
            </h3>
            <h3 className="home-title-mobile d-sm-none d-block mb-5 mb-sm-0">
                <div className="mb-3">
                    <span className="txt-green">round {auctionRound}</span> ends
                    in
                </div>
                <CountDown
                    deadline={auctionStatus === 2 ? auctionEnd : auctionStart}
                    actionAfterDeadline={() =>
                        handleActionAfterDeadline(auctionStatus)
                    }
                />
            </h3>
            <div className="tokens-lower-part mt-5 mt-sm-0">
                <p className="token-left text-uppercase token-left-mobile d-sm-none d-block">
                    tokens left
                </p>
                <p className="token-value mt-2 mt-sm-0">
                    {numberWithCommas(auctionTotalToken - auctionSold, " ")}
                </p>
                <p className="token-left text-uppercase d-sm-block d-none">
                    tokens left in this round
                </p>
                <div className="cta mt-2 mt-sm-0 px-3 px-sm-0">
                    <button
                        className="btn btn-green white-space-nowrap"
                        onClick={placeABidButtonClick}
                    >
                        place a bid
                    </button>
                    <br />
                </div>
                <div className="mx-auto col-lg-8 mt-5 col-10">
                    <div className="d-flex align-items-center justify-content-center">
                        <div className="my-3">
                            <Link
                                to="https://www.certik.com/projects/ndb"
                                target="_blank"
                            >
                                <img src={Certik} alt="audited by certik" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const auctionPendingContent = (
        <div className="left-part col-md-6 px-0 pe-sm-auto">
            <h3 className="home-title d-sm-block d-none text-center">
                <div className="mb-4">
                    {auctionRound > 1 && (
                        <div>
                            <span className="txt-green">
                                round {auctionRound - 1}
                            </span>{" "}
                            ended
                        </div>
                    )}
                    <div>next round starts in</div>
                </div>
                <CountDownPending
                    deadline={auctionStart}
                    actionAfterDeadline={() => handleActionAfterDeadline()}
                />
            </h3>
            <h3 className="home-title-mobile text-center d-sm-none d-block mb-5 mb-sm-0">
                <div className="mb-3 fs-36px">
                    {auctionRound > 1 && (
                        <div className="mb-3">
                            <span className="txt-green">
                                round {auctionRound - 1}
                            </span>{" "}
                            ended
                        </div>
                    )}
                    <div>next round starts in</div>
                </div>
                <CountDownPending
                    deadline={auctionStart}
                    actionAfterDeadline={() => handleActionAfterDeadline()}
                />
            </h3>
            <div className="tokens-lower-part mt-sm-0">
                <div className="cta mt-sm-0 px-1 px-sm-0">
                    <button className="btn btn-green white-space-nowrap">
                        get notify
                    </button>
                    <br />
                </div>
                <div className="mx-auto col-lg-8 mt-5 col-10">
                    <div className="d-flex align-items-center justify-content-center">
                        <div className="my-3">
                            <Link
                                to="https://www.certik.com/projects/ndb"
                                target="_blank"
                            >
                                <img src={Certik} alt="audited by certik" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const presaleStartedContent = (
        <div className="left-part col-md-6 px-0 pe-sm-auto d-flex flex-column justify-content-center">
            <h3 className="home-title d-sm-block d-none">
                <div>
                    <span className="txt-green">round {presaleRound}</span> ends
                    in
                </div>
                <CountDown
                    deadline={presaleStatus === 2 ? presaleEnd : presaleStart}
                    actionAfterDeadline={() =>
                        handleActionAfterDeadline(presaleStatus)
                    }
                />
            </h3>
            <h3 className="home-title-mobile d-sm-none d-block mb-5 mb-sm-0">
                <div className="mb-3">
                    <span className="txt-green">round {presaleRound}</span> ends
                    in
                </div>
                <CountDown
                    deadline={presaleStatus === 2 ? presaleEnd : presaleStart}
                    actionAfterDeadline={() =>
                        handleActionAfterDeadline(presaleStatus)
                    }
                />
            </h3>
            <div className="tokens-lower-part mt-5 mt-sm-0">
                <p className="token-left text-uppercase token-left-mobile d-sm-none d-block">
                    tokens left
                </p>
                <p className="token-value mt-2 mt-sm-0">
                    {numberWithCommas(presaleTotalToken - presaleSold, " ")}
                </p>
                <p className="token-left text-uppercase d-sm-block d-none">
                    tokens left in this round
                </p>
                <div className="cta mt-2 mt-sm-0 px-3 px-sm-0">
                    <button
                        className="btn btn-green white-space-nowrap"
                        onClick={placeABidButtonClick}
                    >
                        place a bid
                    </button>
                    <br />
                </div>
                <div className="mx-auto col-lg-8 mt-5 col-10">
                    <div className="d-flex align-items-center justify-content-center">
                        <div className="my-3">
                            <Link
                                to="https://www.certik.com/projects/ndb"
                                target="_blank"
                            >
                                <img src={Certik} alt="audited by certik" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const presalePendingContent = (
        <div className="left-part col-md-6 px-0 pe-sm-auto">
            <h3 className="home-title d-sm-block d-none text-center pe-0">
                <div className="mb-4">
                    {presaleRound > 1 && (
                        <div>
                            <span className="txt-green">
                                round {presaleRound - 1}
                            </span>{" "}
                            ended
                        </div>
                    )}
                    <div>next round starts in</div>
                </div>
                <CountDownPending
                    deadline={presaleStart}
                    actionAfterDeadline={() => handleActionAfterDeadline()}
                />
            </h3>
            <h3 className="home-title-mobile d-sm-none d-block mb-5 mb-sm-0">
                <div className="mb-3 fs-36px">
                    {presaleRound > 1 && (
                        <div className="mb-3">
                            <span className="txt-green">
                                round {presaleRound - 1}
                            </span>{" "}
                            ended
                        </div>
                    )}
                    <div>next round starts in</div>
                </div>
                <CountDownPending
                    deadline={presaleStart}
                    actionAfterDeadline={() => handleActionAfterDeadline()}
                />
            </h3>
            <div className="tokens-lower-part mt-sm-0">
                <div className="cta mt-sm-0 px-1 px-sm-0">
                    <button className="btn btn-green white-space-nowrap">
                        Be notified
                    </button>
                    <br />
                </div>
                <div className="mx-auto col-lg-8 mt-5 col-10">
                    <div className="d-flex align-items-center justify-content-center">
                        <div className="my-3">
                            <Link
                                to="https://www.certik.com/projects/ndb"
                                target="_blank"
                            >
                                <img src={Certik} alt="audited by certik" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const noContent = (
        <div className="left-part col-md-6 px-0 pe-sm-auto">
            <div className="text-light home-page-no-active-round d-flex flex-column justify-content-center h-100">
                <div className="title">Presale will start soon!</div>
                <div className="sub-title">
                    <Link to="https://api.ndb.technology/widget/form/rSkVvg3fKgsWSbckbyhM">
                        subscribe
                    </Link>{" "}
                    to our waiting list.
                </div>
            </div>
        </div>
    );

    // Render - Client-side only content
    if (loading)
        return (
            <>
                <Loading />
                <PaypalRedirect />
            </>
        );

    return (
        <div>
            <Seo title="Home" />
            <div className="home-page">
                <Header />
                <ReferToFriendsModal
                    isModalOpen={isModalOpen}
                    setIsModalOpen={setIsModalOpen}
                />
                <section className="home-section mt-5 mt-sm-0 d-flex flex-column justify-content-center">
                    <div className="container d-flex flex-column justify-content-xl-center justify-content-start mt-5 mt-md-0 mb-3">
                        <div className="row m-0">
                            {currentRound?.auction
                                ? auctionStatus === 1
                                    ? auctionPendingContent
                                    : auctionStartedContent
                                : currentRound?.presale
                                  ? presaleStatus === 1
                                      ? presalePendingContent
                                      : presaleStartedContent
                                  : noContent}
                            <div className="col-md-1 d-none d-sm-block"></div>
                            <div className="right-part col-md-5 d-none d-md-flex">
                                <img
                                    src={Hero2}
                                    alt="home hero"
                                    className="hero-image img-fluid"
                                />
                                <strong className="title d-none">
                                    The NDB token pre-sale: NDB token will help
                                    you gain access to the NDB Ecosystem and
                                    allows the acquisition of some of its
                                    utilities, such as NFTs.
                                </strong>
                            </div>
                        </div>
                    </div>
                    <div className="d-flex justify-content-center">
                        <CurrentCapProgressBar />
                    </div>
                </section>
                <Footer />
            </div>
        </div>
    );
};

export default IndexPage;
