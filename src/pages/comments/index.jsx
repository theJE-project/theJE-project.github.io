import { useLoaderData, useRouteLoaderData } from 'react-router-dom'
import { FiHeart } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { springBoot } from '@axios';

export function Comments({ users, board_types, board }) {
    const { user } = useRouteLoaderData('default');
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [replyTo, setReplyTo] = useState(null); // 대댓글 작성 대상 댓글 id

    useEffect(() => {
        fetchComments();
    }, [board, board_types]);

    const fetchComments = async () => {
        try {
            const res = await springBoot.post('/comments/search', {
                board_types,
                board,
                is_delete: false
            });
            setComments(res.data);
        } catch (err) {
            console.error("댓글 가져오기 실패:", err);
        }
    };

    const organizeComments = (comments) => {
        const map = {};
        const roots = [];

        comments.forEach(c => {
            c.children = [];
            map[c.id] = c;
        });

        comments.forEach(c => {
            if (!c.parent || c.parent === 0) {
                roots.push(c);
            } else if (map[c.parent]) {
                map[c.parent].children.push(c);
            }
        });

        return roots;
    };

    const handleAddComment = async (e, parent) => {
        e.stopPropagation();
        if (!user?.id) {
            alert("로그인이 필요합니다.");
            return;
        }
        if (!newComment.trim()) return;

        setLoading(true);
        try {
            await springBoot.post('/comments', {
                users: user.id,
                board,
                board_types,
                parent,
                content: newComment.trim(),
            });
            setNewComment('');
            setReplyTo(null);
            await fetchComments();
        } catch (err) {
            console.error("댓글 등록 실패:", err);
        }
        setLoading(false);
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm("댓글을 삭제하시겠습니까?")) return;
        try {
            await springBoot.delete(`/comments/${id}`);
            await fetchComments();
        } catch (err) {
            console.error("댓글 삭제 실패:", err);
        }
    };

    const roots = organizeComments(comments);

    return (
        <div className="mt-6 space-y-4">
            <h4 className="font-bold text-lg">댓글</h4>

            {/* 최상위 댓글 작성 영역 */}
            <div className="flex gap-2 items-start">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onClick={e => e.stopPropagation()}
                    className="border w-full p-2 rounded resize-none"
                    rows={3}
                    placeholder={replyTo ? "답글을 입력하세요" : "댓글을 입력하세요"}
                />
                <button
                    onClick={(e) => handleAddComment(e, replyTo || null)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    disabled={loading}
                >
                    {replyTo ? "답글 등록" : "등록"}
                </button>
                {replyTo && (
                    <button
                        onClick={() => {
                            setReplyTo(null);
                            setNewComment('');
                        }}
                        className="ml-2 px-3 py-2 border rounded"
                    >
                        답글 취소
                    </button>
                )}
            </div>

            {/* 댓글 목록 렌더링 */}
            <ul className="divide-y border-t mt-4">
                {roots.map((c) => (
                    <CommentItem
                        key={c.id}
                        comment={c}
                        user={user}
                        onReply={(id) => {
                            setReplyTo(id);
                            setNewComment('');
                        }}
                        onDelete={handleDelete}
                    />
                ))}
            </ul>
        </div>
    );
}

// 한 댓글 + 자식 댓글 재귀 컴포넌트
function CommentItem({ comment, user, onReply, onDelete }) {
    const isMyComment = user?.id === comment.users;

    return (
        <li className="py-3 pl-4 border-l-2 border-gray-300 ml-4 relative"
            onClick={e => e.stopPropagation()}
        >
            <div className={`p-4 rounded-lg border
                ${isMyComment ? 'bg-blue-50 border-blue-400 shadow-inner' : (comment.parent === 0 ? 'bg-white border-gray-200' : 'bg-gray-100 border-gray-300')}`}>
                <div className="flex justify-between items-center mb-1">
                    <span className={isMyComment ? "font-semibold text-blue-700" : (comment.parent === 0 ? "font-semibold text-gray-800" : "font-semibold text-gray-600")}>
                        {comment.name}
                    </span>
                    <span className={isMyComment ? "text-xs text-blue-400" : (comment.parent === 0 ? "text-xs text-gray-400" : "text-xs text-gray-500")}>
                        {new Date(comment.created_at).toLocaleString()}
                    </span>
                </div>
                <div className={isMyComment ? "text-blue-800" : (comment.parent === 0 ? "text-gray-700" : "text-gray-600")}>
                    {comment.content}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onReply(comment.id);
                        }}
                        className="text-blue-500 text-xs"
                    >
                        답글
                    </button>
                    {user?.id === comment.users && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(e, comment.id);
                            }}
                            className="text-red-500 text-xs"
                        >
                            삭제
                        </button>
                    )}
                </div>
            </div>
            {comment.children && comment.children.length > 0 && (
                <ul className="mt-3 ml-8 border-l-2 border-blue-300 pl-4 space-y-3">
                    {comment.children.map((child) => (
                        <CommentItem key={child.id} comment={child} user={user} onReply={onReply} onDelete={onDelete} />
                    ))}
                </ul>
            )}
        </li>
    );
}
