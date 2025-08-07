import { useEffect, useState } from "react"
import { springBoot } from "@axios";

/** readys의 초기화 */
const readysInit = {
    stuck: false,
    error: null,
}

const dataInit = []

/** deezer에서 음악을 가져오는 훅 */
/** 가져오는건 최대 50개 */
export const useMusic = () => {
    const [ready, setReady] = useState(readysInit);
    const [searchMusics, setSearchMusic] = useState(dataInit);

    const searchMusic = async (search) => {
        let errorMsg = null;
        setReady(readysInit);
        try {
            const res = await springBoot.get(`tracks/search`, { params: { q: search } });
            const musicsWithUrl = res.data.map(music => ({
                ...music,
                url: String(music.id),
                id: null,
            }));

            setSearchMusic(musicsWithUrl);
        } catch (error) {
            console.error(error);
            setSearchMusic(dataInit);
            errorMsg = error;
        } finally {
            setReady({ stuck: true, error: errorMsg });
        }
    };

    return {
        musics: searchMusics,
        ready: ready.stuck,
        error: ready.error,
        getMusics: searchMusic,
    }
}