import { useCallback, useEffect, useRef, useState } from "react"
import { springBoot } from "../../../axios";
export function SignUp() {
    const formRef = useRef();
    const [password, setPassword] = useState('')

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        const form = e.target;
        const name = form.name.value;
        const account = form.account.value;
        const password = form.password.value;
        const email = form.email.value;
        springBoot.post('users', {
            account: account,
            password: password,
            name: name,
            email: email
        }).then((obj)=>{
            alert('회원 가입 완료!\n이메일 인증을 해주세요.\n이메일 인증 후 로그인 가능합니다.')
        }).catch((error)=>{
            alert(error.response.data);
        })
    })

    useEffect(() => { // 비밀번호 중복 확인
        if (!formRef.current) return;
        const form = formRef.current;
        const passwordInput = form.password;
        const checkPasswordInput = form.checkPassword;
        const validatePasswordMatch = () => {
            const password = passwordInput.value;
            const checkPassword = checkPasswordInput.value;
            setPassword(checkPassword !== "" && password !== checkPassword);
        };
        checkPasswordInput.addEventListener("input", validatePasswordMatch);
        passwordInput.addEventListener("input", validatePasswordMatch);
        return () => {
            checkPasswordInput.removeEventListener("input", validatePasswordMatch);
            passwordInput.removeEventListener("input", validatePasswordMatch);
        };
    }, [formRef]);

    return (<>
        <form ref={formRef} onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
            <span>이름</span>
            <input id='name' />
            <span>아이디</span>
            <input id='account' />
            <span>비밀번호</span>
            <input id='password' />
            <span>비밀번호 확인</span>
            {password && (
                <span style={{ color: "red", fontSize: "0.9rem" }}>
                    비밀번호가 일치하지 않습니다.
                </span>
            )}
            <input id='checkPassword' />
            <span>이메일</span>
            <input id='email' />
            <button type="submit">회원가입</button>
        </form>
    </>)
}