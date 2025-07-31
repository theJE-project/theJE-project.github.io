import { isValidElement, useEffect, useState } from 'react'
import { data, useParams } from 'react-router-dom'
import { MdOutlineAddPhotoAlternate, MdOutlineFileUpload } from 'react-icons/md'
import { RiMusicAiLine } from 'react-icons/ri'
import { IoClose } from 'react-icons/io5'
import { springBoot } from '../../axios/springboot'
export { loader } from './loader'

export function GroupOptions() {
    const [imageFile, setImageFile] = useState(null); // 이미지
    const [title, setTitle] = useState(""); // 제목
    const [description, setDescription] = useState(""); // 설명
    const [visibility, setVisibility] = useState(true); // 공개 여부
    const [tagInput, setTagInput] = useState(""); // 태그(태그 입력창)
    const [tagList, setTagList] = useState([]); // 태그 배열
    const { options } = useParams();

    // api 연결
    const fetchPlaylistData = async (data) => {
        try {
            const response = await springBoot.post(`group/${options}`, data);

            // setPlaylistData(response.data);
            console.log(response.data);

        } catch (error) {
            console.error('API 호출 오류:', error);
        }
    }

    // useEffect (()=> {
    //     fetchPlaylistData();
    // }, []);

    // 폼제출
    const handleSubmit = (e) => {

        e.preventDefault();

        if (!title) {
            alert("플레이리스트 제목을 입력해주세요");
            return;
        }

        const data = {
            users: "38879edf-ebd7-4800-b9a7-a97efadce2a1",
            categories: 1,
            title: title,
            content: description,
            isVisible: visibility,
            hash: tagList.join(','),
        }

        // formData.append('users', "38879edf-ebd7-4800-b9a7-a97efadce2a1");
        // formData.append('categories', 1);
        // formData.append('title', title);
        // formData.append('content', description);
        // formData.append('isVisible', visibility);
        // formData.append('hash', tagList.join(','));
        
        // // FormData의 데이터 출력
        // formData.forEach((value, key) => {
        //     console.log(key + ": " + value);
        // });

        console.log(data);
        fetchPlaylistData(data);
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
                                <MdOutlineAddPhotoAlternate size={40} /> 이미지 없음
                                <input type="file" id="file-upload" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="hidden" />
                            </label>
                        </div>
                        <div className="flex flex-col gap-4">
                            <label
                                htmlFor="file-upload"
                                className="w-fit cursor-pointer py-2 px-4 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-100 hover:border-gray-500 transition duration-300"
                            >
                                <input type="file" id="file-upload" accept="image/*" className="hidden" />
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