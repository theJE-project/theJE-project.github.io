// import { useNavigate, useRevalidator } from "react-router-dom"
import { SignUp } from "./signUp";
import { Redirect } from "./redirect";
// import { useCallback, useEffect } from "react";
// import { springBoot } from "@axios";

// function Login() {
//     const nav = useNavigate();
//     const id = localStorage.getItem('user-id')
//     const { revalidate } = useRevalidator();

//     const handleSubmit = useCallback((e) => {
//         e.preventDefault();
//         const form = e.target;
//         const account = form.account.value;
//         const password = form.password.value;
//         springBoot.post('users/login', {
//             account: account,
//             password: password,
//         }).then((obj) => {
//             localStorage.setItem('user-id', obj.data.id)
//             alert(obj.data.name + '님 환영합니다.')
//             nav('/');
//             setTimeout(() => {
//                 revalidate();
//             }, 100);
//         }).catch((error) => {
//             console.error(!error.response?.data
//                 ? error.message
//                 : error.response.data
//             );
//         })
//     })

//     useEffect(() => {
//         if (id) { alert('이미 로그인하였습니다.'); nav('/') }
//     }, [id])

//     return (<>
//         <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
//             <input id='account' />
//             <input id="password" />
//             <button>로그인</button>
//         </form>
//         <button onClick={() => { nav('signUp') }}>회원가입</button>
//     </>)
// }
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      console.log('로그인 데이터:', formData);
      setIsLoading(false);
      window.location.href = '/';
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="text-4xl font-pacifico text-blue-600">
            MusicShare
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">계정에 로그인</h2>
          <p className="mt-2 text-gray-600">음악을 공유하고 소통해보세요</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="이메일을 입력하세요"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="비밀번호를 입력하세요"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                  </div>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600">로그인 상태 유지</span>
              </label>
              <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer">
                비밀번호를 잊으셨나요?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>로그인 중...</span>
                </div>
              ) : (
                '로그인'
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">또는</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 cursor-pointer">
                <div className="w-5 h-5 flex items-center justify-center mr-3">
                  <i className="ri-google-fill text-red-500"></i>
                </div>
                Google로 계속하기
              </button>

              <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 cursor-pointer">
                <div className="w-5 h-5 flex items-center justify-center mr-3">
                  <i className="ri-kakao-talk-fill text-yellow-500"></i>
                </div>
                카카오로 계속하기
              </button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              계정이 없으신가요?{' '}
              <Link href="/auth/signup" className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer">
                회원가입
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500 space-x-4">
          <Link href="/privacy" className="hover:text-gray-700 cursor-pointer">개인정보처리방침</Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-gray-700 cursor-pointer">이용약관</Link>
          <span>•</span>
          <Link href="/help" className="hover:text-gray-700 cursor-pointer">고객센터</Link>
        </div>
      </div>
    </div>
  );
}


export { Login, SignUp, Redirect };