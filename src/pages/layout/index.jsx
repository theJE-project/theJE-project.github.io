import { Outlet, useLoaderData } from "react-router-dom";
import { useMusic } from "../../hooks/useMusics";
import { useEffect } from "react";
export { loader } from './loader'

export function Layout ( ) {
    const { musics, getMusics } = useMusic();

    useEffect(()=>{
        getMusics('하루하루')
    },[])

    console.log(musics)
    return(<>
        hello layout components
        <Outlet />
    </>)
}