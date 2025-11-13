import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFavorites } from "../../contexts/FavoritesContext";
import { useTheme } from "../../contexts/ThemeContext";
import { logEvent } from "../../telemetry/telemetry";

export default function ProfileScreen() {
  const { dispatch } = useFavorites();
  const { themeMode, toggleTheme } = useTheme();

  const appVersion = Constants.manifest?.version || "1.0.4";

  const clearData = async () => {
    try {
      await AsyncStorage.clear();
      dispatch({ type: "SET_FAVORITES", payload: [] });

      logEvent("Data Cleared", { action: "Full reset via button" });
      Alert.alert("¡Listo!", "Todos los datos guardados han sido borrados.");
    } catch (error) {
      console.error("Error clearing data:", error);
      logEvent("Error", {
        type: "AsyncStorage Clear Failed",
        error: error.message,
      });
      Alert.alert("Error", "No se pudieron borrar los datos.");
    }
  };

  const dynamicStyles = getStyles(themeMode);

  return (
    <View style={dynamicStyles.container}>
      <Text style={dynamicStyles.title}>
        Bienvenido a tu perfil
      </Text>

      {/* Botón de cambio de tema */}
      <TouchableOpacity
        style={dynamicStyles.option}
        onPress={() => toggleTheme(themeMode)}
      >
        <Text style={dynamicStyles.optionText}>
          Modo {themeMode === "light" ? "Oscuro" : "Claro"}
        </Text>
      </TouchableOpacity>

      {/* Botón de borrar datos */}
      <TouchableOpacity
        style={[dynamicStyles.option, dynamicStyles.resetButton]}
        onPress={clearData}
      >
        <Text style={dynamicStyles.resetText}>Borrar datos guardados</Text>
      </TouchableOpacity>

      <View style={dynamicStyles.versionContainer}>
        <Text style={dynamicStyles.versionText}>
          Versión de la aplicación: {appVersion}
        </Text>
      </View>
    </View>
  );
}

const getStyles = (themeMode) => {
  const cosmicTheme =
    themeMode === "light"
      ? {
          background: "#EDE8FF",
          cardBackground: "#F8F6FF",
          text: "#1A1A2E",
          accent: "#9D4EDD",
          accentDark: "#5A189A",
          secondaryText: "#6B6B8E",
          shadowColor: "#CBB2FE",
          borderColor: "#C77DFF",
        }
      : {
          background: "#0B0A28",
          cardBackground: "#17153B",
          text: "#E0E0FF",
          accent: "#9D4EDD",
          accentDark: "#5A189A",
          secondaryText: "#A6A3D2",
          shadowColor: "#9D4EDD",
          borderColor: "#5A189A",
        };

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: cosmicTheme.background,
      padding: 25,
    },
    title: {
      fontSize: 26,
      fontWeight: "900",
      textAlign: "center",
      marginBottom: 25,
      color: cosmicTheme.accent,
      textShadowColor: cosmicTheme.accentDark,
      textShadowRadius: 12,
    },
    option: {
      backgroundColor: cosmicTheme.cardBackground,
      borderColor: cosmicTheme.borderColor,
      borderWidth: 1,
      paddingVertical: 15,
      paddingHorizontal: 20,
      borderRadius: 14,
      marginBottom: 15,
      shadowColor: cosmicTheme.shadowColor,
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 4,
    },
    optionText: {
      fontSize: 16,
      color: cosmicTheme.text,
      fontWeight: "500",
    },
    resetButton: {
      backgroundColor: "#2D1B69",
      borderColor: "#9D4EDD",
    },
    resetText: {
      fontSize: 15,
      color: "#FF6B6B",
      fontWeight: "bold",
      textAlign: "center",
    },
    versionContainer: {
      marginTop: "auto",
      alignItems: "center",
      paddingVertical: 20,
      borderTopWidth: 1,
      borderTopColor: cosmicTheme.borderColor,
    },
    versionText: {
      fontSize: 13,
      color: cosmicTheme.secondaryText,
    },
  });
};
