import React, { createContext, useContext, useState, ReactNode } from 'react';
import { TrackingData, FoodEntry } from '../types/tracking';

const TrackingContext = createContext<{
  data: TrackingData;
  addWater: () => void;
  addFoodEntry: (foodEntry: FoodEntry) => void;
} | undefined>(undefined);

export const TrackingProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<TrackingData>({
    waterIntake: 0,
    foodEntries: [],
  });

  const addWater = () => {
    setData((prev) => ({ ...prev, waterIntake: prev.waterIntake + 1 }));
  };

  const addFoodEntry = (foodEntry: FoodEntry) => {
    setData((prev) => ({
      ...prev,
      foodEntries: [...prev.foodEntries, foodEntry],
    }));
  };

  return (
    <TrackingContext.Provider value={{ data, addWater, addFoodEntry }}>
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
