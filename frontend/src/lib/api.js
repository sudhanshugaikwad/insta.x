const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";
// console.log("API URL →", process.env.REACT_APP_API_URL);


export async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, options);
  } catch {
    throw new Error("Unable to connect to the server");
  }

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : {};
  if (!response.ok) {
    throw new Error(data.error || "Something went wrong");
  }
  return data;
}

export function authHeaders(json = false) {
  return {
    ...(json ? { "Content-Type": "application/json" } : {}),
    Authorization: `Bearer ${localStorage.getItem("jwt") || ""}`,
  };
}

// Auth APIs
export async function signup(name, userName, email, password) {
  return request("/signup", {
    method: "POST",
    headers: authHeaders(true),
    body: JSON.stringify({ name, userName, email, password }),
  });
}

export async function checkUsernameAvailability(username, excludeUserId = null) {
  const params = new URLSearchParams({ username });
  if (excludeUserId) {
    params.set("excludeUserId", excludeUserId);
  }

  return request(`/check-username?${params.toString()}`, {
    headers: authHeaders(),
  });
}

export async function signin(email, password) {
  return request("/signin", {
    method: "POST",
    headers: authHeaders(true),
    body: JSON.stringify({ email, password }),
  });
}

export async function updateProfile(name, userName, email, Photo) {
  return request("/profile", {
    method: "PUT",
    headers: authHeaders(true),
    body: JSON.stringify({ name, userName, email, Photo }),
  });
}

// Post APIs
export async function getAllPosts() {
  return request("/allposts", {
    headers: authHeaders(),
  });
}

export async function getMyPosts() {
  return request("/myposts", {
    headers: authHeaders(),
  });
}

export async function createPost(body, photos) {
  return request("/createPost", {
    method: "POST",
    headers: authHeaders(true),
    body: JSON.stringify({ body, photos }),
  });
}

export async function editPost(postId, body, photos) {
  return request(`/editPost/${postId}`, {
    method: "PUT",
    headers: authHeaders(true),
    body: JSON.stringify({ body, photos }),
  });
}

export async function deletePost(postId) {
  return request(`/deletePost/${postId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
}

export async function likePost(postId) {
  return request("/like", {
    method: "PUT",
    headers: authHeaders(true),
    body: JSON.stringify({ postId }),
  });
}

export async function unlikePost(postId) {
  return request("/unlike", {
    method: "PUT",
    headers: authHeaders(true),
    body: JSON.stringify({ postId }),
  });
}

export async function commentPost(postId, text) {
  return request("/comment", {
    method: "PUT",
    headers: authHeaders(true),
    body: JSON.stringify({ postId, text }),
  });
}

export async function getPostComments(postId) {
  return request(`/post/${postId}/comments`, {
    headers: authHeaders(),
  });
}

// User Profile APIs
export async function getMyProfile() {
  return request("/myprofile", {
    headers: authHeaders(),
  });
}

export async function getUserProfile(userId) {
  return request(`/user/${userId}`, {
    headers: authHeaders(),
  });
}

export async function getFollowers(userId) {
  return request(`/followers/${userId}`, {
    headers: authHeaders(),
  });
}

export async function getFollowing(userId) {
  return request(`/following/${userId}`, {
    headers: authHeaders(),
  });
}

export async function checkIsFollowing(userId) {
  return request(`/isFollowing/${userId}`, {
    headers: authHeaders(),
  });
}

// Follow/Unfollow APIs
export async function followUser(followUserId) {
  return request("/follow", {
    method: "PUT",
    headers: authHeaders(true),
    body: JSON.stringify({ followUserId }),
  });
}

export async function unfollowUser(unfollowUserId) {
  return request("/unfollow", {
    method: "PUT",
    headers: authHeaders(true),
    body: JSON.stringify({ unfollowUserId }),
  });
}

// Profile Picture APIs
export async function uploadProfilePic(pic) {
  return request("/uploadProfilePic", {
    method: "PUT",
    headers: authHeaders(true),
    body: JSON.stringify({ pic }),
  });
}

// Search APIs
export async function searchUsers(query) {
  return request(`/search?q=${encodeURIComponent(query)}`, {
    headers: authHeaders(),
  });
}

export async function getAllUsers() {
  return request("/allUsers", {
    headers: authHeaders(),
  });
}

export async function getSuggestedUsers() {
  return request("/suggestedUsers", {
    headers: authHeaders(),
  });
}

export async function getTrendingUsers() {
  return request("/trendingUsers", {
    headers: authHeaders(),
  });
}

// Notification APIs
export async function getNotifications() {
  return request("/notifications", {
    headers: authHeaders(),
  });
}

export async function getUnreadNotificationCount() {
  return request("/notifications/unread/count", {
    headers: authHeaders(),
  });
}

export async function markNotificationAsRead(notificationId) {
  return request(`/notifications/${notificationId}/read`, {
    method: "PUT",
    headers: authHeaders(true),
    body: JSON.stringify({}),
  });
}

export async function markAllNotificationsAsRead() {
  return request("/notifications/markAll/read", {
    method: "PUT",
    headers: authHeaders(true),
    body: JSON.stringify({}),
  });
}

export async function deleteNotification(notificationId) {
  return request(`/notifications/${notificationId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
}

export async function clearAllNotifications() {
  return request("/notifications/clear/all", {
    method: "DELETE",
    headers: authHeaders(),
  });
}

// Message APIs
export async function sendMessage(receiverId, message) {
  return request("/message", {
    method: "POST",
    headers: authHeaders(true),
    body: JSON.stringify({ receiverId, message }),
  });
}

export async function getMessages(userId, page = 0, limit = 50) {
  return request(`/messages/${userId}?page=${page}&limit=${limit}`, {
    headers: authHeaders(),
  });
}

export async function getConversations() {
  return request("/conversations", {
    headers: authHeaders(),
  });
}

export async function getUnreadMessageCount() {
  return request("/unread-messages/count", {
    headers: authHeaders(),
  });
}

export async function deleteMessage(messageId) {
  return request(`/messages/${messageId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
}

export async function getAdminOverview() {
  return request("/admin/overview", { headers: authHeaders() });
}

export async function adminLogin(userName, password) {
  return request("/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userName, password }),
  });
}

export async function updateAdminUser(userId, updates) {
  return request(`/admin/users/${userId}`, {
    method: "PUT",
    headers: authHeaders(true),
    body: JSON.stringify(updates),
  });
}

export async function deleteAdminUser(userId) {
  return request(`/admin/users/${userId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
}

export async function deleteAdminPost(postId) {
  return request(`/admin/posts/${postId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
}
