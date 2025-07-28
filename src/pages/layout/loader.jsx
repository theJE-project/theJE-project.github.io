
import { springBoot } from "@axios";

const getUser = async () => {
    try {
        const data = JSON.parse(localStorage.getItem('user') || '{}');
        if (!data?.token) { 
            console.warn('비로그인 입니다.')
            return { }
        }
        // if (!data.account) {
        //     const response = await springBoot.get("/users", {
        //         params: { account: data.token },
        //     });
        //     localStorage.setItem('user', JSON.stringify(response.data));
        //     return response.data;
        // }
        // 추가 정보가 있으면 로컬 데이터를 바로 반환
        return data;
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