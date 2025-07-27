import api from './api';

interface LoginResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    roles: string[];
  };
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await api.post('/auth/employee/login', { email, password });
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getCurrentUser = (): { id: number; name: string; roles: string[] } | null => {
  const user = localStorage.getItem('user');
  if (!user) return null;
  
  try {
    const parsed = JSON.parse(user);
    // Ensure roles is always an array
    return {
      ...parsed,
      roles: Array.isArray(parsed.roles) ? parsed.roles : 
             typeof parsed.roles === 'string' ? parsed.roles.split(',') : 
             []
    };
  } catch (e) {
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};

export const hasRole = (role: string): boolean => {
  const user = getCurrentUser();
  return user?.roles.includes(role) || false;
};
