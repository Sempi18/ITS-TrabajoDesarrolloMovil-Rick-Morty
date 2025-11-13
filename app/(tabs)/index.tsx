import { Link } from "expo-router";
import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from "react-native";
import { fetchCharacters } from "../../api/Rick_MortyApi";
import { useFavorites } from "../../contexts/FavoritesContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useNetInfo } from "../../hooks/useNetInfo";
import { logEvent } from "../../telemetry/telemetry";
import { useCharacterStatusColor } from "../../hooks/useCharacterStatusColor";

// 🔹 Tarjeta de personaje
const CharacterCard = React.memo(({ character, styles, fadeInAnim }) => {
  const statusColor = useCharacterStatusColor(character?.status);

  if (!character?.id)
    return (
      <View style={[styles.card, { opacity: 0.5 }]}>
        <Text style={{ color: "red" }}>Error al cargar personaje.</Text>
      </View>
    );

  return (
    <Animated.View style={{ opacity: fadeInAnim }}>
      <Link href={`/character/${character.id}`} asChild>
        <TouchableOpacity style={styles.card} activeOpacity={0.8}>
          <Image source={{ uri: character.image }} style={styles.image} />
          <View style={styles.info}>
            <Text style={styles.name}>{character.name}</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
              <Text style={styles.status}>{character.status}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Link>
    </Animated.View>
  );
});

