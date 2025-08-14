import { springBoot } from "@axios";

const getComments = async (users, board_types, board) => {
    try {
        const cached = sessionStorage.getItem('user');
        if (cached) { return JSON.parse(cached); }
        const id = localStorage.getItem('user-id');
        if (!id) {
            console.warn('비로그인 입니다.')
            return {}
        }
        const response = await springBoot.post(`/comments`, {
            users: users,
            board: board,
            board_types: board_types,
        });
        
        const userData = response.data;
        sessionStorage.setItem('user', JSON.stringify(userData));

        return userData
    } catch (error) {
        console.error("유저테이블 불러오기 실패", error);
        return {};
    }
}

export const loader = async ({ params, request }) => {
    const likes = await getLikes();
    return {
        likes: likes,
    }
}