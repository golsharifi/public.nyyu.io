import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AvatarComponent from "./Avatar_Component";
import Loading from "./../../shared/Loading";
import PaginationBar from "./../../PaginationBar";
import { fetch_Avatars } from "./../../../../store/actions/avatarAction";

const AvatarTabPanel = () => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const { data } = useSelector((state) => state);
    const [pageInfo, setPageInfo] = useState({ page: 1, limit: 5 });
    const { page, limit } = pageInfo;
    const [pageData, setPageData] = useState([]);

    useEffect(() => {
        (async function () {
            setLoading(true);
            await dispatch(fetch_Avatars());
            setLoading(false);
        })();
    }, [dispatch]);

    useEffect(() => {
        setPageData(
            Object.values(data).slice((page - 1) * limit, page * limit),
        );
    }, [dispatch, data, page, limit]);

    return (
        <div>
            {loading ? (
                <Loading />
            ) : (
                <>
                    {pageData.map((avatar) => {
                        return (
                            <AvatarComponent key={avatar.id} avatar={avatar} />
                        );
                    })}
                    <PaginationBar
                        setPage={setPageInfo}
                        page={page}
                        limit={limit}
                        total={Object.values(data).length}
                    />
                </>
            )}
        </div>
    );
};

export default AvatarTabPanel;
