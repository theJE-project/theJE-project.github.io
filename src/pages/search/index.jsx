import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { useMusic } from '../../hooks/useMusics';
import { useSearch } from '../../hooks/useSearch'; // ✅ 새 훅
import { FiPlay, FiMusic } from "react-icons/fi";

export function Search() {
    const navigate = useNavigate();
    const { musics, getMusics } = useMusic();
    const { searchDatas, getSearchDatas } = useSearch();
    const [searchParams] = useSearchParams();
    const searchStr = searchParams.get('q');
    const [searchData, setSearchData] = useState({ users: [], communities: [], hashTag: [] });
    const [activeTab, setActiveTab] = useState('all');

    const handleNav = useCallback((e, id, type) => {
        e.preventDefault();
        if (type === 'users') navigate(`/my/${id}`);
        else navigate(`/communities/${id}`);
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
function Section({ type, title, list, handleNav }) {
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
                                <img
                                    src={item.img || 'https://placehold.co/40x40'}
                                    alt="프로필"
                                    className="w-12 h-12 rounded-full object-cover"
                                />
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

                            <button
                                className="text-sm px-4 py-1 rounded-full border border-blue-500 text-blue-500 hover:bg-blue-50 transition"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    alert(`${item.name || item.title} 팔로우`);
                                }}
                            >
                                팔로우
                            </button>
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
