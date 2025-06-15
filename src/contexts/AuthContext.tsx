import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import api from '../config/api.ts'; // Assuming api.ts configures axios

// Definition of the User interface on the frontend
interface User {
  id: number; // Assuming the backend ID is numeric
  email: string; // The user's email
  name: string; // The user's full name
  roles: string[]; // List of roles (e.g., ["ROLE_ADMIN", "ROLE_USUARIO"])
}

// Interface for the authentication state
interface AuthState {
  user: User | null; // Information of the logged-in user
  isLoading: boolean; // Indicates if an authentication operation is in progress
  isAuthenticated: boolean; // Indicates if the user is authenticated
  error: string | null; // Error message for authentication failures
}

// Types of actions for the reducer
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string | null } // Action for failure with error message
  | { type: 'LOGOUT' }
  | { type: 'REGISTER_SUCCESS'; payload: User } // Kept, adjust if registration has a different flow
  | { type: 'CLEAR_ERROR' }; // New action to clear the error state

// Context creation
const AuthContext = createContext<{
  state: AuthState;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, role?: string) => Promise<boolean>; // Role as string now
  logout: () => void;
  clearError: () => void; // Function to clear error
} | null>(null);

// Reducer to manage authentication state
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true, error: null }; // Clears error at the start of the attempt
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isLoading: false,
        isAuthenticated: true,
        error: null, // Ensures error is null on success
      };
     case 'REGISTER_SUCCESS': // Adjust according to your registration flow
       return {
        ...state,
        user: action.payload, // If registration logs in automatically
        isLoading: false,
        isAuthenticated: true, // If registration logs in automatically
        error: null, // Ensures error is null on success
      };
    case 'LOGIN_FAILURE':
      return {
          ...state,
          isLoading: false,
          user: null, // Ensures user is null on failure
          isAuthenticated: false, // Ensures isAuthenticated is false on failure
          error: action.payload || 'Authentication failed', // Uses the payload message or a generic one
        };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null, // Clears error on logout
      };
    case 'CLEAR_ERROR':
        return { ...state, error: null }; // Clears only the error field
    default:
      return state;
  }
};

