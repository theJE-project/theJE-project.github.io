import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { springBoot } from '@axios';

export function Redirect(){
    const [ searchParams ] = useSearchParams();
    const navigate = useNavigate();
    useEffect(()=>{
        const token = searchParams.get('token');
        if(token !== null){
            let errorMsg = null;
            springBoot.post('/users/verify',{ token: token })
            .catch((error)=>{ errorMsg = error.response.data })
            .finally(()=>{
                if(errorMsg !==null){ alert(`회원가입이 확인되지 않습니다.\n${errorMsg}`) } 
                else { alert('회원가입을 축하합니다. 로그인 해주세요.') }
                navigate('/login');
            })
        }
    },[searchParams])
    return(<></>);
}