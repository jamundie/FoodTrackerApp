import React, { createContext, useContext, useState, ReactNode } from 'react';
import { TrackingData, FoodEntry, WaterEntry } from '../types/tracking';

const TrackingContext = createContext<{
  data: TrackingData;
  addWater: () => void;
  addFoodEntry: (foodEntry: FoodEntry) => void;
  addWaterEntry: (waterEntry: WaterEntry) => void;
} | undefined>(undefined);

export const TrackingProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<TrackingData>({
    waterIntake: 0,
    foodEntries: [],
    waterEntries: [],
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

  const addWaterEntry = (waterEntry: WaterEntry) => {
    setData((prev) => ({
      ...prev,
      waterEntries: [...prev.waterEntries, waterEntry],
    }));
  };

  return (
    <TrackingContext.Provider value={{ data, addWater, addFoodEntry, addWaterEntry }}>
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
