import { SignUp } from "./signUp";
import { Redirect } from "./redirect";
import { useRef, useState } from 'react';
import { Link, useNavigate, useRevalidator } from 'react-router-dom';
import { springBoot } from "@axios";

export default function Login() {
    const accountRef = useRef();
    const passwordRef = useRef();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { revalidate } = useRevalidator();

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        const account = accountRef.current;
        const password = passwordRef.current;
        springBoot.post('users/login', {
            account: account.value,
            password: password.value,
        }).then((obj) => {
            localStorage.setItem('user-id', obj.data.id)
            alert(obj.data.name + '님 환영합니다.')
            navigate('/');
            setTimeout(() => { revalidate() }, 100);
        }).catch((error) => {
            alert(!error.response?.data
                ? error.message
                : error.response.data
            );
        })
        setIsLoading(false);
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
                                아이디
                            </label>
                            <input
                                ref={accountRef}
                                required
                                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="아이디를 입력하세요"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                비밀번호
                            </label>
                            <div className="relative">
                                <input
                                    ref={passwordRef}
                                    type={showPassword ? 'text' : 'password'}
                                    required
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
                            {/* <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600">로그인 상태 유지</span>
              </label> */}
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
                    <div className="mt-8 text-center">
                        <p className="text-gray-600">
                            계정이 없으신가요?{' '}
                            <Link 
                                className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                                onClick={(e)=>{ e.preventDefault(); navigate('signUp'); }}
                            >
                                회원가입
                            </Link>
                        </p>
                    </div>
                </div>
                {/* <div className="text-center text-sm text-gray-500 space-x-4">
          <Link href="/privacy" className="hover:text-gray-700 cursor-pointer">개인정보처리방침</Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-gray-700 cursor-pointer">이용약관</Link>
          <span>•</span>
          <Link href="/help" className="hover:text-gray-700 cursor-pointer">고객센터</Link>
        </div> */}
            </div>
        </div>
    );
}


export { Login, SignUp, Redirect };