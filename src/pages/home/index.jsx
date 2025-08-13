import { useLoaderData, useRouteLoaderData, useNavigate, useRevalidator, Link } from 'react-router-dom'
import { useState, useEffect } from 'react';
import { useImage } from '../../hooks/useImage';
export { loader } from './loader'
import { springBoot } from '@axios';
import { useMusic } from '../../hooks/useMusics';
import { FiImage, FiMusic, FiMessageCircle, FiHeart, FiPlay, FiPause, FiBarChart2, FiUserPlus, FiAlertTriangle } from "react-icons/fi";
import TextareaAutosize from 'react-textarea-autosize';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';

export function Home() {
    const { communities1, followingCommunities } = useLoaderData();
    const { user, categories } = useRouteLoaderData('default');

    const navigate = useNavigate();
    const revalidator = useRevalidator();

    const [content, setContent] = useState('');
    const { musics, getMusics } = useMusic();
    const [selectedMusic, setSelectedMusic] = useState(null);
    // 모달 열기
    const [open, setOpen] = useState(false);
    // 재생바
    const [previewUrl, setPreviewUrl] = useState(null);

    const { images, setImages, getImages, deleteImage } = useImage();

    const [tab, setTab] = useState('all'); // all or following

    dayjs.extend(relativeTime);
    dayjs.locale('ko');

    const list = tab === 'all' ? (communities1 ?? []) : (followingCommunities ?? []);


    // 탭 한번 더 누르면 맨위로+새고
    const onClickTab = (next) => {
        if (next === tab) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            revalidator.revalidate();
            return;
        }
        setTab(next);
    };


    // 피드 새로고침
    const handleRefresh = () => {
        revalidator.revalidate();
    }

    useEffect(() => {
        const timer = setInterval(() => {
            handleRefresh();
        }, 300000);
        return () => clearInterval(timer);
    }, []);


    // 글작성 api 호출
    const postCommunity = async (data) => {
        try {
            const response = await springBoot.post('/communities', data);
            const result = response.data;
            return result;
        } catch (error) {
            console.error("글 작성api 호출 실패", error);
            return null;
        }
    }

    // 글삭제 api 호출
    const deleteCommunity = async (id) => {
        if (!confirm('게시글을 삭제할까요?')) return;
        try {
            const response = await springBoot.put(`/communities/${id}`);
            revalidator.revalidate();
            const result = response.data;
            return result;
        } catch (error) {
            console.log("글 삭제 api 호출 실패", error);
            return null;
        }
    }


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
            const response = await springBoot.delete(`/followers/delete`, {
                params: {
                    follower: user.id,
                    followee: target,
                }
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

    // 이미지 업로드
    //*
    const handleImageUpload = async (e) => {
        const files = e.target.files;
        // 파일이 없으면 리턴
        if (!files || !files.length) return;
        setImages(e);
    }
    /**/
    //
    // 음악 검색
    const handleMusicSearch = (e) => {
        e.preventDefault();
        const selectedMusics = e.target.value; // 예시로 input의 value를 사용
        getMusics(selectedMusics);
    }

    // 음악 선택
    const handleMusicSelect = (m) => {
        setSelectedMusic(m);
        setOpen(false); // 모달 닫기x
        console.log("선택된 음악:", m);
    }

    // 조회수 증가 api 호출
    const increaseView = async (id) => {
        try {
            const response = await springBoot.put(`/communities/view/${id}`);
            revalidator.revalidate();
            const result = response.data;
            return result;
        } catch (error) {
            console.log("조회수 증가 api 호출 실패", error);
            return null;
        }
    }

    // 상세페이지 이동
    const handleDetail = (id) => {
        increaseView(id);
        navigate(`/${id}`);
    }



    // 폼 제출
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(images)
        const data = {
            users: user.id,
            categories: 1,
            content: content,
            images: images || null,
            musics: selectedMusic ? [selectedMusic] : null,
        };
        console.log("전송할 데이터:", data);
        const result = await postCommunity(data);
        try {
            setContent('');
            images.length = 0; // 고쳐야댐
            setSelectedMusic(null);
            revalidator.revalidate();
            console.log("글 작성 성공:", result);
        } catch (error) {
            console.error("글 작성 실패", error);

        }
    }


    // console.log(loader);
    // console.log(musics);
    // console.log(user.name);
    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* 전체/팔로잉 탭 */}
            {user?.id && (
                <>
                    <div className="flex h-12 sticky top-17 bg-white/90">
                        <button
                            className={`w-1/2 flex items-center justify-center font-semibold cursor-pointer
            ${tab === 'all'
                                    ? 'text-black border-b-4 border-blue-500 bg-gray-50'
                                    : 'text-gray-500'}
            transition-colors duration-150`}
                            onClick={() => onClickTab('all')}
                        >
                            전체
                        </button>
                        <button
                            className={`w-1/2 flex items-center justify-center font-semibold cursor-pointer
            ${tab === 'following'
                                    ? 'text-black border-b-4 border-blue-500 bg-gray-50'
                                    : 'text-gray-500'}
            transition-colors duration-150`}
                            onClick={() => onClickTab('following')}
                        >
                            팔로잉
                        </button>
                    </div>
                    {/* <h3 className="font-bold text-lg mb-3">피드</h3> */}

                    {/* 글쓰기 */}
                    <div className="bg-white p-5 rounded-b-lg border-1 border-gray-200">
                        <form onSubmit={handleSubmit}>
                            <div className="flex items-start gap-3">
                                {/* 프로필 둥근 이미지 (임시, 사용자 첫글자 원) */}
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
                                    {user?.img
                                        ? <img src={getImages({ url: user.img })} alt="profile" className="w-10 h-10 rounded-full object-cover" />
                                        : user?.name?.charAt(0)
                                    }
                                </div>
                                <div className="flex-1">
                                    <TextareaAutosize
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        // maxLength={200}
                                        placeholder="좋아하는 음악을 공유해보세요!"
                                        minRows={1}
                                        className="w-full resize-none border-none focus:ring-0 text-base placeholder-gray-400 outline-none bg-transparent"
                                    />
                                    {/* 노래 미리보기 */}
                                    {selectedMusic && (
                                        <div
                                            className="flex items-center gap-3 p-3 rounded-lg bg-[#f5faff] hover:bg-[#e1effc] transition-colors border border-[#d4e7fa] relative"
                                        >
                                            <img src={selectedMusic.albumCover} alt={selectedMusic.titleShort} className="w-16 h-16 rounded-lg object-cover" />
                                            <div>
                                                <div className="font-semibold">{selectedMusic.titleShort}</div>
                                                <div className="text-xs text-gray-600">{selectedMusic.artistName}</div>

                                            </div>
                                            <button
                                                type="button"
                                                className="absolute top-[3px] right-[3px] bg-black/70 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs cursor-pointer"
                                                onClick={(e) => {
                                                    e.stopPropagation(); // 상위 클릭 방지
                                                    setSelectedMusic(null); // 선택 음악 초기화
                                                    setPreviewUrl(null); // 음악재생 종료
                                                }}
                                            >
                                                ×
                                            </button>
                                            {/* <button type="button" className='cursor-pointer ml-auto' onClick={(e) => {
                                                // 재생 누르면 모달 꺼짐 방지
                                                e.stopPropagation();
                                                setPreviewUrl(selectedMusic.preview);
                                            }}
                                            ><FiPlay className="inline text-xl" color="#7faaf9" /></button> */}
                                        </div>

                                    )}

                                    {/* 새 이미지 미리보기 */}
                                    <div className="img-preview-list flex flex-wrap gap-2 mt-3">
                                        {images.length > 0 && images.map((img) => (
                                            <div className="relative w-[100px] h-[100px]" key={img.id}>
                                                <button
                                                    type="button"
                                                    className="absolute top-[3px] right-[3px] bg-black/70 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs cursor-pointer"
                                                    onClick={() => { deleteImage(img) }}
                                                >
                                                    &times;
                                                </button>
                                                <img
                                                    src={getImages(img)}
                                                    alt={`업로드 이미지${img.id + 1}`}
                                                    className="w-full h-full object-cover rounded-lg"
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-3 mt-3">
                                        <label className="text-gray-400 hover:text-gray-600 transition cursor-pointer">
                                            <FiImage className="inline text-lg" />
                                            <input type="file" accept="image/*" multiple className='hidden' onChange={handleImageUpload} />
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setOpen(true);
                                                setPreviewUrl(null);
                                            }}
                                            className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
                                        >
                                            <FiMusic className="inline text-lg" />
                                        </button>

                                    </div>
                                </div>
                                <button
                                    disabled={!content && !images.length && !selectedMusic}
                                    type="submit"
                                    onClick={()=>setPreviewUrl(null)}
                                    className="ml-2 px-5 py-2 bg-blue-500 text-white font-bold rounded-full hover:bg-blue-400 disabled:bg-gray-300 transition cursor-pointer"
                                >
                                    공유하기
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            )}



            {/* 음악 검색 모달 */}
            {
                open && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
                        onClick={() => {
                            setOpen(false);
                            setPreviewUrl(null);
                            getMusics(''); // 검색 초기화
                        }}
                    >
                        <div
                            className="bg-white rounded-xl shadow-xl w-full max-w-xl mx-3 flex flex-col"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* 헤더 */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h2 className="text-lg font-bold">음악 검색</h2>
                                <button
                                    className="text-gray-400 hover:text-gray-700 cursor-pointer"
                                    onClick={() => {
                                        setOpen(false);
                                        getMusics('');
                                        setPreviewUrl(null)
                                    }}
                                >
                                    <span className="text-2xl">&times;</span>
                                </button>
                            </div>

                            {/* 검색 */}
                            <div className="p-6 pt-3 items-center gap-2 border-b border-gray-100">
                                <input
                                    type="text"
                                    placeholder="아티스트, 곡명, 앨범으로 검색하세요"
                                    onChange={handleMusicSearch}
                                    className="w-full border rounded-lg px-4 py-3 text-base outline-none placeholder:text-gray-400 bg-gray-50"
                                />
                                {/* {previewUrl && (
                                    <audio controls src={previewUrl} autoPlay className="w-full mt-2 hidden" />
                                )} */}
                            </div>

                            {/* 결과목록 */}
                            <div className="p-6 pt-2 flex-1 min-h-[260px] max-h-[400px] overflow-y-auto">

                                {musics.length > 0 ? musics.map((m) => (
                                    <div
                                        key={m.id}
                                        onClick={() => {
                                            handleMusicSelect(m);
                                            getMusics(''); // 검색 초기화
                                        }}
                                        className="flex items-center gap-4 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0"

                                    >
                                        <img src={m.albumCover} alt={m.titleShort} className="w-14 h-14 rounded-lg object-cover" />
                                        <div className="flex-1">
                                            <div className="font-bold leading-tight">{m.titleShort}</div>
                                            <div className="text-sm text-gray-500">{m.artistName}</div>
                                            {m.albumTitle && <div className="text-xs text-gray-400">{m.albumTitle}</div>}
                                        </div>
                                        <button type="button" className='cursor-pointer group' onClick={(e) => {
                                            // 재생 누르면 모달 꺼짐 방지
                                            e.stopPropagation();
                                            { previewUrl === m.preview ? setPreviewUrl(null) : setPreviewUrl(m.preview); }
                                        }}
                                        >{previewUrl === m.preview ?
                                            <FiPause className="inline text-xl text-blue-300 group-hover:text-blue-500" />
                                            :
                                            <FiPlay className="inline text-xl text-blue-300 group-hover:text-blue-500" />}
                                        </button>
                                    </div>
                                )) : (
                                    // 결과 없을 때
                                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                                        <FiMusic className="mb-4" size={54} color="#7faaf9" />
                                        <div className="font-bold text-base text-gray-700 mb-1">음악을 검색하세요</div>
                                        <div className="text-sm text-gray-400">공유하고 싶은 음악을 찾아보세요</div>
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>
                )

            }

            {/* 새 게시글 */}
            {/* <div type='button' className='cursor-pointer mx-auto flex items-center' onClick={handleRefresh} 
            disabled={revalidator.state === 'loading'}>
                {revalidator.state === 'loading' ? '...' : ''}
            </div> */}
            {previewUrl && (
                <audio onEnded={()=>setPreviewUrl(null)} controls src={previewUrl} autoPlay className="hidden" />
            )}
            {/* 새로고침 버튼 */}
            <button type='button' onClick={handleRefresh} className="mx-auto my-4 w-full max-w-2xl
                flex items-center justify-center
                rounded-full border border-blue-200 bg-blue-50
                px-4 py-2 font-semibold text-blue-600 cursor-pointer hover:bg-blue-100
                active:scale-[0.99] transition" disabled={revalidator.state === 'loading'}>새 게시글 보기</button>
            {/* 피드 */}
            <div className="flex flex-col gap-3">
                {list.length === 0 ? (
                    tab === 'following'
                        ? <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                            <FiUserPlus size={40} className="mb-3" />
                            <p className="text-gray-500">팔로우한 사용자가 없습니다</p>
                            <p className="text-sm text-gray-400">다른 사용자를 팔로우해보세요</p>
                        </div>
                        : <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                            <FiAlertTriangle size={40} className="mb-3" />
                            <p className="text-gray-500">게시글이 없습니다</p>
                            <p className="text-sm text-gray-400">좋아하는 음악을 공유해보세요</p>
                        </div>
                ) : (list.map((c) => (
                    <div
                        key={c.id}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDetail(c.id);
                        }}
                        className="bg-white hover:bg-gray-50 p-5 rounded-lg border-1 border-gray-200 cursor-pointer"
                    >
                        <div className="flex gap-3">
                            {/* 왼쪽 프로필 */}
                            <div className="flex-shrink-0">
                                <Link to={`/user/${c.users?.id}`} 
                                onClick={(e) => e.stopPropagation()}
                                className="w-10 h-10 rounded-full bg-blue-500 overflow-hidden flex items-center justify-center text-white font-bold text-lg"
                                aria-label={`${c.users?.name} 프로필로 이동`}
                                >
                                    {c?.users?.img
                                        ? <img src={getImages({ url: c.users.img })} alt="profile" className="w-full h-full object-cover" />
                                        : c?.users?.name?.charAt(0)}
                                </Link>
                            </div>
                            {/* 오른쪽: 모든 내용 */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <Link to={`/user/${c.users?.id}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="font-bold truncate hover:underline">{c?.users?.name}</Link>
                                    <span className="text-gray-500 text-sm">@{c?.users?.account}</span>
                                    <span className="text-gray-400 text-xs"> {dayjs(c.created_at).fromNow()}</span>

                                    {tab === 'all' && user?.id && (
                                        <div className="ml-auto">
                                            {c?.users?.id === user?.id ? (
                                                <button
                                                    className="text-gray-500 hover:text-red-500 font-bold cursor-pointer"
                                                    onClick={(e) => {
                                                        e.preventDefault(); e.stopPropagation();
                                                        deleteCommunity(c.id);
                                                    }}
                                                >
                                                    삭제
                                                </button>
                                            ) : (
                                                <button
                                                    className={`border rounded-full px-3 py-0.5 text-sm font-semibold cursor-pointer transition-colors ${c?.users?._following
                                                        ? 'text-gray-500 border-gray-500 hover:bg-red-50 hover:text-red-500 hover:border-red-500'
                                                        : 'text-white bg-blue-500 hover:bg-blue-400'
                                                        }`}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        followOrUnfollow(c?.users?.id, c?.users?._following, c?.users?.name);
                                                    }}
                                                >
                                                    {c?.users?._following ? '팔로잉' : '팔로우'}
                                                </button>

                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-1 text-base text-gray-900 whitespace-pre-line break-words">
                                    {c.content}
                                </div>

                                {c.musics && c.musics.length > 0 && c.musics.map((m) => (
                                    <div
                                        key={m.id}
                                        className="mt-2 flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200"
                                    >
                                        <img src={m.albumCover} alt={m.titleShort} className="w-16 h-16 rounded-lg object-cover" />
                                        <div className="min-w-0">
                                            <div className="font-semibold truncate">{m.titleShort}</div>
                                            <div className="text-xs text-gray-600 truncate">{m.artistName}</div>
                                        </div>
                                        <button
                                            type="button"
                                            className="cursor-pointer ml-auto group"
                                            onClick={(e) => {
                                                e.preventDefault(); e.stopPropagation();
                                                previewUrl === m.preview ? setPreviewUrl(null) : setPreviewUrl(m.preview);
                                            }}
                                        >
                                            {previewUrl === m.preview
                                                ? <FiPause className="text-xl text-[#7faaf9] group-hover:text-[#3583f5]" />
                                                : <FiPlay className="text-xl text-[#7faaf9] group-hover:text-[#3583f5]" />}
                                        </button>
                                    </div>
                                ))}

                                {c.images && c.images.length > 0 && (
                                    <div className="mt-3 gap-2">
                                        {c.images.map((img) => (
                                            <img
                                                key={img.id}
                                                src={getImages(img)}
                                                alt=""
                                                className="w-full h-auto rounded-lg object-cover"
                                            />
                                        ))}
                                    </div>

                                )}





                                <div className="mt-2 flex items-center gap-8 pt-2 text-gray-400 text-sm border-t border-gray-100">
                                    <div className="flex items-center gap-1"><FiMessageCircle /> {c.comments}</div>
                                    <div className="flex items-center gap-1"><FiHeart /> {c.likes}</div>
                                    <div className="flex items-center gap-1"><FiBarChart2 /> {c.count}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )))}
            </div>
        </div >
    )

}