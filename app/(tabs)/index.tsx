import { View, Text, Pressable, Dimensions, ScrollView } from "react-native";
import { useTracking } from "../../hooks/TrackingContext";
import { useRouter } from "expo-router";
import React from "react";
import { styles } from "../../styles/index.styles";
import PlaceholderCircle from "@/components/PlaceholderCircle";
import RecentActivities from "@/components/RecentActivities";
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
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={true}
      bounces={true}
      scrollEventThrottle={16}
      decelerationRate="normal"
      pagingEnabled={false}
    >
      {/* Overview Section */}
      <View style={styles.overview}>
        <Text style={styles.header}>Overview</Text>
        <View style={styles.overviewGrid}>
          <Pressable 
            style={styles.card} 
            onPress={() => router.push("/food")}
            testID="food-intake-button"
          >
            <PlaceholderCircle backgroundColor="#F9A8D4FF"></PlaceholderCircle>
            <Text>Food Intake</Text>
            <Text style={styles.cardCount}>{data.foodEntries.length} entries</Text>
          </Pressable>
          <Pressable 
            style={styles.card} 
            onPress={() => router.push("/water")}
            testID="water-intake-button"
          >
            <PlaceholderCircle backgroundColor="#93C5FDFF"></PlaceholderCircle>
            <Text>Water Intake</Text>
            <Text style={styles.cardCount}>{data.waterIntake} glasses</Text>
          </Pressable>
          <Pressable
            style={styles.card}
            onPress={() => console.log("Sleep pressed")}
            testID="sleep-button"
          >
            <PlaceholderCircle backgroundColor="#D8B4FEFF"></PlaceholderCircle>
            <Text>Sleep</Text>
            <Text style={styles.cardCount}>Coming Soon</Text>
          </Pressable>
          <Pressable
            style={styles.card}
            onPress={() => console.log("Stress pressed")}
            testID="stress-button"
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
      <RecentActivities 
        foodEntries={data.foodEntries} 
        waterEntries={data.waterEntries} 
        maxEntries={20} 
      />
      {/* Add some extra space at the bottom for testing */}
      <View style={{ height: 200 }} />
    </ScrollView>
  );
}
