import { springBoot } from "../../axios/springboot"

const getFollowee = async() =>{
    try{
        const user = localStorage.getItem('user-id');
        const response = springBoot.get(`followers/followee/${user}`);
        return await response.data;
    }
    catch(error){ 
        return []
    }
}

const getFollower = async() =>{
    try{
        const user = localStorage.getItem('user-id');
        const response = springBoot.get(`followers/follower/${user}`);
        return await response.data;
    }
    catch(error){ 
        return []
    }
}

export const loader = async ({ params, request }) => {
    // 파람과 리퀘스트를 쓸수 있다.
    // 이곳이 리턴 되지 않으면 컴포넌틀는 랜더링 되지 않는다.
    return {
        followee: getFollowee(),
        follower: getFollower()
    }
}