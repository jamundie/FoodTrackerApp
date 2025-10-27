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
    boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
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
  chartSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
    textAlign: "center",
  },
  chartContainer: {
    alignItems: "center",
    marginVertical: 10,
  },
  chartLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    marginTop: 10,
  },
  dayLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  calorieValues: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    marginTop: 5,
  },
  calorieValue: {
    fontSize: 10,
    color: "#007bff",
    fontWeight: "bold",
  },
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
