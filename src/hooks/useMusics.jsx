import { useEffect, useState } from "react"
import { youtube } from "@axios";



export const useMusic = () => {
    const [ready, setReady] = useState(false);
    const [videos, setVideos] = useState([]);

    const searchMusic = async ({ search }) => {
        try {
            const response = await youtube.get('search', {
                params: { q:search },
            });
            setVideos(response.data.items);
        } catch (err) {
            
        }
    };

    return {
        videos,
        searchMusic,
    }
}