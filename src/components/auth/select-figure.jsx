import React, { useState, useMemo, useCallback } from "react";
import Modal from "react-modal";
import { navigate } from "gatsby";
import StarRatings from "react-star-ratings";
import { useMutation, useQuery } from "@apollo/client";
import { FaExclamationCircle } from "@react-icons/all-files/fa/FaExclamationCircle";
import names from "random-names-generator";
import validator from "validator";

import Seo from "../seo";
import Header from "../header";
import FigureItem from "../FigureItem";
import Loading from "../common/Loading";
import CustomSpinner from "../common/custom-spinner";
import AvatarImage from "../admin/shared/AvatarImage";
import { CloseIcon } from "../../utilities/imgImport";
import { ROUTES } from "../../utilities/routes";
import { GET_USER } from "../../apollo/graphqls/querys/Auth";
import { SET_AVATAR } from "../../apollo/graphqls/mutations/Auth";
import { GET_AVATARS } from "../../apollo/graphqls/querys/AvatarComponent";
import { getShuftiStatusByReference } from "../../utilities/utility-methods";
import { GET_SHUFT_REFERENCE } from "../verify-identity/kyc-webservice";

const SelectFigure = () => {
    // Containers
    const [error, setError] = useState("");
    const [pending, setPending] = useState(false);
    const [selected, setSelect] = useState(false);
    const [selectedId, setSelectId] = useState(0);
    const [modalIsOpen, setIsOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [userDataLoading, setUserDataLoading] = useState(true);
    const [avatarsLoading, setAvatarsLoading] = useState(true);
    const [figuresArray, setFiguresArray] = useState([]);
    const [randomName, setRandomName] = useState("");

    // Optimize queries with better fetch policies
    useQuery(GET_SHUFT_REFERENCE, {
        onCompleted: async (data) => {
            const reference = data.getShuftiReference;
            const response = await getShuftiStatusByReference(reference);
            if (response.event === "verification.accepted")
                navigate(ROUTES.profile);
        },
        fetchPolicy: "cache-first", // Use cache-first for better performance
        errorPolicy: "ignore",
    });

    useQuery(GET_USER, {
        onCompleted: async (res) => {
            if (res.getUser?.avatar) {
                const { prefix, name } = res.getUser.avatar;
                if (prefix && name) {
                    return navigate(ROUTES.verifyId);
                }
            }
            return setUserDataLoading(false);
        },
        fetchPolicy: "cache-first", // Use cache-first for better performance
    });

    // Optimized avatar fetching
    useQuery(GET_AVATARS, {
        onCompleted: (res) => {
            const processedAvatars =
                res.getAvatars?.map((item, index) => {
                    return {
                        id: index,
                        avatar: {
                            avatarSet: item.avatarSet,
                            hairColor: item.hairColor,
                            skinColor: item.skinColor,
                        },
                        firstname: item?.fname,
                        lastname: item?.surname,
                        stars: item.skillSet.map((skill) => {
                            return {
                                type: skill.name,
                                rates: skill.rate,
                            };
                        }),
                        abilities: item.factsSet.map((fact) => {
                            return {
                                title: fact.topic,
                                text: fact.detail,
                            };
                        }),
                        intro: item.details,
                    };
                }) || [];

            setFiguresArray(processedAvatars);
            setAvatarsLoading(false);
        },
        fetchPolicy: "cache-and-network", // Better performance with cache
        errorPolicy: "ignore",
    });

    const [setAvatar] = useMutation(SET_AVATAR, {
        errorPolicy: "ignore",
        onCompleted: (data) => {
            setPending(false);
            if (data?.setAvatar === "Success") navigate(ROUTES.verifyId);
            else
                setError(
                    `${figuresArray[selectedId].lastname}.${randomName} Already Taken, Choose Another Name`,
                );
        },
        onError: (err) => {
            setError(err.message);
            setPending(false);
        },
    });

    const loadingPage = avatarsLoading || userDataLoading;

    // Memoize filtered figures for performance
    const filteredFigures = useMemo(() => {
        if (!searchValue) return figuresArray;
        return figuresArray.filter((item) =>
            (item?.firstname + item?.lastname)
                .toLowerCase()
                .includes(searchValue.toLowerCase()),
        );
    }, [figuresArray, searchValue]);

    // Methods
    const handleFigure = useCallback(
        (id) => {
            setSelectId(id);
            setIsOpen(true);
            setRandomName(figuresArray[id]?.lastname || "");
        },
        [figuresArray],
    );

    const closeModal = useCallback(() => {
        setIsOpen(false);
        setSelect(false);
        setError("");
    }, []);

    const handleOnConfirmButtonClick = useCallback(
        (e) => {
            e.preventDefault();
            if (!randomName) {
                setError("Display name is required");
                return;
            }

            if (!validator.isAlphanumeric(randomName)) {
                setError("Display name can contain only letters and numbers");
                return;
            }

            setPending(true);
            setError("");
            setAvatar({
                variables: {
                    prefix: figuresArray[selectedId].lastname,
                    name: randomName,
                },
            });
        },
        [randomName, figuresArray, selectedId, setAvatar],
    );

    if (loadingPage) return <Loading />;
    else
        return (
            <>
                <Seo title="Select Figure" />
                <main className="select-figure-page">
                    <Header />
                    <section className="container position-relative h-100">
                        <div className="figure-section">
                            <h3 className="header-text">
                                Select one Historical Figure
                            </h3>
                            <div className="row">
                                <div className="figure-select col-md-5 col-lg-6">
                                    <input
                                        type="text"
                                        className="figure-search"
                                        placeholder="Search"
                                        value={searchValue}
                                        onChange={(e) =>
                                            setSearchValue(e.target.value)
                                        }
                                    />
                                    <div className="row figure-select-items-section">
                                        {filteredFigures.map((item) => (
                                            <div
                                                className="col-lg-3 col-6 mb-3"
                                                key={item.id}
                                                style={{
                                                    opacity:
                                                        item?.id === selectedId
                                                            ? "1"
                                                            : "0.5",
                                                }}
                                            >
                                                <FigureItem
                                                    figure={item}
                                                    active={
                                                        item?.id === selectedId
                                                    }
                                                    onFigureSelect={
                                                        handleFigure
                                                    }
                                                ></FigureItem>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="figure-intro col-md-7 col-lg-6">
                                    <div className="figure-intro__box">
                                        {!selected && (
                                            <div className="figure-name">
                                                {figuresArray && (
                                                    <p>
                                                        {
                                                            figuresArray[
                                                                selectedId
                                                            ]?.firstname
                                                        }{" "}
                                                        {
                                                            figuresArray[
                                                                selectedId
                                                            ]?.lastname
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                        <div className="figure-intro__box--body">
                                            {!selected ? (
                                                <>
                                                    <div className="d-flex justify-content-around">
                                                        <div className="mt-3 scale-70">
                                                            <AvatarImage
                                                                avatar={
                                                                    figuresArray &&
                                                                    figuresArray[
                                                                        selectedId
                                                                    ]?.avatar
                                                                }
                                                            />
                                                        </div>
                                                        <div className="stars">
                                                            {figuresArray &&
                                                                figuresArray[
                                                                    selectedId
                                                                ]?.stars.map(
                                                                    (
                                                                        item,
                                                                        idx,
                                                                    ) => (
                                                                        <div
                                                                            className="row align-items-center"
                                                                            key={
                                                                                idx
                                                                            }
                                                                        >
                                                                            <div className="col-6">
                                                                                <p className="ability">
                                                                                    {
                                                                                        item.type
                                                                                    }
                                                                                </p>
                                                                            </div>
                                                                            <div className="col-6">
                                                                                <StarRatings
                                                                                    numberOfStars={
                                                                                        item.rates
                                                                                    }
                                                                                    starDimension="17px"
                                                                                    starSpacing="3px"
                                                                                    starRatedColor="#ffffff"
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    ),
                                                                )}
                                                        </div>
                                                    </div>
                                                    <div className="my-4">
                                                        {figuresArray &&
                                                            figuresArray[
                                                                selectedId
                                                            ]?.abilities.map(
                                                                (item, idx) => (
                                                                    <div
                                                                        className="row mb-1"
                                                                        key={
                                                                            idx
                                                                        }
                                                                    >
                                                                        <div className="col-4">
                                                                            <p className="fw-bold">
                                                                                {
                                                                                    item.title
                                                                                }
                                                                            </p>
                                                                        </div>
                                                                        <div className="col-8 p-0">
                                                                            <p>
                                                                                {
                                                                                    item.text
                                                                                }
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                ),
                                                            )}
                                                    </div>
                                                    <p>
                                                        {figuresArray &&
                                                            figuresArray[
                                                                selectedId
                                                            ]?.intro}
                                                    </p>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="text-end">
                                                        <div
                                                            onClick={() =>
                                                                setSelect(false)
                                                            }
                                                            onKeyDown={() =>
                                                                setSelect(false)
                                                            }
                                                            role="button"
                                                            tabIndex="0"
                                                        >
                                                            <img
                                                                width="27px"
                                                                height="27px"
                                                                src={CloseIcon}
                                                                alt="close"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="main-content">
                                                        <div className="d-flex align-items-end flex-column">
                                                            <div className="d-flex align-items-end justify-content-start">
                                                                <h3 className="random-display mb-0 fw-bold me-4">
                                                                    {
                                                                        figuresArray[
                                                                            selectedId
                                                                        ]
                                                                            ?.lastname
                                                                    }
                                                                    .
                                                                </h3>
                                                                <div className="random-generate">
                                                                    <p className="form-label">
                                                                        Your
                                                                        display
                                                                        name
                                                                    </p>
                                                                    <input
                                                                        className="form-control"
                                                                        type="text"
                                                                        value={
                                                                            randomName
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            setRandomName(
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                    />
                                                                </div>
                                                            </div>
                                                            <p
                                                                className="random-text"
                                                                onClick={() =>
                                                                    setRandomName(
                                                                        names
                                                                            .random()
                                                                            .substring(
                                                                                0,
                                                                                7,
                                                                            ),
                                                                    )
                                                                }
                                                                onKeyDown={() =>
                                                                    setRandomName(
                                                                        names
                                                                            .random()
                                                                            .substring(
                                                                                0,
                                                                                7,
                                                                            ),
                                                                    )
                                                                }
                                                                role="presentation"
                                                            >
                                                                Random generate
                                                            </p>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        {error && (
                                            <span className="errorsapn">
                                                <FaExclamationCircle /> {error}
                                            </span>
                                        )}
                                        {selected ? (
                                            <button
                                                className="btn btn-outline-light rounded-0 text-uppercase w-100 d-flex align-items-center justify-content-center text-uppercase fw-bold fs-24px"
                                                disabled={pending}
                                                onClick={
                                                    handleOnConfirmButtonClick
                                                }
                                            >
                                                <div
                                                    className={`${pending ? "opacity-100" : "opacity-0"}`}
                                                >
                                                    <CustomSpinner />
                                                </div>
                                                <div
                                                    className={`${pending ? "ms-3" : "pe-4"}`}
                                                >
                                                    confirm
                                                </div>
                                            </button>
                                        ) : (
                                            <button
                                                className="btn-primary text-uppercase w-100 mt-3"
                                                onClick={() => setSelect(true)}
                                            >
                                                select
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    <Modal
                        isOpen={modalIsOpen}
                        onRequestClose={closeModal}
                        ariaHideApp={false}
                        className="figure-modal"
                        overlayClassName="figure-modal__overlay"
                    >
                        <div className="figure-intro__box">
                            <div className="mobile-figure-header">
                                {figuresArray && (
                                    <p>
                                        {figuresArray[selectedId]?.firstname}{" "}
                                        {figuresArray[selectedId]?.lastname}
                                    </p>
                                )}

                                <div
                                    onClick={() => closeModal()}
                                    onKeyDown={() => closeModal()}
                                    role="button"
                                    tabIndex="0"
                                    className="ms-auto"
                                >
                                    <img
                                        width="14px"
                                        height="14px"
                                        src={CloseIcon}
                                        alt="close"
                                    />
                                </div>
                            </div>
                            <div className="figure-intro__box--body">
                                {!selected ? (
                                    <>
                                        <div className="stars">
                                            {figuresArray &&
                                                figuresArray[
                                                    selectedId
                                                ]?.stars.map((item, idx) => (
                                                    <div
                                                        className="row align-items-center"
                                                        key={idx}
                                                    >
                                                        <div className="col-6">
                                                            <p className="ability">
                                                                {item.type}
                                                            </p>
                                                        </div>
                                                        <div className="col-6">
                                                            <StarRatings
                                                                numberOfStars={
                                                                    item.rates
                                                                }
                                                                starDimension="17px"
                                                                starSpacing="3px"
                                                                starRatedColor="#ffffff"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                        <div className="my-4">
                                            {figuresArray &&
                                                figuresArray[
                                                    selectedId
                                                ]?.abilities.map(
                                                    (item, idx) => (
                                                        <div
                                                            className="row mb-1"
                                                            key={idx}
                                                        >
                                                            <div className="col-5">
                                                                <p className="fw-bold">
                                                                    {item.title}
                                                                </p>
                                                            </div>
                                                            <div className="col-7 p-0">
                                                                <p>
                                                                    {item.text}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ),
                                                )}
                                        </div>
                                        <p>
                                            {figuresArray &&
                                                figuresArray[selectedId]?.intro}
                                        </p>
                                        <button
                                            className="btn btn-outline-light round-0 w-100 mt-3"
                                            onClick={() => setSelect(true)}
                                        >
                                            Next
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="main-content">
                                            <div className="d-flex align-items-end justify-content-start">
                                                <h3 className="random-display mb-0 fw-bold me-4">
                                                    {
                                                        figuresArray[selectedId]
                                                            ?.lastname
                                                    }
                                                    .
                                                </h3>
                                                <div className="random-generate">
                                                    <p className="form-label">
                                                        Your display name
                                                    </p>
                                                    <input
                                                        className="form-control"
                                                        type="text"
                                                        value={randomName}
                                                        onChange={(e) =>
                                                            setRandomName(
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>
                                            <p
                                                className="random-text w-100"
                                                onClick={() =>
                                                    setRandomName(
                                                        names
                                                            .random()
                                                            .substring(0, 7),
                                                    )
                                                }
                                                onKeyDown={() =>
                                                    setRandomName(
                                                        names
                                                            .random()
                                                            .substring(0, 7),
                                                    )
                                                }
                                                role="presentation"
                                            >
                                                Random generate
                                            </p>
                                        </div>
                                        <div className="mt-2">
                                            {error && (
                                                <span className="errorsapn">
                                                    <FaExclamationCircle />{" "}
                                                    {error}
                                                </span>
                                            )}
                                            <button
                                                className="btn btn-outline-light rounded-0 text-uppercase w-100 d-flex align-items-center justify-content-center text-uppercase fw-bold fs-24px"
                                                disabled={pending}
                                                onClick={
                                                    handleOnConfirmButtonClick
                                                }
                                            >
                                                <div
                                                    className={`${pending ? "opacity-100" : "opacity-0"}`}
                                                >
                                                    <CustomSpinner />
                                                </div>
                                                <div
                                                    className={`${pending ? "ms-3" : "pe-4"}`}
                                                >
                                                    confirm
                                                </div>
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </Modal>
                </main>
            </>
        );
};

export default SelectFigure;
