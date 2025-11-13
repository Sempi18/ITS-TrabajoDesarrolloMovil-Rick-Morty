import { Platform } from "react-native";

// --- Colores base ---
const tintColorLight = "#9D4EDD"; // Violeta brillante
const tintColorDark = "#C77DFF"; // Lavanda luminosa

export const Colors = {
  light: {
    text: "#1A1A2E", // Texto oscuro sobre fondo claro
    background: "#EDE8FF", // Lavanda muy pálido
    tint: tintColorLight, // Violeta vibrante
    icon: "#5A189A", // Púrpura intenso
    tabIconDefault: "#B9A8FF", // Suave violeta grisáceo
    tabIconSelected: tintColorLight,
    card: "#F8F6FF", // Fondo de tarjeta sutil lavanda
    subText: "#6B6B8E", // Texto secundario gris azulado
    border: "#CBB2FE", // Borde lavanda
    title: "#9D4EDD", // Títulos destacados
  },

  dark: {
    text: "#E0E0FF", // Blanco con matiz lavanda
    background: "#0B0A28", // Azul-violeta espacial
    tint: tintColorDark, // Lavanda neón
    icon: "#9D4EDD", // Púrpura brillante
    tabIconDefault: "#5A189A", // Oscuro desaturado
    tabIconSelected: tintColorDark,
    card: "#17153B", // Tarjetas violetas profundas
    subText: "#A6A3D2", // Texto gris azulado
    border: "#5A189A", // Borde tenue violeta
    title: "#C77DFF", // Color principal en títulos
  },
};

// --- Tipografías ---
export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
