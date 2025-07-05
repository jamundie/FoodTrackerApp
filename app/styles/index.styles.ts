import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
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
    boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
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
