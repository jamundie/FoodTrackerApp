import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
    flexGrow: 1,
  },
  overview: {},
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  overviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
    // Native shadow (iOS + Android)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  cardCount: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  cardValue: {
    fontSize: 18,
    color: "#007bff",
  },
  progressSnapshot: {},
  recentActivities: {
    marginTop: 30,
  },

  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  activityIcon: {
    fontSize: 24,
    marginRight: 12,
  },

  activityDetails: {
    flex: 1,
  },

  activityTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },

  activitySubtitle: {
    fontSize: 14,
    color: "#666",
  },

  activityTime: {
    fontSize: 12,
    color: "#999",
  },
});
