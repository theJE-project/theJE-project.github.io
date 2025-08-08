import { useLoaderData, useRouteLoaderData, useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react';
import { useImage } from '../../hooks/useImage';
export { loader } from './loader'
import { springBoot } from '@axios';
import { useMusic } from '../../hooks/useMusics';
import { FiImage, FiMusic, FiMessageCircle, FiHeart, FiPlay, FiPause } from "react-icons/fi";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';

export function Home() {
    const { communities1, followingCommunities } = useLoaderData();
    const { user, categories } = useRouteLoaderData('default');
    const navigate = useNavigate();
    const [content, setContent] = useState('');
    const { musics, getMusics } = useMusic();
    const [selectedMusic, setSelectedMusic] = useState(null);
    // 모달 열기
    const [open, setOpen] = useState(false);
    // 재생바
    const [previewUrl, setPreviewUrl] = useState(null);

    const { images, setImages, getImages, deleteImage } = useImage();

    const [tab, setTab] = useState('all'); // all or following
    const [feed, setFeed] = useState(tab === 'all' ? communities1 : followingCommunities);

    dayjs.extend(relativeTime);
    dayjs.locale('ko');

    useEffect(() => {
        setFeed(tab === 'all' ? communities1 : followingCommunities);
    }, [tab, communities1, followingCommunities]);

    const handleRefresh = async () => {
        const updated = tab === 'all' ? await communities1 : await followingCommunities;
        setFeed(updated);
    }

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


    // 피드 새고? 하려는건데 안쓸수도
    /*
    const fetchFeed = async () => {
        const res = await springBoot.get('/communities');
        try{
            setFeed(res.data);
        }catch(error){
            console.log("피드 불러오기 실패", error);
        }
        
    }
    /**/

    // 상세페이지 이동
    const handleDetail = (id) => navigate(`/${id}`);




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
            //fetchFeed(); // 새 글 작성 후 피드 갱신
            console.log("글 작성 성공:", result);
        } catch (error) {
            console.error("글 작성 실패", error);

        }
    }

    /*
    useEffect(()=>{
        fetchFeed();
    },[]);
    /**/





    // console.log(loader);
    // console.log(musics);
    // console.log(user.name);
    return (
        <div className="w-full max-w-[600px] mx-auto">
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
                            onClick={() => setTab('all')}
                        >
                            전체
                        </button>
                        <button
                            className={`w-1/2 flex items-center justify-center font-semibold cursor-pointer
            ${tab === 'following'
                                    ? 'text-black border-b-5 border-blue-500 bg-gray-50'
                                    : 'text-gray-500'}
            transition-colors duration-150`}
                            onClick={() => setTab('following')}
                        >
                            팔로잉
                        </button>
                    </div>
                    {/* <h3 className="font-bold text-lg mb-3">피드</h3> */}

                    {/* 글쓰기 */}
                    <div className="bg-white p-5 rounded-b-lg mb-6 border-1 border-gray-200">
                        <form onSubmit={handleSubmit}>
                            <div className="flex items-start gap-3">
                                {/* 프로필 둥근 이미지 (임시, 사용자 첫글자 원) */}
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
                                    {user?.img
                                        ? <img src={user.img} alt="profile" className="w-10 h-10 rounded-full object-cover" />
                                        : user?.name?.charAt(0)
                                    }
                                </div>
                                <div className="flex-1">
                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="좋아하는 음악을 공유해보세요!"
                                        className="w-full resize-none border-none focus:ring-0 text-base placeholder-gray-400 outline-none min-h-[44px] bg-transparent"
                                    />
                                    {/* 노래 미리보기 */}
                                    {selectedMusic && (
                                        <div
                                            className="flex items-center gap-3 p-3 rounded-lg bg-[#f5faff] hover:bg-[#e1effc] transition-colors border border-[#d4e7fa]"
                                        >
                                            <img src={selectedMusic.albumCover} alt={selectedMusic.titleShort} className="w-16 h-16 rounded-lg object-cover" />
                                            <div>
                                                <div className="font-semibold">{selectedMusic.titleShort}</div>
                                                <div className="text-xs text-gray-600">{selectedMusic.artistName}</div>
                                            </div>
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
                                        {/* 추가 아이콘들 필요시 여기에 */}
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="ml-2 px-5 py-2 bg-[#418FDE] text-white font-bold rounded-full shadow hover:bg-[#367cb3] transition cursor-pointer"
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
                                    className="text-gray-400 hover:text-gray-700"
                                    onClick={() => {
                                        setOpen(false);
                                        getMusics('');
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
                                            <FiPause className="inline text-xl text-[#7faaf9] group-hover:text-[#3583f5]" />
                                            :
                                            <FiPlay className="inline text-xl text-[#7faaf9] group-hover:text-[#3583f5]" />}
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
            <button type='button' className='cursor-pointer' onClick={handleRefresh}>새 게시글 새고</button>
            {previewUrl && (
                <audio controls src={previewUrl} autoPlay className="hidden" />
            )}


            {/* 피드 */}
            < div className="flex flex-col gap-3" >
                {
                    (feed ?? []).map((c) => (
                        <div key={c.id} onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDetail(c.id)
                        }} className="bg-white hover:bg-gray-50 p-5 rounded-lg flex flex-col gap-3 border-1 border-gray-200 cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
                                    {c.users?.img
                                        ? <img src={c.users.img} alt="profile" className="w-10 h-10 rounded-full object-cover" />
                                        : c.users?.name?.charAt(0)
                                    }
                                </div>
                                <div>
                                    <span className="font-bold">{c.users?.name}</span>
                                    <span className="ml-1 text-gray-500 text-sm">@{c.users?.account}</span>
                                    <span className="ml-2 text-gray-400 text-xs">{dayjs(c.created_at).fromNow()}</span>
                                </div>
                                {/* <button type='button' className='cursor-pointer' onClick={() => deleteCommunity(c.id)}>삭제</button> */}
                                {tab === 'all' && user.id && (
                                    <div className="ml-auto">
                                        {c.users?.id === user?.id ? (
                                            <button
                                                className="text-gray-500 hover:text-red-500 font-bold cursor-pointer"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    deleteCommunity(c.id)
                                                }}
                                            >
                                                삭제
                                            </button>
                                        ) : (
                                            <button
                                                className="text-gray-500 font-bold hover:text-blue-500 cursor-pointer"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    followOrUnfollow(c.users?.id, c.users?._following)
                                                }}
                                            >
                                                {c.users?._following ?
                                                    <div className='text-gray-500 border border-gray-500 rounded-2xl px-3 py-1'>언팔로우 </div>
                                                    :
                                                    <div className='text-blue-500 border border-blue-500 hover:bg-blue-500 hover:text-white transition-colors rounded-2xl px-3 py-1'>팔로우</div>}
                                            </button>
                                        )}
                                    </div>
                                )}

                            </div>


                            {/* 글 내용 */}
                            <div className="text-base text-gray-900 whitespace-pre-line">{c.content}</div>

                            {/* 음악 카드 */}
                            {c.musics && c.musics.length > 0 && (
                                c.musics.map((m, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 
                                        transition-colors border border-gray-200"
                                    >
                                        <img src={m.albumCover} alt={m.titleShort} className="w-16 h-16 rounded-lg object-cover" />
                                        <div>
                                            <div className="font-semibold">{m.titleShort}</div>
                                            <div className="text-xs text-gray-600">{m.artistName}</div>
                                        </div>
                                        <button type="button" className='cursor-pointer ml-auto group' onClick={(e) => {
                                            // 재생 누르면 모달 꺼짐 방지
                                            e.preventDefault();
                                            e.stopPropagation();
                                            { previewUrl === m.preview ? setPreviewUrl(null) : setPreviewUrl(m.preview); }
                                        }}
                                        >{previewUrl === m.preview ?
                                            <FiPause className="inline text-xl text-[#7faaf9] group-hover:text-[#3583f5]" />
                                            :
                                            <FiPlay className="inline text-xl text-[#7faaf9] group-hover:text-[#3583f5]" />}
                                        </button>
                                    </div>

                                ))
                            )}

                            {/* 사진 */}
                            {c.images && c.images.length > 0 && (
                                <div className="mt-3 flex gap-2">
                                    {c.images.map((img) => (
                                        <img
                                            key={img.id}
                                            src={getImages(img)} // DB images 테이블 url 컬럼이 path임
                                            alt={`게시글 이미지${img.id + 1}`}
                                            className="w-full max-w-[160px] h-auto rounded-lg object-cover"
                                        />
                                    ))}
                                </div>
                            )}
                            {/* 댓글/좋아요 아이콘들 */}
                            <div className="flex items-center gap-8 pt-2 text-gray-400 text-sm border-t border-gray-100">
                                <div className="flex items-center gap-1"><FiMessageCircle className="inline" /> {c.comments}</div>
                                <div className="flex items-center gap-1"><FiHeart className="inline" /> {c.likes}</div>
                            </div>
                        </div>
                    ))
                }
            </div >
        </div >
    )

}