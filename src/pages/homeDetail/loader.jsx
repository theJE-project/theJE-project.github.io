import { springBoot } from "@axios";

const user = localStorage.getItem('user-id');
// 게시글 상세
const getCommunity = async (id) => {
    try {
        const response = await springBoot.get(`/communities/community/${id}`, {
            params: {
                user: user,
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
    const community = await getCommunity(params.id);
    return {
        community: community,
    }
}