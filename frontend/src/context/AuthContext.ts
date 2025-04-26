import { createContext } from 'react';

// AuthState is the type for the authentication state (user to access current user id and email and the token to access the api)
export interface AuthState {
    user: any;
    accessToken: string | null;
}

// Defines what values will be available in the context (state and methods)
export interface AuthContextType {
    authState: AuthState;
    setAuthState: (authState: AuthState) => void;
    isAuthenticated: boolean;
    logout: () => Promise<void>;
    darkMode: boolean | null;
    toggleDarkMode: () => void;
}

// that's the context skeleton what will use the useAuth hook
export const AuthContext = createContext<AuthContextType>({
    authState: { user: null, accessToken: null },
    setAuthState: () => { },
    isAuthenticated: false,
    logout: async () => { },
    darkMode: null,
    toggleDarkMode: () => { }
});