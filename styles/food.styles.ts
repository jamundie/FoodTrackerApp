import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    marginBottom: 24,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    marginTop: 4,
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    marginTop: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownButtonText: {
    fontSize: 16,
    color: "#000",
  },
  placeholderText: {
    color: "#999",
  },
  dropdownArrow: {
    fontSize: 12,
    color: "#666",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownModal: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    width: "80%",
    maxHeight: "60%",
  },
  dropdownHeader: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  categoryOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  categoryOptionText: {
    fontSize: 16,
  },
  selectedCategoryOption: {
    backgroundColor: "#f0f8ff",
  },
  dateSeparator: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f8f8f8",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#eee",
    marginVertical: 8,
  },
  dateSeparatorText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
    textAlign: "center",
  },
  calendarContainer: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  calendarNavButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: "#007AFF",
    minWidth: 32,
    alignItems: "center",
  },
  calendarNavButtonDisabled: {
    backgroundColor: "#ccc",
  },
  calendarNavText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  calendarNavTextDisabled: {
    color: "#999",
  },
  calendarHeaderText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  calendarDaysHeader: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 8,
  },
  calendarDayHeaderText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    textAlign: "center",
    flex: 1,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  calendarDay: {
    width: "14.28%", // 100% / 7 days
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    marginBottom: 2,
  },
  calendarDayOtherMonth: {
    opacity: 0.3,
  },
  calendarDayToday: {
    backgroundColor: "#e3f2fd",
    borderWidth: 2,
    borderColor: "#2196f3",
  },
  calendarDaySelected: {
    backgroundColor: "#007AFF",
  },
  calendarDayDisabled: {
    opacity: 0.3,
  },
  calendarDayText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  calendarDayTextOtherMonth: {
    color: "#999",
  },
  calendarDayTextToday: {
    color: "#2196f3",
    fontWeight: "600",
  },
  calendarDayTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  calendarDayTextDisabled: {
    color: "#ccc",
  },
  closeButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginTop: 16,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  hint: {
    marginTop: 4,
    color: "#666",
    fontSize: 12,
  },
  ingredientsSection: {
    marginTop: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  ingredientCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  ingredientHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  removeButton: {
    backgroundColor: "#ff4444",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  removeButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  amountInput: {
    flex: 1,
    marginTop: 0,
  },
  unitPicker: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    overflow: "hidden",
  },
  unitButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#f0f0f0",
  },
  unitButtonSelected: {
    backgroundColor: "#007AFF",
  },
  unitButtonText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  unitButtonTextSelected: {
    color: "#fff",
  },
  addIngredientButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginTop: 8,
  },
  addIngredientButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#34C759",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 16,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  recentSection: {
    marginTop: 32,
  },
  entryCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
});
