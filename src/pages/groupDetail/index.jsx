import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { springBoot } from '../../axios/springboot';
import { useImage } from '../../hooks';


export { loader } from './loader'

export function GroupDetail() {
    const { id } = useParams(); // 게시글 id 값 받음
    const { getImages } = useImage(); // 이미지 가져오기

    // const { user } = useRouteLoaderData('default'); // 로그인 사용자
    const [playlistData, setPlaylistData] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);


    useEffect(() => {
        async function fetchData() {
            try {
                const response = await springBoot.get(`communities/community/${id}`);
                setPlaylistData(response.data);
                console.log(response.data);
            } catch (error) {
                console.error('API 호출 오류:', error);
            }
        }

        fetchData();
    }, [id])

    const handleFollowToggle = () => {
        setIsFollowing(prev => !prev);
        // 여기서 실제 팔로우 API 호출도 함께 처리하면 좋음
    };

    return (
        <div className="flex flex-col items-center p-6 min-h-screen">
            {playlistData ? (
                <div className="w-full max-w-4xl">
                    {/* 이미지 */}
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
                            <span className="text-sm text-gray-700">{playlistData.users.img}{playlistData.users.name}</span>
                            <button
                                className={`text-xs px-2 py-1 rounded border ${isFollowing ? 'border-gray-400 text-gray-300' : 'border-blue-500 text-blue-500'
                                    }`}
                                onClick={handleFollowToggle}
                            >
                                {isFollowing ? '팔로잉' : '팔로우'}
                            </button>
                        </div>
                        
                    </div>

                    {/* 설명 */}
                    <p className="mb-6 ">{playlistData.content}</p>

                    {/* 음악 리스트 */}
                    <div className="my-2 border">
                        <div className='flex justify-between'>
                            <span>음악 목록</span>
                            <span>{playlistData.musics.length} 곡</span>
                        </div>
                        {playlistData.musics.map((track, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between px-4 py-3 rounded-lg"
                            >
                                <div>
                                    <p className="font-semibold">{track.titleShort}</p>
                                    <p className="text-sm text-gray-400">{track.artistName}</p>
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