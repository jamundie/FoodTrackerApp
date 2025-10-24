import React from 'react';
import { View, Text } from 'react-native';
import { FoodEntry, WaterEntry } from '@/types/tracking';
import { styles } from '@/styles/index.styles';

type ActivityEntry = {
  id: string;
  type: 'food' | 'water';
  timestamp: string;
  title: string;
  subtitle: string;
  icon: string;
};

type RecentActivitiesProps = {
  foodEntries: FoodEntry[];
  waterEntries: WaterEntry[];
  maxEntries?: number;
};

export default function RecentActivities({ 
  foodEntries, 
  waterEntries, 
  maxEntries = 10 
}: RecentActivitiesProps) {
  // Convert food entries to activity entries
  const foodActivities: ActivityEntry[] = foodEntries.map(entry => ({
    id: entry.id,
    type: 'food' as const,
    timestamp: entry.timestamp,
    title: `Logged ${entry.mealName}`,
    subtitle: `${entry.category} • ${entry.ingredients.length} ingredients${
      entry.totalCalories ? ` • ${Math.round(entry.totalCalories)} cal` : ''
    }`,
    icon: '🍳'
  }));

  // Convert water entries to activity entries
  const waterActivities: ActivityEntry[] = waterEntries.map(entry => ({
    id: entry.id,
    type: 'water' as const,
    timestamp: entry.timestamp,
    title: `${entry.entryName}`,
    subtitle: `${entry.ingredients.length} ingredients${
      entry.totalVolume ? ` • ${Math.round(entry.totalVolume)}ml` : ''
    }`,
    icon: '💧'
  }));

  // Combine and sort by timestamp (most recent first)
  const allActivities = [...foodActivities, ...waterActivities]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, maxEntries);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  return (
    <View style={styles.recentActivities}>
      <Text style={styles.header}>Recent Activities</Text>
      
      {allActivities.length === 0 ? (
        <View style={styles.activityRow} testID="activity-row">
          <Text style={styles.activityIcon}>📝</Text>
          <View style={styles.activityDetails}>
            <Text style={styles.activityTitle}>No activities yet</Text>
            <Text style={styles.activitySubtitle}>Start tracking your food and water intake!</Text>
          </View>
          <Text style={styles.activityTime}>--</Text>
        </View>
      ) : (
        allActivities.map((activity) => (
          <View key={activity.id} style={styles.activityRow} testID="activity-row">
            <Text style={styles.activityIcon}>{activity.icon}</Text>
            <View style={styles.activityDetails}>
              <Text style={styles.activityTitle}>{activity.title}</Text>
              <Text style={styles.activitySubtitle}>{activity.subtitle}</Text>
            </View>
            <Text style={styles.activityTime}>
              {formatTime(activity.timestamp)}
            </Text>
          </View>
        ))
      )}
    </View>
  );
}