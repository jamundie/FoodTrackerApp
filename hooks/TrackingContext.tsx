import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { TrackingData, FoodEntry, WaterEntry, UserProfile } from '../types/tracking';
import { useAuth } from './AuthContext';
import {
  fetchFoodEntries,
  fetchWaterEntries,
  fetchUserProfile,
  insertFoodEntry,
  insertWaterEntry,
  upsertUserProfile,
  uploadMealPhoto,
} from '../lib/trackingService';

const DEFAULT_USER_PROFILE: UserProfile = {
  displayName: '',
  defaultVolumePresetId: 'glass',
};

const EMPTY_DATA: TrackingData = { foodEntries: [], waterEntries: [] };

type TrackingContextValue = {
  data: TrackingData;
  userProfile: UserProfile;
  loading: boolean;
  addFoodEntry: (foodEntry: FoodEntry) => Promise<void>;
  addWaterEntry: (waterEntry: WaterEntry) => Promise<void>;
  updateUserProfile: (profile: UserProfile) => Promise<void>;
};

const TrackingContext = createContext<TrackingContextValue | undefined>(undefined);

export const TrackingProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [data, setData] = useState<TrackingData>(EMPTY_DATA);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [loading, setLoading] = useState(false);

  const userId = user?.id ?? null;

  // Load all data when user signs in; clear when they sign out.
  // Depend on userId (string | null) rather than the user object to avoid
  // re-running when the auth provider returns a new object reference.
  useEffect(() => {
    if (!userId) {
      setData(EMPTY_DATA);
      setUserProfile(DEFAULT_USER_PROFILE);
      return;
    }

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const [foodEntries, waterEntries, profile] = await Promise.all([
        fetchFoodEntries(userId),
        fetchWaterEntries(userId),
        fetchUserProfile(userId),
      ]);
      if (!cancelled) {
        setData({ foodEntries, waterEntries });
        if (profile) setUserProfile(profile);
        setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [userId]);

  const addFoodEntry = useCallback(async (entry: FoodEntry) => {
    if (!userId) return;

    // If the entry has a local photo URI, upload it first and replace with storage path
    let persistedEntry = entry;
    if (entry.photoUri && !entry.photoUri.startsWith('http')) {
      const storagePath = await uploadMealPhoto(userId, entry.id, entry.photoUri);
      persistedEntry = { ...entry, photoUri: storagePath ?? undefined };
    }

    // Optimistic update — add to local state immediately
    setData((prev) => ({
      ...prev,
      foodEntries: [persistedEntry, ...prev.foodEntries],
    }));

    await insertFoodEntry(userId, persistedEntry);
  }, [userId]);

  const addWaterEntry = useCallback(async (entry: WaterEntry) => {
    if (!userId) return;

    setData((prev) => ({
      ...prev,
      waterEntries: [entry, ...prev.waterEntries],
    }));

    await insertWaterEntry(userId, entry);
  }, [userId]);

  const updateUserProfile = useCallback(async (profile: UserProfile) => {
    if (!userId) return;
    setUserProfile(profile);
    await upsertUserProfile(userId, profile);
  }, [userId]);

  return (
    <TrackingContext.Provider value={{ data, userProfile, loading, addFoodEntry, addWaterEntry, updateUserProfile }}>
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
