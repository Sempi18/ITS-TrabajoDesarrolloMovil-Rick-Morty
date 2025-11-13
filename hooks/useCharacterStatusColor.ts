export const useCharacterStatusColor = (status) => {
  switch (status) {
    case "Alive":
      return "#4CAF50";
    case "Dead":
      return "#E63946";
    default:
      return "#FFD166";
  }
};
