import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const AuthContext = createContext();

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  UPDATE_PROFILE: 'UPDATE_PROFILE',
  REFRESH_TOKEN: 'REFRESH_TOKEN',
  SET_LOADING: 'SET_LOADING'
};

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: false,
  error: null
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      };

    case AUTH_ACTIONS.UPDATE_PROFILE:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
        isLoading: false
      };

    case AUTH_ACTIONS.REFRESH_TOKEN:
      return {
        ...state,
        token: action.payload.token
      };

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    default:
      return state;
  }
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if token is valid on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      console.log('🔐 AuthContext - checkAuthStatus - token exists:', !!token);
      console.log('🔐 AuthContext - checkAuthStatus - current state:', state);
      
      // Skip if already loading (to prevent race conditions)
      if (state.isLoading) {
        console.log('🔐 AuthContext - checkAuthStatus - already loading, skipping');
        return;
      }
      
      if (token) {
        try {
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
          
          const response = await api.get('/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          console.log('🔐 AuthContext - checkAuthStatus - response:', response);

          if (response.data) {
            console.log('AuthContext - checkAuthStatus - user data:', response.data.data.user);
            dispatch({
              type: AUTH_ACTIONS.LOGIN_SUCCESS,
              payload: {
                user: response.data.data.user,
                token
              }
            });
          } else {
            console.log('AuthContext - checkAuthStatus - token invalid, logging out');
            // Token is invalid, remove it
            localStorage.removeItem('token');
            dispatch({ type: AUTH_ACTIONS.LOGOUT });
          }
        } catch (error) {
          console.error('AuthContext - checkAuthStatus - error:', error);
          localStorage.removeItem('token');
          dispatch({ type: AUTH_ACTIONS.LOGOUT });
        } finally {
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      console.log('AuthContext - login - starting login for:', email);
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });

      const response = await api.post('/auth/login', { email, password });
      console.log('AuthContext - login - response:', response);
      console.log('AuthContext - login - response.data:', response.data);
      console.log('AuthContext - login - response.data.data:', response.data?.data);

      if (response.data && response.data.data) {
        console.log('AuthContext - login - storing token and user data');
        localStorage.setItem('token', response.data.data.token);
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            user: response.data.data.user,
            token: response.data.data.token
          }
        });
        toast.success('Login successful!');
        console.log('AuthContext - login - returning success with user:', response.data.data.user);
        return { success: true, user: response.data.data.user };
      } else {
        console.log('AuthContext - login - login failed:', response.data?.message);
        dispatch({
          type: AUTH_ACTIONS.LOGIN_FAILURE,
          payload: response.data?.message || 'Login failed'
        });
        toast.error(response.data?.message || 'Login failed');
        return { success: false, message: response.data?.message };
      }
    } catch (error) {
      console.error('AuthContext - login - error:', error);
      console.error('AuthContext - login - error response:', error.response);
      console.error('AuthContext - login - error message:', error.message);
      
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage
      });
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.REGISTER_START });

      const response = await api.post('/auth/register', userData);

      if (response.data) {
        // Don't automatically log in after registration
        // Just show success message and let the form handle redirect
        toast.success('Registration successful! Please log in to your account.');
        return { success: true };
      } else {
        dispatch({
          type: AUTH_ACTIONS.REGISTER_FAILURE,
          payload: response.data?.message || 'Registration failed'
        });
        toast.error(response.data?.message || 'Registration failed');
        return { success: false, message: response.data?.message };
      }
    } catch (error) {
      console.error('Registration error:', error);
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAILURE,
        payload: 'Network error. Please try again.'
      });
      toast.error('Network error. Please try again.');
      return { success: false, message: 'Network error' };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (token) {
        // Call logout endpoint
        try {
          await api.post('/auth/logout', {}, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
        } catch (error) {
          console.log('Logout API call failed, but continuing with local logout');
        }
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      toast.success('Logged out successfully');
    }
  };

  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

      const response = await api.put('/auth/profile', profileData, {
        headers: {
          'Authorization': `Bearer ${state.token}`
        }
      });

      if (response.data) {
        dispatch({
          type: AUTH_ACTIONS.UPDATE_PROFILE,
          payload: response.data.data.user
        });
        toast.success('Profile updated successfully!');
        return { success: true };
      } else {
        toast.error(response.data?.message || 'Profile update failed');
        return { success: false, message: response.data?.message };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Network error. Please try again.');
      return { success: false, message: 'Network error' };
    }
  };

  // Change password function
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await api.put('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword
      }, {
        headers: {
          'Authorization': `Bearer ${state.token}`
        }
      });

      if (response.data) {
        toast.success('Password changed successfully!');
        return { success: true };
      } else {
        toast.error(response.data?.message || 'Password change failed');
        return { success: false, message: response.data?.message };
      }
    } catch (error) {
      console.error('Password change error:', error);
      toast.error('Network error. Please try again.');
      return { success: false, message: 'Network error' };
    }
  };

  // Refresh token function
  const refreshToken = async () => {
    try {
      const response = await api.post('/auth/refresh', {}, {
        headers: {
          'Authorization': `Bearer ${state.token}`
        }
      });

      if (response.data) {
        localStorage.setItem('token', response.data.data.token);
        dispatch({
          type: AUTH_ACTIONS.REFRESH_TOKEN,
          payload: { token: response.data.data.token }
        });
        return { success: true };
      } else {
        // Token refresh failed, logout user
        logout();
        return { success: false };
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      logout();
      return { success: false };
    }
  };

  // Check if user is admin
  const isAdmin = () => {
    return state.user?.is_admin || false;
  };

  // Check if user is verified
  const isVerified = () => {
    return state.user?.is_verified || false;
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    refreshToken,
    isAdmin,
    isVerified
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
