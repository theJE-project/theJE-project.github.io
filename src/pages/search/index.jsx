import { useEffect, useState, useCallback } from 'react';
import { useLoaderData, useRouteLoaderData, useNavigate, useSearchParams, useRevalidator } from 'react-router-dom';
import { springBoot } from "@axios";
import { useMusic } from '../../hooks/useMusics';
import { useSearch } from '../../hooks/useSearch'; // ✅ 새 훅
import { FiPlay, FiMusic } from "react-icons/fi";
import { useImage } from '../../hooks/useImage';

export function Search() {
    const { user } = useRouteLoaderData('default'); // 로그인 사용자
    const navigate = useNavigate();
    const revalidator = useRevalidator();
    const { musics, getMusics } = useMusic();
    const { searchDatas, getSearchDatas } = useSearch();
    const [searchParams] = useSearchParams();
    const searchStr = searchParams.get('q');
    const [searchData, setSearchData] = useState({ users: [], communities: [], hashTag: [] });
    const [activeTab, setActiveTab] = useState('all');

    const handleNav = useCallback((e, id, type) => {
        e.preventDefault();
        if (type === 'users') navigate(`/my/${id}`);
        else if (type === 'communities') navigate(`/group/${id}`);
        else navigate(`/${id}`);
    }, [navigate]);

    useEffect(() => {
        if (searchStr) {
            getMusics(searchStr);
            getSearchDatas(searchStr);
        } else {
            setSearchData({ users: [], communities: [], hashTag: [] });
        }
    }, [searchStr]);

    // ✅ searchDatas가 업데이트되면 상태 반영
    useEffect(() => {
        if (searchDatas) {
            const { users = [], communities = [], hashTag = [] } = searchDatas;
            setSearchData({ users, communities, hashTag });
        }
    }, [searchDatas]);

    // 팔로우 api 호출
    const follow = async (target) => {
        console.log(target)
        try {
            const response = await springBoot.post('/followers', {
                follower: user.id,
                followee: target
            })
            const result = response.data;
            return result;
        } catch (error) {
            console.log("팔로우 api 호출 실패", error);
            return null;
        }
    }
    // 팔로우 취소 api 호출
    const unfollow = async (target) => {
        try {
            const response = await springBoot.post(`/followers/delete`, {
                follower: user.id,
                followee: target,
            });
            return response.data;
        } catch (error) {
            console.log("팔로우 취소 api 호출 실패", error);
            return null;
        }
    }
    const followOrUnfollow = async (target, isFollowing, userName) => {
        try {
            let result;
            if (isFollowing) {
                if (!confirm(`${userName} 님을 팔로우 취소 하시겠습니까?`)) return;
                result = await unfollow(target);
                alert('');
            } else {
                if (!confirm(`${userName} 님을 팔로우 하시겠습니까?`)) return;
                result = await follow(target);
            }
            revalidator.revalidate();
            console.log(result);
        } catch (error) {
            console.log("팔로우/언팔로우 실패", error);
        }
    }

    const tabLabel = {
        all: '전체',
        users: '사용자',
        communities: '플레이리스트',
        hashTag: '해시태그',
        musics: '음악',
    };

    const getTabCount = {
        all: [
            ...searchData.users,
            ...searchData.communities,
            ...searchData.hashTag,
            ...musics
        ].length,
        users: searchData.users.length,
        communities: searchData.communities.length,
        hashTag: searchData.hashTag.length,
        musics: musics.length
    };

    const renderList = () => {
        const listMap = {
            users: searchData.users,
            communities: searchData.communities,
            hashTag: searchData.hashTag,
            musics: musics,
        };

        if (activeTab === 'all') {
            return (
                <>
                    {Object.entries(listMap).map(([key, list]) => (
                        <Section
                            key={key}
                            type={key}
                            title={tabLabel[key]}
                            list={list}
                            handleNav={handleNav}
                            user={user}
                            followOrUnfollow={followOrUnfollow}
                        />
                    ))}
                </>
            );
        } else {
            return (
                <Section
                    type={activeTab}
                    title={tabLabel[activeTab]}
                    list={listMap[activeTab]}
                    handleNav={handleNav}
                    user={user}
                    followOrUnfollow={followOrUnfollow}
                />
            );
        }
    };

    return (
        <div className="w-full max-w-[600px] mx-auto py-8">
            <h2 className="text-2xl font-bold mb-6 px-10">🔍 "{searchStr}" 검색 결과</h2>

            {/* 탭 */}
            <div className="flex gap-4 border-b border-gray-200 mb-6 mt-6 overflow-x-auto no-scrollbar px-10">

                {Object.keys(tabLabel).map((key) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`pb-2 px-3 text-sm font-medium whitespace-nowrap transition-all
                        ${activeTab === key
                                ? 'border-b-2 border-blue-500 text-blue-600'
                                : 'text-gray-500 hover:text-blue-500 hover:border-b-2 hover:border-blue-300'
                            }`}
                    >
                        {tabLabel[key]}{" "}
                        {getTabCount[key] > 0 && (
                            <span className="ml-1 text-xs text-blue-500 font-semibold">
                                ({getTabCount[key]})
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* 결과 리스트 */}
            {!searchStr ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <div className="font-semibold text-base text-gray-700 mb-1">
                        검색어를 입력해주세요.
                    </div>
                </div>
            ) : (
                renderList()
            )}
        </div>
    );

}

// 🔧 공통 섹션 컴포넌트
function Section({ type, title, list, handleNav, user, followOrUnfollow }) {
    const { getImages } = useImage()
    if (type === 'musics') {
        return (
            <div className="mb-12 px-10">
                <h3 className="text-xl font-bold mb-4 text-gray-800">{title}</h3>
                <div className="space-y-3 bg-white p-4 rounded-xl shadow-sm max-h-[400px] overflow-y-auto">
                    {list.length > 0 ? list.map((m) => (
                        <div
                            key={m.id}
                            onClick={() => { /* handleMusicSelect(m); */ }}
                            className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition cursor-pointer border border-gray-100"
                        >
                            <img src={m.albumCover} alt={m.titleShort} className="w-14 h-14 rounded-lg object-cover" />
                            <div className="flex-1">
                                <div className="font-semibold text-gray-900">{m.titleShort}</div>
                                <div className="text-sm text-gray-500">{m.artistName}</div>
                                {m.albumTitle && <div className="text-xs text-gray-400">{m.albumTitle}</div>}
                            </div>
                            <button
                                type="button"
                                className="p-2 rounded-full hover:bg-blue-100"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    // setPreviewUrl(m.preview);
                                }}
                            >
                                <FiPlay className="text-blue-500 text-xl" />
                            </button>
                        </div>
                    )) : (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                            <FiMusic className="mb-4" size={48} />
                            <div className="font-medium text-gray-600">검색된 음악이 없습니다</div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    console.log(list)
    return (
        <div className="mb-12 px-10">
            <h3 className="text-xl font-bold mb-4 text-gray-800">{title}</h3>
            {list.length > 0 ? (
                <ul className="space-y-4">
                    {list.map(item => (
                        <li
                            key={item.id}
                            className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border hover:shadow-md transition"
                        >
                            <div
                                className="flex items-center gap-4 cursor-pointer"
                                onClick={(e) => handleNav(e, item.id, type)}
                            >
                                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                { item.img.trim()
                                    ?(<img
                                        src={getImages({ url: item.img })}
                                        alt={user.name[0] || "프로필"}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />)
                                    :(item.name.charAt(0))
                                }
                                </div>
                                <div className="text-sm">
                                    {type === 'users' ? (
                                        <>
                                            <div className="font-semibold text-gray-900 text-base">{item.name}</div>
                                            <div className="text-gray-500 text-sm">
                                                @{item.account} · 팔로워 {item.followerCount?.toLocaleString() || 0}명
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="font-semibold text-gray-900 text-base">{item.title}</div>
                                            <div className="text-gray-500 text-sm">
                                                {item.name} · 조회수 {item.count || 0}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="ml-auto">
                                {item?.id === user?.id ? (
                                    {}
                                ) : (
                                    <button
                                        className={`border rounded-full px-3 py-0.5 text-sm font-semibold cursor-pointer transition-colors 
                                            ${item.is_following
                                                ? 'text-gray-500 border-gray-500'
                                                : 'text-blue-500 border-blue-500 hover:bg-blue-500 hover:text-white'
                                            }`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            followOrUnfollow(item.id, item.is_following, item.name);
                                        }}
                                    >
                                        {item.is_following ? '팔로잉' : '팔로우'}
                                    </button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                    <div className="font-medium text-gray-600">검색 결과가 없습니다.</div>
                </div>
            )}
        </div>
    );
}
