import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { fetchCharacterById } from "../../api/Rick_MortyApi";
import { useFavorites } from "../../contexts/FavoritesContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useCharacterStatusColor } from "../../hooks/useCharacterStatusColor"; // 💡 color dinámico de estado
import { logEvent } from "../../telemetry/telemetry";

export default function CharacterDetailScreen() {
  const { id } = useLocalSearchParams();
  const [character, setCharacter] = useState(null);
  const [episodesData, setEpisodesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { favorites, dispatch } = useFavorites();
  const { theme } = useTheme();

  const isFavorite = favorites.some((fav) => fav.id.toString() === id);
  const heartScale = useRef(new Animated.Value(1)).current; // ❤️ animación de rebote
  const statusColor = useCharacterStatusColor(character?.status);

  const fetchCharacter = async () => {
    setLoading(true);
    try {
      const data = await fetchCharacterById(id);
      setCharacter(data);
      logEvent("Character View", { characterId: id, characterName: data.name });
    } catch (error) {
      console.error("Error fetching character details:", error);
      setCharacter(null);
      logEvent("Error", {
        type: "API Fetch Detail",
        characterId: id,
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEpisodes = async () => {
    if (!character?.episode?.length) return;
    setEpisodesLoading(true);
    try {
      const episodes = await Promise.all(
        character.episode.map((url) => fetch(url).then((res) => res.json()))
      );
      const validEpisodes = episodes.filter((ep) => ep && ep.id);
      setEpisodesData(validEpisodes);
      logEvent("Episodes Loaded", {
        count: validEpisodes.length,
        characterId: character.id,
      });
    } catch (error) {
      console.error("Error fetching episodes:", error);
      logEvent("Error", {
        type: "Episodes Fetch Failed",
        characterId: character?.id,
      });
    } finally {
      setEpisodesLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchCharacter();
  }, [id]);

  useEffect(() => {
    if (character) fetchEpisodes();
  }, [character]);

  const toggleFavorite = () => {
    if (!character) return;

    // animación del corazón
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.3, useNativeDriver: true }),
      Animated.spring(heartScale, { toValue: 1, useNativeDriver: true }),
    ]).start();

    if (isFavorite) {
      dispatch({ type: "REMOVE_FAVORITE", payload: character });
      logEvent("Remove Favorite", {
        characterId: character.id,
        characterName: character.name,
      });
    } else {
      dispatch({ type: "ADD_FAVORITE", payload: character });
      logEvent("Add Favorite", {
        characterId: character.id,
        characterName: character.name,
      });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCharacter();
    setRefreshing(false);
  };

  const s = getStyles(theme);

  if (loading) {
    return (
      <View style={s.loadingContainer}>
        <ActivityIndicator size="large" color="#9D4EDD" />
        <Text style={[s.text, { marginTop: 10 }]}>Cargando personaje...</Text>
      </View>
    );
  }

  if (!character) {
    return (
      <View style={s.loadingContainer}>
        <Text style={s.text}>No se pudo cargar el personaje.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={s.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* --- Encabezado --- */}
      <View style={s.header}>
        <Image source={{ uri: character.image }} style={s.image} />
        <View style={s.headerInfo}>
          <Text style={s.name}>{character.name}</Text>
          <Text style={[s.status, { color: statusColor }]}>
            {character.status} — {character.species}
          </Text>

          <TouchableOpacity onPress={toggleFavorite} activeOpacity={0.8}>
            <Animated.View
              style={[s.favoriteButton, { transform: [{ scale: heartScale }] }]}
            >
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={34}
                color={isFavorite ? "#FF6B6B" : "#C77DFF"}
              />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>

      {/* --- Información General --- */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Información del Personaje</Text>
        <Text style={s.detailText}>
          <Text style={s.bold}>Género:</Text> {character.gender}
        </Text>
        <Text style={s.detailText}>
          <Text style={s.bold}>Origen:</Text> {character.origin.name}
        </Text>
        <Text style={s.detailText}>
          <Text style={s.bold}>Última ubicación:</Text>{" "}
          {character.location.name}
        </Text>
      </View>

      {/* --- Episodios --- */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Apariciones</Text>
        {episodesLoading ? (
          <ActivityIndicator size="small" color="#C77DFF" />
        ) : episodesData.length > 0 ? (
          episodesData.map((ep) => (
            <Text key={ep.id} style={s.episodeText}>
              <Text style={s.episodeCode}>{ep.episode}</Text> — {ep.name}
            </Text>
          ))
        ) : (
          <Text style={s.detailText}>No hay episodios disponibles.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const getStyles = () =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0B0A28" },
    text: { color: "#E0E0FF" },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#0B0A28",
    },
    header: {
      alignItems: "center",
      padding: 25,
      backgroundColor: "#17153B",
      borderBottomLeftRadius: 40,
      borderBottomRightRadius: 40,
      marginBottom: 20,
      shadowColor: "#9D4EDD",
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 6,
    },
    image: {
      width: 180,
      height: 180,
      borderRadius: 90,
      borderWidth: 3,
      borderColor: "#C77DFF",
    },
    headerInfo: { alignItems: "center", marginTop: 15 },
    name: {
      fontSize: 28,
      fontWeight: "900",
      color: "#E0E0FF",
      textAlign: "center",
      textShadowColor: "#5A189A",
      textShadowRadius: 10,
    },
    status: {
      fontSize: 16,
      marginTop: 5,
      fontStyle: "italic",
    },
    favoriteButton: {
      marginTop: 15,
      backgroundColor: "#2D1B69",
      padding: 10,
      borderRadius: 50,
      shadowColor: "#C77DFF",
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 5,
    },
    section: {
      paddingHorizontal: 20,
      paddingVertical: 18,
      marginHorizontal: 15,
      marginBottom: 15,
      borderRadius: 16,
      backgroundColor: "#17153B",
      borderWidth: 1,
      borderColor: "#5A189A",
      shadowColor: "#9D4EDD",
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 4,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: "bold",
      marginBottom: 10,
      color: "#C77DFF",
      borderBottomWidth: 1,
      borderBottomColor: "#5A189A",
      paddingBottom: 5,
      textShadowColor: "#2D1B69",
      textShadowRadius: 6,
    },
    bold: { fontWeight: "bold", color: "#E0E0FF" },
    detailText: {
      fontSize: 16,
      marginBottom: 6,
      color: "#A6A3D2",
    },
    episodeText: {
      fontSize: 15,
      color: "#E0E0FF",
      marginBottom: 8,
      paddingLeft: 5,
    },
    episodeCode: {
      color: "#C77DFF",
      fontWeight: "bold",
    },
  });
