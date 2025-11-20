import { Link } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
} from "react-native";
import { useFavorites } from "../../contexts/FavoritesContext";
import { useTheme } from "../../contexts/ThemeContext";
import { logEvent } from "../../telemetry/telemetry";
import { useCharacterStatusColor } from "../../hooks/useCharacterStatusColor";
const FavoriteCard = ({ character, styles }) => {
  const { dispatch } = useFavorites();
  const [fadeAnim] = useState(new Animated.Value(1)); //  Animación para efecto de eliminación
  const statusColor = useCharacterStatusColor(character.status);

  const handleRemoveFavorite = () => {
    logEvent("Remove Favorite", {
      characterId: character.id,
      characterName: character.name,
    });

    // Animación antes de eliminar
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      dispatch({ type: "REMOVE_FAVORITE", payload: character });
    });
  };

  return (
    <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
      <Link href={`/character/${character?.id?.toString()}`} asChild>
        <TouchableOpacity style={styles.infoContainer} activeOpacity={0.8}>
          <Image source={{ uri: character.image }} style={styles.image} />
          <View>
            <Text style={styles.name}>{character.name}</Text>
            <Text style={[styles.status, { color: statusColor }]}>
              {character.status}
            </Text>
          </View>
        </TouchableOpacity>
      </Link>

      <TouchableOpacity
        onPress={handleRemoveFavorite}
        style={styles.removeButton}
        activeOpacity={0.8}
      >
        <Text style={styles.removeText}>Eliminar</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function FavoritesScreen() {
  const { favorites } = useFavorites();
  const { theme } = useTheme();
  const dynamicStyles = getStyles(theme);

  return (
    <View style={dynamicStyles.container}>
      {favorites.length === 0 ? (
        <View style={dynamicStyles.emptyContainer}>
          <Text style={dynamicStyles.emptyEmoji}>😞</Text>
          <Text style={dynamicStyles.emptyText}>Sin favoritos aún</Text>
          <Text style={dynamicStyles.subEmptyText}>
            Agrega personajes desde la pantalla de detalles.
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={({ item }) => (
            <FavoriteCard character={item} styles={dynamicStyles} />
          )}
          keyExtractor={(item) => item?.id?.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#0B0A28",
      padding: 16,
    },
    // --- ESTADO VACÍO ---
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    emptyEmoji: {
      fontSize: 54,
      marginBottom: 12,
    },
    emptyText: {
      textAlign: "center",
      fontSize: 22,
      fontWeight: "bold",
      color: "#C77DFF",
    },
    subEmptyText: {
      textAlign: "center",
      marginTop: 6,
      fontSize: 14,
      color: "#A6A3D2",
    },
    // --- TARJETAS ---
    card: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: "#17153B",
      borderRadius: 18,
      padding: 14,
      marginVertical: 10,
      shadowColor: "#9D4EDD",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
      borderWidth: 1,
      borderColor: "#5A189A",
    },
    infoContainer: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    image: {
      width: 64,
      height: 64,
      borderRadius: 14,
      marginRight: 12,
      borderWidth: 2,
      borderColor: "#C77DFF",
    },
    name: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#E0E0FF",
      marginBottom: 2,
    },
    status: {
      fontSize: 14,
      fontWeight: "600",
    },
    // --- BOTÓN ELIMINAR ---
    removeButton: {
      backgroundColor: "#9D4EDD",
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 25,
      shadowColor: "#9D4EDD",
      shadowOpacity: 0.5,
      shadowRadius: 6,
      elevation: 5,
      borderWidth: 1,
      borderColor: "#C77DFF",
    },
    removeText: {
      color: "#EDE8FF",
      fontSize: 13,
      fontWeight: "bold",
    },
  });
