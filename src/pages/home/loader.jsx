import { springBoot } from "@axios";


const user = localStorage.getItem('user-id');
const getCommunities = async () => {
    // 나중에 교체할거
    //* 
    try {
        const response = await springBoot.get('/communities', {
            params: {
                category: 1,
            }
        });
        const result = response.data;
        console.log("피드 불러오기 성공:", result);
        return result;
    } catch (error) {
        console.error("피드 불러오기 실패:", error);
        return [];
    }
    /**/
}

const getCommunities1 = async () => {
    // 나중에 교체할거
    //* 
    try {
        const response = await springBoot.get('/communities/byUser', {
            params: {
                category: 1,
                user: user,
            }
        });
        const result = response.data;
        console.log("피드 불러오기 성공:", result);
        return result;
    } catch (error) {
        console.error("피드 불러오기 실패:", error);
        return [];
    }
    /**/
}

// 팔로잉 유저 글
const getFollowingCommunities = async () => {
    try{
        const response = await springBoot.get('/communities/followee', {
            params: {
                category: 1,
                user: user,
            }
        });
        const result = response.data;
        console.log("팔로잉 유저 글 불러오기 성공:", result);
        return result;
    }catch(error){
        console.error("팔로잉 유저 글 불러오기 실패:", error);
        return [];
    }
}


// const getFollowing = async (target) => {
//     try {
//         const response = await springBoot.get("/followers/is-following", {
//             params: { myId: user, targetId: target }
//         });
//         const result = response.data;
//         return result;
//     } catch (error) {
//         console.log("팔로우 여부 불러오기 실패", error);
//         return null;
//     }
// }


// const getIsFollowing = async (id) => {
//     try {
//         const response = await springBoot.get(`/followers/following/${id}`);
//         const result = response.data;
//         return result;
//     } catch (error) {
//         console.log("팔로우 여부 불러오기 실패", error);
//         return null;
//     }
// }


// + 공통: 글 id, 유저 이름, 이메일, 프사, 작성시간 / 사진 포함 가능
// 1. 글만: 글 내용
// (select u.name, u.email, u.img, c.created_at, c.content from communities c join users u on c.users=u.id)
// 2. 음악만: 음악 제목, 아티스트, 커버이미지, 음악 url
// 3. 글+음악: 글 내용, 음악 제목, 아티스트, 커버이미지, 음악url




export const loader = async ({ params, request }) => {
    const communities = await getCommunities();
    const communities1 = await getCommunities1();
    const followingCommunities = await getFollowingCommunities();
    return {
        communities: communities,
        communities1: communities1,
        followingCommunities: followingCommunities,
    }
}