import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";

// --- CONSTANTES ---
const FAVORITES_KEY = "favorites_v2"; // cambiamos la key para diferenciar versión
const initialState = [];

// --- REDUCER ---
const favoritesReducer = (state, action) => {
  switch (action.type) {
    case "SET_FAVORITES":
      return Array.isArray(action.payload) ? action.payload : initialState;

    case "ADD_FAVORITE":
      // Evita duplicados
      if (state.some((item) => item.id === action.payload.id)) return state;
      return [...state, action.payload];

    case "REMOVE_FAVORITE":
      return state.filter((char) => char.id !== action.payload.id);

    case "CLEAR_FAVORITES":
      return initialState;

    default:
      console.warn(`⚠️ Acción desconocida: ${action.type}`);
      return state;
  }
};

// --- CONTEXTO ---
const FavoritesContext = createContext({
  favorites: [],
  dispatch: () => {},
  isLoaded: false,
});

// --- PROVIDER ---
export const FavoritesProvider = ({ children }) => {
  const [favorites, dispatch] = useReducer(favoritesReducer, initialState);
  const [isLoaded, setIsLoaded] = useState(false);

  // --- Cargar desde almacenamiento ---
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const data = await AsyncStorage.getItem(FAVORITES_KEY);
        if (data) {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed)) {
            dispatch({ type: "SET_FAVORITES", payload: parsed });
            console.log(`✅ ${parsed.length} favoritos cargados`);
          }
        }
      } catch (err) {
        console.error("❌ Error cargando favoritos:", err);
      } finally {
        setIsLoaded(true);
      }
    };
    loadFavorites();
  }, []);

  // --- Guardar en almacenamiento ---
  useEffect(() => {
    if (!isLoaded) return;
    const saveFavorites = async () => {
      try {
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      } catch (err) {
        console.error("💾 Error guardando favoritos:", err);
      }
    };
    saveFavorites();
  }, [favorites, isLoaded]);

  // --- Limpieza completa ---
  const clearFavorites = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(FAVORITES_KEY);
      dispatch({ type: "CLEAR_FAVORITES" });
      console.log("🗑️ Favoritos limpiados correctamente");
    } catch (err) {
      console.error("Error al limpiar favoritos:", err);
    }
  }, []);

  // --- Valor memoizado ---
  const contextValue = useMemo(
    () => ({ favorites, dispatch, clearFavorites, isLoaded }),
    [favorites, clearFavorites, isLoaded]
  );

  return (
    <FavoritesContext.Provider value={contextValue}>
      {children}
    </FavoritesContext.Provider>
  );
};

// --- HOOK PERSONALIZADO ---
export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites debe usarse dentro de un FavoritesProvider");
  }
  return context;
};