// 🔹 Encabezado de estadísticas y filtros
const SummaryHeader = React.memo(({ totalCharacters, totalFavorites, currentFilter, setFilter, styles }) => {
  const filterOptions = ["All", "Alive", "Dead", "unknown"];

  return (
    <View style={styles.summaryContainer}>
      <Text style={styles.summaryTitle}>Explora el Multiverso de Rick & Morty</Text>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{totalCharacters}</Text>
          <Text style={styles.statLabel}>Personajes</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: "#C77DFF" }]}>{totalFavorites}</Text>
          <Text style={styles.statLabel}>Favoritos</Text>
        </View>
      </View>

      <Text style={styles.filterTitle}>Filtrar por estado:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        {filterOptions.map((filter) => (
          <TouchableOpacity
            key={filter}
            onPress={() => setFilter(filter)}
            style={[styles.filterButton, currentFilter === filter && styles.filterButtonActive]}
          >
            <Text
              style={[
                styles.filterButtonText,
                currentFilter === filter && styles.filterButtonTextActive,
              ]}
            >
              {filter === "All" ? "Mostrar todos" : filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
});

export default function CharactersScreen() {
  const [characters, setCharacters] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentFilter, setCurrentFilter] = useState("All");

  const isConnected = useNetInfo();
  const { theme } = useTheme();
  const { favorites } = useFavorites();

  const fadeInAnim = useRef(new Animated.Value(0)).current;

  const startFadeIn = useCallback(() => {
    Animated.timing(fadeInAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeInAnim]);

  const filteredCharacters = useMemo(() => {
    if (currentFilter === "All") return characters;
    return characters.filter((c) => c.status === currentFilter);
  }, [characters, currentFilter]);

  const fetchData = useCallback(
    async (pageNum) => {
      if (!isConnected && pageNum === 1) {
        Alert.alert("Sin conexión", "Conéctate a internet para cargar los datos.");
        logEvent("Error", { type: "No connection", screen: "CharactersScreen" });
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await fetchCharacters(pageNum);
        if (data.results && Array.isArray(data.results)) {
          setCharacters((prev) =>
            pageNum === 1
              ? data.results
              : [...prev, ...data.results.filter((c) => !prev.some((p) => p.id === c.id))]
          );
          logEvent("Data Loaded", { page: pageNum, count: data.results.length });
          startFadeIn();
        }
      } catch (error) {
        console.error("Error fetching characters:", error);
        logEvent("Error", { type: "API Fetch", error: error.message });
      } finally {
        setLoading(false);
      }
    },
    [isConnected, startFadeIn]
  );

  useEffect(() => {
    fetchData(page);
  }, [page, fetchData]);

  const loadMore = () => {
    if (isConnected) setPage((p) => p + 1);
    else {
      Alert.alert("Sin conexión", "No puedes cargar más personajes sin conexión.");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData(1);
    setRefreshing(false);
  };

  const s = getStyles(theme);

  if (loading && characters.length === 0)
    return (
      <View style={s.centeredView}>
        <ActivityIndicator size="large" color="#9D4EDD" />
        <Text style={[s.text, { marginTop: 10 }]}>Cargando personajes...</Text>
      </View>
    );

  return (
    <View style={s.container}>
      <FlatList
        data={filteredCharacters}
        renderItem={({ item }) => (
          <CharacterCard character={item} styles={s} fadeInAnim={fadeInAnim} />
        )}
        keyExtractor={(item) => item?.id?.toString()}
        ListHeaderComponent={() => (
          <SummaryHeader
            totalCharacters={characters.length}
            totalFavorites={favorites.length}
            currentFilter={currentFilter}
            setFilter={setCurrentFilter}
            styles={s}
          />
        )}
        ListFooterComponent={() => (
          <View style={s.footer}>
            {loading ? (
              <ActivityIndicator size="large" color="#9D4EDD" />
            ) : (
              isConnected && (
                <TouchableOpacity onPress={loadMore} style={s.loadMoreButton}>
                  <Text style={s.loadMoreText}>Cargar más</Text>
                </TouchableOpacity>
              )
            )}
          </View>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />

      {!isConnected && (
        <View style={s.offlineBanner}>
          <Text style={s.offlineText}>Modo Offline - Datos desactualizados</Text>
        </View>
      )}
    </View>
  );
}

// --- ESTILOS ---
const getStyles = () =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0B0A28" },
    centeredView: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#0B0A28",
    },
    text: { color: "#E0E0FF" },

    // HEADER
    summaryContainer: {
      padding: 20,
      backgroundColor: "#17153B",
      marginBottom: 10,
      borderBottomWidth: 2,
      borderBottomColor: "#9D4EDD",
      borderRadius: 20,
      shadowColor: "#000",
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 6,
    },
    summaryTitle: {
      fontSize: 22,
      fontWeight: "900",
      color: "#C77DFF",
      textAlign: "center",
      marginBottom: 15,
      textShadowColor: "#2D1B69",
      textShadowRadius: 10,
    },
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 14,
    },
    statBox: {
      alignItems: "center",
      paddingVertical: 8,
      width: "48%",
      backgroundColor: "#0F0E2C",
      borderRadius: 10,
      borderWidth: 1,
      borderColor: "#5A189A",
    },
    statNumber: { fontSize: 30, fontWeight: "bold", color: "#9D4EDD" },
    statLabel: { fontSize: 13, color: "#A6A3D2", marginTop: 2 },
    filterTitle: {
      fontSize: 15,
      fontWeight: "600",
      color: "#E0E0FF",
      marginTop: 10,
      marginBottom: 8,
    },
    filterScroll: { marginBottom: 10 },
    filterButton: {
      paddingVertical: 6,
      paddingHorizontal: 16,
      borderRadius: 25,
      backgroundColor: "#17153B",
      marginRight: 8,
      borderWidth: 1,
      borderColor: "#4C3D91",
    },
    filterButtonActive: { backgroundColor: "#9D4EDD", borderColor: "#C77DFF" },
    filterButtonText: { color: "#E0E0FF", fontSize: 14 },
    filterButtonTextActive: { color: "#0B0A28", fontWeight: "bold" },

    // CARDS
    card: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#17153B",
      borderRadius: 18,
      marginHorizontal: 15,
      marginVertical: 8,
      padding: 12,
      elevation: 5,
      shadowColor: "#9D4EDD",
      shadowOpacity: 0.25,
      shadowRadius: 8,
      borderWidth: 1,
      borderColor: "#5A189A",
    },
    image: {
      width: 64,
      height: 64,
      borderRadius: 12,
      marginRight: 14,
      borderWidth: 1.5,
      borderColor: "#C77DFF",
    },
    info: { flex: 1 },
    name: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#E0E0FF",
      marginBottom: 2,
    },
    statusRow: { flexDirection: "row", alignItems: "center" },
    statusIndicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 6,
    },
    status: { fontSize: 13, color: "#A6A3D2", fontWeight: "500" },

    // FOOTER
    footer: { padding: 30, alignItems: "center" },
    loadMoreButton: {
      backgroundColor: "#9D4EDD",
      paddingVertical: 12,
      paddingHorizontal: 32,
      borderRadius: 30,
      shadowColor: "#9D4EDD",
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 5,
    },
    loadMoreText: {
      color: "#E0E0FF",
      fontWeight: "bold",
      fontSize: 15,
    },
    offlineBanner: {
      backgroundColor: "#FF6B6B",
      padding: 10,
      alignItems: "center",
    },
    offlineText: { color: "#fff", fontWeight: "bold" },
  });