// Authentication provider
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isLoading: false,
    isAuthenticated: false,
    error: null, // Added error field to initial state
  });

  // Effect to load user from localStorage on initialization
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('accessToken');

    if (savedUser && savedToken) {
      try {
        const user: User = JSON.parse(savedUser);
        // TODO: Optional: Add a token expiration check here
        // Before dispatching LOGIN_SUCCESS, you can validate if the token is still valid
        // And if not, dispatch LOGOUT.

        // Assuming the token and user in localStorage are valid for now
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      } catch (e) {
        console.error("Failed to parse user from localStorage or invalid token:", e);
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        dispatch({ type: 'LOGOUT' }); // Clears state if there's an error in localStorage
      }
    }
  }, []); // Runs only once on component mount

  // Function to clear the error state
   const clearError = () => {
        dispatch({ type: 'CLEAR_ERROR' });
    };


  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: 'LOGIN_START' });

    try {
      // Send email as username to the backend
      const response = await api.post('auth/login', { username: email, password }); // Verify if the endpoint is correct (/auth/login)

      // ** EXTRACTING ROLES, ID, AND NAME FROM THE BACKEND **
      // Assuming the backend response at the /auth/login endpoint now includes:
      // id: number, username: string (email), nomeCompleto: string, roles: string[], accessToken: string, ...
      const { accessToken, id, username, nomeCompleto, roles } = response.data;

      // Basic check if essential data is returned
      if (accessToken && id !== undefined && username && nomeCompleto && Array.isArray(roles)) { // Verified if roles is an array
        // Build the User object for the frontend USING the actual data from the backend
        const frontendUser: User = {
            id: id, // Use the actual ID returned by the backend
            email: username, // The backend returns the email in the 'username' field after searching by email
            name: nomeCompleto, // Using the full name from the backend
            roles: roles, // Saving the actual list of roles
        };

        // Save the token and the complete User object in localStorage
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('user', JSON.stringify(frontendUser));

        // Dispatch success with the actual User object
        dispatch({ type: 'LOGIN_SUCCESS', payload: frontendUser });
        console.log('Login successful. Token and user saved.', frontendUser); // Logs the user object
        return true;
      } else {
         console.error('Incomplete login API response: user data missing.', response.data); // Logs the response for debugging
         dispatch({ type: 'LOGIN_FAILURE', payload: 'Incomplete API response' });
         return false;
      }

    } catch (error: any) { // Use 'any' or a more specific type for error (e.g., AxiosError)
      console.error('Error during login:', error.response?.data || error.message);
      let errorMessage = 'An error occurred while trying to log in.';
      if (error.response && error.response.data && error.response.data.message) {
           errorMessage = error.response.data.message; // Uses backend error message if available
      } else if (error.message) {
           errorMessage = error.message;
      }

      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      return false;
    }
  };

  // Registration function (adjusted to receive role as string)
  const register = async (email: string, password: string, name: string, role: string = 'USUARIO'): Promise<boolean> => {
    dispatch({ type: 'LOGIN_START' }); // Using LOGIN_START to indicate loading

    try {
        // Adapt the endpoint and request body to match your backend registration API
        // Assuming the backend expects { email, password, username, roleName } for registration
        // and returns a user object similar to login on success
        const response = await api.post('/auth/registrar', { // Verify if the endpoint is correct (/auth/registrar)
            email: email,
            password: password,
            username: name, // Sending the full name as username for backend registration
            // If your backend expects 'roleName', send it as a string (e.g., "ROLE_ADMIN")
             roleName: role.toUpperCase() // Sending the role as an uppercase string, adjust as your backend expects
        });

         // Assuming the backend returns a user object similar to login on successful registration
         const { accessToken, id, username: registeredEmail, nomeCompleto, roles } = response.data;


         if (accessToken && id !== undefined && registeredEmail && nomeCompleto && Array.isArray(roles)) { // Verified if roles is an array
            // Build the User object for the frontend USING the actual data from the backend returned on registration
             const frontendUser: User = {
                 id: id,
                 email: registeredEmail,
                 name: nomeCompleto,
                 roles: roles,
             };

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('user', JSON.stringify(frontendUser)); // Saves the created User object
            dispatch({ type: 'REGISTER_SUCCESS', payload: frontendUser }); // Kept REGISTER_SUCCESS
            console.log('Registration successful. Token and user saved.', frontendUser); // Logs the user object
            return true;
        } else {
            console.error('Incomplete registration API response.', response.data); // Logs the response for debugging
            dispatch({ type: 'LOGIN_FAILURE', payload: 'Incomplete registration API response' }); // Using LOGIN_FAILURE, can create REGISTER_FAILURE
            return false;
        }

    } catch (error: any) { // Use 'any' or a more specific type for error
        console.error('Error during registration:', error.response?.data || error.message);
        let errorMessage = 'An error occurred while trying to register.';
         if (error.response && error.response.data && error.response.data.message) {
             errorMessage = error.response.data.message; // If the backend sends an error message in the body
         } else if (error.message) {
            errorMessage = error.message;
         }
        dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage }); // Using LOGIN_FAILURE, can create REGISTER_FAILURE
        return false;
    }
  };


  // Logout function
  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
    console.log('Logout successful. Token and user removed.');
  };

  // The `useAuth` hook will read the state from this context
  return (
    <AuthContext.Provider value={{ state, login, register, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to consume the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  // Adds logic to easily check roles in components
  // Checks if the user exists, if the roles array exists, and if it includes 'ROLE_ADMIN'
  const isAdmin = context.state.user?.roles?.includes('ROLE_ADMIN') || false;
  const isUser = context.state.user?.roles?.includes('ROLE_USUARIO') || false; // Example for USUARIO
  // TODO: Add other role checks if needed

  return {
    ...context, // Returns the entire original context (state, login, register, logout, clearError)
    isAdmin, // Adds the boolean isAdmin property
    isUser, // Adds the boolean isUser property
    // ... Add other role properties here if created
  };
};
