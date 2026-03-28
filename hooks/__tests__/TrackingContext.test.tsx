import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { View, TouchableOpacity, Text } from 'react-native';
import { TrackingProvider, useTracking } from '../TrackingContext';
import { FoodEntry, WaterEntry, UserProfile } from '../../types/tracking';

// ── Mock AuthContext — overrides global jest.setup.ts mock for this test file ──
// (keeps a user so addFoodEntry / addWaterEntry don't bail out early)
jest.mock('../AuthContext', () => ({
  useAuth: () => ({ user: { id: 'test-user-id', email: 'test@example.com' } }),
}));

// ── Test components ───────────────────────────────────────────

const TestTrackingComponent = () => {
  const { data, loading, addFoodEntry, addWaterEntry } = useTracking();

  const mockFoodEntry: FoodEntry = {
    id: '1',
    mealName: 'Test Meal',
    category: 'Lunch',
    timestamp: '2025-08-04T12:00:00.000Z',
    ingredients: [],
  };

  const mockWaterEntry: WaterEntry = {
    id: '1',
    entryName: 'Test Water Entry',
    timestamp: '2025-08-04T14:00:00.000Z',
    ingredients: [],
    volumePresetId: 'glass',
    volumeMl: 250,
    totalVolume: 250,
  };

  return (
    <View>
      <Text testID="loading">{loading ? 'loading' : 'ready'}</Text>
      <Text testID="food-entries-count">{data.foodEntries.length}</Text>
      <Text testID="water-entries-count">{data.waterEntries.length}</Text>
      <TouchableOpacity onPress={() => addFoodEntry(mockFoodEntry)} testID="add-food-entry-button">
        <Text>Add Food Entry</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => addWaterEntry(mockWaterEntry)} testID="add-water-entry-button">
        <Text>Add Water Entry</Text>
      </TouchableOpacity>
    </View>
  );
};

const TestProfileComponent = () => {
  const { userProfile, updateUserProfile } = useTracking();

  const updatedProfile: UserProfile = {
    displayName: 'Alice',
    age: 28,
    defaultVolumePresetId: 'pint',
  };

  return (
    <View>
      <Text testID="display-name">{userProfile.displayName}</Text>
      <Text testID="default-preset">{userProfile.defaultVolumePresetId}</Text>
      <TouchableOpacity onPress={() => updateUserProfile(updatedProfile)} testID="update-profile-button">
        <Text>Update Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

// ── Tests ─────────────────────────────────────────────────────

describe('TrackingContext', () => {
  it('provides initial empty state when no user is signed in', () => {
    const { getByTestId } = render(
      <TrackingProvider>
        <TestTrackingComponent />
      </TrackingProvider>
    );

    expect(getByTestId('food-entries-count').props.children).toBe(0);
    expect(getByTestId('water-entries-count').props.children).toBe(0);
  });

  it('adds food entries optimistically', async () => {
    const { getByTestId } = render(
      <TrackingProvider>
        <TestTrackingComponent />
      </TrackingProvider>
    );

    // Wait for initial load to settle before interacting
    await waitFor(() => expect(getByTestId('loading').props.children).toBe('ready'));

    fireEvent.press(getByTestId('add-food-entry-button'));
    await waitFor(() => expect(getByTestId('food-entries-count').props.children).toBe(1));

    fireEvent.press(getByTestId('add-food-entry-button'));
    await waitFor(() => expect(getByTestId('food-entries-count').props.children).toBe(2));
  });

  it('adds water entries optimistically', async () => {
    const { getByTestId } = render(
      <TrackingProvider>
        <TestTrackingComponent />
      </TrackingProvider>
    );

    await waitFor(() => expect(getByTestId('loading').props.children).toBe('ready'));

    fireEvent.press(getByTestId('add-water-entry-button'));
    await waitFor(() => expect(getByTestId('water-entries-count').props.children).toBe(1));

    fireEvent.press(getByTestId('add-water-entry-button'));
    await waitFor(() => expect(getByTestId('water-entries-count').props.children).toBe(2));
  });

  it('throws error when used outside provider', () => {
    const originalError = console.error;
    console.error = jest.fn();

    const TestComponentWithoutProvider = () => {
      try {
        useTracking();
        return <Text>Should not render</Text>;
      } catch (error) {
        return <Text testID="error">{(error as Error).message}</Text>;
      }
    };

    const { getByTestId } = render(<TestComponentWithoutProvider />);
    expect(getByTestId('error').props.children).toBe('useTracking must be used within a TrackingProvider');

    console.error = originalError;
  });

  it('preserves existing data when adding multiple entry types', async () => {
    const { getByTestId } = render(
      <TrackingProvider>
        <TestTrackingComponent />
      </TrackingProvider>
    );

    await waitFor(() => expect(getByTestId('loading').props.children).toBe('ready'));

    fireEvent.press(getByTestId('add-food-entry-button'));
    await waitFor(() => expect(getByTestId('food-entries-count').props.children).toBe(1));

    fireEvent.press(getByTestId('add-water-entry-button'));
    await waitFor(() => expect(getByTestId('water-entries-count').props.children).toBe(1));

    expect(getByTestId('food-entries-count').props.children).toBe(1);
  });
});

describe('TrackingContext — userProfile', () => {
  it('provides default userProfile', () => {
    const { getByTestId } = render(
      <TrackingProvider>
        <TestProfileComponent />
      </TrackingProvider>
    );

    expect(getByTestId('display-name').props.children).toBe('');
    expect(getByTestId('default-preset').props.children).toBe('glass');
  });

  it('updates userProfile via updateUserProfile', async () => {
    const { getByTestId } = render(
      <TrackingProvider>
        <TestProfileComponent />
      </TrackingProvider>
    );

    fireEvent.press(getByTestId('update-profile-button'));

    await waitFor(() => expect(getByTestId('display-name').props.children).toBe('Alice'));
    expect(getByTestId('default-preset').props.children).toBe('pint');
  });
});
