import { springBoot } from "@axios";

const user = localStorage.getItem('user-id');
// const getCommunities = async () => {
//     try {
//         const response = await springBoot.get('/communities', {
//             params: {
//                 category: 1,
//             }
//         });
//         const result = response.data;
//         console.log("피드 불러오기 성공:", result);
//         return result;
//     } catch (error) {
//         console.error("피드 불러오기 실패:", error);
//         return [];
//     }
// }

// 팔로우 여부 조회하려고 만든 거
const getCommunities1 = async () => {
    try {
        const response = await springBoot.get('/communities/byUser', {
            params: {
                category: 1,
                user: user,
            }
        });
        const result = response.data;
        console.log("피드 불러오기 성공(isFollowing 포함)", result);
        return result;
    } catch (error) {
        console.error("피드 불러오기 실패:", error);
        return [];
    }
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





export const loader = async ({ params, request }) => {
    // const communities = await getCommunities();
    const communities1 = await getCommunities1();
    const followingCommunities = await getFollowingCommunities();
    return {
        // communities: communities,
        communities1: communities1,
        followingCommunities: followingCommunities,
    }
}