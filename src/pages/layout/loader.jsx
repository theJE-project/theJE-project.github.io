
import { springBoot } from "@axios";

// 여기에 않읽은 알림을 가져오기

const getUser = async () => {
    try {
        const cached = sessionStorage.getItem('user');
        if (cached) { return JSON.parse(cached); }
        const id = localStorage.getItem('user-id');
        if (!id) {
            console.warn('비로그인 입니다.')
            return {}
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

const getNotifications = async () => {
    try {
        const id = localStorage.getItem('user-id');
        if (!id) {
            console.warn('비로그인 입니다.')
            return []
        }
        const response = await springBoot.get(`/notifications/${id}`);
        return response.data
    } catch (error) {
        console.error("알림테이블 불러오기 실패", error);
        return [];
    }
}

const getCategories = async () => {
    try {
        const response = await springBoot.get("/categories")
            .catch(error => {
                throw new Error(JSON.stringify({
                    title: '서버 연결 오류',
                    content: `
                        Spring Boot 를 찾을 수 가 없습니다.\n
                        https://github.com/theJE-project/theJE-project.admin\n
                        해당 GITHUB 에서 다운로드 후 Spring Boot를 가동 해주세요.
                    `
                }));
            })
        const data = response.data;
        return data;
    } catch (error) { throw error; }
};

export const loader = async ({ params, request }) => {
    const user = await getUser();
    const categories = await getCategories();
    const notifications = await getNotifications();
    return {
        user: user,
        categories: categories,
        notifications: notifications,
    }
}