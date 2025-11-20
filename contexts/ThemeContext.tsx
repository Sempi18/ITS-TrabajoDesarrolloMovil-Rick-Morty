import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { LayoutAnimation, useColorScheme } from "react-native";

const THEME_KEY = "appTheme_v2";

const cosmicLight = {
  background: "#EDE8FF",
  cardBackground: "#F8F6FF",
  text: "#1A1A2E",
  title: "#9D4EDD",
  subText: "#6B6B8E",
  tint: "#9D4EDD",
  border: "#CBB2FE",
};

const cosmicDark = {
  background: "#0B0A28",
  cardBackground: "#17153B",
  text: "#E0E0FF",
  title: "#C77DFF",
  subText: "#A6A3D2",
  tint: "#C77DFF",
  border: "#5A189A",
};

export const ThemeContext = createContext({
  themeMode: "light",
  theme: cosmicLight,
  toggleTheme: () => {},
});

// Provider del Tema
export const ThemeProvider = ({ children }) => {
  const systemTheme = useColorScheme();
  const [themeMode, setThemeMode] = useState(systemTheme || "light");
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar tema guardado desde AsyncStorage
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_KEY);
        if (stored) setThemeMode(stored);
      } catch (err) {
        console.error("❌ Error cargando tema:", err);
      } finally {
        setIsLoaded(true);
      }
    };
    loadTheme();
  }, []);

  // Guardar tema actual al cambiar
  useEffect(() => {
    if (!isLoaded) return;
    AsyncStorage.setItem(THEME_KEY, themeMode).catch((err) =>
      console.error("💾 Error guardando tema:", err)
    );
  }, [themeMode, isLoaded]);

  // Alternar tema (toggle)
  const toggleTheme = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setThemeMode((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  // Seleccionar tema actual según el modo
  const theme = themeMode === "dark" ? cosmicDark : cosmicLight;

  // Memorizar el valor del contexto
  const contextValue = useMemo(
    () => ({
      themeMode,
      theme,
      toggleTheme,
    }),
    [themeMode, theme]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook personalizado para acceder al contexto
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context)
    throw new Error("useTheme debe usarse dentro de un ThemeProvider");
  return context;
};
