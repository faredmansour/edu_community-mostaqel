const BASE_URL = 'http://localhost:5000/api';

interface RequestOptions extends RequestInit {
  token?: string | null;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const token = options.token || localStorage.getItem('token');
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Set Content-Type unless we're uploading a file (in which case the browser sets it automatically with the boundary)
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'حدث خطأ ما');
  }

  return data as T;
}

export const api = {
  // Auth
  login: (credentials: any) => request<any>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  
  register: (userData: any) => request<any>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  
  getMe: () => request<any>('/auth/me'),

  // Posts
  getPosts: () => request<{ posts: any[] }>('/posts'),
  
  createPost: (formData: FormData) => request<{ post: any }>('/posts', {
    method: 'POST',
    body: formData,
  }),
  
  likePost: (postId: string) => request<any>(`/posts/${postId}/like`, {
    method: 'POST',
  }),

  getComments: (postId: string) => request<{ comments: any[] }>(`/posts/${postId}/comments`),
  
  createComment: (postId: string, content: string) => request<{ comment: any }>(`/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  }),

  // Challenges
  getChallenges: () => request<{ challenges: any[] }>('/challenges'),
  
  getSubmissions: () => request<{ submissions: any[] }>('/challenges/submissions'),
  
  submitChallenge: (challengeId: string, answer: string) => request<any>(`/challenges/${challengeId}/submit`, {
    method: 'POST',
    body: JSON.stringify({ answer }),
  }),

  // Leaderboard
  getLeaderboard: (grade?: string) => {
    const query = grade ? `?grade=${encodeURIComponent(grade)}` : '';
    return request<{ leaderboard: any[] }>(`/leaderboard${query}`);
  },
  
  getSchools: () => request<{ schools: any[] }>('/leaderboard/schools'),

  // Teachers
  getTeachers: () => request<{ teachers: any[] }>('/teachers'),
  
  rateTeacher: (teacherId: string, rating: number, comment?: string) => request<any>(`/teachers/${teacherId}/rate`, {
    method: 'POST',
    body: JSON.stringify({ rating, comment }),
  }),

  // Admin
  getAdminStats: () => request<any>('/admin/stats'),
  
  getAdminUsers: () => request<{ users: any[] }>('/admin/users'),
  
  deleteUser: (userId: string) => request<any>(`/admin/users/${userId}`, {
    method: 'DELETE',
  }),
};
