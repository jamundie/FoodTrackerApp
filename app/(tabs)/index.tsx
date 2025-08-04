import { View, Text, Pressable, Dimensions } from "react-native";
import { useTracking } from "../../hooks/TrackingContext";
import { useRouter } from "expo-router";
import React from "react";
import { styles } from "../../styles/index.styles";
import PlaceholderCircle from "@/components/PlaceholderCircle";
import { Canvas, Rect } from "@shopify/react-native-skia";

export default function HomeScreen() {
  const router = useRouter();
  const { data } = useTracking();
  const { width } = Dimensions.get("window");

  const chartData = [3, 5, 2, 4, 6, 1, 4]; // Example y-values
  const chartHeight = 200;
  const chartWidth = width - 40;
  const barWidth = chartWidth / chartData.length - 10;
  const maxDataValue = Math.max(...chartData);

  return (
    <View style={styles.container}>
      {/* Overview Section */}
      <View style={styles.overview}>
        <Text style={styles.header}>Overview</Text>
        <View style={styles.overviewGrid}>
          <Pressable style={styles.card} onPress={() => router.push("/food")}>
            <PlaceholderCircle backgroundColor="#F9A8D4FF"></PlaceholderCircle>
            <Text>Food Intake</Text>
            <Text style={styles.cardCount}>{data.foodEntries.length} entries</Text>
          </Pressable>
          <Pressable style={styles.card} onPress={() => router.push("/water")}>
            <PlaceholderCircle backgroundColor="#93C5FDFF"></PlaceholderCircle>
            <Text>Water Intake</Text>
            <Text style={styles.cardCount}>{data.waterIntake} glasses</Text>
          </Pressable>
          <Pressable
            style={styles.card}
            onPress={() => console.log("Sleep pressed")}
          >
            <PlaceholderCircle backgroundColor="#D8B4FEFF"></PlaceholderCircle>
            <Text>Sleep</Text>
            <Text style={styles.cardCount}>Coming Soon</Text>
          </Pressable>
          <Pressable
            style={styles.card}
            onPress={() => console.log("Stress pressed")}
          >
            <PlaceholderCircle backgroundColor="#86EFACFF"></PlaceholderCircle>
            <Text>Stress</Text>
            <Text style={styles.cardCount}>Coming Soon</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.progressSnapshot}>
        <Text style={styles.header}>Progress Snapshot</Text>
        <Text>Graph goes here</Text>
        <View>
          <Canvas style={{ width: chartWidth, height: chartHeight }}>
            {chartData.map((value, index) => {
              const barHeight = (value / maxDataValue) * chartHeight;
              return (
                <Rect
                  key={index}
                  x={index * (barWidth + 10)}
                  y={chartHeight - barHeight}
                  width={barWidth}
                  height={barHeight}
                  color="#007bff"
                />
              );
            })}
          </Canvas>
        </View>
      </View>
      <View style={styles.recentActivities}>
        <Text style={styles.header}>Recent Activities</Text>

        {/* Show recent food entries */}
        {data.foodEntries.slice(-3).reverse().map((entry, index) => (
          <View key={entry.id} style={styles.activityRow}>
            <Text style={styles.activityIcon}>🍳</Text>
            <View style={styles.activityDetails}>
              <Text style={styles.activityTitle}>Logged {entry.mealName}</Text>
              <Text style={styles.activitySubtitle}>
                {entry.category} • {entry.ingredients.length} ingredients
                {entry.totalCalories && ` • ${Math.round(entry.totalCalories)} cal`}
              </Text>
            </View>
            <Text style={styles.activityTime}>
              {new Date(entry.timestamp).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </View>
        ))}

        {/* Show water intake if any */}
        {data.waterIntake > 0 && (
          <View style={styles.activityRow}>
            <Text style={styles.activityIcon}>💧</Text>
            <View style={styles.activityDetails}>
              <Text style={styles.activityTitle}>Water Intake</Text>
              <Text style={styles.activitySubtitle}>{data.waterIntake} glasses total</Text>
            </View>
            <Text style={styles.activityTime}>Today</Text>
          </View>
        )}

        {/* Show placeholder if no activities */}
        {data.foodEntries.length === 0 && data.waterIntake === 0 && (
          <View style={styles.activityRow}>
            <Text style={styles.activityIcon}>📝</Text>
            <View style={styles.activityDetails}>
              <Text style={styles.activityTitle}>No activities yet</Text>
              <Text style={styles.activitySubtitle}>Start tracking your food and water intake!</Text>
            </View>
            <Text style={styles.activityTime}>--</Text>
          </View>
        )}
      </View>
    </View>
  );
}
