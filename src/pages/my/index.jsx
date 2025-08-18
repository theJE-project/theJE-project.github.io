import React, { useState, useEffect } from 'react';
import { springBoot } from '../../axios/springboot';
import { useLoaderData, useNavigate, Link } from 'react-router-dom';
import { useImage } from '../../hooks/useImage';
import { FiPlay } from "react-icons/fi";
export { loader } from './loader';

// [추가] 상대시간 표시용 dayjs 설정
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';
dayjs.extend(relativeTime);
dayjs.locale('ko');

export function My() {
    const userId = localStorage.getItem('user-id');
    const navigate = useNavigate();
    const { followee, follower } = useLoaderData();

    const { setImages, getImages } = useImage();

    const [activeTab, setActiveTab] = useState('posts');
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [liked, setLiked] = useState([]);
    const [loading, setLoading] = useState(true);
    const [previewUrl, setPreviewUrl] = useState(null);

    // 프로필 편집
    const [showEdit, setShowEdit] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', content: '', img: '' });

    // 팔로워/팔로잉 모달
    const [showFollowModal, setShowFollowModal] = useState(false);
    const [followType, setFollowType] = useState('followers');

    // [추가] 날짜 -> "몇 분 전/며칠 전" 변환
    const fromNow = (value) => {
        if (!value) return '';
        const d = dayjs(value);
        return d.isValid() ? d.fromNow() : '';
    };

    useEffect(() => {
        if (!userId) {
            window.alert('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
            navigate('/login', { replace: true });
            return;
        }
        setLoading(true);

        // 프로필 정보
        springBoot.get('users/my', { params: { userId } })
            .then(res => {
                setProfile(res.data);
                setEditForm({
                    name: res.data.name || '',
                    content: res.data.content || '',
                    img: res.data.img || '',
                });
            })
            .catch(() => setProfile(null));

        // 탭별 데이터
        if (activeTab === "posts") {
            springBoot.get('communities/user', {
                params: { user: userId, category: 1, page: 0, size: 10 }
            }).then(res => setPosts(res.data || [])).catch(() => setPosts([]));
        }

        if (activeTab === "playlists") {
            springBoot.get('communities/user', {
                params: { user: userId, category: 2, page: 0, size: 10 }
            }).then(res => setPlaylists(res.data || [])).catch(() => setPlaylists([]));
        }

        if (activeTab === "liked") {
            springBoot.get('likes/my', { params: { userId } })
                .then(res => setLiked(res.data || []))
                .catch(() => setLiked([]));
        }

        setLoading(false);
    }, [userId, navigate, activeTab, showEdit]);

    if (!userId) return <div className="py-10 text-center text-gray-600">로그인이 필요합니다.</div>;
    if (loading || !profile) return <div className="py-10 text-center text-gray-600">로딩 중...</div>;

    const postsCount = posts.length || 0;
    const followersCount = (follower && follower.length) || 0;
    const followingCount = (followee && followee.length) || 0;
    const joinDate = profile.joinDate || profile.created_at?.slice(0, 10) || profile.createdAt?.slice(0, 10) || '';

    const handleFileChange = async (e) => {
        const uploaded = await setImages(e);
        if (uploaded && uploaded[0]) {
            setEditForm((prev) => ({ ...prev, img: uploaded[0].url }));
        }
    };

    const handleEditSave = async () => {
        try {
            await springBoot.put('users', {
                id: userId,
                name: editForm.name,
                content: editForm.content,
                img: editForm.img,
            });
            sessionStorage.removeItem('user');
            window.location.reload();
            localStorage.setItem('user-name', editForm.name);
            localStorage.setItem('user-img', editForm.img);
            setShowEdit(false);
        } catch {
            alert('프로필 수정 실패!');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditForm((prev) => ({ ...prev, [name]: value }));
    };

    const openFollowModal = (type) => {
        setFollowType(type);
        setShowFollowModal(true);
    };

    const renderCard = (item) => {
        const raw = item.images?.[0]?.url || "";
        const imageUrl = raw ? getImages({ url: raw }) : null;
        const musics = Array.isArray(item?.musics) ? item.musics : (item?.music ? [item.music] : []);

        // 플레이리스트 카드 (그대로)
        if (activeTab === "playlists") {
            return (
                <Link
                    key={item.id}
                    to={`/group/${item.id}`}
                    className="w-60 block hover:opacity-90 transition cursor-pointer"
                >
                    {imageUrl && (
                        <img
                            src={imageUrl}
                            alt={item.title || "플레이리스트"}
                            className="w-60 h-60 object-cover"
                        />
                    )}
                    <div className="mt-2 font-semibold text-sm truncate">
                        {item.title || '제목 없음'}
                    </div>
                </Link>
            );
        }

        return (
            <div
                key={item.id}
                className="bg-white hover:bg-gray-50 p-5 rounded-lg border border-gray-200 cursor-default"
            >
                <div className="flex gap-3">
                    {/* 아바타 */}
                    <Link
                        to={`/user/${profile.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="w-10 h-10 rounded-full bg-blue-500 overflow-hidden flex items-center justify-center text-white font-bold text-lg"
                        aria-label={`${profile.name} 프로필로 이동`}
                    >
                        {profile.img
                            ? <img src={getImages({ url: profile.img })} alt="" className="w-full h-full object-cover" />
                            : (profile.name?.charAt(0) || "?")}
                    </Link>

                    {/* 오른쪽: 이름/핸들/시간 + 본문 */}
                    <div className="flex-1">
                        {/* 헤더: 이름/핸들/시간 한 줄 */}
                        <div className="flex items-center gap-2 mb-2">
                            <Link
                                to={`/user/${profile.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="font-bold truncate"
                            >
                                {profile.name}
                            </Link>
                            <span className="text-gray-500 text-sm">@{profile.account}</span>
                            <span className="text-gray-400 text-xs">
                                {fromNow(item.createdAt || item.created_at)}
                            </span>
                        </div>

                        {/* 본문 */}
                        <div className="mt-1 text-base text-gray-900 whitespace-pre-line break-words">
                            {item.content || item.artist || ''}
                        </div>

                        {/* 이미지 */}
                        {imageUrl && (
                            <img
                                src={imageUrl}
                                alt="게시글 이미지"
                                className="mt-3 w-full h-auto rounded-lg object-cover"
                            />
                        )}

                        {/* 음악 카드 */}
                        {musics.length > 0 && musics.map((m, i) => (
                            <div
                                key={i}
                                className="mt-2 flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200"
                            >
                                <img
                                    src={m?.albumCover || "/no-album.png"}
                                    alt={m?.titleShort || "음원"}
                                    className="w-16 h-16 rounded-lg object-cover"
                                />
                                <div className="min-w-0">
                                    <div className="font-semibold truncate">{m?.titleShort || "제목 없음"}</div>
                                    <div className="text-xs text-gray-600 truncate">{m?.artistName || "아티스트"}</div>
                                </div>
                                <button
                                    type="button"
                                    className="cursor-pointer ml-auto group"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (m?.preview) setPreviewUrl(m.preview);
                                    }}
                                >
                                    <FiPlay className="text-xl text-[#7faaf9] group-hover:text-[#3583f5]" />
                                </button>
                            </div>
                        ))}

                        {/* 하단 카운트 */}
                        <div className="mt-2 flex items-center gap-8 pt-2 text-gray-400 text-sm border-t border-gray-100">
                            <div className="flex items-center gap-1">💬 {item.commentsCount || 0}</div>
                            <div className="flex items-center gap-1">❤️ {item.likesCount || 0}</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };


    return (
        <div className="max-w-3xl mx-auto py-10">
            {/* ===== 프로필 카드 ===== */}
            <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6 flex items-center relative">
                <div className="relative w-28 h-28 mr-8 flex-shrink-0">
                    {profile.img ? (
                        <img
                            src={getImages({ url: profile.img })}
                            alt={profile.name}
                            className="w-28 h-28 rounded-full object-cover border-4 border-blue-100"
                        />
                    ) : (
                        <div className="w-28 h-28 rounded-full border-4 border-blue-100 bg-blue-500 flex items-center justify-center text-white text-3xl font-bold">
                            {profile.name ? profile.name[0] : "?"}
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center mb-2">
                        <span className="text-3xl font-bold text-gray-900">{profile.name}</span>
                        <span className="ml-3 text-gray-500 text-xl">@{profile.account}</span>
                        <button
                            onClick={() => setShowEdit(true)}
                            className="ml-6 bg-blue-500 text-white px-5 py-2 rounded-full font-semibold hover:bg-blue-600 transition"
                        >
                            프로필 편집
                        </button>
                    </div>
                    <div className="text-gray-600 mb-4">
                        {profile.content || '아직 자기소개가 없습니다.'}
                    </div>
                    <div className="flex items-center space-x-8 text-lg text-gray-600">
                        <span><strong className="text-gray-900">{postsCount}</strong> 게시물</span>
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

            {/* ===== 프로필 편집 모달 ===== */}
            {showEdit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="bg-white rounded-xl p-8 w-full max-w-md mx-2 relative">
                        <h2 className="text-xl font-bold mb-6 text-center">프로필 편집</h2>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-medium mb-1">이름</label>
                            <input type="text" name="name" value={editForm.name} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded" />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-medium mb-1">소개</label>
                            <textarea name="content" value={editForm.content} onChange={handleInputChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded" />
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-700 font-medium mb-1">프로필 이미지 업로드</label>
                            <input type="file" accept="image/*" onChange={handleFileChange} className="w-full px-3 py-2 border border-gray-300 rounded" />
                            {editForm.img ? (
                                <img src={getImages({ url: editForm.img })} alt="프로필 미리보기" className="w-24 h-24 rounded-full mt-2 object-cover border" />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl font-bold mt-2 border">
                                    {editForm.name ? editForm.name[0] : "?"}
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setEditForm((prev) => ({ ...prev, img: '' }))} className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 text-gray-700">기본이미지로 변경</button>
                            <button onClick={() => setShowEdit(false)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">취소</button>
                            <button onClick={handleEditSave} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">저장</button>
                        </div>
                    </div>
                </div>
            )}

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
                                                    {user.name ? user.name[0] : "?"}
                                                </div>
                                            )}
                                            <span className="font-semibold text-gray-900">{user.name}</span>
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
                                                    {user.name ? user.name[0] : "?"}
                                                </div>
                                            )}
                                            <span className="font-semibold text-gray-900">{user.name}</span>
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
                    <button onClick={() => setActiveTab('liked')} className={`flex-1 py-4 text-center font-medium cursor-pointer ${activeTab === 'liked' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>좋아요</button>
                </div>

                {/* [유지] 플레이리스트 탭은 3열 그리드 */}
                <div className={`${activeTab === 'playlists' ? 'p-6 grid grid-cols-3 gap-4' : 'p-0'}`}>
                    {activeTab === 'posts' && (
                        posts.length === 0
                            ? <div className="py-8 text-center text-gray-500">작성한 글이 없습니다.</div>
                            : <div className="flex flex-col gap-3">{posts.map(renderCard)}</div>
                    )} {/* Home처럼 gap-3 */}
                    {activeTab === 'playlists' && (playlists.length === 0 ? <div className="py-8 text-center text-gray-500">플레이리스트가 없습니다.</div> : playlists.map(renderCard))}
                    {activeTab === 'liked' && (liked.length === 0 ? <div className="py-8 text-center text-gray-500">좋아요한 음악이 없습니다.</div> : <div className="space-y-6">{liked.map(renderCard)}</div>)}
                </div>
            </div>

            {previewUrl && (
                <audio controls src={previewUrl} autoPlay className="hidden" />
            )}
        </div>
    );
}
