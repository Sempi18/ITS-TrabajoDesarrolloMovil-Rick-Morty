import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext'; 
import { StyleSheet } from 'react-native';

export default function TabScreensLayout() {
  const { theme } = useTheme(); 

  
  const tabBarStyle = StyleSheet.create({
    bar: {
        backgroundColor: theme.cardBackground, 
        borderTopColor: theme.cardBackground, 
      },
  });

  return (
    <Tabs screenOptions={{
      // Aplicamos los colores dinámicos
      tabBarActiveTintColor: theme.title, 
      tabBarInactiveTintColor: theme.subText,
      tabBarStyle: tabBarStyle.bar,
      headerShown: false,
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Personajes',
          tabBarIcon: ({ color }) => <Ionicons name="people" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favoritos',
          tabBarIcon: ({ color }) => <Ionicons name="heart" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <Ionicons name="person-circle" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}