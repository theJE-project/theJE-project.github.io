import { useLoaderData, useRouteLoaderData, useNavigate, Link } from 'react-router-dom';
import { useState, useCallback } from 'react';
import { springBoot } from '@axios';
import { Likes } from '../likes/index';
import { timeAgo } from '../../utils/utils';

export function Notifications() {
    const { user, notifications: loaderNotifications } = useRouteLoaderData('default');
    const [notifications, setLocalNotifications] = useState(loaderNotifications);
    const navigate = useNavigate();

    const [filter, setFilter] = useState(0); // 0: 전체
    const filtered = filter === 0
        ? notifications
        : filter === 9
            ? notifications.filter(n => n.is_read === false)  // 읽지않음 필터
            : notifications.filter(n => n.board_types === filter);

    const sortedNotifications = [...filtered].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // 최신순 정렬

    // 각 필터별 알림 개수 계산
    const countByFilter = {
        0: notifications.length, // 전체
        9: notifications.filter(n => !n.is_read).length, // 읽지않음
        4: notifications.filter(n => n.board_types === 4).length,
        3: notifications.filter(n => n.board_types === 3).length,
        2: notifications.filter(n => n.board_types === 2).length,
        1: notifications.filter(n => n.board_types === 1).length,
    };

    const getMessage = (n) => {
        switch (n.board_types) {
            case 4: return '회원님의 플레이리스트를 좋아요하였습니다.';
            case 3: return '댓글을 남겼습니다.';
            case 2: return '팔로우하기 시작했습니다.';
            case 1: return '플레이리스트를 만들었습니다.';
            default: return '';
        }
    };

    const hendleNav = useCallback(async (e, id, boardType, board) => {
        e.preventDefault();
        try {
            const response = await springBoot.put(`/notifications`, {
                id: id,
                is_read: true, // 읽은처리
            });
        } catch (error) {
            console.error('API 호출 오류:', error);
        }

        let path = '/';

        switch (boardType) {
            case 1:
                path = `/group/${board}`;
                break;
            case 2:
                path = `/${board}`;
                break;
            case 3:
                path = `/${board}`;
                break;
            case 4:
                path = `/${board}`;
                break;
            default:
                path = '/';
        }

        navigate(path);
    }, [navigate]);

    const handleMarkAllAsRead = async () => {
        console.log('Notifications user : ' + user)
        console.log('Notifications user id : ' + user.id)
        try {
            await springBoot.put('/notifications/allRead', {
                receiver: user.id,
                is_read: true
            });
            // 새 객체로 복사 → 참조 변경을 위해
            const updated = notifications.map(n => ({ ...n, is_read: true }));
            setLocalNotifications(updated);  // 새로운 상태로 교체
        } catch (err) {
            console.error('모두 읽음 처리 실패:', err);
            alert('알림을 모두 읽음 처리하는 데 실패했습니다.');
        }
    }



    return (
        <div className="max-w-xl mx-auto p-4">
            {/* <h3 className="font-bold text-lg mb-3">알림</h3> */}
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg">알림</h3>
                <button
                    onClick={handleMarkAllAsRead}
                    className="text-sm text-blue-500 hover:text-blue-700"
                >
                    모두 읽음
                </button>
            </div>
            {/* 탭 필터 */}
            <div className="flex gap-2 mb-4 text-sm font-medium">
                {[
                    { type: 0, label: '전체' },
                    { type: 9, label: '읽지 않음' },
                    { type: 4, label: '좋아요' },
                    { type: 3, label: '댓글' },
                    { type: 2, label: '팔로우' },
                    { type: 1, label: '플레이리스트' },
                ].map(tab => {
                    let activeBgColor = '';
                    let inactiveTextColor = '';

                    switch (tab.type) {
                        case 0: // 파랑
                            activeBgColor = 'bg-blue-500';
                            break;
                        case 9: // 주황
                            activeBgColor = 'bg-orange-500';
                            break;
                        case 4: // 빨강
                            activeBgColor = 'bg-red-500';
                            break;
                        case 3: // 녹색
                            activeBgColor = 'bg-green-500';
                            break;
                        case 2: // 보라
                            activeBgColor = 'bg-purple-500';
                            break;
                        case 1: // 노랑
                            activeBgColor = 'bg-yellow-400';
                            break;
                        default:
                            activeBgColor = 'bg-gray-500';
                    }

                    return (
                        <button
                            key={tab.type}
                            onClick={() => setFilter(tab.type)}
                            className={`px-3 py-1 rounded-full border ${filter === tab.type
                                ? `${activeBgColor} text-white`
                                : `${inactiveTextColor} border`
                                }`}
                        >
                            {tab.label}{" "}
                            <span className="ml-1 font-semibold whitespace-nowrap">
                                ({countByFilter[tab.type] || 0})
                            </span>

                        </button>
                    );
                })}
            </div>

            {/* 알림 리스트 */}
            <ul className="space-y-4">
                {sortedNotifications.map(n => (
                    <li
                        key={n.id}
                        className={`shadow-sm rounded-xl p-4 flex items-start gap-4 relative ${!n.is_read ? 'bg-blue-100' : ''
                            }`}
                    >
                        <Link
                            to="#"
                            className="flex items-start gap-4 p-4 w-full h-full block text-inherit no-underline"
                            onClick={e => hendleNav(e, n.id, n.board_types, n.board)}
                        >
                            <img
                                src={n.sender?.img || 'https://placehold.co/40x40'}
                                alt="프로필"
                                className="w-10 h-10 rounded-full"
                            />
                            <div className="flex-1 text-sm text-gray-700">
                                <div className="flex items-center justify-between">
                                    <p>
                                        <span className="font-bold mr-1">{n.name}</span>
                                        {getMessage(n)}
                                    </p>
                                    <span className="text-xs text-gray-400">{timeAgo(n.created_at)}</span>
                                </div>
                                {n.content && <p className="mt-1 text-gray-500">{n.content}</p>}
                            </div>
                            {!n.is_read && (
                                <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                            {/* <button className="absolute bottom-2 right-2 text-gray-400 hover:text-gray-600">
                                <FiMoreHorizontal />
                            </button> */}

                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
