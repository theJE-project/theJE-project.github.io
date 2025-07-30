import { useState } from 'react'
import { TbArrowsUpDown } from 'react-icons/tb';
import { useLocation } from 'react-router-dom';

export { loader } from './loader'
export function Group() {
    const [selectMenu, setSelectMenu] = useState("인기순");
    const [isDropDownOpen, setIsDropDownOpen] = useState(false); // 인기순 최신순 드롭다운

    const [selectGenre, setSelectGenre] = useState("전체"); // 장르 선택
    const [selectMood, setSelectMood] = useState([]); // 무드 선택

    // 테스트 
    const location = useLocation();
    const data = location.state;
    if (data) {
        console.log(data);

    }

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
                alert("무드를 선택해주세요"); // alert
                // newMoods =["전체"]; // 선택한거 없으면 전체로 
            }

            setSelectMood(newMoods);
        }

    }

    return (
        <div className="max-w-7xl mx-auto my-5">

            {/* 장르 */}
            <div className="mb-4">
                <p className='pb-2 text-xl font-semibold'>장르</p>
                <div className="flex flex-wrap gap-2">
                    {['전체', 'Pop', '발라드', '댄스', '랩/힙합', 'R&B', '인디음악', '록/메탈', '클래식'].map(genre => (
                        <button key={genre}
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
                        <button key={mood}
                            onClick={() => toggleMood(mood)}
                            className={`px-3 py-1 rounded-md border border-gray-200 shadow-md ${selectMood.includes(mood) ? "bg-amber-500 duratation-300 text-white" : "bg-white text-gray-700"}`}>{mood}</button>
                    ))}
                </div>
            </div>

            {/* 추천 플레이리스트 */}
            <div className="my-10">
                {/* 상단 */}
                <div className='flex justify-between'>
                    <h2 className="text-3xl font-semibold py-2">추천 플레이리스트</h2>
                    <div className='relative'>
                        <button onClick={() => setIsDropDownOpen(!isDropDownOpen)}
                            className="flex items-center gap-1 text-blue-500 px-3 py-1 rounded-md cursor-pointer">{selectMenu}<TbArrowsUpDown /></button>

                        {isDropDownOpen && (
                            <div className="absolute right-0 mt-2 w-28 bg-white rounded-md shadow-md z-10">
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

                {/* 플레이리스트 목록 */}
                <div>
                    <div>
                        <p>제목: {data?.title}</p>
                        <p>설명: {data?.description}</p>
                        <p>태그: {data?.tagList?.join(', ')}</p>
                        <p>공개 여부: {data?.visibility ? "공개" : "비공개"}</p>
                    </div>
                </div>
            </div>
        </div>
    )
} 