import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import ProfileForm from '../../ProfileForm';
import { UserProfile } from '../../../types/tracking';

const mockOnSave = jest.fn();

const defaultProfile: UserProfile = {
  displayName: '',
  defaultVolumePresetId: 'glass',
};

const populatedProfile: UserProfile = {
  displayName: 'Jane',
  age: 30,
  weightKg: 65,
  heightCm: 170,
  dailyWaterGoalMl: 2000,
  defaultVolumePresetId: 'pint',
};

describe('ProfileForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders all fields', () => {
    const { getByTestId } = render(
      <ProfileForm profile={defaultProfile} onSave={mockOnSave} />
    );

    expect(getByTestId('profile-name-input')).toBeTruthy();
    expect(getByTestId('profile-age-input')).toBeTruthy();
    expect(getByTestId('profile-weight-input')).toBeTruthy();
    expect(getByTestId('profile-height-input')).toBeTruthy();
    expect(getByTestId('profile-water-goal-input')).toBeTruthy();
    expect(getByTestId('profile-save-button')).toBeTruthy();
  });

  it('pre-populates fields from the profile prop', () => {
    const { getByDisplayValue } = render(
      <ProfileForm profile={populatedProfile} onSave={mockOnSave} />
    );

    expect(getByDisplayValue('Jane')).toBeTruthy();
    expect(getByDisplayValue('30')).toBeTruthy();
    expect(getByDisplayValue('65')).toBeTruthy();
    expect(getByDisplayValue('170')).toBeTruthy();
    expect(getByDisplayValue('2000')).toBeTruthy();
  });

  it('shows the default volume preset selector', () => {
    const { getByTestId } = render(
      <ProfileForm profile={populatedProfile} onSave={mockOnSave} />
    );
    // WaterVolumeSelector renders the volume-selector-button
    expect(getByTestId('volume-selector-button')).toBeTruthy();
  });

  it('calls onSave with updated profile when save button is pressed', () => {
    const { getByTestId } = render(
      <ProfileForm profile={defaultProfile} onSave={mockOnSave} />
    );

    fireEvent.changeText(getByTestId('profile-name-input'), 'Alice');
    fireEvent.changeText(getByTestId('profile-age-input'), '25');
    fireEvent.changeText(getByTestId('profile-water-goal-input'), '1500');
    fireEvent.press(getByTestId('profile-save-button'));

    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        displayName: 'Alice',
        age: 25,
        dailyWaterGoalMl: 1500,
        defaultVolumePresetId: 'glass',
      })
    );
  });

  it('saves undefined for empty numeric fields', () => {
    const { getByTestId } = render(
      <ProfileForm profile={defaultProfile} onSave={mockOnSave} />
    );

    fireEvent.press(getByTestId('profile-save-button'));

    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        age: undefined,
        weightKg: undefined,
        heightCm: undefined,
        dailyWaterGoalMl: undefined,
      })
    );
  });

  it('shows saved confirmation banner after saving and hides it after 2s', () => {
    const { getByTestId, queryByTestId } = render(
      <ProfileForm profile={defaultProfile} onSave={mockOnSave} />
    );

    fireEvent.press(getByTestId('profile-save-button'));

    expect(getByTestId('profile-saved-banner')).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(2001);
    });

    expect(queryByTestId('profile-saved-banner')).toBeNull();
  });

  it('updates defaultVolumePresetId when a different preset is selected', () => {
    const { getByTestId } = render(
      <ProfileForm profile={defaultProfile} onSave={mockOnSave} />
    );

    // Open the volume selector modal and pick pint
    fireEvent.press(getByTestId('volume-selector-button'));
    fireEvent.press(getByTestId('volume-option-pint'));

    fireEvent.press(getByTestId('profile-save-button'));

    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({ defaultVolumePresetId: 'pint' })
    );
  });
});
