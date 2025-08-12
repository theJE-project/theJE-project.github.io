import { springBoot } from "@axios";


// 게시글 상세
const getCommunity = async (id, userId) => {
    try {
        const response = await springBoot.get(`/communities/community/${id}`, {
            params: {
                user: userId,
            }
        });
        const result = response.data;
        return result;
    }catch(error){
        console.log("게시글 상세 불러오기 실패", error);
        return null;
    };
}




export const loader = async ({ params, request }) => {
    const userId = localStorage.getItem('user-id');
    const community = await getCommunity(params.id, userId);
    return {
        community: community,
    }
}