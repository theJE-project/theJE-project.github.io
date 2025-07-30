import { useLoaderData, useRouteLoaderData } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react';
//import { useImage } from '../../hooks/useImage';
export { loader } from './loader'
import { springBoot } from '@axios';
import { useMusic } from '../../hooks/useMusics';

export function Home() {
    const { user, categories } = useRouteLoaderData('defult');
    const [content, setContent] = useState('');
    const { musics, getMusics } = useMusic();
    const [selectedMusic, setSelectedMusic] = useState(null);
    const [open, setOpen] = useState(false);

    // 나중에 주석 해제
    //const { images, setImages, getImages, initImage } = useImage();


    // 글작성 api 호출
    const postCommunity = async (data) => {
        try {
            const response = await springBoot.post('/communities', data);
            const result = response.data;
            return result;
        } catch (error) {
            console.error("글 작성 실패", error);
            return null;
        }
    }

    // 이미지 업로드
    /*
    const handleImageUpload = async (e) => {
        const files = e.target.files;
        // 파일이 없으면 리턴
        if (!files || !files.length) return;
        setImages(e);
    }
    /**/

    // 음악 검색
    const handleMusicSearch = (e) => {
        e.preventDefault();
        const selectedMusics = e.target.value; // 예시로 input의 value를 사용
        getMusics(selectedMusics);
    }

    // 음악 선택
    const handleMusicSelect = (m) => {
        setSelectedMusic(m);
        setOpen(false); // 모달 닫기
        console.log("선택된 음악:", m);
    }

    // 폼 제출
    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = {
            content: content,
            music: selectedMusic || null,
            // img: images || null,
        };
        const result = await postCommunity(data);
        if (result) {
            setContent('');
            console.log("글 작성 성공:", result);
        } else {
            console.error("글 작성 실패");
        }
    }



    const loader = useLoaderData();
    // console.log(loader);

    console.log(musics)
    return (<>
        {/* <p className='text-[#6CABDD]'>Home Page</p> */}
        <h3>피드</h3><hr></hr>
        {/* 글쓰는곳 */}
        <div>
            <form onSubmit={handleSubmit}>
                <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder='좋아하는 음악을 공유해보세요'></textarea>
                <input type='file' accept='image/*' multiple
                // onChange={handleImageUpload} 
                />

                {/* 음악 검색 모달 */}
                <button type='button' onClick={() => setOpen(true)}>음악검색</button>

                {/* todo: 모달 만들면 거 안에다 넣기 */}
                <input type='text' placeholder='음악 제목을 입력하세요' onChange={handleMusicSearch} />
                {musics.map((m) => {
                    return (
                        <div key={m.id} onClick={() => handleMusicSelect(m)}>
                            <p>{m.title} - {m.artist.name}</p>
                            <img src={m.album.cover_medium} alt={m.title} />
                        </div>
                    )
                })}
                <button type='submit'>글쓰기</button>
            </form>
        </div><hr></hr><br></br>

        {/* 피드 */}
        {loader.communities.map((c) => {
            // 
            return (
                <div key={c.id}>
                    <p>{c.user.name} @{c.user.account} {c.createdAt}</p>
                    <p>{c?.content}</p>
                    <p className='text-[#6CABDD]'>
                        {c?.music?.cover} {c?.music?.title} {c?.music?.artist} {c?.music?.url}
                    </p>
                    <p>댓글 {c.comments} 좋아요 {c.likes}</p>
                    <hr></hr>
                </div>
            )
        })}
    </>)
}