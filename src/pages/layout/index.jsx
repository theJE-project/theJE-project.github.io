export { loader } from './loader'
import React, { useCallback, useRef, useState } from 'react';
import { Link, Outlet, useLoaderData, useNavigate, useSearchParams } from 'react-router-dom';
import { springBoot } from '@axios';

export function Layout() {
    const loader = useLoaderData();
    const navigate = useNavigate();
    const searchRef = useRef();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [setShowAllNotifications] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const findUser = Object.keys(loader.user).length === 0;
    const [search, setSearch] = useState(false);
    const notifications = loader.notifications.filter(notification => !notification.isRead);

    //  추가: 프로필 이미지 서버 URL을 자동으로 붙여주는 함수
    const getImgUrl = (img) => {
        if (!img) return '';
        return img.startsWith('http') ? img : `http://localhost:8888${img}`;
    };

    const handleSerachBlur = (e) => {
        const value = e.target.value;
        if (value) { searchParams.set('q', value); } else { searchParams.delete('q'); }
        e.target.value = ''
        setSearchParams(searchParams);
    };

    const hendleNav = useCallback((e, o) => {
        e.preventDefault();
        searchRef.current.value = ''
        navigate(o);
    }, [])

    const handleNotification = useCallback(async (e, o) => {
        e.preventDefault();
        const response = await springBoot.put(`/notifications`, {
            id: o.id,
            isRead: false, // 임시 false 
        }).then((obj) => {
            setShowNotifications(false);
            console.log(o)
        });
    }, [])

    return (<>
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-8">
                            <Link
                                className="text-2xl font-pacifico text-blue-600"
                                onClick={(e) => hendleNav(e, '/')}
                            >
                                MusicShare
                            </Link>
                            <nav className={`flex space-x-6 transition-all duration-300 ease overflow-hidden ${search ? 'max-w-0' : 'max-w-1000'}`}>
                                {loader.categories.map((o, i) =>
                                    <Link
                                        key={i}
                                        className="text-gray-700 hover:text-blue-600 cursor-pointer whitespace-nowrap overflow-hidden overflow-ellipsis"
                                        onClick={(e) => hendleNav(e, o.url)}
                                    >
                                        {o.name}
                                    </Link>
                                )}
                            </nav>
                        </div>
                        <div className="flex items-center space-x-4 w-full justify-end">
                            <div className="ml-4 relative w-full flex justify-end">
                                <input
                                    ref={searchRef}
                                    type="text"
                                    placeholder="검색"
                                    className={`w-${search ? 'full' : '24'} px-4 py-2 pr-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all duration-300 ease`}
                                    onBlur={(e) => {
                                        setSearch(false)
                                        handleSerachBlur(e)
                                    }}
                                    onFocus={() => {
                                        setSearch(true)
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.target.blur();
                                        }
                                    }}
                                />
                                <i className="ri-search-line absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 flex items-center justify-center"></i>
                            </div>
                            {/* 알림 아이콘 */}
                            {!findUser ? (
                                <div className="relative">
                                    <button
                                        onClick={() => {
                                            if (notifications.length != 0) {
                                                setShowNotifications(!showNotifications)
                                            }
                                        }}
                                        className="p-2 text-gray-600 hover:text-blue-600 cursor-pointer relative"
                                    >
                                        <i className="ri-notification-line text-xl"></i>
                                        {notifications.length !== 0 &&
                                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                                {notifications.length}
                                            </span>
                                        }
                                    </button>
                                    {showNotifications && (
                                        <div className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                            <div className="p-4 border-b border-gray-200">
                                                <h3 className="font-semibold text-gray-900">알림</h3>
                                            </div>
                                            <div className="max-h-96 overflow-y-auto">
                                                {notifications.map((notification) => (
                                                    <div
                                                        key={notification.id}
                                                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer`}
                                                        onClick={(e) => handleNotification(e, notification)}
                                                    >
                                                        <div className="flex items-start space-x-3">
                                                            <div className={`w-2 h-2 rounded-full mt-2 ${!notification.isRead ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                                                            <div className="flex-1">
                                                                <p className="text-sm text-gray-900">{notification.content}</p>
                                                                <p className="text-xs text-gray-500 mt-1">{notification.createdAt}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="p-3 border-t border-gray-200">
                                                <button
                                                    onClick={() => {
                                                        setShowAllNotifications(true);
                                                        setShowNotifications(false);
                                                    }}
                                                    className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer"
                                                >
                                                    모든 알림 보기
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : <Link
                                className="text-gray-700 hover:text-blue-600 cursor-pointer whitespace-nowrap"
                                onClick={(e) => { hendleNav(e, '/login') }}
                            >
                                로그인
                            </Link>}
                            {/* 프로필 드롭다운 */}
                            {!findUser && (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                                        className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer"
                                    >
                                        {/*  변경: 서버 주소 붙여주는 함수 사용! */}
                                        {loader?.user?.img && loader.user.img.trim() !== ""
                                            ? (
                                                <img
                                                    src={getImgUrl(loader.user.img)} 
                                                    alt={loader.user.name || "프로필"}
                                                    className="w-8 h-8 rounded-full object-cover"
                                                />
                                            )
                                            : (
                                                (loader?.user?.name && loader.user.name.length > 0)
                                                    ? loader.user.name.charAt(0)
                                                    : "?"
                                            )
                                        }
                                    </button>
                                    {showProfileDropdown && (
                                        <div className="absolute right-0 top-12 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                            {/* 상단 사용자 정보 */}
                                            <div className="p-4 border-b border-gray-100 flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                                    {/*  변경: 서버 주소 붙여주는 함수 사용! */}
                                                    {loader?.user?.img && loader.user.img.trim() !== ""
                                                        ? (
                                                            <img
                                                                src={getImgUrl(loader.user.img)} 
                                                                alt={loader.user.name || "프로필"}
                                                                className="w-10 h-10 rounded-full object-cover"
                                                            />
                                                        )
                                                        : (
                                                            (loader?.user?.name && loader.user.name.length > 0)
                                                                ? loader.user.name.charAt(0)
                                                                : "?"
                                                        )
                                                    }
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-900">{loader.user.name}</p>
                                                    <p className="text-sm text-gray-500">{`@${loader.user.account}`}</p>
                                                </div>
                                            </div>
                                            <div className="py-2 space-y-1">
                                                <Link
                                                    className="flex items-center px-4 py-2 hover:bg-gray-50 text-gray-700"
                                                    onClick={(e) => hendleNav(e, '/my')}
                                                >
                                                    <i className="ri-user-line mr-3 text-lg"></i>
                                                    프로필
                                                </Link>
                                            </div>
                                            <div className="border-t border-gray-100 py-2">
                                                <button
                                                    className="w-full flex items-center px-4 py-2 hover:bg-gray-50 text-gray-700"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        localStorage.removeItem('user-id');
                                                        sessionStorage.clear();
                                                        window.location.reload();
                                                        alert('로그아웃 되었습니다.')
                                                    }}
                                                >
                                                    <i className="ri-logout-circle-line mr-3 text-lg"></i>
                                                    로그아웃
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>
            <Outlet />
        </div>
    </>);
}
