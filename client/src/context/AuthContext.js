import { createContext, useContext, useReducer, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null)

const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN':
            return { user: action.payload }
        case 'LOGOUT':
            return { user: null }
        default:
            return state
    }

}

const getInitialState = () => {
    const token = localStorage.getItem('jwtToken');

    if(!token) return { user: null }


    try {
        const decoded = jwtDecode(token)


        if(decoded.exp * 1000 < Date.now()) {
            localStorage.removeItem('jwtToken')
            return { user: null}
        }

        return { user: decoded }
    } catch (error) {
        localStorage.removeItem('jwtToken')
        return { user: null };
    }
}


export const AuthProvider = ({ children }) => {
    const [ state, dispatch ] = useReducer(authReducer, null, getInitialState)

    const login = (userData) => {
        localStorage.setItem('jwtToken', userData.token)
        dispatch({ type: 'LOGIN', payload: userData})
    }

    const logout = () => {
        localStorage.removeItem('jwtToken')
        dispatch({ type: 'LOGOUT'})
    };


    return (
        <AuthContext.Provider value={{ user: state.user, login, logout}}>
            {children}
        </AuthContext.Provider>
    )
}


// custom hook
export const useAuth = () => {
    const context = useContext(AuthContext)
    if(!context){
        throw new Error('useAuth must be used within AuthProvider')
    }

    return context
}