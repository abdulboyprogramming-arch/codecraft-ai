/**
 * CodeCraft AI - Store
 * 
 * This module provides global state management using React Context.
 * 
 * Developer: Abdulrahman Adeeyo
 * Hackathon: Prometheus July AI Challenge
 */

import { createContext, useContext, useReducer } from 'react'

// ============================================
// State Types
// ============================================

const initialState = {
  theme: 'light',
  notifications: [],
  sidebarOpen: true,
  currentReview: null,
  isLoading: false,
}

// ============================================
// Action Types
// ============================================

const ActionTypes = {
  SET_THEME: 'SET_THEME',
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  SET_CURRENT_REVIEW: 'SET_CURRENT_REVIEW',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  SET_LOADING: 'SET_LOADING',
  CLEAR_NOTIFICATIONS: 'CLEAR_NOTIFICATIONS',
}

// ============================================
// Reducer
// ============================================

function storeReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_THEME:
      return { ...state, theme: action.payload }

    case ActionTypes.TOGGLE_SIDEBAR:
      return { ...state, sidebarOpen: !state.sidebarOpen }

    case ActionTypes.SET_CURRENT_REVIEW:
      return { ...state, currentReview: action.payload }

    case ActionTypes.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, {
          id: Date.now(),
          ...action.payload,
          timestamp: new Date(),
        }],
      }

    case ActionTypes.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
      }

    case ActionTypes.CLEAR_NOTIFICATIONS:
      return { ...state, notifications: [] }

    case ActionTypes.SET_LOADING:
      return { ...state, isLoading: action.payload }

    default:
      return state
  }
}

// ============================================
// Context
// ============================================

const StoreContext = createContext()

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(storeReducer, initialState)

  // Action creators
  const actions = {
    setTheme: (theme) => dispatch({ type: ActionTypes.SET_THEME, payload: theme }),
    toggleSidebar: () => dispatch({ type: ActionTypes.TOGGLE_SIDEBAR }),
    setCurrentReview: (review) => dispatch({ type: ActionTypes.SET_CURRENT_REVIEW, payload: review }),
    addNotification: (notification) => dispatch({ type: ActionTypes.ADD_NOTIFICATION, payload: notification }),
    removeNotification: (id) => dispatch({ type: ActionTypes.REMOVE_NOTIFICATION, payload: id }),
    clearNotifications: () => dispatch({ type: ActionTypes.CLEAR_NOTIFICATIONS }),
    setLoading: (isLoading) => dispatch({ type: ActionTypes.SET_LOADING, payload: isLoading }),
  }

  return (
    <StoreContext.Provider value={{ state, actions }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const context = useContext(StoreContext)
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider')
  }
  return context
}

// ============================================
// Export Action Types
// ============================================

export { ActionTypes }
