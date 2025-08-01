
import { springBoot } from "@axios";

// 여기에 알림 추가

const getUser = async () => {
    try {
        const cached = sessionStorage.getItem('user');
        if (cached) { return JSON.parse(cached); }
        const id = localStorage.getItem('user-id');
        if (!id) {
            console.warn('비로그인 입니다.')
            return { }
        }
        const response = await springBoot.get(`/users/${id}`);
        const userData = response.data;
        sessionStorage.setItem('user', JSON.stringify(userData)); 
        return userData
    } catch (error) {
        console.error("유저테이블 불러오기 실패", error);
        return {};
    }
}

const getCategories = async () => {
    try {
        const cached = sessionStorage.getItem('categories');
        if (cached !== null) { return JSON.parse(cached); }
        const response = await springBoot.get("/categories");
        const data = response.data;
        sessionStorage.setItem('categories', JSON.stringify(data));
        return data;
    } catch (error) {
        console.error("카테고리 불러오기 실패:", error);
        return [];
    }
};

export const loader = async ({ params, request }) => {
    const user = await getUser();
    const categories = await getCategories();
    return {
        user: user,
        categories: categories,
    }
}