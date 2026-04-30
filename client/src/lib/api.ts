const API_URL = '/api';

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  if (process.env.NEXT_PUBLIC_SKIP_AUTH === 'true' && endpoint === '/auth/me') {
    return { 
      user: { 
        id: 0, 
        name: "Dev Mode Admin", 
        email: "dev@apexsync.io", 
        org_slug: "dev_org" 
      } 
    };
  }

  // We use credentials: 'include' to ensure cookies are sent with the request
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || data.error || 'Something went wrong');
  }

  return data;
}

export const performanceApi = {
  getRoster: () => apiRequest('/performance/roster'),
  getAthleteDetail: (id: string) => apiRequest(`/performance/athlete/${id}`),
  createAthlete: (payload: any) => apiRequest('/performance/roster', { method: 'POST', body: JSON.stringify(payload) }),
  getTeams: () => apiRequest('/performance/teams'),
  createTeam: (payload: { name: string; description?: string }) => apiRequest('/performance/teams', { method: 'POST', body: JSON.stringify(payload) }),
};

export const decisionsApi = {
  getOpen: () => apiRequest('/decisions/open'),
};

export const umsApi = {
  getUsers: () => apiRequest('/ums/org/users'),
  createUser: (payload: {
    name: string;
    email: string;
    username?: string;
    phone?: string;
    password?: string;
    roleIds: number[];
  }) => apiRequest('/ums/org/users', { method: 'POST', body: JSON.stringify(payload) }),
  updateUser: (id: number, payload: {
    name?: string;
    password?: string;
    isActive?: boolean;
    roleIds?: number[];
  }) => apiRequest(`/ums/org/users/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  getRoles: () => apiRequest('/ums/roles'),
  getPermissions: () => apiRequest('/ums/roles/permissions'),
  createRole: (payload: { name: string; description?: string, permissionIds?: number[] }) =>
    apiRequest('/ums/roles', { method: 'POST', body: JSON.stringify(payload) }),
};

export const authApi = {
  signup: (payload: any) => apiRequest('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  
  checkEmail: (email: string) => apiRequest('/auth/check-email', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),

  checkOrg: (slug: string) => apiRequest('/auth/check-org', {
    method: 'POST',
    body: JSON.stringify({ slug }),
  }),

  login: (payload: any) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  getMe: () => apiRequest('/auth/me', {
    method: 'GET',
  }),
  
  logout: () => apiRequest('/auth/logout', {
    method: 'POST',
  }),
};
