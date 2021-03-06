import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { AppLoading } from 'expo';
import { Archivo_400Regular, Archivo_700Bold, useFonts } from '@expo-google-fonts/archivo';
import { Poppins_400Regular, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import Routes from './src/routes/AppStack';

import { AuthProvider } from './src/components/hooks/AuthContext';



export default function App() {


    const [fontsLoaded] = useFonts({
        Archivo_400Regular,
        Archivo_700Bold,
        Poppins_400Regular,
        Poppins_600SemiBold
      });

      if (!fontsLoaded) {
         return <AppLoading />
      }


  return (
    <>
      <StatusBar style="auto" backgroundColor="#8257E5" />
      <AuthProvider>
        <Routes />
      </AuthProvider>
    </>
  );

}
