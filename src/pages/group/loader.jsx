import { springBoot } from "@axios";

export const loader = async ({ params, request }) => {
    try {
        // Spring Boot 서버에 GET 요청 (category=1)
        const response = await springBoot.get('/communities', {
            params: {
                category: 2,
            }
        });
        return response.data;
    } catch (error) {
        console.error('API 호출 오류:', error);
        return [];
    }
};
