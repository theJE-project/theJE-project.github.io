import React, { useState, useEffect } from 'react';
import { springBoot } from '../../axios/springboot';
import { useNavigate } from 'react-router-dom';
export { loader } from './loader';

export function My() {
    const userId = localStorage.getItem('user-id');
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('posts');
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    // ===== [프로필 편집] =====
    const [showEdit, setShowEdit] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', content: '', img: '' });

    // ===== [팔로워/팔로잉 팝업/리스트] =====
    const [showFollowModal, setShowFollowModal] = useState(false);
    const [followType, setFollowType] = useState('followers');
    const [followList, setFollowList] = useState([]);

    useEffect(() => {
        if (!userId) {
            window.alert('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
            navigate('/login', { replace: true });
            return;
        }
        setLoading(true);
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

        springBoot.get('communities/my', { params: { userId } })
            .then(res => setPosts(res.data))
            .catch(() => setPosts([]));

        setLoading(false);
    }, [userId, navigate, showEdit]);

    if (!userId) {
        return <div className="py-10 text-center text-gray-600">로그인이 필요합니다.</div>;
    }
    if (loading || !profile) {
        return <div className="py-10 text-center text-gray-600">로딩 중...</div>;
    }

    const postsCount = profile.postsCount || posts.length || 0;
    const followers = profile.followers || 0;
    const following = profile.following || 0;
    const joinDate =
        profile.joinDate ||
        profile.created_at?.slice(0, 10) ||
        profile.createdAt?.slice(0, 10) ||
        '';

    // ===== [프로필 편집 저장] =====
    const handleEditSave = async () => {
        try {
            await springBoot.put('users', {
                id: userId,
                name: editForm.name,
                content: editForm.content,   
                img: editForm.img,
            });

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

    // ===== [팔로워/팔로잉 팝업] =====
    const openFollowModal = (type) => {
        setFollowType(type);
        setShowFollowModal(true);
        springBoot.get(
            type === 'followers' ? 'followers/followers' : 'followers/following',
            { params: { userId: profile.id } }
        )
        .then(res => setFollowList(res.data || []))
        .catch(() => setFollowList([]));
    };

    const handleFollowToggle = (targetId, isFollowing) => {
        if (!userId) return;
        if (isFollowing) {
            springBoot.delete('followers/unfollow', {
                params: { follower: userId, followee: targetId }
            }).then(() => {
                setFollowList(prev =>
                    prev.map(u =>
                        u.id === targetId ? { ...u, isFollowing: false } : u
                    )
                );
            });
        } else {
            springBoot.post('followers/follow', null, {
                params: { follower: userId, followee: targetId }
            }).then(() => {
                setFollowList(prev =>
                    prev.map(u =>
                        u.id === targetId ? { ...u, isFollowing: true } : u
                    )
                );
            });
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-10">
            {/* 프로필 카드 */}
            <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6 flex items-center relative">
                <div className="relative w-28 h-28 mr-8 flex-shrink-0">
                    {profile.img ? (
                        <img
                            src={profile.img}
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
                            <strong className="text-gray-900">{followers}</strong> 팔로워
                        </button>
                        <button
                            type="button"
                            onClick={() => openFollowModal('following')}
                            className="hover:text-blue-600"
                        >
                            <strong className="text-gray-900">{following}</strong> 팔로잉
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
                        <div className="mb-6">
                            <label className="block text-gray-700 font-medium mb-1">프로필 이미지 주소</label>
                            <input
                                type="text"
                                name="img"
                                value={editForm.img}
                                onChange={handleInputChange}
                                placeholder="이미지 URL 입력 (선택)"
                                className="w-full px-3 py-2 border border-gray-300 rounded"
                            />
                        </div>
                        <div className="flex justify-end gap-2">
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
                            {followList.length === 0
                                ? <div className="text-gray-500 py-6 text-center">리스트가 없습니다</div>
                                : followList.map(user => (
                                    <div key={user.id} className="flex items-center py-3 border-b last:border-0">
                                        <img
                                            src={user.img}
                                            alt={user.name}
                                            className="w-10 h-10 rounded-full object-cover border mr-3"
                                        />
                                        <span className="font-semibold text-gray-900">{user.name}</span>
                                        <span className="ml-2 text-gray-500">@{user.account}</span>
                                        {user.id !== userId && (
                                            <button
                                                className={`ml-auto px-4 py-1 rounded-full text-sm font-medium 
                                                    ${user.isFollowing ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                                        : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                                                onClick={() => handleFollowToggle(user.id, user.isFollowing)}
                                            >
                                                {user.isFollowing ? '팔로잉' : '팔로우'}
                                            </button>
                                        )}
                                    </div>
                                ))}
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

            {/* 탭/게시물 렌더링 */}
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
                                {posts.map(post => (
                                    <div key={post.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                                        <div className="flex items-center mb-2">
                                            <div className="relative w-12 h-12 mr-3">
                                                {profile.img ? (
                                                    <img
                                                        src={profile.img}
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
                                            <span className="ml-4 text-gray-400 text-sm">{post.createdAt || post.created_at}</span>
                                        </div>
                                        <div className="mb-2 font-bold text-xl">{post.title}</div>
                                        <div className="mb-3 text-gray-700">{post.content}</div>
                                        <div className="flex space-x-6 text-gray-500 mt-2">
                                            <span className="flex items-center"><span role="img" aria-label="댓글">💬</span>&nbsp;{post.commentsCount || 0}</span>
                                            <span className="flex items-center"><span role="img" aria-label="좋아요">❤️</span>&nbsp;{post.likesCount || 0}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                    )}
                    {activeTab === 'playlists' && (
                        <div className="py-8 text-center text-gray-500">준비 중입니다</div>
                    )}
                    {activeTab === 'liked' && (
                        <div className="py-8 text-center text-gray-500">좋아요한 음악이 여기에 표시됩니다.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
