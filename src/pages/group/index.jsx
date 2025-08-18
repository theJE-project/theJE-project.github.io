import { useState, useEffect } from 'react'
import { TbArrowsUpDown } from 'react-icons/tb';
import axios from 'axios'; // axios 추가
import { springBoot } from '../../axios/springboot';
import { Link, useLoaderData, useNavigate, useRouteLoaderData } from 'react-router-dom';
import { useImage } from '../../hooks';
import { FiPlus, FiPlusCircle } from 'react-icons/fi';


export { loader } from './loader'
export function Group() {
    const navigate = useNavigate();
    const [selectMenu, setSelectMenu] = useState("인기순");
    const [isDropDownOpen, setIsDropDownOpen] = useState(false); // 인기순 최신순 드롭다운

    const [selectGenre, setSelectGenre] = useState("전체"); // 장르 선택
    const [selectMood, setSelectMood] = useState(["전체"]); // 무드 선택
    // const [playlistData, setPlaylistData] = useState([]); // API 응답 데이터 저장
    const playlistData = useLoaderData(); // playList Loader
    const { user } = useRouteLoaderData('default'); // 로그인 사용자
    const { getImages } = useImage();

    const emojiRegex = /\p{Emoji_Presentation}|\p{Emoji}\uFE0F/gu; // 이모지 제거
    // console.log(user)

    // 무드 선택 함수
    const toggleMood = (mood) => {
        if (mood === "전체") {
            // 전체 선택하면 전체만
            setSelectMood(["전체"]);
        } else {
            let newMoods = [...selectMood];

            if (newMoods.includes("전체")) {
                newMoods = [];
            }

            if (newMoods.includes(mood)) {
                // 이미 선택된 거 빼기
                newMoods = newMoods.filter(m => m !== mood);
            } else {
                // 선택 안됐으면 추가
                // setSelectMood([...selectMood, mood]);
                newMoods.push(mood);
            }

            // 배열 비어있으면 처리하는거
            if (newMoods.length === 0) {
                // alert("무드를 선택해주세요"); // alert
                newMoods = ["전체"]; // 선택한거 없으면 전체로 
            }

            setSelectMood(newMoods);
        }

    }

    // 선택한 무드에서 이모지 제거
    const selectMoodCleaned = selectMood.map(mood => mood.replace(emojiRegex, '').trim());

    // 필터 처리
    const filterPlaylists = playlistData.filter(playlist => {
        // DB 해시태그
        const hashArray = playlist.hash?.split(',').map(tag => tag.replace(emojiRegex, '').trim()) || []; // string > 배열로

        // 장르 필터
        const matchesGenre = selectGenre === "전체" || hashArray.includes(selectGenre);

        // 무드 필터
        const matchesMood = selectMoodCleaned.includes("전체") || hashArray.some(tag =>
            selectMoodCleaned.some(mood => tag.includes(mood)));

        return matchesGenre && matchesMood;
    })

    const handleClick = () => {
        if (!user.id) {
            alert("로그인 후 이용해주세요")
            return;
        }
        navigate('/group/create');
    }

    return (
        <div className="p-6 max-w-4xl mx-auto my-5">
            {/* 장르 */}
            <div className="mb-4">
                <p className='pb-2 text-xl font-semibold'>장르</p>
                <div className="flex flex-wrap gap-2">
                    {['전체', 'Pop', '발라드', '댄스', '랩/힙합', 'R&B', '인디음악', '록/메탈', '클래식'].map(genre => (
                        <button type="button" key={genre}
                            onClick={() => setSelectGenre(genre)} // 클릭 시 상태 업데이트
                            className={`px-3 py-1 rounded-md border border-gray-200 shadow-md ${selectGenre === genre ? "bg-blue-500 duration-300 text-white" : "bg-white text-gray-700 font-bold"}`}>{genre}</button>

                    ))}
                </div>
            </div>

            {/* 무드 */}
            <div className="mb-4">
                <p className='pb-2 text-xl font-semibold'>무드</p>
                <div className="flex flex-wrap gap-2">
                    {['전체', '🏖️ 여름', '🎶 신나는', '😎 기분업', '🚗 드라이브', '💻 집중/작업', '💪 운동', '☕ 카페', '✈️ 여행', '🌿 휴식', '💌 위로', '😢 슬픈', '🔥 응원'].map(mood => (
                        <button type="button" key={mood}
                            onClick={() => toggleMood(mood)}
                            className={`px-3 py-1 rounded-md border border-gray-200 shadow-md ${selectMood.includes(mood) ? "bg-amber-500 duratation-300 text-white" : "bg-white text-gray-700"}`}>{mood}</button>
                    ))}
                </div>
            </div>

            {/* 추천 플레이리스트 */}
            <div className="my-10">
                {/* 상단 */}
                <div className='flex flex-col sm:flex-row justify-between'>
                    <h2 className="text-2xl font-semibold py-2">추천 플레이리스트</h2>

                    <div className='flex justify-between items-center sm:w-auto'>
                        <button onClick={handleClick} className='px-3 py-1 flex bg-blue-100 text-gray-700 rounded-xl cursor-pointer gap-1 hover:bg-gray-300 hover:text-black'><span>새 플레이리스트</span><FiPlus size={20} className='' /></button>

                        <div className='relative inline-block'>
                            <button onClick={() => setIsDropDownOpen(!isDropDownOpen)}
                                className="flex items-center gap-1 px-3 py-1 rounded-md cursor-pointer">{selectMenu}<TbArrowsUpDown /></button>

                            {isDropDownOpen && (
                                <div className="absolute top-full right-0 mt-2 w-28 bg-white rounded-md shadow-md z-10">
                                    {["인기순", "최신순"].map(option => (
                                        <button key={option}
                                            onClick={() => {
                                                setSelectMenu(option);
                                                setIsDropDownOpen(false);
                                            }}
                                            className={`block w-full text-left px-4 py-2 hover:bg-gray-300 ${selectMenu === option ? "text-blue-500 font-semibold" : ""
                                                }`}>
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {console.log(playlistData)}

                {/* 플레이리스트 목록 */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 justify-items-center">
                    {filterPlaylists.map((playlist, index) => (
                        <div key={index} className="rounded-lgoverflow-hidden cursor-pointer w-full"
                            onClick={() => navigate(`/group/${playlist.id}`)}>
                            <div className='p-3 aspect-square  overflow-hidden'>
                                <img
                                    src={`${playlist.images.length !== 0
                                        ? getImages(playlist.images[0])
                                        : playlist.musics[0]?.albumCover
                                        }`}
                                    alt="image error"
                                    className="rounded-md object-cover w-full h-full"
                                />

                            </div>
                            <h3 className="py-2 text-lg font-semibold ">{playlist.title}</h3>
                            <p className="line-clamp-2 max-w-full overflow-hidden">
                                {playlist.hash?.split(',').map((tag, index) => tag ? (
                                    <span key={index} className="inline-block my-1 px-1 mr-1 break-words text-blue-500 bg-gray-200 rounded-md "> #{tag}</span>
                                ) : null)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
} 