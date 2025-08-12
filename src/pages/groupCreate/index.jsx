import { isValidElement, useEffect, useRef, useState } from 'react'
import { data, useNavigate, useParams, useRouteLoaderData } from 'react-router-dom'
import { MdOutlineAddPhotoAlternate, MdOutlineFileUpload, MdOutlineLibraryMusic } from 'react-icons/md'
import { RiMusicAiLine } from 'react-icons/ri'
import { IoClose } from 'react-icons/io5'
import { springBoot } from '../../axios/springboot'
import { useImage } from '../../hooks'
import { useMusic } from '../../hooks/useMusics'
import { FaPlayCircle, FaRegPauseCircle } from 'react-icons/fa'
export { loader } from './loader'

export function GroupCreate() {
    const navigate = useNavigate();
    const { user } = useRouteLoaderData('default'); // 로그인 사용자

    const { images, setImages, getImages } = useImage(); // 이미지 훅
    const [previewUrls, setPreviewUrls] = useState([]);
    const [fallbackImages, setFallbackImages] = useState([]); // 앨범커버 이미지

    const { musics, getMusics } = useMusic(); // music 훅 (음악 가져오기)
    const [music, setMusics] = useState(); // 결과 저장?
    const [musicList, setMusicList] = useState([]); // 음악 리스트
    const [musicSearch, setMusicSearch] = useState(""); // 음악 검색

    const [title, setTitle] = useState(""); // 제목
    const [description, setDescription] = useState(""); // 설명
    const [visibility, setVisibility] = useState(true); // 공개 여부
    const [tagInput, setTagInput] = useState(""); // 태그(태그 입력창)
    const [tagList, setTagList] = useState([]); // 태그 배열


    // api 연결
    const fetchPlaylistData = async (data) => {
        try {
            const response = await springBoot.post('/communities', data);

            // setPlaylistData(response.data);
            console.log(response.data);

        } catch (error) {
            console.error('API 호출 오류:', error);
        }
    }

    // 폼제출
    const handleSubmit = async(e) => {
        e.preventDefault();

        if (!title) {
            alert("플레이리스트 제목을 입력해주세요");
            return;
        }

        if (musicList.length === 0) {
            alert("음악을 추가해주세요");
            return;
        }

        const data = {
            users: user.id,
            categories: 2,
            images: images,
            title: title,
            content: description,
            is_visible: visibility,
            hash: tagList.join(','),
            musics: musicList,
        }

        console.log(data);

        try {
            await fetchPlaylistData(data);
            navigate('/group');
        } catch (error) {
            
        }
    };

    // 태그 enter 처리
    const enterTags = (e) => {
        if (e.key === "Enter" && tagInput.trim() !== "") {
            e.preventDefault(); // 폼 제출 막음
            const newTag = tagInput.trim();

            if (!tagList.includes(newTag)) {
                setTagList([...tagList, newTag]); // 태그 추가
            }

            setTagInput(""); // 입력창 초기화
        }
    }

    // 태그 삭제
    const deleteTags = (tagDelete) => {
        setTagList(tagList.filter((tags) => (tags) !== tagDelete)); // 선택한 태그 삭제
    }

    // 이미지 처리 핸들러
    const handleImage = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // 미리보기 preview
        const localUrl = URL.createObjectURL(file);
        setPreviewUrls([localUrl]);

        await setImages(e);
    }

    // 음악 검색 handler
    const handleMusicSearch = (e) => {
        const value = e.target.value;
        setMusicSearch(value);
        getMusics(value); // api 요청
    }

    // 음악 추가 함수
    const addMusic = (music) => {
        // 중복 체크
        if (musicList.find(m => m.url === music.url)) return;
        setMusicList(prev => [...prev, music]); // 리스트에 추가

        // 검색창 초기화
        setMusicSearch(""); // 검색창 초기화
        getMusics(""); // 검색결과 초기화
    }

    // 음악 삭제 함수
    const deleteMusic = (music) => {
        setMusicList(prev => prev.filter(m => m.url !== music.url));
    };

    return (

        <div className='max-w-5xl mx-auto px-6 py-10'>
            <div className="mb-8">

                <h1 className="flex items-center text-3xl font-bold py-2 gap-2 "><RiMusicAiLine />새 플레이리스트 만들기<RiMusicAiLine /></h1>
                <p className="text-lg text-gray-700 font-medium">나만의 플레이리스트를 만들고, 다른 사람들과 음악 이야기를 나누세요</p>
            </div>

            <div className='bg-white border border-gray-400 rounded-xl shadow p-6 mb-10'>
                <h2 className='text-lg font-semibold pb-4'>플레이리스트 정보</h2>

                {/* 대표이미지 */}
                <div className='mb-4'>
                    <label className='block font-medium mb-1'>대표이미지</label>
                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md w-64 h-64">
                            <label className="flex flex-col items-center gap-2 cursor-pointer text-gray-500">
                                {previewUrls.length === 0 ? (
                                    <>
                                        <MdOutlineAddPhotoAlternate size={40} />
                                        이미지 없음
                                    </>
                                ) : (
                                    previewUrls.map((url, index) => (
                                        <img
                                            key={index}
                                            src={url}
                                            alt={`preview-${index}`}
                                            className="object-cover w-full h-full"
                                        />
                                    ))
                                )}

                            </label>
                        </div>
                        <div className="flex flex-col gap-4">
                            <label
                                htmlFor="file-upload"
                                className="w-fit cursor-pointer py-2 px-4 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-100 hover:border-gray-500 transition duration-300"
                            >
                                <input type="file" id="file-upload" accept="image/*"
                                    onChange={handleImage}
                                    className="hidden" />
                                <div className="flex justify-center items-center gap-2">
                                    <MdOutlineFileUpload />
                                    <span>이미지 업로드</span>
                                </div>
                            </label>
                            <p className="text-xs text-gray-400 mt-1">JPG, PNG 파일만 업로드 가능합니다.</p>
                        </div>
                    </div>
                </div>

                {/* 제목 */}
                <div className='mb-4'>
                    <label className='block font-medium mb-1'>플레이리스트 제목 *</label>
                    <input type="text"
                        onChange={(e) => setTitle(e.target.value)}
                        maxLength={30}
                        className="w-full border border-gray-300 px-4 py-2 rounded-md"
                        placeholder='플레이리스트 제목을 입력하세요 ( 최대 30자 )' />
                </div>

                {/* 설명  */}
                <div className='mb-4'>
                    <label className='block font-medium mb-1'>설명</label>
                    <textarea
                        onChange={(e) => setDescription(e.target.value)}
                        maxLength={300}
                        className="w-full px-4 py-2 rounded-md resize-none h-28 border border-gray-300"
                        placeholder="플레이리스트에 대한 설명을 입력하세요" />
                    <div className="text-sm text-right text-gray-400">{description.length}/300</div>
                </div>

                {/* 태그  */}
                <div className="gap-6 mb-4">
                    {/* 태그 입력 */}
                    <label className='block font-medium mb-1'>태그</label>
                    <div className="flex flex-col md:flex-row justify-between">
                        <input type="text"
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={enterTags}
                            value={tagInput} // <input> 상태가 tagInput과 동기화 되도록
                            className="w-1/2 border border-gray-300 px-4 py-2 rounded-md"
                            placeholder='ex) 팝, 듀엣, 빌보드' />

                        {/* 공개 설정 */}
                        <div className="flex gap-6 items-center">
                            <label className="font-medium">공개 설정</label>
                            <label className="flex items-center gap-1 text-sm">
                                <input type="radio"
                                    name="visibility"
                                    value="public" defaultChecked
                                    onChange={() => setVisibility(true)} />
                                공개
                            </label>
                            <label className="flex items-center gap-1 text-sm">
                                <input type="radio"
                                    name="visibility"
                                    value="private"
                                    onChange={() => setVisibility(false)} />
                                비공개
                            </label>
                        </div>
                    </div>
                    {/* 태그 입력 목록(배열) */}
                    {tagList.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {tagList.map((tags, idx) => (
                                <span key={idx} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm">
                                    #{tags}
                                    <button
                                        onClick={() => deleteTags(tags)} // 클릭 시 해당 태그 삭제
                                        className="ml-2"
                                    >
                                        <IoClose />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* 음악검색 컴포넌트 자리~ */}
                <div className="mb-4">
                    <label className="block font-medium mb-1">음악 추가</label>
                    <div>
                        <input type='text'
                            placeholder='음악을 검색하세요'
                            value={musicSearch}
                            onChange={handleMusicSearch}
                            className='w-full border border-gray-300 rounded-md px-4 py-2'
                        />

                        {/* 음악 결과 목록 */}
                        <div className="my-2 max-h-70 overflow-y-auto bg-gray-100 rounded">
                            {musics.length === 0 && musicSearch.trim() !== "" && <p>검색 결과가 없습니다.</p>}
                            {musics.map((music) => (
                                <div key={music.url} className="flex my-2 p-1 border border-gray-300 rounded-md bg-white">
                                    <div className='m-2 w-20 h-20'>
                                        <img src={music.albumCover}
                                            className='w-full h-full object-cover rounded-xl' />
                                    </div>

                                    <div className='flex flex-col justify-center'>
                                        <div className='flex my-1'>
                                            <p className='text-base font-semibold'>{music.titleShort}</p>
                                            <p>{music.duration}</p>
                                        </div>
                                        <p className=''>{music.artistName}</p>
                                        {/* 음악 재생 버튼 */}
                                        {music.preview && (
                                            <audio controls className='p-0' >
                                                <source src={music.preview} type='audio/mpeg' />
                                                브라우저가 오디오를 지원 X
                                            </audio>
                                        )}
                                    </div>

                                    <button onClick={() => addMusic(music)}
                                        disabled={musicList.find(m => m.url === music.url) !== undefined}
                                        className="text-sm text-blue-600 disabled:text-gray-400">
                                        {musicList.find(m => m.url === music.url) ? '추가됨' : '추가'}
                                    </button>
                                </div>

                            ))}
                        </div>
                    </div>

                </div>

                {/* 음악 목록 */}
                <div className='mb-4'>
                    <div className='flex justify-between'>
                        <label className="block font-medium mb-1">음악 목록</label>
                        <p className='text-gray-700'>{musicList.length} 곡</p>
                    </div>
                    
                    <div className='border border-gray-300 rounded-xl max-h-96 overflow-y-auto'>
                        {musicList.length === 0 && <div className='h-40 flex flex-col items-center justify-center gap-2 text-gray-500 '> <MdOutlineLibraryMusic size={30} className='' /> <p className='text-lg '>좋아하는 음악을 추가해보세요</p></div>}
                        {/* 음악 입력 목록(배열) */}
                        {musicList.length > 0 && (
                            <div className="grid">
                                {musicList.map((music) => (
                                    <div key={music.url} className="flex">
                                        <div className='m-2 h-20 w-20'>
                                            <img src={music.albumCover}
                                                className='w-full h-full rounded-xl' />
                                        </div>

                                        <div className='flex flex-col'>
                                            <div className='flex'>
                                                <p className='text-lg font-semibold'>{music.titleShort}</p>
                                                <p>{music.duration}</p>
                                            </div>
                                            <p className=''>{music.artistName}</p>
                                            {/* 음악 재생 버튼 */}
                                            {/* {music.preview && (
                                                <audio controls >
                                                    <source src={music.preview} type='audio/mpeg' />
                                                    브라우저가 오디오를 지원 X
                                                </audio>
                                            )} */}
                                        </div>
                                        <button
                                            onClick={() => deleteMusic(music)} // 클릭 시 해당 태그 삭제
                                            className="ml-2"
                                        >
                                            <IoClose />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>


                {/* 하단 버튼 */}
                <div className="flex justify-between gap-4">
                    <button className="px-4 py-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-200">취소</button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 rounded-md bg-blue-400 text-white hover:bg-blue-600">플레이리스트 생성</button>
                </div>
            </div>

        </div>
    )
}