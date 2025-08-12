// src/pages/user/loader.jsx
import { springBoot } from '../../axios/springboot';

async function getProfile(userId) {
    const { data } = await springBoot.get(`users/${userId}`);
    return data;
}
async function getFollower(userId) {
    const { data } = await springBoot.get(`followers/follower/${userId}`);
    return data || [];
}
async function getFollowee(userId) {
    const { data } = await springBoot.get(`followers/followee/${userId}`);
    return data || [];
}
async function getIsFollowing(myId, targetId) {
    if (!myId) return false;
    const { data } = await springBoot.get('followers/is-following', {
        params: { myId, targetId },
    });
    return !!data;
}

export async function loader({ params }) {
    const targetId = params.id; // URL의 대상 유저
    const myId = localStorage.getItem('user-id');

    const [profile, follower, followee, isFollowing] = await Promise.all([
        getProfile(targetId),
        getFollower(targetId),
        getFollowee(targetId),
        getIsFollowing(myId, targetId),
    ]);

    return { profile, follower, followee, isFollowing };
}
