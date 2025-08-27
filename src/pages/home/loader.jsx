import { springBoot } from "@axios";



const getCommunities = async () => {

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
}

const getCommunities1 = async (user) => {
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
}

// 팔로잉 유저 글
const getFollowingCommunities = async (user) => {
    if(!user) return [];
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

export const loader = async ({ params, request }) => {
    const user = localStorage.getItem('user-id');
    const communities1 = user ?await getCommunities1(user) :await getCommunities();
    const followingCommunities = await getFollowingCommunities(user);
    return {
        communities1: communities1,
        followingCommunities: followingCommunities,
    }
}