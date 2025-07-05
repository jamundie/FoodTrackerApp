import { render, fireEvent } from "@testing-library/react-native";
import React from "react";
import HomeScreen from "../../app/(tabs)/index";
import { TrackingProvider } from "../../hooks/TrackingContext";

const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));
jest.mock("@shopify/react-native-skia", () => {
  return {
    Canvas: ({ children }: { children: React.ReactNode }) => children,
    Rect: () => null,
  };
});

describe("HomeScreen", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it("renders the overview buttons", () => {
    const { getByText } = render(
      <TrackingProvider>
        <HomeScreen />
      </TrackingProvider>
    );

    expect(getByText(/Food Intake/i)).toBeTruthy();
    expect(getByText(/Water Intake/i)).toBeTruthy();
    expect(getByText(/Sleep/i)).toBeTruthy();
    expect(getByText(/Stress/i)).toBeTruthy();
  });

  it("calls router.push when Food Intake is pressed", () => {
    const { getByText } = render(
      <TrackingProvider>
        <HomeScreen />
      </TrackingProvider>
    );

    fireEvent.press(getByText(/Food Intake/i));

    expect(mockPush).toHaveBeenCalledWith("/food");
  });

  it("renders the progress snapshot section", () => {
    const { getByText } = render(
      <TrackingProvider>
        <HomeScreen />
      </TrackingProvider>
    );

    expect(getByText(/Progress Snapshot/i)).toBeTruthy();
  });
});
