import { useLoaderData, useRouteLoaderData, useRevalidator, useNavigate } from 'react-router-dom'
import { useState } from 'react';
import { useImage } from '../../hooks/useImage';
export { loader } from './loader'
import { springBoot } from '@axios';
import { FiMessageCircle, FiHeart, FiPlay, FiArrowLeft, FiAlertTriangle, FiPause } from "react-icons/fi";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';
import { Likes } from '../likes/index';
import { Comments } from '../comments/index';

export function HomeDetail() {
    const { community } = useLoaderData();
    const { user } = useRouteLoaderData('default');
    const navigate = useNavigate();
    const revalidator = useRevalidator();
    // 재생바
    const [previewUrl, setPreviewUrl] = useState(null);

    const { getImages } = useImage();

    dayjs.extend(relativeTime);
    dayjs.locale('ko');


    // 글삭제 api 호출
    const deleteCommunity = async (id) => {
        if (!confirm('게시글을 삭제할까요?')) return;
        try {
            const response = await springBoot.put(`/communities/${id}`);
            revalidator.revalidate();
            navigate('/');
            const result = response.data;
            return result;
        } catch (error) {
            console.log("글 삭제 api 호출 실패", error);
            return null;
        }
    }

    // 팔로우 api 호출
    const follow = async (target) => {
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


    return (
        <div className="w-full max-w-[600px] mx-auto">
            {/* 피드 */}
            <div className="h-12 sticky top-17 bg-white/90 backdrop-blur">
                <div className="max-w-[600px] mx-auto h-12 flex items-center gap-3 px-4">
                    <button onClick={() => navigate(-1)} className="cursor-pointer p-2 -ml-2">
                        <FiArrowLeft className="text-xl" />
                    </button>
                    <div className="font-bold text-lg">뒤로가기</div>
                </div>
            </div>
            {community?.id && community.users &&
                < div className="flex flex-col gap-3" >
                    <div className="bg-white p-5 rounded-lg flex flex-col gap-3 border-1 border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
                                {community.users?.img
                                    ? <img src={community.users?.img} alt="profile" className="w-10 h-10 rounded-full object-cover" />
                                    : community.users?.name?.charAt(0)
                                }
                            </div>
                            <div className='flex flex-col'>
                                <span className="font-bold">{community?.users?.name}</span>
                                <span className="text-gray-500 text-sm">@{community?.users?.account}</span>

                            </div>
                            {user.id && (
                                <div className="ml-auto">
                                    {community?.users?.id === user?.id ? (
                                        <button
                                            className="text-gray-500 hover:text-red-500 font-bold cursor-pointer"
                                            onClick={() => deleteCommunity(community.id)}
                                        >
                                            삭제
                                        </button>
                                    ) : (
                                        <button

                                            className={`border rounded-2xl px-3 py-1 font-semibold cursor-pointer transition-colors ${community?.users?._following
                                                ? 'text-gray-500 border-gray-500 hover:text-red-500 hover:border-red-500 hover:bg-red-50'
                                                : 'bg-blue-500 text-white hover:bg-blue-400'
                                                }`}
                                            onClick={() => {
                                                followOrUnfollow(community?.users?.id, community?.users?._following, community?.users?.name);
                                            }}
                                        >
                                            {community?.users?._following ? '팔로잉' : '팔로우'}
                                        </button>
                                    )}


                                </div>
                            )}

                        </div>


                        {/* 글 내용 */}
                        <div className="text-lg text-gray-900 whitespace-pre-line">{community?.content}</div>

                        {/* 음악 카드 */}
                        {previewUrl && (
                            <audio onEnded={() => setPreviewUrl(null)} controls src={previewUrl} autoPlay className="hidden" />
                        )}
                        {community?.musics && community?.musics.length > 0 && (
                            community?.musics.map((m) => (
                                <div
                                    key={m.id}
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
                                        e.stopPropagation();
                                        { previewUrl === m.preview ? setPreviewUrl(null) : setPreviewUrl(m.preview); }
                                    }}
                                    >{previewUrl === m.preview ?
                                        <FiPause className="inline text-xl text-blue-300 group-hover:text-blue-500" />
                                        :
                                        <FiPlay className="inline text-xl text-blue-300 group-hover:text-blue-500" />}</button>
                                </div>

                            ))
                        )}

                        {/* 사진 */}
                        {/* {community?.images && community?.images.length > 0 && (
                            <div className="mt-3 flex gap-2">
                                {community?.images.map((img) => (
                                    <img
                                        key={img.id}
                                        src={getImages(img)} // DB images 테이블 url 컬럼이 path임
                                        alt={`게시글 이미지${img.id + 1}`}
                                        className="w-full max-w-[160px] h-auto rounded-lg object-cover"
                                    />
                                ))}
                            </div>
                        )} */}

                        {community?.images?.length > 0 && (() => {
                                    const imgs = community.images.slice(0, 4);
                                    

                                    // 1장
                                    if (imgs.length === 1) {
                                        return (
                                            <div className="mt-3 rounded-xl overflow-hidden">
                                                <div>
                                                    <img
                                                        src={getImages(imgs[0])}
                                                        alt=""
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            </div>
                                        );
                                    }

                                    // 2장
                                    if (imgs.length === 2) {
                                        return (
                                            <div className="mt-3 grid grid-cols-2 gap-1 rounded-xl overflow-hidden">
                                                {imgs.map(it => (
                                                    <div key={it.id}>
                                                        <img
                                                            src={getImages(it)}
                                                            alt=""
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    }

                                    // 3장 (왼쪽 크게/오른쪽 위/아래 두 장)
                                    if (imgs.length === 3) {
                                        return (
                                            <div className="mt-3 rounded-xl overflow-hidden">
                                                <div className="grid grid-cols-2 grid-rows-2 gap-1 aspect-[4/3]">
                                                    {/* 왼쪽: 두 행 차지 */}
                                                    <img
                                                        src={getImages(imgs[0])}
                                                        alt=""
                                                        className="col-span-1 row-span-2 w-full h-full object-cover"
                                                        loading="lazy" decoding="async"
                                                    />

                                                    {/* 오른쪽 위/아래 */}
                                                    <img
                                                        src={getImages(imgs[1])}
                                                        alt=""
                                                        className="w-full h-full object-cover"
                                                        loading="lazy" decoding="async"
                                                    />
                                                    <img
                                                        src={getImages(imgs[2])}
                                                        alt=""
                                                        className="w-full h-full object-cover"
                                                        loading="lazy" decoding="async"
                                                    />
                                                </div>
                                            </div>
                                        );
                                    }

                                    // 4장 (2x2)
                                    return (
                                        <div className="mt-3 grid grid-cols-2 gap-1 rounded-xl overflow-hidden">
                                            {imgs.map(it => (
                                                <div key={it.id} className="aspect-[4/3]">
                                                    <img
                                                        src={getImages(it)}
                                                        alt=""
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })()}




                        <span className="text-gray-400 text-xs">{dayjs(community.created_at).format('YYYY년 MM월 DD일, A hh시 mm분')} · 조회수 {community.count}</span>
                        {/* 댓글/좋아요 아이콘들 */}
                        <Likes
                            users={user.id}
                            board_types='1'
                            board={community.id}
                        />
                        <Comments
                            userId={user.id}
                            board_types='1'
                            board={community.id}
                        />
                        
                        <div className="flex items-center gap-8 pt-2 text-gray-400 text-sm border-t border-gray-100">
                            <div className="flex items-center gap-1"><FiMessageCircle className="inline" /> {community.comments}</div>
                            <div className="flex items-center gap-1"><FiHeart className="inline" /> {community.likes}</div>
                            {/* 기타 아이콘 더 필요시 추가 */}
                        </div>
                    </div>
                </div >
            }
        </div >
    )

}