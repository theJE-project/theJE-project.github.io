import React, { useState, useEffect } from 'react';
import { springBoot } from '../../axios/springboot';
import { useLoaderData, useNavigate } from 'react-router-dom';
export { loader } from './loader';

// ⭐ 이미지 주소 앞에 백엔드 서버 주소를 붙여주는 함수
const getImgUrl = (img) => {
    if (!img) return null; // 이미지가 없으면 null 반환
    return img.startsWith('http') ? img : `http://localhost:8888${img}`;
};

export function My() {
    const userId = localStorage.getItem('user-id');
    const navigate = useNavigate();
    const { followee, follower } = useLoaderData();

    const [activeTab, setActiveTab] = useState('posts');
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [liked, setLiked] = useState([]);
    const [loading, setLoading] = useState(true);

    // 프로필 편집
    const [showEdit, setShowEdit] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', content: '', img: '' });

    // 팔로워/팔로잉 모달
    const [showFollowModal, setShowFollowModal] = useState(false);
    const [followType, setFollowType] = useState('followers');

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
                console.log('profile', res.data);
            })
            .catch(() => setProfile(null));

        // 탭별 데이터
        if (activeTab === "posts") {
            springBoot.get('communities/user', {
                params: {
                    user: userId,
                    category: 1,
                    page: 0,
                    size: 10,
                }
            })
            .then(res => setPosts(res.data || []))
            .catch(() => setPosts([]));
        }

        if (activeTab === "playlists") {
            springBoot.get('communities/user', {
                params: {
                    user: userId,
                    category: 2,
                    page: 0,
                    size: 10,
                }
            })
            .then(res => setPlaylists(res.data || []))
            .catch(() => setPlaylists([]));
        }

        if (activeTab === "liked") {
            springBoot.get('likes/my', { params: { userId } })
                .then(res => setLiked(res.data || []))
                .catch(() => setLiked([]));
        }

        setLoading(false);
    }, [userId, navigate, activeTab, showEdit]);

    if (!userId) {
        return <div className="py-10 text-center text-gray-600">로그인이 필요합니다.</div>;
    }
    if (loading || !profile) {
        return <div className="py-10 text-center text-gray-600">로딩 중...</div>;
    }

    const postsCount = posts.length || 0;
    const followersCount = (follower && follower.length) || 0;
    const followingCount = (followee && followee.length) || 0;
    const joinDate =
        profile.joinDate ||
        profile.created_at?.slice(0, 10) ||
        profile.createdAt?.slice(0, 10) ||
        '';

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
        } catch (e) {
            alert('프로필 수정 실패!');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditForm((prev) => ({ ...prev, [name]: value }));
    };

    // 프로필 이미지 파일 업로드 함수
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await springBoot.post('/images/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setEditForm((prev) => ({ ...prev, img: res.data.url }));
        } catch (err) {
            alert("이미지 업로드 실패!");
        }
    };

    const openFollowModal = (type) => {
        setFollowType(type);
        setShowFollowModal(true);
    };

    // 카드 렌더링 공통 함수
    const renderCard = (item) => (
        <div key={item.id} className="border-b border-gray-100 pb-6 last:border-b-0">
            <div className="flex items-center mb-2">
                <div className="relative w-12 h-12 mr-3">
                    {getImgUrl(profile.img) ? (
                        <img
                            src={getImgUrl(profile.img)}
                            alt={profile.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-blue-100"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-full border-2 border-blue-100 bg-blue-500 flex items-center justify-center text-white text-xl font-bold">
                            {profile.name ? profile.name[0] : "?"}
                        </div>
                    )}
                </div>
                <span className="font-semibold text-lg text-gray-900">{profile.name}</span>
                <span className="ml-2 text-gray-500">@{profile.account}</span>
                <span className="ml-4 text-gray-400 text-sm">{item.createdAt || item.created_at}</span>
            </div>
            <div className="mb-2 font-bold text-xl">{item.title || item.name || item.content || '제목 없음'}</div>
            <div className="mb-3 text-gray-700">{item.content || item.artist || ''}</div>
            <div className="flex space-x-6 text-gray-500 mt-2">
                <span className="flex items-center"><span role="img" aria-label="댓글">💬</span>&nbsp;{item.commentsCount || 0}</span>
                <span className="flex items-center"><span role="img" aria-label="좋아요">❤️</span>&nbsp;{item.likesCount || 0}</span>
            </div>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto py-10">
            {/* 프로필 카드 */}
            <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6 flex items-center relative">
                <div className="relative w-28 h-28 mr-8 flex-shrink-0">
                    {getImgUrl(profile.img) ? (
                        <img
                            src={getImgUrl(profile.img)}
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
                        <span>
                            <strong className="text-gray-900">{postsCount}</strong> 게시물
                        </span>
                        <button
                            type="button"
                            onClick={() => openFollowModal('followers')}
                            className="hover:text-blue-600"
                        >
                            <strong className="text-gray-900">{followersCount}</strong> 팔로워
                        </button>
                        <button
                            type="button"
                            onClick={() => openFollowModal('followee')}
                            className="hover:text-blue-600"
                        >
                            <strong className="text-gray-900">{followingCount}</strong> 팔로잉
                        </button>
                        <span>
                            {joinDate && <>{joinDate} 가입</>}
                        </span>
                    </div>
                </div>
            </div>

            {/* ====== 프로필 편집 모달 ====== */}
            {showEdit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="bg-white rounded-xl p-8 w-full max-w-md mx-2 relative">
                        <h2 className="text-xl font-bold mb-6 text-center">프로필 편집</h2>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-medium mb-1">이름</label>
                            <input
                                type="text"
                                name="name"
                                value={editForm.name}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-medium mb-1">소개</label>
                            <textarea
                                name="content"
                                value={editForm.content}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded"
                            />
                        </div>
                        {/* 파일 업로드 */}
                        <div className="mb-6">
                            <label className="block text-gray-700 font-medium mb-1">프로필 이미지 업로드</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded"
                            />
                            {/* 미리보기 */}
                            {editForm.img && getImgUrl(editForm.img) ? (
                                <img
                                    src={getImgUrl(editForm.img)}
                                    alt="프로필 미리보기"
                                    className="w-24 h-24 rounded-full mt-2 object-cover border"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl font-bold mt-2 border">
                                    {editForm.name ? editForm.name[0] : "?"}
                                </div>
                            )}
                        </div>
                        {/* 기본이미지(이니셜)로 변경 버튼 */}
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setEditForm((prev) => ({ ...prev, img: '' }))}
                                className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 text-gray-700"
                            >
                                기본이미지로 변경
                            </button>
                            <button
                                onClick={() => setShowEdit(false)}
                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleEditSave}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                저장
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== [팔로워/팔로잉 팝업] ===== */}
            {showFollowModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="bg-white rounded-xl p-8 w-full max-w-md mx-2 relative">
                        <h2 className="text-xl font-bold mb-6 text-center">
                            {followType === 'followers' ? '팔로워' : '팔로잉'}
                        </h2>
                        <div className="max-h-96 overflow-y-auto">
                            {followType === 'followers' && (
                                followersCount === 0
                                    ? <div className="text-gray-500 py-6 text-center">팔로워가 없습니다</div>
                                    : follower.map(user => (
                                        <div key={user.id} className="flex items-center py-3 border-b last:border-0">
                                            {getImgUrl(user.img) ? (
                                                <img
                                                    src={getImgUrl(user.img)}
                                                    alt={user.name}
                                                    className="w-10 h-10 rounded-full object-cover border mr-3"
                                                />
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
                            {followType === 'followee' && (
                                followingCount === 0
                                    ? <div className="text-gray-500 py-6 text-center">팔로잉이 없습니다</div>
                                    : followee.map(user => (
                                        <div key={user.id} className="flex items-center py-3 border-b last:border-0">
                                            {getImgUrl(user.img) ? (
                                                <img
                                                    src={getImgUrl(user.img)}
                                                    alt={user.name}
                                                    className="w-10 h-10 rounded-full object-cover border mr-3"
                                                />
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
                            <button onClick={() => setShowFollowModal(false)}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                                닫기
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 탭/게시물/플레이리스트/좋아요 */}
            <div className="bg-white rounded-lg border border-gray-200 mb-6">
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('posts')}
                        className={`flex-1 py-4 text-center font-medium cursor-pointer ${activeTab === 'posts' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        게시물
                    </button>
                    <button
                        onClick={() => setActiveTab('playlists')}
                        className={`flex-1 py-4 text-center font-medium cursor-pointer ${activeTab === 'playlists' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        플레이리스트
                    </button>
                    <button
                        onClick={() => setActiveTab('liked')}
                        className={`flex-1 py-4 text-center font-medium cursor-pointer ${activeTab === 'liked' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        좋아요
                    </button>
                </div>

                <div className="p-6">
                    {activeTab === 'posts' && (
                        posts.length === 0 ?
                            <div className="py-8 text-center text-gray-500">작성한 글이 없습니다.</div>
                            :
                            <div className="space-y-6">
                                {posts.map(renderCard)}
                            </div>
                    )}
                    {activeTab === 'playlists' && (
                        playlists.length === 0 ?
                            <div className="py-8 text-center text-gray-500">플레이리스트가 없습니다.</div>
                            :
                            <div className="space-y-6">
                                {playlists.map(renderCard)}
                            </div>
                    )}
                    {activeTab === 'liked' && (
                        liked.length === 0 ?
                            <div className="py-8 text-center text-gray-500">좋아요한 음악이 없습니다.</div>
                            :
                            <div className="space-y-6">
                                {liked.map(renderCard)}
                            </div>
                    )}
                </div>
            </div>
        </div>
    );
}
