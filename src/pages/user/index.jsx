import React, { useEffect, useState } from 'react';
import { useLoaderData, useNavigate, useParams, Link } from 'react-router-dom';
import { springBoot } from '../../axios/springboot';
import { useImage } from '../../hooks/useImage';

export { loader } from './loader';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';
dayjs.extend(relativeTime);
dayjs.locale('ko');

export function User() {
    const navigate = useNavigate();
    const { id: targetId } = useParams(); 
    const myId = localStorage.getItem('user-id');

    const { profile, follower, followee, isFollowing: initFollowing } = useLoaderData();
    const { getImages } = useImage();

    const [activeTab, setActiveTab] = useState('posts'); // posts | playlists
    const [posts, setPosts] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(initFollowing);
    const [showFollowModal, setShowFollowModal] = useState(false);
    const [followType, setFollowType] = useState('followers');

    const fromNow = (v) => {
        if (!v) return '';
        const d = dayjs(v);
        return d.isValid() ? d.fromNow() : '';
    };

    // 탭 데이터 가져오기
    useEffect(() => {
        if (!targetId) return;
        setLoading(true);

        const load = async () => {
            try {
                if (activeTab === 'posts') {
                    const res = await springBoot.get('communities/user', {
                        params: { user: targetId, category: 1, page: 0, size: 10 },
                    });
                    setPosts(res.data || []);
                } else {
                    const res = await springBoot.get('communities/user', {
                        params: { user: targetId, category: 2, page: 0, size: 12 },
                    });
                    setPlaylists(res.data || []);
                }
            } catch (e) {
                activeTab === 'posts' ? setPosts([]) : setPlaylists([]);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [targetId, activeTab]);

    const followersCount = follower?.length || 0;
    const followingCount = followee?.length || 0;

    // 팔로우/언팔로우
    const handleToggleFollow = async () => {
        if (!myId) {
            if (confirm('로그인이 필요합니다. 로그인 페이지로 이동할까요?')) {
                navigate('/login');
            }
            return;
        }
        try {
            if (isFollowing) {
                await springBoot.delete('followers/delete', { params: { follower: myId, followee: targetId } });
                setIsFollowing(false);
            } else {
                await springBoot.post('followers', { follower: myId, followee: targetId });
                setIsFollowing(true);
            }
        } catch (e) {
            alert('처리 중 오류가 발생했습니다.');
        }
    };

    const openFollowModal = (type) => {
        setFollowType(type);
        setShowFollowModal(true);
    };

    const renderCard = (item) => {
        const raw = item.images?.[0]?.url || '';
        const imageUrl = raw ? getImages({ url: raw }) : null;
        const musics = Array.isArray(item?.musics) ? item.musics : (item?.music ? [item.music] : []);

        // 플레이리스트 그리드 카드
        if (activeTab === 'playlists') {
            return (
                <Link key={item.id} to={`/group/${item.id}`} className="w-60 block hover:opacity-90 transition cursor-pointer">
                    {imageUrl && (
                        <img src={imageUrl} alt={item.title || '플레이리스트'} className="w-60 h-60 object-cover rounded-lg border" />
                    )}
                    <div className="mt-2 font-semibold text-sm truncate">{item.title || '제목 없음'}</div>
                </Link>
            );
        }

        // 일반 게시물 카드
        return (
            <div key={item.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                {/* 작성자 정보 (클릭 시 다시 이 유저로 이동) */}
                <div className="flex items-center mb-2">
                    <Link to={`/user/${profile.id}`} className="relative w-12 h-12 mr-3">
                        {profile.img ? (
                            <img src={getImages({ url: profile.img })} alt={profile.name} className="w-12 h-12 rounded-full object-cover border-2 border-blue-100" />
                        ) : (
                            <div className="w-12 h-12 rounded-full border-2 border-blue-100 bg-blue-500 flex items-center justify-center text-white text-xl font-bold">
                                {profile.name ? profile.name[0] : '?'}
                            </div>
                        )}
                    </Link>
                    <div className="min-w-0">
                        <span className="font-semibold text-lg text-gray-900">{profile.name}</span>
                        <span className="text-gray-500">@{profile.account}</span>
                    </div>
                    <span className="ml-4 text-gray-400 text-sm">{fromNow(item.createdAt || item.created_at)}</span>
                </div>

                <div className="mb-3 text-gray-700">{item.content || item.artist || ''}</div>

                {imageUrl && (
                    <div className="mt-2">
                        <img src={imageUrl} alt="게시글 이미지" className="w-full h-auto " />
                    </div>
                )}

                {musics.length > 0 && musics.map((m, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200 mt-2">
                        <img src={m?.albumCover || '/no-album.png'} alt={m?.titleShort || '음원'} className="w-16 h-16 rounded-lg object-cover" />
                        <div className="min-w-0">
                            <div className="font-semibold truncate">{m?.titleShort || '제목 없음'}</div>
                            <div className="text-xs text-gray-600 truncate">{m?.artistName || '아티스트'}</div>
                        </div>
                    </div>
                ))}

                <div className="flex space-x-6 text-gray-500 mt-2">
                    <span className="flex items-center">💬&nbsp;{item.commentsCount || 0}</span>
                    <span className="flex items-center">❤️&nbsp;{item.likesCount || 0}</span>
                </div>
            </div>
        );
    };

    if (!profile) return <div className="py-10 text-center text-gray-600">유저를 찾을 수 없습니다.</div>;

    const joinDate = profile.created_at?.slice(0, 10) || profile.createdAt?.slice(0, 10) || '';

    return (
        <div className="max-w-3xl mx-auto py-10">
            {/* ===== 프로필 카드 ===== */}
            <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6 flex items-center relative">
                <div className="relative w-28 h-28 mr-8 flex-shrink-0">
                    {profile.img ? (
                        <img src={getImages({ url: profile.img })} alt={profile.name} className="w-28 h-28 rounded-full object-cover border-4 border-blue-100" />
                    ) : (
                        <div className="w-28 h-28 rounded-full border-4 border-blue-100 bg-blue-500 flex items-center justify-center text-white text-3xl font-bold">
                            {profile.name ? profile.name[0] : '?'}
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center mb-2">
                        <span className="text-3xl font-bold text-gray-900">{profile.name}</span>
                        <span className="ml-3 text-gray-500 text-xl">@{profile.account}</span>

                        {/* 팔로우 버튼 (내 계정과 다를 때만 표시) */}
                        {myId && myId !== profile.id && (
                            <button
                                onClick={handleToggleFollow}
                                className={`ml-6 px-5 py-2 rounded-full font-semibold transition ${isFollowing ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                            >
                                {isFollowing ? '팔로잉' : '팔로우'}
                            </button>
                        )}
                    </div>

                    <div className="text-gray-600 mb-4">
                        {profile.content || '자기소개가 없습니다.'}
                    </div>

                    <div className="flex items-center space-x-8 text-lg text-gray-600">
                        <span><strong className="text-gray-900">{posts.length}</strong> 게시물</span>
                        <button type="button" onClick={() => openFollowModal('followers')} className="hover:text-blue-600">
                            <strong className="text-gray-900">{followersCount}</strong> 팔로워
                        </button>
                        <button type="button" onClick={() => openFollowModal('followee')} className="hover:text-blue-600">
                            <strong className="text-gray-900">{followingCount}</strong> 팔로잉
                        </button>
                        <span>{joinDate && <>{joinDate} 가입</>}</span>
                    </div>
                </div>
            </div>

            {/* ===== 팔로워/팔로잉 모달 ===== */}
            {showFollowModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="bg-white rounded-xl p-8 w-full max-w-md mx-2 relative">
                        <h2 className="text-xl font-bold mb-6 text-center">
                            {followType === 'followers' ? '팔로워' : '팔로잉'}
                        </h2>
                        <div className="max-h-96 overflow-y-auto">
                            {followType === 'followers' &&
                                (followersCount === 0
                                    ? <div className="text-gray-500 py-6 text-center">팔로워가 없습니다</div>
                                    : follower.map(user => (
                                        <div key={user.id} className="flex items-center py-3 border-b last:border-0">
                                            {user.img ? (
                                                <img src={getImages({ url: user.img })} alt={user.name} className="w-10 h-10 rounded-full object-cover border mr-3" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-3">
                                                    {user.name ? user.name[0] : '?'}
                                                </div>
                                            )}
                                            <Link to={`/user/${user.id}`} className="font-semibold text-gray-900 hover:underline">{user.name}</Link>
                                            <span className="ml-2 text-gray-500">@{user.account}</span>
                                        </div>
                                    ))
                                )}
                            {followType === 'followee' &&
                                (followingCount === 0
                                    ? <div className="text-gray-500 py-6 text-center">팔로잉이 없습니다</div>
                                    : followee.map(user => (
                                        <div key={user.id} className="flex items-center py-3 border-b last:border-0">
                                            {user.img ? (
                                                <img src={getImages({ url: user.img })} alt={user.name} className="w-10 h-10 rounded-full object-cover border mr-3" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-3">
                                                    {user.name ? user.name[0] : '?'}
                                                </div>
                                            )}
                                            <Link to={`/user/${user.id}`} className="font-semibold text-gray-900 hover:underline">{user.name}</Link>
                                            <span className="ml-2 text-gray-500">@{user.account}</span>
                                        </div>
                                    ))
                                )}
                        </div>
                        <div className="flex justify-end pt-4">
                            <button onClick={() => setShowFollowModal(false)} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">닫기</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== 탭 ===== */}
            <div className="bg-white rounded-lg border border-gray-200 mb-6">
                <div className="flex border-b border-gray-200">
                    <button onClick={() => setActiveTab('posts')} className={`flex-1 py-4 text-center font-medium cursor-pointer ${activeTab === 'posts' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>게시물</button>
                    <button onClick={() => setActiveTab('playlists')} className={`flex-1 py-4 text-center font-medium cursor-pointer ${activeTab === 'playlists' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>플레이리스트</button>
                </div>

                <div className={`p-6 ${activeTab === 'playlists' ? 'grid grid-cols-3 gap-4' : ''}`}>
                    {loading && <div className="py-8 text-center text-gray-500">로딩 중...</div>}
                    {!loading && activeTab === 'posts' && (posts.length === 0 ? <div className="py-8 text-center text-gray-500">작성한 글이 없습니다.</div> : <div className="space-y-6">{posts.map(renderCard)}</div>)}
                    {!loading && activeTab === 'playlists' && (playlists.length === 0 ? <div className="py-8 text-center text-gray-500">플레이리스트가 없습니다.</div> : playlists.map(renderCard))}
                </div>
            </div>
        </div>
    );
}
