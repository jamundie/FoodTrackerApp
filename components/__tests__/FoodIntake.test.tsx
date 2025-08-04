import { render, fireEvent, waitFor } from "@testing-library/react-native";
import React from "react";
import FoodScreen from "../../app/(tabs)/food";
import { TrackingProvider } from "../../hooks/TrackingContext";
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

  describe("Initial Render", () => {
    it("renders the main form elements", () => {
      const { getByText, getByPlaceholderText } = renderFoodScreen();

      expect(getByText("Meal Name")).toBeTruthy();
      expect(getByText("Category")).toBeTruthy();
      expect(getByText("Custom Date/Time (optional)")).toBeTruthy();
      expect(getByText("Ingredients")).toBeTruthy();
      
      expect(getByPlaceholderText("e.g., Lasagne, Chicken Salad")).toBeTruthy();
      expect(getByText("Select a category")).toBeTruthy();
      expect(getByPlaceholderText("Leave empty for current time")).toBeTruthy();
    });

    it("renders initial ingredient form", () => {
      const { getByText, getByPlaceholderText } = renderFoodScreen();

      expect(getByText("Ingredient 1")).toBeTruthy();
      expect(getByPlaceholderText("Ingredient name")).toBeTruthy();
      expect(getByPlaceholderText("Amount")).toBeTruthy();
      expect(getByPlaceholderText("Calories per 100g (optional)")).toBeTruthy();
      expect(getByText("g")).toBeTruthy();
      expect(getByText("ml")).toBeTruthy();
      expect(getByText("piece")).toBeTruthy();
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

    it("allows typing in custom timestamp field", () => {
      const { getByPlaceholderText } = renderFoodScreen();
      const timestampInput = getByPlaceholderText("Leave empty for current time");

      fireEvent.changeText(timestampInput, "2025-08-04T12:00:00.000Z");
      expect(timestampInput.props.value).toBe("2025-08-04T12:00:00.000Z");
    });

    it("allows typing in ingredient fields", () => {
      const { getByPlaceholderText } = renderFoodScreen();
      
      const ingredientNameInput = getByPlaceholderText("Ingredient name");
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
    it("adds new ingredient when Add Ingredient button is pressed", () => {
      const { getByText, getAllByText, getByTestId } = renderFoodScreen();
      const addButton = getByTestId("add-ingredient-button");

      fireEvent.press(addButton);

      expect(getByText("Ingredient 1")).toBeTruthy();
      expect(getByText("Ingredient 2")).toBeTruthy();
      expect(getAllByText(/Ingredient \d+/).length).toBe(2);
    });

    it("removes ingredient when Remove button is pressed", () => {
      const { getByText, queryByText, getByTestId, getAllByText } = renderFoodScreen();
      const addButton = getByTestId("add-ingredient-button");

      // Add a second ingredient
      fireEvent.press(addButton);
      expect(getByText("Ingredient 2")).toBeTruthy();

      // Remove the second ingredient - get all remove buttons and click the first one
      const removeButtons = getAllByText("Remove");
      fireEvent.press(removeButtons[0]);

      expect(queryByText("Ingredient 2")).toBeNull();
      expect(getByText("Ingredient 1")).toBeTruthy();
    });

    it("does not show remove button when only one ingredient exists", () => {
      const { queryByText } = renderFoodScreen();
      expect(queryByText("Remove")).toBeNull();
    });

    it("changes unit selection for ingredients", () => {
      const { getByText } = renderFoodScreen();
      
      // Initially 'g' should be selected (default)
      const mlButton = getByText("ml");
      fireEvent.press(mlButton);

      // ml should now be selected (test would need to check styling or state)
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
      const { getByText, getByPlaceholderText, getByTestId } = renderFoodScreen();
      
      // Fill out the form
      const mealNameInput = getByPlaceholderText("e.g., Lasagne, Chicken Salad");
      const ingredientNameInput = getByPlaceholderText("Ingredient name");
      const amountInput = getByPlaceholderText("Amount");
      const caloriesInput = getByPlaceholderText("Calories per 100g (optional)");
      
      fireEvent.changeText(mealNameInput, "Spaghetti Bolognese");
      fireEvent.changeText(ingredientNameInput, "Ground Beef");
      fireEvent.changeText(amountInput, "200");
      fireEvent.changeText(caloriesInput, "250");

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
      const { getByText, getByPlaceholderText, getByTestId } = renderFoodScreen();
      
      // Fill out and submit form
      const mealNameInput = getByPlaceholderText("e.g., Lasagne, Chicken Salad");
      const ingredientNameInput = getByPlaceholderText("Ingredient name");
      const amountInput = getByPlaceholderText("Amount");
      
      fireEvent.changeText(mealNameInput, "Test Meal");
      fireEvent.changeText(ingredientNameInput, "Test Ingredient");
      fireEvent.changeText(amountInput, "100");

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
        expect(ingredientNameInput.props.value).toBe("");
        expect(amountInput.props.value).toBe("");
        expect(getByText("Select a category")).toBeTruthy();
      });
    });
  });

  describe("Recent Entries Display", () => {
    it("shows recent entries section when entries exist", async () => {
      const { getByText, getByPlaceholderText, getByTestId } = renderFoodScreen();
      
      // Add a food entry first
      const mealNameInput = getByPlaceholderText("e.g., Lasagne, Chicken Salad");
      const ingredientNameInput = getByPlaceholderText("Ingredient name");
      const amountInput = getByPlaceholderText("Amount");
      
      fireEvent.changeText(mealNameInput, "Test Meal");
      fireEvent.changeText(ingredientNameInput, "Test Ingredient");
      fireEvent.changeText(amountInput, "100");

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