import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation, useRouteLoaderData } from 'react-router-dom';
import { MdOutlineAddPhotoAlternate, MdOutlineFileUpload, MdOutlineLibraryMusic } from 'react-icons/md';
import { RiMusicAiLine } from 'react-icons/ri';
import { IoClose } from 'react-icons/io5';
import { springBoot } from '../../axios/springboot';
import { useImage } from '../../hooks';
import { useMusic } from '../../hooks/useMusics';
import { FiPause, FiPlay, FiPlus, FiX } from 'react-icons/fi';

export { loader } from './loader';

export function GroupUpdate() {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();

    const { user } = useRouteLoaderData('default'); // 로그인 사용자 
    const { images, setImages, getImages, resetImages } = useImage(); // 이미지 훅
    const { musics, getMusics } = useMusic(); // music 훅

    // 수정 대상 데이터 (수정페이지로 라우팅 시 state로 넘긴 playlistData)
    const playlistData = location.state?.playlistData;

    // 폼 상태
    const [previewUrls, setPreviewUrls] = useState([]); // 이미지 미리보기 url
    const [musicList, setMusicList] = useState([]); // music List 상태
    const [musicSearch, setMusicSearch] = useState(''); // music 검색 
    const [previewUrl, setPreviewUrl] = useState(null); // music 미리듣기 

    const [title, setTitle] = useState(''); // 제목
    const [description, setDescription] = useState(''); // 설명
    const [visibility, setVisibility] = useState(true); // 공개 여부
    const [tagInput, setTagInput] = useState(''); // 태그 입력
    const [tagList, setTagList] = useState([]); // 태그 리스트
    const [tagError, setTagError] = useState(''); // 태그 경고
    const [imageList, setImageList] = useState([]); // 기존 이미지 저장용

    // 플레이리스트 초기값 세팅
    useEffect(() => {
        if (playlistData) {
            // music 세팅: music 속성 및 형태 변환
            const changeMusicList = (playlistData.musics || []).map(music => ({
                ...music,
                id: null,
                url: music.id,
            }));
            
            // 이미지 세팅: 기존 서버 이미지 주소 배열을 previewUrls로 설정
            if (playlistData.images?.length > 0) {
                const serverImageUrls = playlistData.images.map(img => getImages(img));
                setPreviewUrls(serverImageUrls); // 미리보기용
                setImageList(playlistData.images); 

                console.log("이미지 출력", playlistData.images);
            } else {
                setPreviewUrls([]);
                setImageList([]);
            }

            // 데이터 세팅
            setTitle(playlistData.title || '');
            setDescription(playlistData.content || '');
            setVisibility(playlistData.is_visible ?? true);
            setTagList(playlistData.hash ? playlistData.hash.split(',').filter(Boolean) : []);
            setMusicList(changeMusicList);

        }
    }, [playlistData]);

    // 태그 입력 Enter 처리
    const enterTags = (e) => {
        if (e.key === 'Enter' && tagInput.trim() !== '') {
            e.preventDefault();

            if (tagList.length >= 20) {
                setTagError('※태그는 최대 20개까지 입력할 수 있습니다.');
                return;
            }

            const newTag = tagInput.trim();
            if (!tagList.includes(newTag)) {
                setTagList([...tagList, newTag]);
                setTagError("");
            }
            setTagInput("");
        }
    };

    // 태그 삭제
    const deleteTags = (tagDelete) => {
        const newTagList = tagList.filter((tag) => tag !== tagDelete);
        setTagList(newTagList);
        if (newTagList.length <= 20) {
            setTagError("");
        }
    };

    // 이미지 업로드 핸들러
    const handleImage = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        await resetImages();

        // 이미지 미리보기
        const localUrl = URL.createObjectURL(file);

        // 수정 시 대표이미지 1개만 사용
        setPreviewUrls([localUrl]);

        await setImages(e); // 기존 배열 무시하고 파일 1개만 저장
        setImageList([]); // 새 이미지 업로드하면 기존 서버 이미지 초기화
    };

    useEffect(() => {
        console.log("이미지 변경 콘솔:", images)
    }, [images])

    // 음악 검색 핸들러
    const handleMusicSearch = (e) => {
        const value = e.target.value;
        setMusicSearch(value);
        getMusics(value);
    };

    // 음악 추가
    const addMusic = (music) => {
        if (musicList.find(m => m.url === music.url)) return;
        setMusicList(prev => [...prev, music]); // 리스트에 추가

        // 검색창 초기화
        setMusicSearch("");
        getMusics("");
    };


    // 음악 삭제
    const deleteMusic = (music) => {
        setMusicList(prev => prev.filter(m => m.url !== music.url));
    };

    // 재생시간 변환 함수
    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // 수정 폼 제출
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title) {
            alert('플레이리스트 제목을 입력해주세요');
            return;
        }
        if (musicList.length === 0) {
            alert('음악을 추가해주세요');
            return;
        }

        const data = {
            users: user.id,
            categories: 2,
            //
            images: imageList.length > 0? imageList : images, 
            title,
            content: description,
            is_visible: visibility,
            hash: tagList.join(','),
            musics: musicList,
        };

        console.log(data);

        try {
            await springBoot.put(`/communities/update/${id}`, data);
            alert('플레이리스트가 수정되었습니다.');
            navigate(`/group/${id}`);
        } catch (error) {
            console.error('수정 중 오류:', error);
            alert('수정에 실패했습니다.');
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-6 py-10">
            <div className="mb-8">
                <h1 className="flex items-center text-3xl font-bold py-2 gap-2">
                    <RiMusicAiLine />플레이리스트 수정<RiMusicAiLine />
                </h1>
                <p className="text-lg text-gray-700 font-medium">플레이리스트 정보를 수정하고 저장하세요</p>
            </div>

            <div className="bg-white border border-gray-400 rounded-xl shadow p-6 mb-10">
                <h2 className='text-lg font-semibold pb-4'>플레이리스트 정보</h2>


                {/* 대표이미지 */}
                <div className="mb-4">
                    <label className="block font-medium mb-1">대표이미지</label>
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
                                        <img key={index} src={url} alt={`preview-${index}`} className="object-cover w-full h-full" />
                                    ))
                                )}
                                <input type="file" id="file-upload" accept="image/*" onChange={handleImage} className="hidden" />
                            </label>
                        </div>
                        <div className="flex flex-col gap-4">
                            <label
                                htmlFor="file-upload"
                                className="w-fit cursor-pointer py-2 px-4 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-100 hover:border-gray-500 transition duration-300"
                            >
                                이미지 업로드
                            </label>
                            <p className="text-xs text-gray-400 mt-1">JPG, PNG 파일만 업로드 가능합니다.</p>
                        </div>
                    </div>
                </div>

                {/* 제목 */}
                <div className="mb-4">
                    <label className="block font-medium mb-1">플레이리스트 제목 *</label>
                    <input
                        type="text"
                        onChange={(e) => setTitle(e.target.value)}
                        value={title}
                        maxLength={30}
                        className="w-full border border-gray-300 px-4 py-2 rounded-md"
                        placeholder="플레이리스트 제목을 입력하세요 ( 최대 30자 )"
                    />
                </div>

                {/* 설명 */}
                <div className="mb-4">
                    <label className="block font-medium mb-1">설명</label>
                    <textarea
                        onChange={(e) => setDescription(e.target.value)}
                        value={description}
                        maxLength={300}
                        className="w-full px-4 py-2 rounded-md resize-none h-28 border border-gray-300"
                        placeholder="플레이리스트에 대한 설명을 입력하세요"
                    />
                    <div className="text-sm text-right text-gray-400">{description.length}/300</div>
                </div>

                {/* 태그 */}
                <div className="gap-6 mb-4">
                    <div className="flex gap-2 items-center">
                        <label className="block font-medium mb-1">태그</label>
                        {tagError && <p className="text-sm text-red-500">{tagError}</p>}
                    </div>
                    <div className="flex flex-col md:flex-row justify-between">
                        <input
                            type="text"
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={enterTags}
                            value={tagInput}
                            className="w-1/2 border border-gray-300 px-4 py-2 rounded-md"
                            placeholder="ex) 팝, 듀엣, 빌보드"
                        />
                        {/* 공개 설정 */}
                        <div className="flex gap-6 items-center">
                            <label className="font-medium">공개 설정</label>
                            <label className="flex items-center gap-1 text-sm">
                                <input
                                    type="radio"
                                    name="visibility"
                                    value="public"
                                    checked={visibility === true}
                                    onChange={() => setVisibility(true)}
                                />
                                공개
                            </label>
                            <label className="flex items-center gap-1 text-sm">
                                <input
                                    type="radio"
                                    name="visibility"
                                    value="private"
                                    checked={visibility === false}
                                    onChange={() => setVisibility(false)}
                                />
                                비공개
                            </label>
                        </div>
                    </div>
                    {tagList.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {tagList.map((tags, idx) => (
                                <span key={idx} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm">
                                    #{tags}
                                    <button onClick={() => deleteTags(tags)} className="ml-2">
                                        <IoClose />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* 음악 검색 */}
                {previewUrl && (
                                        <audio
                                            controls
                                            src={previewUrl}
                                            autoPlay
                                            className="hidden"
                                            onEnded={() => setPreviewUrl(null)}
                                        />
                                    )}
                <div className="mb-4">
                    <label className="block font-medium mb-1">음악 추가</label>
                    <input
                        type="text"
                        placeholder="음악을 검색하세요"
                        value={musicSearch}
                        onChange={handleMusicSearch}
                        className="w-full border border-gray-300 rounded-md px-4 py-2"
                    />
                    <div className="my-2 max-h-70 overflow-y-auto rounded">
                        {musics.length === 0 && musicSearch.trim() !== '' && <p>검색 결과가 없습니다.</p>}

                        {musics.map((music, index) => (
                            <div
                                key={music.url ?? index}
                                className="flex my-2 p-1 border border-gray-300 rounded-md bg-white items-center"
                            >

                                <div className="m-2 w-20 h-20">
                                    <img src={music.albumCover} className="w-full h-full object-cover rounded-xl" />
                                </div>
                                <div className="flex flex-col justify-center">
                                    <p className="text-base font-semibold">{music.titleShort}</p>
                                    <p className="text-gray-700">{music.artistName}</p>
                                </div>
                                <div className="flex ml-auto gap-2">
                                    <p className="text-sm text-gray-500">{formatDuration(music.duration)}</p>
                                    <button
                                        type="button"
                                        className="text-blue-500"
                                        onClick={() =>
                                            previewUrl === music.preview ? setPreviewUrl(null) : setPreviewUrl(music.preview)
                                        }
                                    >
                                        {previewUrl === music.preview ? <FiPause size={20} /> : <FiPlay size={20} />}
                                    </button>
                                    
                                    <button
                                        onClick={() => {addMusic(music); setPreviewUrl(null)}}
                                        disabled={musicList.find((m) => m.url === music.url) !== undefined}
                                        className="text-blue-500 disabled:text-gray-400"
                                    >
                                        <FiPlus size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 음악 목록 */}
                <div className="mb-4">
                    <div className="flex justify-between">
                        <label className="block font-medium mb-1">음악 목록</label>
                        <p className="text-gray-700">{musicList.length} 곡</p>
                    </div>
                    <div className="border border-gray-300 rounded-xl max-h-96 overflow-y-auto">
                        {musicList.length === 0 && (
                            <div className="h-40 flex flex-col items-center justify-center gap-2 text-gray-500">
                                <MdOutlineLibraryMusic size={30} />
                                <p className="text-lg">좋아하는 음악을 추가해보세요</p>
                            </div>
                        )}
                        {musicList.length > 0 && (
                            <div className="grid">
                                {musicList.map((music) => (
                                    <div key={music.url} className="flex my-2 p-1 rounded-md bg-white items-center">
                                        <div className="m-2 h-20 w-20">
                                            <img src={music.albumCover} className="w-full h-full rounded-xl" />
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="font-semibold">{music.titleShort}</p>
                                            <p className="text-gray-700">{music.artistName}</p>
                                        </div>
                                        <button onClick={() => deleteMusic(music)} className="ml-auto pr-2 text-gray-700">
                                            <FiX size={20} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* 하단 버튼 */}
                <div className="flex justify-between gap-4">
                    <button
                        type="button"
                        className="px-4 py-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-200"
                        onClick={() => navigate(-1)}
                    >
                        취소
                    </button>
                    <button type="button" onClick={handleSubmit} className="px-4 py-2 rounded-md bg-blue-400 text-white hover:bg-blue-600">
                        플레이리스트 수정
                    </button>
                </div>
            </div>
        </div>
    );
}
