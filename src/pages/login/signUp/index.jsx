import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // React Router 사용 시
import { springBoot } from '../../../axios';

export function SignUp() {
    const [formData, setFormData] = useState({
        name: '',
        account: '',
        email: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [passwordMismatch, setPasswordMismatch] = useState('');
    const  navigate = useNavigate();

    const handleInputChange = (e) => {
        const { id, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [id]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        const { confirmPassword, acceptTerms, ...dataToSend } = formData;
        springBoot.post('users', { ...dataToSend})
        .then((obj)=>{
            alert('회원 가입 완료!\n이메일 인증을 해주세요.\n이메일 인증 후 로그인 가능합니다.')
            navigate('/');
        })
        .catch((error)=>{
            alert(!error.response?.data
                ? error.message
                : error.response.data
            );
        })
        .finally(()=>{
            setIsLoading(false)
        })
    };

    useEffect(() => {
        const password = formData.password;
        const confirmPassword = formData.confirmPassword;
        setPasswordMismatch(
            confirmPassword !== '' && password !== confirmPassword
        );
    }, [formData.password, formData.confirmPassword]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900">회원가입</h1>
                    <p className="mt-2 text-gray-600">MusicShare의 함께 음악을 공유하세요</p>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                이름
                            </label>
                            <input
                                id="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="이름을 입력하세요"
                            />
                        </div>

                        <div>
                            <label htmlFor="account" className="block text-sm font-medium text-gray-700 mb-2">
                                아이디
                            </label>
                            <input
                                id="account"
                                type="text"
                                required
                                value={formData.account}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="아이디를 입력하세요"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                이메일
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="비밀번호를 입력하세요"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                >
                                    <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                                </button>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                비밀번호 확인
                            </label>
                            <div className="relative">
                                <input
                                    id='confirmPassword'
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="비밀번호를 다시 입력하세요"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                >
                                    <i className={showConfirmPassword ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                                </button>
                            </div>
                            {passwordMismatch && (
                                <span style={{ color: "red", fontSize: "0.9rem" }}>
                                    비밀번호가 일치하지 않습니다.
                                </span>
                            )}
                        </div>

                        <div className="flex items-start">
                            <input
                                type="checkbox"
                                id="acceptTerms"
                                checked={formData.acceptTerms}
                                onChange={handleInputChange}
                                required
                                className="w-5 h-5 text-blue-600 border-gray-300 rounded mt-1"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                                이용약관과 개인정보 처리방침에 동의합니다.
                            </span>
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>가입 중...</span>
                                </div>
                            ) : (
                                '회원가입'
                            )}
                        </button>
                    </form>
                    {/* 
                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-gray-500">또는</span>
                            </div>
                        </div>

                        <div className="mt-6 flex space-x-3">
                            <button className="flex-1 flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50">
                                <i className="ri-google-fill text-red-500 mr-2"></i> Google
                            </button>
                            <button className="flex-1 flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50">
                                <i className="ri-kakao-talk-fill text-yellow-500 mr-2"></i> 카카오
                            </button>
                        </div>
                    </div> */}

                    <div className="mt-8 text-center">
                        <p className="text-gray-600">
                            이미 계정이 있으신가요?{' '}
                            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                                로그인
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
