import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TrackingData {
  waterIntake: number;
  foodEntries: string[];
}

const TrackingContext = createContext<{
  data: TrackingData;
  addWater: () => void;
  addFood: (food: string) => void;
} | undefined>(undefined);

export const TrackingProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<TrackingData>({
    waterIntake: 0,
    foodEntries: [],
  });

  const addWater = () => {
    setData((prev) => ({ ...prev, waterIntake: prev.waterIntake + 1 }));
  };

  const addFood = (food: string) => {
    setData((prev) => ({
      ...prev,
      foodEntries: [...prev.foodEntries, food],
    }));
  };

  return (
    <TrackingContext.Provider value={{ data, addWater, addFood }}>
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
