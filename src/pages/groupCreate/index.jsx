import PlaylistFrom from './playlistForm'
export { loader } from './loader'

export function GroupCreate() {
    const navigate = useNavigate();
    const { user } = useRouteLoaderData('default'); // 로그인 사용자

    const { images, setImages, getImages } = useImage(); // 이미지 훅
    const [previewUrls, setPreviewUrls] = useState([]);

    const { musics, getMusics } = useMusic(); // music 훅 (음악 가져오기)
    const [music, setMusics] = useState(); // 결과 저장?
    const [previewUrl, setPreviewUrl] = useState(null); // 현재 재생 중 음악 
    const [musicList, setMusicList] = useState([]); // 음악 목록
    const [musicSearch, setMusicSearch] = useState(""); // 음악 검색

    const [title, setTitle] = useState(""); // 제목
    const [description, setDescription] = useState(""); // 설명
    const [visibility, setVisibility] = useState(true); // 공개 여부
    const [tagInput, setTagInput] = useState(""); // 태그(태그 입력창)
    const [tagList, setTagList] = useState([]); // 태그 배열
    const [tagError, setTagError] = useState(""); // 태그 경고


    // api 연결
    const fetchPlaylistData = async (data) => {
        console.log('서버에 보낼 데이터:', JSON.stringify(data, null, 2));
        
        try {
            const response = await springBoot.post('/communities', data);

            // setPlaylistData(response.data);
            console.log(response.data);

        } catch (error) {
            console.error('API 호출 오류:', error);
        }
    }

    // 폼제출
    const handleSubmit = async (e) => {
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

        try {
            await fetchPlaylistData(data);
            alert("플레이리스트 생성이 완료되었습니다.")
            navigate('/group');
        } catch (error) {

        }
    };

    // 태그 enter 처리
    const enterTags = (e) => {
        if (e.key === "Enter" && tagInput.trim() !== "") {
            e.preventDefault(); // 폼 제출 막음

            if (tagList.length >= 20) {
                setTagError("※태그는 최대 20개까지 입력할 수 있습니다.")
                return;
            }

            const newTag = tagInput.trim();

            if (!tagList.includes(newTag)) {
                setTagList([...tagList, newTag]); // 태그 추가
                setTagError("");
            }

            setTagInput(""); // 입력창 초기화
        }
    }

    // 태그 삭제
    const deleteTags = (tagDelete) => {
        const newTagList = tagList.filter((tags) => (tags) !== tagDelete); // 선택한 태그 삭제

        setTagList(newTagList);

        if (newTagList.length <= 20) {
            setTagError("");
        }
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

    // 재생시간 변환
    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        // 초가 한 자리면 0 붙이기 (예: 3 -> 03)
        const paddedSecs = secs.toString().padStart(2, '0');
        return `${mins}:${paddedSecs}`;
    };

    return (
        <PlaylistFrom />
    )
}