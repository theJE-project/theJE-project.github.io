// src/pages/my/loader.js
import { springBoot } from "../../axios/springboot"

const getFollowee = async () => {
  try {
    const user = localStorage.getItem('user-id');
    if (!user) return [];
    // ★ 요청 대기
    const response = await springBoot.get(`followers/followee/${user}`);
    // ★ 데이터 반환
    return response.data || [];
  } catch (error) {
    return [];
  }
}

const getFollower = async () => {
  try {
    const user = localStorage.getItem('user-id');
    if (!user) return [];
    // ★ 요청 대기
    const response = await springBoot.get(`followers/follower/${user}`);
    // ★ 데이터 반환
    return response.data || [];
  } catch (error) {
    return [];
  }
}

export const loader = async ({ params, request }) => {
  // 파람과 리퀘스트를 쓸수 있다.
  // 이곳이 리턴 되지 않으면 컴포넌틀는 랜더링 되지 않는다.

  // ★ 두 요청을 병렬로 대기
  const [followee, follower] = await Promise.all([
    getFollowee(),
    getFollower(),
  ]);

  return { followee, follower };
}
