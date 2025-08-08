import { useLoaderData, useRouteLoaderData } from 'react-router-dom'
import { FiHeart } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { springBoot } from '@axios';

export function Likes({ users, board_types, board }) {
    const { user } = useRouteLoaderData('default');
    const [likesId, setLikesId] = useState('');
    const [likes, setLikes] = useState(0);
    const [liked, setLiked] = useState(false);
    const [loading, setLoading] = useState(false);  // 로딩 상태

    useEffect(() => {
        const fetchLikes = async () => {
            setLoading(true);
            const result = await getLikes(users, board_types, board);
            setLikesId(result.id);
            setLikes(result.count);
            setLiked(result.liked);
            setLoading(false);
        };
        fetchLikes();
    }, [users, board_types, board]);

    const handleLike = async () => {
        if (!users) {
            alert("로그인이 필요합니다.");
            return;
        }

        setLoading(true);
        try {
            if (liked) {
                await springBoot.delete(`/likes/${likesId}`);
            } else {
                await springBoot.post('/likes', {
                    users,
                    board_types,
                    board,
                });
            }
            // 좋아요 상태가 바뀐 후 서버에서 최신 상태를 다시 받아옴
            const result = await getLikes(users, board_types, board);
            setLikesId(result.id);
            setLikes(result.count);
            setLiked(result.liked);
        } catch (err) {
            console.error('좋아요 처리 실패:', err);
        }
        setLoading(false);
    };

    return (
        <button
            disabled={loading}  // 로딩 중엔 버튼 비활성화
            onClick={handleLike}
            className={`flex items-center gap-1 text-sm ${liked ? 'text-red-500' : 'text-gray-400'}`}
        >
            <FiHeart className="inline" />
            {loading ? '...' : likes}
        </button>
    );
}

// 외부 함수로 분리
async function getLikes(users, board_types, board) {
    try {
        if (!users) return { count: 0, liked: false };

        const res = await springBoot.post(`/likes/count`, {
            users,
            board,
            board_types,
        });
        const result = res.data[0];
        return {
            id: result.id,
            count: result.count,
            liked: result.liked,
        };
    } catch (error) {
        console.error("좋아요 데이터 불러오기 실패", error);
        return { id: null, count: 0, liked: false };
    }
}
