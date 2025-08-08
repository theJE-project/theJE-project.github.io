import { useEffect, useState } from 'react';
import { useNavigate, useParams, useRouteLoaderData } from 'react-router-dom';
import { springBoot } from '../../axios/springboot';
import { useImage } from '../../hooks';
import { FaListUl, FaUserCircle } from 'react-icons/fa';
import { GiConsoleController } from 'react-icons/gi';
import { HiDotsVertical } from 'react-icons/hi';


export { loader } from './loader'

export function GroupDetail() {
    const navigate = useNavigate();
    const { id } = useParams(); // 게시글 id 값 받음
    const { getImages } = useImage(); // 이미지 가져오기
    const { user } = useRouteLoaderData('default'); // 로그인 사용자

    const [playlistData, setPlaylistData] = useState(null); // 플레이리스트데이터
    const [isFollowing, setIsFollowing] = useState(false); // 팔로우
    const [isMenuOpen, setIsMenuOpen] = useState();


    useEffect(() => {
        async function fetchData() {
            try {
                const response = await springBoot.get(`communities/community/${id}`, {
                    params: {
                        user: user.id,
                    }
                });

                if (response.data.users._following !== undefined) {
                    setIsFollowing(response.data.users._following);
                }

                console.log(response.data);
                setPlaylistData(response.data);
            } catch (error) {
                console.error('API 호출 오류:', error);
            }
        }

        fetchData();
    }, [id])

    // 팔로우 
    const handleFollowToggle = async () => {
        if(!user.id){
            alert("로그인 후 이용해주세요")
        }


        try {
            if (!playlistData?.users?.id) return;

            // 언팔로우
            if (isFollowing) {
                const confirmUnfollow = window.confirm("언팔로우 하시겠습니까?");
                if (!confirmUnfollow) return;
                
                await springBoot.delete('followers/delete', {
                    params: {
                        follower: user.id, // 로그인 사용자
                        followee: playlistData.users.id // 상대방
                    }
                });
                setIsFollowing(false);

            } else { // 팔로잉
                await springBoot.post('/followers', {
                    follower: user.id,
                    followee: playlistData.users.id

                });
                setIsFollowing(true);
            }

        } catch (error) {
            console.error(error);
        }
    }

    const toggleMenu = () => {
        setIsMenuOpen(prev => !prev);;
    };

    const handleDelete = async () => {
        const result = confirm("플레이리스트를 삭제하시겠습니까?");

        if (result) {
            await springBoot.delete(`/communities/${id}`);
            alert("삭제가 완료되었습니다.")
            navigate('/group');
        } else {
            return;
        }
    }

    return (
        <div className="flex flex-col items-center min-h-screen">
            {playlistData ? (
                <div className="p-6 w-full max-w-4xl">
                    {/* 대표이미지 */}
                    <div className="w-full mb-6 flex justify-center">
                        <img
                            src={`${playlistData.images.length !== 0
                                ? getImages(playlistData.images[0])
                                : playlistData.musics[0]?.albumCover
                                }`}
                            alt="image error"
                            className="h-48 w-48 object-cover sm:h-80 sm:w-80 rounded-md"
                        />
                    </div>

                    {/* 제목 */}
                    <div className='flex justify-between'>
                        <div className=''>
                            <h1 className="text-3xl font-bold mb-2">{playlistData.title}</h1>
                            <span className="text-sm text-gray-500"> {(() => {
                                const date = new Date(playlistData.created_at);
                                return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
                            })()}</span>

                        </div>
                        {/* 드롭메뉴 */}
                        {user && playlistData.users.id === user.id && (
                            <div className="relative">
                                <button onClick={toggleMenu} className="text-gray-600">
                                    <HiDotsVertical size={18} />
                                </button>

                                {isMenuOpen && (
                                    <div className="absolute right-0 mt-2 bg-white shadow-gray-300 rounded shadow z-10 w-18">
                                        <button
                                            onClick={handleDelete}
                                            className="block w-full text-center px-3 py-2 text-sm hover:bg-red-100 hover:text-red-500 "
                                        >
                                            삭제
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                    </div>

                    {/* 작성자 정보 */}
                    <div className="flex items-center justify-between my-2">
                        <div className="flex items-center gap-2">
                            <div>
                                {playlistData.users.img ? (
                                    <img
                                        src={getImages(playlistData.users.img)}
                                        alt='작성자 프로필'
                                        className='rounded-full object-cover' />
                                ) : (
                                    <FaUserCircle className='text-gray-400' />
                                )}
                            </div>
                            <span className='font-medium'> {playlistData.users.name}</span>

                            {/* 팔로우 버튼 */}
                            {user && playlistData.users.id !== user.id && (
                                <button
                                    onClick={handleFollowToggle}
                                    className={`text-xs px-3 py-0.5 rounded-2xl border ${isFollowing ? 'border-gray-400 text-black bg-gray-200' : 'bg-blue-400 text-white'
                                        }`}
                                >
                                    {isFollowing ? '팔로잉' : '팔로우'}
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
                    <div className="my-2 p-4 bg-blue-200/30 rounded-xl border border-gray-300">
                        <div className='flex justify-between font-medium '>
                            <span className='flex items-center gap-2'><FaListUl />음악 목록</span>
                            <span>{playlistData.musics.length} 곡</span>
                        </div>
                        {playlistData.musics.map((track, index) => (
                            <div
                                key={index}
                                className="flex flex-wrap px-4 py-3 rounded-lg"
                            >
                                <div className='h-full'>
                                    <img src={track.albumCover}
                                        className='h-20 w-20 rounded-xl' />
                                </div>


                                <div className='ml-4 flex flex-col justify-center gap-1 '>
                                    <p className="font-semibold">{track.titleShort}</p>
                                    <p className="text-sm text-gray-400">{track.artistName}</p>
                                </div>
                                {/* <div>
                                        {track.preview && (
                                            <audio controls className='p-0 ' >
                                                <source src={track.preview} type='audio/mpeg' />
                                                브라우저가 오디오를 지원 X
                                            </audio>
                                        )}

                                    </div> */}

                                <div className='ml-auto'>
                                    {/* 음악 재생 버튼 */}
                                    {track.preview && (
                                        <audio controls className='p-0 ' >
                                            <source src={track.preview} type='audio/mpeg' />
                                            브라우저가 오디오를 지원 X
                                        </audio>
                                    )}
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