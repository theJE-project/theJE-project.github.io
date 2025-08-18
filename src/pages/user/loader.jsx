// src/pages/user/loader.jsx
import { springBoot } from '@axios';

// 404면 "데이터 없음"으로 되돌려서 화면이 안전하게 렌더링되도록
const safeGet = async (url, fallback) => {
  try {
    const { data } = await springBoot.get(url);
    return data ?? fallback;
  } catch (err) {
    if (err?.response?.status === 404) return fallback;
    throw err; // 다른 에러는 그대로 올림
  }
};

export const loader = async ({ params }) => {
  const userId = params.id;          // ✅ /user/:id 라우트에서 넘어온 대상 유저
  if (!userId) return { profile: null, posts: [], follower: [], followee: [] };

  // ⚠️ 아래 엔드포인트는 프로젝트 실제 API에 맞춰 한 줄만 쓰세요.
  // - 프로필:      /users/{id}
  // - 글목록(택1): /communities/user/{id}  또는  /communities?user={id}
  const profile  = await safeGet(`/users/${userId}`, null);
  const posts    = await safeGet(`/communities/user/${userId}`, []); // ← 실제 API에 맞게 변경
  const follower = await safeGet(`/followers/follower/${userId}`, []);
  const followee = await safeGet(`/followers/followee/${userId}`, []);

  return { profile, posts, follower, followee };
};
