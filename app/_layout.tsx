import { Stack } from 'expo-router';
import { FavoritesProvider } from '../contexts/FavoritesContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <ThemeProvider> 
      <FavoritesProvider>
        <SafeAreaView style={{ flex: 1 }}>
          <Stack>
            {/* Agrupa las pestañas */}
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            
            <Stack.Screen 
              name="character/[id]" 
              options={{ 
                headerTitle: 'Detalles del Personaje',
                headerBackTitleVisible: false,
              }} 
            />
          </Stack>
        </SafeAreaView>
      </FavoritesProvider>
    </ThemeProvider>
  );
}