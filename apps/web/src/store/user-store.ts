import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  userType?: string;
  isActive?: boolean;
  /** Minister profile id for studio sermon list (`GET /sermon/minister/:id`). */
  ministerId?: string;
  [key: string]: any;
}

interface UserState {
  user: User | null;
  users: User[];
  userType: string;
  token: string | null;
  loading: boolean;
  isLoggedIn: boolean;
  resource?: any;
  
  // Actions
  setUser: (user: User | null) => void;
  setUsers: (users: User[]) => void;
  setUserType: (userType: string) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  setResource: (resource: any) => void;
  unsetLoading: (loading: boolean) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      users: [],
      userType: '',
      token: null,
      loading: false,
      isLoggedIn: false,
      
      setUser: (user) => set({ user }),
      setUsers: (users) => set({ users }),
      setUserType: (userType) => set({ userType }),
      setToken: (token) => set({ token }),
      setLoading: (loading) => set({ loading }),
      setIsLoggedIn: (isLoggedIn) => set({ isLoggedIn }),
      setResource: (resource) => set({ resource }),
      unsetLoading: (loading) => set({ loading }),
      clearUser: () => set({ 
        user: null, 
        users: [],
        userType: '', 
        token: null, 
        loading: false,
        isLoggedIn: false
      }),
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        user: state.user,
        userType: state.userType,
        token: state.token,
      }),
    }
  )
);
