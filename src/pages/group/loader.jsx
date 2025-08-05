import { springBoot } from "@axios";

export const loader = async ({ params, request }) => {
    try {
        // Spring Boot 서버에 GET 요청 보내기
        const response = await springBoot.get('group');
        // 받은 데이터를 상태에 저장
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('API 호출 오류:', error);
        return []
    }
}