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
