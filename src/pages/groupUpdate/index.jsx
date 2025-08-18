import { useLocation } from "react-router-dom";
import PlaylistFrom from "../groupCreate/playlistForm";

export { loader } from './loader'

export function GroupUpdate() {
    // groupDetail에서 데이터 받기
    const location = useLocation();
    const playlistData = location.state?.playlistData; 

    return(
        <PlaylistFrom playlistData={playlistData}/>
    )
}