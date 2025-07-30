import { useNavigate, useRevalidator } from "react-router-dom"
import { SignUp } from "./signUp";
import { Redirect } from "./redirect";
import { useCallback, useEffect } from "react";
import { springBoot } from "@axios";

function Login() {
    const nav = useNavigate();
    const id = localStorage.getItem('user-id')
    const { revalidate } = useRevalidator();

    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        const form = e.target;
        const account = form.account.value;
        const password = form.password.value;
        springBoot.post('users/login', {
            account: account,
            password: password,
        }).then((obj) => {
            localStorage.setItem('user-id',obj.data.id)
            alert(obj.data.name+'님 환영합니다.')
            nav('/')
            revalidate();
        }).catch((error) => {
            console.error(error.response.data);
        })
    })

    useEffect(()=>{
        if(id) { alert('이미 로그인하였습니다.'); nav('/') }
    },[id])

    return (<>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
            <input id='account' />
            <input id="password" />
            <button>로그인</button>
        </form>
        <button onClick={() => { nav('signUp') }}>회원가입</button>
    </>)
}

export { Login, SignUp, Redirect };