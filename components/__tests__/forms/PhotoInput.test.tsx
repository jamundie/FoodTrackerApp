import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { Alert, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import PhotoInput from "../../PhotoInput";

jest.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
}));

const mockOnPhotoSelect = jest.fn();
const mockOnPhotoRemove = jest.fn();

describe("PhotoInput", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, "alert");
  });

  describe("empty state", () => {
    it("renders the add photo button when no photo is set", () => {
      const { getByTestId } = render(
        <PhotoInput photoUri={undefined} onPhotoSelect={mockOnPhotoSelect} onPhotoRemove={mockOnPhotoRemove} />
      );
      expect(getByTestId("add-photo-button")).toBeTruthy();
    });

    it("does not render photo preview when no photo is set", () => {
      const { queryByTestId } = render(
        <PhotoInput photoUri={undefined} onPhotoSelect={mockOnPhotoSelect} onPhotoRemove={mockOnPhotoRemove} />
      );
      expect(queryByTestId("photo-preview")).toBeNull();
    });

    it("renders custom label when provided", () => {
      const { getByText } = render(
        <PhotoInput photoUri={undefined} onPhotoSelect={mockOnPhotoSelect} onPhotoRemove={mockOnPhotoRemove} label="Bowel Photo" addLabel="+ Attach Photo" />
      );
      expect(getByText("Bowel Photo")).toBeTruthy();
      expect(getByText("+ Attach Photo")).toBeTruthy();
    });
  });

  describe("filled state", () => {
    const uri = "file:///test/photo.jpg";

    it("renders the photo preview when a photo is set", () => {
      const { getByTestId } = render(
        <PhotoInput photoUri={uri} onPhotoSelect={mockOnPhotoSelect} onPhotoRemove={mockOnPhotoRemove} />
      );
      expect(getByTestId("photo-preview")).toBeTruthy();
    });

    it("renders Replace and Remove buttons when a photo is set", () => {
      const { getByTestId } = render(
        <PhotoInput photoUri={uri} onPhotoSelect={mockOnPhotoSelect} onPhotoRemove={mockOnPhotoRemove} />
      );
      expect(getByTestId("replace-photo-button")).toBeTruthy();
      expect(getByTestId("remove-photo-button")).toBeTruthy();
    });

    it("does not render the add photo button when a photo is set", () => {
      const { queryByTestId } = render(
        <PhotoInput photoUri={uri} onPhotoSelect={mockOnPhotoSelect} onPhotoRemove={mockOnPhotoRemove} />
      );
      expect(queryByTestId("add-photo-button")).toBeNull();
    });

    it("calls onPhotoRemove when Remove button is pressed", () => {
      const { getByTestId } = render(
        <PhotoInput photoUri={uri} onPhotoSelect={mockOnPhotoSelect} onPhotoRemove={mockOnPhotoRemove} />
      );
      fireEvent.press(getByTestId("remove-photo-button"));
      expect(mockOnPhotoRemove).toHaveBeenCalledTimes(1);
    });
  });

  describe("photo picker — library", () => {
    beforeEach(() => {
      // Force Android path so Alert.alert is used instead of ActionSheetIOS
      Platform.OS = "android" as typeof Platform.OS;
    });

    it("calls onPhotoSelect with the URI when a library photo is picked", async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ status: "granted" });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: "file:///picked.jpg" }],
      });

      let alertActions: any[] = [];
      (Alert.alert as jest.Mock).mockImplementation((_title, _msg, actions) => {
        alertActions = actions ?? [];
      });

      const { getByTestId } = render(
        <PhotoInput photoUri={undefined} onPhotoSelect={mockOnPhotoSelect} onPhotoRemove={mockOnPhotoRemove} />
      );

      fireEvent.press(getByTestId("add-photo-button"));

      const libraryAction = alertActions.find((a: any) => a.text === "Photo Library");
      await libraryAction?.onPress();

      expect(mockOnPhotoSelect).toHaveBeenCalledWith("file:///picked.jpg");
    });

    it("shows a permission alert if library permission is denied", async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ status: "denied" });

      let alertActions: any[] = [];
      (Alert.alert as jest.Mock).mockImplementation((_title, _msg, actions) => {
        alertActions = actions ?? [];
      });

      const { getByTestId } = render(
        <PhotoInput photoUri={undefined} onPhotoSelect={mockOnPhotoSelect} onPhotoRemove={mockOnPhotoRemove} />
      );

      fireEvent.press(getByTestId("add-photo-button"));

      const libraryAction = alertActions.find((a: any) => a.text === "Photo Library");
      await libraryAction?.onPress();

      expect(mockOnPhotoSelect).not.toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledWith(
        "Permission required",
        "Allow access to your photo library to add a photo."
      );
    });

    it("does not call onPhotoSelect when picker is cancelled", async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ status: "granted" });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({ canceled: true, assets: [] });

      let alertActions: any[] = [];
      (Alert.alert as jest.Mock).mockImplementation((_title, _msg, actions) => {
        alertActions = actions ?? [];
      });

      const { getByTestId } = render(
        <PhotoInput photoUri={undefined} onPhotoSelect={mockOnPhotoSelect} onPhotoRemove={mockOnPhotoRemove} />
      );

      fireEvent.press(getByTestId("add-photo-button"));

      const libraryAction = alertActions.find((a: any) => a.text === "Photo Library");
      await libraryAction?.onPress();

      expect(mockOnPhotoSelect).not.toHaveBeenCalled();
    });
  });
});
