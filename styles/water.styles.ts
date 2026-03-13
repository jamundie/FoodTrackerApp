import { StyleSheet } from "react-native";

export const waterStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f8ff", // Light blue background for water theme
  },
  waterEntryTitle: {
    color: "#007AFF",
    fontWeight: "600",
  },
  // Inline row: entry name input + volume selector on the same line
  nameVolumeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 4,
  },
  nameInput: {
    flex: 3,
    marginTop: 0,
  },
  volumeSelector: {
    flex: 2,
    marginTop: 0,
  },
});
