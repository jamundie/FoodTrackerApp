import { StyleSheet } from "react-native";

export const profileStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#eee",
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  fieldRowLast: {
    borderBottomWidth: 0,
  },
  fieldLabel: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  fieldInput: {
    flex: 1,
    fontSize: 16,
    color: "#000",
    textAlign: "right",
    padding: 0,
  },
  fieldInputPlaceholder: {
    color: "#999",
  },
  volumeRow: {
    paddingVertical: 8,
  },
  volumeLabel: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
  },
  saveButton: {
    backgroundColor: "#34C759",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  savedBanner: {
    backgroundColor: "#e6f9ed",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#34C759",
  },
  savedBannerText: {
    color: "#1a7a3a",
    fontSize: 14,
    fontWeight: "600",
  },
});
