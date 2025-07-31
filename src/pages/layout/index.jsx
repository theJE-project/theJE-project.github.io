import { Outlet, useLoaderData, useNavigate } from "react-router-dom";
import { useMusic } from "../../hooks/useMusics";
import { useEffect } from "react";
import { useImage } from "../../hooks";
export { loader } from './loader'

export function Layout ( ) {
    const nav = useNavigate();
    const { user } = useLoaderData();
    return(<>
        { 
            Object.keys(user).length === 0 
            ? <button onClick={(e)=>{nav('/login')}}>로그인</button>
            : <button onClick={(e)=>{ 
                localStorage.removeItem('user-id');
                sessionStorage.clear();
                window.location.reload();
                alert('로그아웃 되었습니다.');
            }}>로그아웃</button>
        }
        <Outlet />
    </>)
}