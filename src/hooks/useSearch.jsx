import { useEffect, useState } from "react"
import { useRouteLoaderData } from 'react-router-dom';
import { springBoot } from "@axios";

/** readys의 초기화 */
const readysInit = {
    stuck: false,
    error: null,
}

/** 스프링부트 백엔드에서 검색데이터 가져오는 훅 */
export const useSearch = () => {
    const { user } = useRouteLoaderData('default');
    const [ready, setReady] = useState(readysInit);
    const [searchDatas, setSearchDatas] = useState({
        users: [],
        communities: [],
        hashTag: [],
    });

    const getSearchDatas = async (searchStr) => {
        let errorMsg = null;
        try {
            const response = await springBoot.post('/search', { 
                searchStr,
                follower: user.id
            });
            const users = response.data.users || [];
            const communities = response.data.communities || [];
            const hashTag = response.data.hashTag || [];

            const result = { users, communities, hashTag };
            setSearchDatas(result);
            return result;
        } catch (error) {
            console.error('getSearchDatas 실패', error);
            errorMsg = error;
            const emptyResult = { users: [], communities: [], hashTag: [] };
            setSearchDatas(emptyResult);
            return emptyResult;
        } finally {
            setReady({ stuck: true, error: errorMsg });
        }
    };

    return {
        searchDatas,
        ready: ready.stuck,
        error: ready.error,
        getSearchDatas,
    };
};