import React, { createContext, useContext, useState, ReactNode } from 'react';
import { TrackingData, FoodEntry, WaterEntry, UserProfile } from '../types/tracking';
import { createMockFoodEntries, createMockWaterEntries, calculateMockFoodCalories } from '../utils/mockData';

const DEFAULT_USER_PROFILE: UserProfile = {
  displayName: '',
  defaultVolumePresetId: 'glass',
};

const TrackingContext = createContext<{
  data: TrackingData;
  userProfile: UserProfile;
  addFoodEntry: (foodEntry: FoodEntry) => void;
  addWaterEntry: (waterEntry: WaterEntry) => void;
  updateUserProfile: (profile: UserProfile) => void;
} | undefined>(undefined);

export const TrackingProvider = ({ children }: { children: ReactNode }) => {
  // Only load mock data in development environment or when explicitly enabled
  const shouldUseMockData = (
    process.env.NODE_ENV === 'development' || 
    process.env.EXPO_PUBLIC_USE_MOCK_DATA === 'true'
  ) && process.env.NODE_ENV !== 'test';
  
  const initializeData = (): TrackingData => {
    if (shouldUseMockData) {
      const mockFoodEntries = calculateMockFoodCalories(createMockFoodEntries());
      const mockWaterEntries = createMockWaterEntries();
      return {
        foodEntries: mockFoodEntries,
        waterEntries: mockWaterEntries,
      };
    }
    
    return {
      foodEntries: [],
      waterEntries: [],
    };
  };
  
  const [data, setData] = useState<TrackingData>(initializeData());
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);

  const addFoodEntry = (foodEntry: FoodEntry) => {
    setData((prev) => ({
      ...prev,
      foodEntries: [...prev.foodEntries, foodEntry],
    }));
  };

  const addWaterEntry = (waterEntry: WaterEntry) => {
    setData((prev) => ({
      ...prev,
      waterEntries: [...prev.waterEntries, waterEntry],
    }));
  };

  const updateUserProfile = (profile: UserProfile) => {
    setUserProfile(profile);
  };

  return (
    <TrackingContext.Provider value={{ data, userProfile, addFoodEntry, addWaterEntry, updateUserProfile }}>
      {children}
    </TrackingContext.Provider>
  );
};

export const useTracking = () => {
  const context = useContext(TrackingContext);
  if (!context) {
    throw new Error('useTracking must be used within a TrackingProvider');
  }
  return context;
};
