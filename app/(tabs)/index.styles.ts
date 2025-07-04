import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  progressContainer: { marginBottom: 30 },
  progressText: { fontSize: 18, marginBottom: 10 },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 30,
  },
  metricsContainer: { alignItems: "center" },
  metricsHeader: { fontSize: 20, marginBottom: 10, fontWeight: "600" },
});
