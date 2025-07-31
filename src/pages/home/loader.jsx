import { springBoot } from "@axios";

const getCommunities = async () => {
    // 나중에 교체할거
    /* 
    try {
        const response = await springBoot.get('/communities');
        const data = response.data;
        return data;
    } catch (error) {
        console.error("피드 불러오기 실패:", error);
        return [];
    }
    /**/

    // + 공통: 글 id, 유저 이름, 이메일, 프사, 작성시간 / 사진 포함 가능
    // 1. 글만: 글 내용
    // (select u.name, u.email, u.img, c.created_at, c.content from communities c join users u on c.users=u.id)
    // 2. 음악만: 음악 제목, 아티스트, 커버이미지, 음악 url
    // 3. 글+음악: 글 내용, 음악 제목, 아티스트, 커버이미지, 음악url

    // 임시
    const dummyFeeds = [
        {
            id: 1,
            user: {
                name: "김민수",
                account: "minsu_kim",
                img: "gromit.jpg",
            },
            createdAt: "2시간 전",
            content: "새로운 인디 밴드 발견했어요! 정말 놀라운 음악들이에요 🎵\n\n오늘 하루 종일 이 앨범만 들었는데 질리지가 않네요. 특히 두 번째 트랙이 정말 좋아요.",
            music: {
                title: "Midnight Dreams",
                artist: "Luna Band",
                cover: "https://cover.url",
                url: "https://music.url"
            },
            image: "https://임시이미지.url", // 없을 수도 있음
            comments: 12, // count만
            likes: 34,    // count만
        },
        {
            id: 2,
            user: {
                name: "이수진",
                account: "suji_lee",
                img: "https://프로필이미지",
            },
            createdAt: "3시간 전",
            content: "가을 감성 노래 추천받아요 🍁",
            music: null,
            image: null,
            comments: 8,
            likes: 22,
        },
        {
            id: 3,
            user: {
                name: "홍길동",
                account: "gildong",
                img: "https://프로필이미지",
            },
            createdAt: "1시간 전",
            content: "",
            music: {
                title: "Autumn Jazz",
                artist: "Various Artists",
                cover: "https://cover.url",
                url: "https://music.url"
            },
            image: null,
            comments: 5,
            likes: 10,
        }
    ]
    return dummyFeeds;
}



export const loader = async ({ params, request }) => {
    const communities = await getCommunities();
    return {
        communities: communities,
    }
}