import { useEffect, useState } from 'react';
import { useParams, useRouteLoaderData } from 'react-router-dom';
import { springBoot } from '../../axios/springboot';
import { useImage } from '../../hooks';
import { FaListUl, FaUserCircle } from 'react-icons/fa';


export { loader } from './loader'

export function GroupDetail() {
    const { id } = useParams(); // 게시글 id 값 받음
    const { getImages } = useImage(); // 이미지 가져오기

    const { user } = useRouteLoaderData('default'); // 로그인 사용자
    const [playlistData, setPlaylistData] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);


    useEffect(() => {
        async function fetchData() {
            try {
                const response = await springBoot.get(`communities/community/${id}`);
                setPlaylistData(response.data);

                if (response.data.users.isFollowing !== undefined) {
                    setIsFollowing(response.data.users.isFollowing);
                }

                console.log(response.data);
            } catch (error) {
                console.error('API 호출 오류:', error);
            }
        }

        fetchData();
    }, [id])

    return (
        <div className="flex flex-col items-center p-6 min-h-screen">
            {playlistData ? (
                <div className="w-full max-w-4xl">
                    {/* 대표이미지 */}
                    <div className="w-full mb-6 flex justify-center">
                        <img
                            src={`${playlistData.images.length !== 0
                                ? getImages(playlistData.images[0])
                                : playlistData.musics[0]?.albumCover
                                }`}
                            alt="image error"
                            className=" object-cover h-80 w-80 rounded-md"
                        />
                    </div>

                    {/* 제목 */}
                    <h1 className="text-3xl font-bold mb-2">{playlistData.title}</h1>
                    <span className="text-xs">{playlistData.created_at}</span>

                    {/* 작성자 정보 */}
                    <div className="flex items-center justify-between my-2">
                        <div className="flex items-center gap-2">
                            <div>
                                {playlistData.users.img ? (
                                    <img
                                        src={playlistData.users.img}
                                        className='rounded-full object-cover' />
                                ) : (
                                    <FaUserCircle className='text-gray-400' />
                                )}
                            </div>
                            <span className='font-medium'> {playlistData.users.name}</span>

                            {user && playlistData.users.id !== user.id && (
                                <button
                                    className={`text-xs px-3 py-0.5 rounded border ${isFollowing ? 'border-gray-400 text-gray-300' : 'border-blue-500 text-blue-500'
                                        }`}
                                >
                                    {isFollowing ? '팔로잉' : '언팔로우'}
                                </button>
                            )}
                        </div>

                    </div>

                    {/* 설명 */}
                    <div className='my-4'>
                        <p className="pb-2 text-gray-800 ">{playlistData.content}</p>
                        <p className="">
                            {playlistData.hash?.split(',').map((tag, index) => tag ? (
                                <span key={index} className="inline-block my-1 px-1 mr-1 text-blue-500 bg-gray-200 rounded-md "> #{tag}</span>
                            ) : null)}
                        </p>

                    </div>

                    {/* 음악 리스트 */}
                    <div className="my-2 p-4 bg-lime-100/50 rounded-xl border border-gray-300">
                        <div className='flex justify-between font-medium '>
                            <span className='flex items-center gap-2'><FaListUl />음악 목록</span>
                            <span>{playlistData.musics.length} 곡</span>
                        </div>
                        {playlistData.musics.map((track, index) => (
                            <div
                                key={index}
                                className="flex px-4 py-3 rounded-lg"
                            >
                                <div className='h-full w-20'>
                                    <img src={track.albumCover}
                                        className='rounded-xl' />
                                </div>

                                <div className='flex justify-between items-center w-full'>
                                    <div className='ml-4 flex flex-col gap-'>
                                        <p className="font-semibold">{track.titleShort}</p>
                                        <p className="text-sm text-gray-400">{track.artistName}</p>
                                    </div>
                                    <div>
                                        {/* 음악 재생 버튼 */}
                                        {track.preview && (
                                            <audio controls className='p-0 ' >
                                                <source src={track.preview} type='audio/mpeg' />
                                                브라우저가 오디오를 지원 X
                                            </audio>
                                        )}

                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <p className="text-gray-400">로딩 중...</p>
            )}
        </div>
    );
}