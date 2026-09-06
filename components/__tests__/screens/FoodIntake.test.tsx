import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import React from "react";
import FoodScreen from "../../../app/(tabs)/food";
import { TrackingProvider } from "../../../hooks/TrackingContext";
import { Alert } from "react-native";

// Mock Alert
jest.spyOn(Alert, 'alert');

describe("FoodScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderFoodScreen = () => {
    return render(
      <TrackingProvider>
        <FoodScreen />
      </TrackingProvider>
    );
  };

  /** Opens the Add Ingredient modal, fills name/amount/calories, saves, and taps Done. */
  const addIngredientViaModal = (
    screen: ReturnType<typeof renderFoodScreen>,
    { name, amount, calories }: { name: string; amount: string; calories?: string }
  ) => {
    const { getByTestId, getByPlaceholderText } = screen;
    fireEvent.press(getByTestId("add-ingredient-button"));
    fireEvent.changeText(getByPlaceholderText("Search ingredient or product…"), name);
    fireEvent.changeText(getByPlaceholderText("Amount"), amount);
    if (calories !== undefined) {
      fireEvent.changeText(getByPlaceholderText("Calories per 100g (optional)"), calories);
    }
    fireEvent.press(getByTestId("add-ingredient-modal-save"));
    fireEvent.press(getByTestId("add-ingredient-modal-done"));
  };

  describe("Initial Render", () => {
    it("renders the main form elements", () => {
      const { getByText, getByPlaceholderText } = renderFoodScreen();

      expect(getByText("Meal Name")).toBeTruthy();
      expect(getByText("Category")).toBeTruthy();
      expect(getByText("Date & Time")).toBeTruthy();
      expect(getByText("Ingredients")).toBeTruthy();
      
      expect(getByPlaceholderText("e.g., Lasagne, Chicken Salad")).toBeTruthy();
      expect(getByText("Select a category")).toBeTruthy();
    });

    it("renders an empty ingredient list with just the add button", () => {
      const { queryByText, getByTestId } = renderFoodScreen();

      expect(queryByText(/Unnamed ingredient/)).toBeNull();
      expect(getByTestId("add-ingredient-button")).toBeTruthy();
    });

    it("renders action buttons", () => {
      const { getByTestId } = renderFoodScreen();

      expect(getByTestId("add-ingredient-button")).toBeTruthy();
      expect(getByTestId("submit-food-entry-button")).toBeTruthy();
    });
  });

  describe("Form Input", () => {
    it("allows typing in meal name field", () => {
      const { getByPlaceholderText } = renderFoodScreen();
      const mealNameInput = getByPlaceholderText("e.g., Lasagne, Chicken Salad");

      fireEvent.changeText(mealNameInput, "Spaghetti Bolognese");
      expect(mealNameInput.props.value).toBe("Spaghetti Bolognese");
    });

    it("allows selecting date and time through pickers", () => {
      const { getByTestId } = renderFoodScreen();
      
      // Test date picker button exists
      const datePickerButton = getByTestId("date-picker-button");
      expect(datePickerButton).toBeTruthy();
      
      // Test time picker button exists
      const timePickerButton = getByTestId("time-picker-button");
      expect(timePickerButton).toBeTruthy();
      
      // Test that buttons can be pressed (opens modals)
      fireEvent.press(datePickerButton);
      fireEvent.press(timePickerButton);
    });

    it("allows toggling calendar view in date picker", () => {
      const { getByTestId } = renderFoodScreen();
      
      // Open date picker
      const datePickerButton = getByTestId("date-picker-button");
      fireEvent.press(datePickerButton);
      
      // Find and press calendar toggle button
      const calendarToggle = getByTestId("calendar-toggle-button");
      expect(calendarToggle).toBeTruthy();
      
      // Test that toggle can be pressed
      fireEvent.press(calendarToggle);
    });

    it("allows typing in the add-ingredient modal fields", () => {
      const screen = renderFoodScreen();
      const { getByTestId, getByPlaceholderText } = screen;

      fireEvent.press(getByTestId("add-ingredient-button"));

      const ingredientNameInput = getByPlaceholderText("Search ingredient or product…");
      const amountInput = getByPlaceholderText("Amount");
      const caloriesInput = getByPlaceholderText("Calories per 100g (optional)");

      fireEvent.changeText(ingredientNameInput, "Ground Beef");
      fireEvent.changeText(amountInput, "200");
      fireEvent.changeText(caloriesInput, "250");

      expect(ingredientNameInput.props.value).toBe("Ground Beef");
      expect(amountInput.props.value).toBe("200");
      expect(caloriesInput.props.value).toBe("250");
    });
  });

  describe("Category Dropdown", () => {
    it("opens category dropdown when pressed", async () => {
      const { getByText } = renderFoodScreen();
      const categoryButton = getByText("Select a category");

      fireEvent.press(categoryButton);

      await waitFor(() => {
        expect(getByText("Select Category")).toBeTruthy();
        expect(getByText("Breakfast")).toBeTruthy();
        expect(getByText("Lunch")).toBeTruthy();
        expect(getByText("Dinner")).toBeTruthy();
        expect(getByText("Main Dish")).toBeTruthy();
      });
    });

    it("selects a category and closes dropdown", async () => {
      const { getByText } = renderFoodScreen();
      const categoryButton = getByText("Select a category");

      fireEvent.press(categoryButton);

      await waitFor(() => {
        const breakfastOption = getByText("Breakfast");
        fireEvent.press(breakfastOption);
      });

      await waitFor(() => {
        expect(getByText("Breakfast")).toBeTruthy();
        // Modal should be closed, so "Select Category" header should not be visible
        expect(() => getByText("Select Category")).toThrow();
      });
    });

    it("closes dropdown when close button is pressed", async () => {
      const { getByText } = renderFoodScreen();
      const categoryButton = getByText("Select a category");

      fireEvent.press(categoryButton);

      await waitFor(() => {
        const closeButton = getByText("Close");
        fireEvent.press(closeButton);
      });

      await waitFor(() => {
        expect(() => getByText("Select Category")).toThrow();
      });
    });
  });

  describe("Ingredient Management", () => {
    it("adds an ingredient row via the modal", () => {
      const screen = renderFoodScreen();
      const { getByText } = screen;

      addIngredientViaModal(screen, { name: "Ground Beef", amount: "200" });

      expect(getByText("Ground Beef")).toBeTruthy();
      expect(getByText("200 g")).toBeTruthy();
    });

    it("adds multiple ingredient rows back-to-back via Add Another", () => {
      const screen = renderFoodScreen();
      const { getByTestId, getByPlaceholderText, getByText } = screen;

      fireEvent.press(getByTestId("add-ingredient-button"));
      fireEvent.changeText(getByPlaceholderText("Search ingredient or product…"), "Ground Beef");
      fireEvent.changeText(getByPlaceholderText("Amount"), "200");
      fireEvent.press(getByTestId("add-ingredient-modal-save"));

      fireEvent.press(getByTestId("add-ingredient-modal-add-another"));
      fireEvent.changeText(getByPlaceholderText("Search ingredient or product…"), "Rice");
      fireEvent.changeText(getByPlaceholderText("Amount"), "100");
      fireEvent.press(getByTestId("add-ingredient-modal-save"));
      fireEvent.press(getByTestId("add-ingredient-modal-done"));

      expect(getByText("Ground Beef")).toBeTruthy();
      expect(getByText("Rice")).toBeTruthy();
    });

    it("removes ingredient when Delete is confirmed", () => {
      const screen = renderFoodScreen();
      const { getByTestId, queryByText } = screen;

      addIngredientViaModal(screen, { name: "Ground Beef", amount: "200" });
      expect(screen.getByText("Ground Beef")).toBeTruthy();

      fireEvent.press(getByTestId("delete-ingredient-0"));
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      act(() => {
        alertCall[2].find((b: any) => b.text === "Delete").onPress();
      });

      expect(queryByText("Ground Beef")).toBeNull();
    });

    it("does not render any ingredient rows when list is empty", () => {
      const { queryByTestId } = renderFoodScreen();
      expect(queryByTestId("edit-ingredient-0")).toBeNull();
    });

    it("changes unit selection within the add-ingredient modal", () => {
      const { getByTestId, getByText } = renderFoodScreen();

      fireEvent.press(getByTestId("add-ingredient-button"));

      const mlButton = getByText("ml");
      fireEvent.press(mlButton);

      expect(mlButton).toBeTruthy();
    });
  });

  describe("Form Validation", () => {
    it("shows error when submitting without meal name", async () => {
      const { getByTestId } = renderFoodScreen();
      const submitButton = getByTestId("submit-food-entry-button");

      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith("Error", "Please enter a meal name");
      });
    });

    it("shows error when submitting without category", async () => {
      const { getByTestId, getByPlaceholderText } = renderFoodScreen();
      const mealNameInput = getByPlaceholderText("e.g., Lasagne, Chicken Salad");
      const submitButton = getByTestId("submit-food-entry-button");

      fireEvent.changeText(mealNameInput, "Test Meal");
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith("Error", "Please select a category");
      });
    });

    it("shows error when submitting without ingredients", async () => {
      const { getByText, getByPlaceholderText, getByTestId } = renderFoodScreen();
      const mealNameInput = getByPlaceholderText("e.g., Lasagne, Chicken Salad");
      const categoryButton = getByText("Select a category");
      const submitButton = getByTestId("submit-food-entry-button");

      fireEvent.changeText(mealNameInput, "Test Meal");
      fireEvent.press(categoryButton);
      
      await waitFor(() => {
        fireEvent.press(getByText("Breakfast"));
      });

      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith("Error", "Please add at least one ingredient");
      });
    });
  });

  describe("Successful Form Submission", () => {
    it("successfully submits a complete food entry", async () => {
      const screen = renderFoodScreen();
      const { getByText, getByPlaceholderText, getByTestId } = screen;
      
      // Fill out the form
      const mealNameInput = getByPlaceholderText("e.g., Lasagne, Chicken Salad");
      fireEvent.changeText(mealNameInput, "Spaghetti Bolognese");

      addIngredientViaModal(screen, { name: "Ground Beef", amount: "200", calories: "250" });

      // Select category
      const categoryButton = getByText("Select a category");
      fireEvent.press(categoryButton);
      
      await waitFor(() => {
        fireEvent.press(getByText("Main Dish"));
      });

      // Submit form
      const submitButton = getByTestId("submit-food-entry-button");
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith("Success", "Food entry added successfully!");
      });
    });

    it("resets form after successful submission", async () => {
      const screen = renderFoodScreen();
      const { getByText, getByPlaceholderText, getByTestId, queryByText } = screen;
      
      // Fill out and submit form
      const mealNameInput = getByPlaceholderText("e.g., Lasagne, Chicken Salad");
      fireEvent.changeText(mealNameInput, "Test Meal");

      addIngredientViaModal(screen, { name: "Test Ingredient", amount: "100" });

      // Select category
      const categoryButton = getByText("Select a category");
      fireEvent.press(categoryButton);
      
      await waitFor(() => {
        fireEvent.press(getByText("Snack"));
      });

      // Submit
      const submitButton = getByTestId("submit-food-entry-button");
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith("Success", "Food entry added successfully!");
      });

      // Check that form is reset
      await waitFor(() => {
        expect(mealNameInput.props.value).toBe("");
        expect(queryByText("Test Ingredient")).toBeNull();
        expect(getByText("Select a category")).toBeTruthy();
      });
    });
  });

  describe("Recent Entries Display", () => {
    it("shows recent entries section when entries exist", async () => {
      const screen = renderFoodScreen();
      const { getByText, getByPlaceholderText, getByTestId } = screen;
      
      // Add a food entry first
      const mealNameInput = getByPlaceholderText("e.g., Lasagne, Chicken Salad");
      fireEvent.changeText(mealNameInput, "Test Meal");

      addIngredientViaModal(screen, { name: "Test Ingredient", amount: "100" });

      const categoryButton = getByText("Select a category");
      fireEvent.press(categoryButton);
      
      await waitFor(() => {
        fireEvent.press(getByText("Snack"));
      });

      const submitButton = getByTestId("submit-food-entry-button");
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(getByText(/Recent Entries \(1\)/)).toBeTruthy();
        expect(getByText("Test Meal")).toBeTruthy();
        expect(getByText("Snack")).toBeTruthy();
      });
    });
  });
});
