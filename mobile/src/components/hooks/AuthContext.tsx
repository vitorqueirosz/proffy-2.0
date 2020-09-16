import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';

import AsyncStorage from '@react-native-community/async-storage';

import api from '../../services/api';

interface SignInCredentials {
    email: string;
    password: string;
}

interface signUpCredentials {
    name: string;
    email: string;
    password: string;
    whatsapp: string;
}

interface User {
    id: string;
    name: string;
    email: string;
    avatar: string;
    whatsapp: string;
    bio: string;
}

interface AuthContextData {
    user: User;
    signIn(credentials: SignInCredentials): Promise<void>;
    signOut(): void;
    signUp(credentials: signUpCredentials): Promise<void>;
    handleVisibleFilter(): void;
    updateUserData(user: User): Promise<void>;
    isVisible: boolean;
}
interface AuthData {
    user: User;
    token: string;
}
const AuthContext = createContext({} as AuthContextData);

const AuthProvider: React.FC = ({ children }) => {
    const [data, setData] = useState({} as AuthData);
    const [isVisible, setIsVisible] = useState<boolean>(false);

    useEffect(() => {

        (
            async function loadAuthData(): Promise<void> {
               const [token, user] = await AsyncStorage.multiGet([
                '@Proffy:token',
                '@Proffy:user'
               ]);

               if (token[1] && user[1]) {
                   api.defaults.headers.authorization = `Bearer ${token}`;

                   setData({ token: token[1], user: JSON.parse(user[1]) })
               }
            }
        )();
    }, []);


    const signIn = useCallback( async ({ email, password }) => {
        const response = await api.post('/sessions', {
            email,
            password
        });

        const { user, token } = response.data;

        await AsyncStorage.multiSet([
            ['@Proffy:token', token],
            ['@Proffy:user', JSON.stringify(user)]
        ]);

        api.defaults.headers.authorization = `Bearer ${token}`;

        setData({ user, token });
    }, []);

    const updateUserData = useCallback( async (user: User) => {
        await AsyncStorage.setItem('@Proffy:user', JSON.stringify(user));

        setData({
            token: data.token,
            user
        });

    }, [data.token]);

    const signOut = useCallback(async () => {
          await AsyncStorage.multiRemove([
              '@Proffy:token',
              '@Proffy:user'
          ]);

          setData({} as AuthData);
    }, []);

    const signUp = useCallback( async ({ name, email, password, whatsapp }) => {

        const response = await api.post('/users', {
            name,
            email,
            password,
            whatsapp
        });

        const { user } = response.data;

        setData(user);
    }, []);

    const handleVisibleFilter = useCallback(() => {
        setIsVisible(!isVisible);
    }, [isVisible]);


  return (
    <AuthContext.Provider value={{
         signIn,
         signUp,
         user: data.user,
         signOut,
         handleVisibleFilter,
         updateUserData,
         isVisible }}
    >
      {children}
    </AuthContext.Provider>
  )
}

function useAuth(): AuthContextData {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }

    return context;
}

export  { AuthProvider, useAuth};
