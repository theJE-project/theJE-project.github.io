import { springBoot } from "@axios";



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

// 팔로우 여부 조회하려고 만든 거(로그인 유저 기준 피드)
const getCommunities1 = async (userId) => {
    try {
        console.log('getCommunities1 - userId : ' + userId)

        const response = await springBoot.get('/communities/byUser', {
            params: {
                category: 1,
                user: userId,
                size: 100,
            }
        });
        // const response = await springBoot.post('/communities/byUser', {
        //     category: Number(1),
        //     follower: userId,
        // });
        const result = response.data;
        console.log("피드 불러오기 성공:", result);
        return result;
    } catch (error) {
        console.error("피드 불러오기 실패:", error);
        return [];
    }
}

// 팔로잉 유저 글
const getFollowingCommunities = async (userId) => {
    try {
        
        const response = await springBoot.get('/communities/followee', {
            params: {
                category: 1,
                user: userId,
            }
        });
        
        // const response = await springBoot.post('/communities/followee', {
        //     category: 1,
        //     user: userId,
        // });
        const result = response.data;
        console.log("팔로잉 유저 글 불러오기 성공:", result);
        return result;
    } catch (error) {
        console.error("팔로잉 유저 글 불러오기 실패:", error);
        return [];
    }
}

// // 좋아요 개수
// const getLikes = async (id) =>{
//     try{
//         const response = await springBoot.post('/likes/count')
//     }
// }


// *안씀*
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
    const userId = localStorage.getItem('user-id');
    const communities1 = await getCommunities1(userId);
    const followingCommunities = await getFollowingCommunities(userId);
    return {
        // communities: communities,
        communities1: communities1,
        followingCommunities: followingCommunities,
    }
}