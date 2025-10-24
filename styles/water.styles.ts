import { StyleSheet } from "react-native";

export const waterStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f8ff", // Light blue background for water theme
  },
  waterIcon: {
    fontSize: 24,
    color: "#007AFF",
  },
  waterEntryTitle: {
    color: "#007AFF",
    fontWeight: "600",
  },
  ingredientsAccordion: {
    marginTop: 16,
    marginBottom: 16,
  },
  accordionTitle: {
    color: "#007AFF",
  },
});

// Re-export food styles for consistency
export { styles } from "./food.styles";