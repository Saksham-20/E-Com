import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

// Action types
const WISHLIST_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_WISHLIST: 'SET_WISHLIST',
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  CLEAR_WISHLIST: 'CLEAR_WISHLIST',
  SET_ERROR: 'SET_ERROR',
  MERGE_GUEST_WISHLIST: 'MERGE_GUEST_WISHLIST'
};

// Initial state
const initialState = {
  items: [],
  isLoading: false,
  error: null
};

// Reducer function
const wishlistReducer = (state, action) => {
  switch (action.type) {
    case WISHLIST_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    case WISHLIST_ACTIONS.SET_WISHLIST:
      return {
        ...state,
        items: action.payload.items || [],
        isLoading: false,
        error: null
      };

    case WISHLIST_ACTIONS.ADD_ITEM:
      // Check if item already exists
      const existingItem = state.items.find(item => item.product_id === action.payload.product_id);
      
      if (existingItem) {
        return state; // Item already exists
      }

      return {
        ...state,
        items: [...state.items, action.payload]
      };

    case WISHLIST_ACTIONS.REMOVE_ITEM:
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };

    case WISHLIST_ACTIONS.CLEAR_WISHLIST:
      return {
        ...state,
        items: []
      };

    case WISHLIST_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };

    case WISHLIST_ACTIONS.MERGE_GUEST_WISHLIST:
      return {
        ...state,
        items: action.payload.items || []
      };

    default:
      return state;
  }
};

// Wishlist Provider Component
export const WishlistProvider = ({ children }) => {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);
  const { isAuthenticated, token } = useAuth();

  // Load wishlist from localStorage for guest users
  useEffect(() => {
    if (!isAuthenticated) {
      const guestWishlist = localStorage.getItem('guestWishlist');
      if (guestWishlist) {
        try {
          const parsedWishlist = JSON.parse(guestWishlist);
          dispatch({
            type: WISHLIST_ACTIONS.MERGE_GUEST_WISHLIST,
            payload: parsedWishlist
          });
        } catch (error) {
          console.error('Error parsing guest wishlist:', error);
          localStorage.removeItem('guestWishlist');
        }
      }
    }
  }, [isAuthenticated]);

  // Save guest wishlist to localStorage
  useEffect(() => {
    if (!isAuthenticated) {
      if (state.items.length > 0) {
        localStorage.setItem('guestWishlist', JSON.stringify({
          items: state.items
        }));
      } else {
        localStorage.removeItem('guestWishlist');
      }
    }
  }, [state.items, isAuthenticated]);

  // Load user wishlist when authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      loadUserWishlist();
    }
  }, [isAuthenticated, token]);

  // Load user wishlist from API
  const loadUserWishlist = async () => {
    try {
      dispatch({ type: WISHLIST_ACTIONS.SET_LOADING, payload: true });

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/wishlist`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        dispatch({
          type: WISHLIST_ACTIONS.SET_WISHLIST,
          payload: data.data
        });
      } else {
        throw new Error('Failed to load wishlist');
      }
    } catch (error) {
      console.error('Load wishlist error:', error);
      dispatch({
        type: WISHLIST_ACTIONS.SET_ERROR,
        payload: 'Failed to load wishlist'
      });
    }
  };

  // Add item to wishlist
  const addToWishlist = async (product) => {
    try {
      if (isAuthenticated) {
        // Add to user wishlist via API
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/wishlist`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            product_id: product.id
          })
        });

        if (response.ok) {
          const data = await response.json();
          
          // Reload wishlist to get updated state
          await loadUserWishlist();
          
          toast.success(data.message || 'Item added to wishlist');
          return { success: true };
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || 'Failed to add item to wishlist');
          return { success: false, message: errorData.message };
        }
      } else {
        // Add to guest wishlist
        const wishlistItem = {
          id: `guest_${Date.now()}`,
          product_id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          compare_price: product.compare_price,
          primary_image: product.primary_image,
          category_name: product.category_name,
          category_slug: product.category_slug,
          brand_name: product.brand_name,
          brand_slug: product.brand_slug
        };

        dispatch({
          type: WISHLIST_ACTIONS.ADD_ITEM,
          payload: wishlistItem
        });

        toast.success('Item added to wishlist');
        return { success: true };
      }
    } catch (error) {
      console.error('Add to wishlist error:', error);
      toast.error('Failed to add item to wishlist');
      return { success: false, message: 'Network error' };
    }
  };

  // Remove item from wishlist
  const removeFromWishlist = async (itemId) => {
    try {
      if (isAuthenticated) {
        // Remove via API
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/wishlist/${itemId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          
          // Reload wishlist to get updated state
          await loadUserWishlist();
          
          toast.success(data.message || 'Item removed from wishlist');
          return { success: true };
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || 'Failed to remove item');
          return { success: false, message: errorData.message };
        }
      } else {
        // Remove from guest wishlist
        dispatch({
          type: WISHLIST_ACTIONS.REMOVE_ITEM,
          payload: itemId
        });

        toast.success('Item removed from wishlist');
        return { success: true };
      }
    } catch (error) {
      console.error('Remove from wishlist error:', error);
      toast.error('Failed to remove item from wishlist');
      return { success: false, message: 'Network error' };
    }
  };

  // Clear wishlist
  const clearWishlist = async () => {
    try {
      if (isAuthenticated) {
        // Clear via API
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/wishlist`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          
          // Reload wishlist to get updated state
          await loadUserWishlist();
          
          toast.success(data.message || 'Wishlist cleared');
          return { success: true };
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || 'Failed to clear wishlist');
          return { success: false, message: errorData.message };
        }
      } else {
        // Clear guest wishlist
        dispatch({ type: WISHLIST_ACTIONS.CLEAR_WISHLIST });
        toast.success('Wishlist cleared');
        return { success: true };
      }
    } catch (error) {
      console.error('Clear wishlist error:', error);
      toast.error('Failed to clear wishlist');
      return { success: false, message: 'Network error' };
    }
  };

  // Merge guest wishlist with user wishlist after login
  const mergeGuestWishlist = async () => {
    if (state.items.length === 0) return;

    try {
      let mergedCount = 0;
      let skippedCount = 0;

      for (const item of state.items) {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/wishlist`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            product_id: item.product_id
          })
        });

        if (response.ok) {
          mergedCount++;
        } else {
          skippedCount++;
        }
      }

      // Clear guest wishlist and load user wishlist
      dispatch({ type: WISHLIST_ACTIONS.CLEAR_WISHLIST });
      localStorage.removeItem('guestWishlist');
      
      // Reload user wishlist
      await loadUserWishlist();
      
      toast.success(`Wishlist merged successfully! ${mergedCount} items added.`);
      return { success: true, mergedCount, skippedCount };
    } catch (error) {
      console.error('Merge wishlist error:', error);
      toast.error('Failed to merge wishlist');
      return { success: false, message: 'Network error' };
    }
  };

  // Get wishlist item count
  const getWishlistItemCount = () => {
    return state.items.length;
  };

  // Check if item is in wishlist
  const isItemInWishlist = (productId) => {
    return state.items.some(item => item.product_id === productId);
  };

  // Get wishlist item by product ID
  const getWishlistItem = (productId) => {
    return state.items.find(item => item.product_id === productId);
  };

  const value = {
    ...state,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    mergeGuestWishlist,
    getWishlistItemCount,
    isItemInWishlist,
    getWishlistItem,
    loadUserWishlist
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

// Custom hook to use wishlist context
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export default WishlistContext;
