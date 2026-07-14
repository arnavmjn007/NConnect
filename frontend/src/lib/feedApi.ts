async function feedFetch(path: string, opts: RequestInit = {}) {
    const res = await fetch(`/api/feed/${path}`, {
        ...opts,
        headers: { 'Content-Type': 'application/json', ...opts.headers },
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Request failed: ${res.status}`);
    }
    return res.json();
}

export function getFeed(page = 1) {
    return feedFetch(`feed?page=${page}`);
}
export function getTrendingFeed(page = 1) {
    return feedFetch(`feed/trending?page=${page}`);
}
export function getFollowingFeed(page = 1) {
    return feedFetch(`feed/following?page=${page}`);
}

export function getUserPosts(userId: string, page = 1) {
    return feedFetch(`posts/user/${encodeURIComponent(userId)}?page=${page}`);
}

export function createPost(data: {
    content?: string;
    media_urls?: string[];
    post_type?: string;
    project_id?: string;
}) {
    return feedFetch('posts', { method: 'POST', body: JSON.stringify(data) });
}
export function getPost(id: string) {
    return feedFetch(`posts/${id}`);
}
export function updatePost(id: string, data: { content?: string; media_urls?: string[] }) {
    return feedFetch(`posts/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}
export function deletePost(id: string) {
    return feedFetch(`posts/${id}`, { method: 'DELETE' });
}
export function repost(id: string, repost_comment?: string) {
    return feedFetch(`posts/${id}/repost`, {
        method: 'POST',
        body: JSON.stringify({ repost_comment }),
    });
}

export function likePost(id: string) {
    return feedFetch(`posts/${id}/like`, { method: 'POST' });
}
export function unlikePost(id: string) {
    return feedFetch(`posts/${id}/like`, { method: 'DELETE' });
}

export function getComments(postId: string) {
    return feedFetch(`posts/${postId}/comments`);
}
export function addComment(postId: string, content: string, parent_comment_id?: string) {
    return feedFetch(`posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content, parent_comment_id }),
    });
}
export function deleteComment(id: string) {
    return feedFetch(`comments/${id}`, { method: 'DELETE' });
}

export function followUser(userId: string) {
    return feedFetch(`follow/${userId}`, { method: 'POST' });
}
export function unfollowUser(userId: string) {
    return feedFetch(`follow/${userId}`, { method: 'DELETE' });
}
export function getFollowers(userId: string) {
    return feedFetch(`followers/${userId}`);
}
export function getFollowing(userId: string) {
    return feedFetch(`following/${userId}`);
}

export function getConversations() {
    return feedFetch('chat/conversations');
}
export function getMessages(conversationId: string, before?: string) {
    const q = before ? `?before=${before}` : '';
    return feedFetch(`chat/messages/${conversationId}${q}`);
}
export function startConversation(otherUserId: string) {
    return feedFetch('chat/conversations', {
        method: 'POST',
        body: JSON.stringify({ otherUserId }),
    });
}


export function getNotifications(page = 1) {
    return feedFetch(`notifications?page=${page}`);
}
export function getUnreadCount() {
    return feedFetch('notifications/unread-count');
}
export function markAllRead() {
    return feedFetch('notifications/read-all', { method: 'PATCH' });
}
export function markOneRead(id: string) {
    return feedFetch(`notifications/${id}/read`, { method: 'PATCH' });
}
export function deleteNotification(id: string) {
    return feedFetch(`notifications/${id}`, { method: 'DELETE' });
}
export function getAnnouncements() {
    return feedFetch('notifications/announcements');
}
export function sendAnnouncement(data: {
    title: string;
    message: string;
    type: string;
    audience: string;
    scheduled_at?: string;
}) {
    return feedFetch('notifications/announcements', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}