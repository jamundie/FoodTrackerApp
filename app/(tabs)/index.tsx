import { View, Text, Pressable, Dimensions, ScrollView } from "react-native";
import { useTracking } from "../../hooks/TrackingContext";
import { useRouter } from "expo-router";
import React from "react";
import { styles } from "../../styles/index.styles";
import PlaceholderCircle from "@/components/PlaceholderCircle";
import RecentActivities from "@/components/RecentActivities";
import { Canvas, Line, vec, Circle, Skia } from "@shopify/react-native-skia";

export default function HomeScreen() {
  const router = useRouter();
  const { data } = useTracking();
  const { width } = Dimensions.get("window");

  // Calculate daily calorie totals for the last 7 days
  const getDailyCalories = () => {
    const dailyTotals: number[] = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(targetDate.setHours(0, 0, 0, 0));
      const dayEnd = new Date(targetDate.setHours(23, 59, 59, 999));
      
      const dayTotal = data.foodEntries
        .filter(entry => {
          const entryDate = new Date(entry.timestamp);
          return entryDate >= dayStart && entryDate <= dayEnd;
        })
        .reduce((total, entry) => total + (entry.totalCalories || 0), 0);
      
      dailyTotals.push(dayTotal);
    }
    
    return dailyTotals;
  };

  const getDayLabels = () => {
    const labels: string[] = [];
    const today = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      labels.push(days[targetDate.getDay()]);
    }
    
    return labels;
  };

  const chartData = getDailyCalories();
  const dayLabels = getDayLabels();
  const chartHeight = 200;
  const chartWidth = width - 40;
  const maxDataValue = Math.max(...chartData, 1); // Ensure at least 1 to avoid division by 0
  const padding = 30;

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
        <Text style={styles.chartSubtitle}>Daily Calorie Intake (Last 7 Days)</Text>
        <View style={styles.chartContainer}>
          <Canvas style={{ width: chartWidth, height: chartHeight + padding * 2 }}>
            {/* Draw line chart */}
            {chartData.map((value, index) => {
              if (index === 0) return null; // Skip first point for line drawing
              
              const prevValue = chartData[index - 1];
              const x1 = padding + ((index - 1) * (chartWidth - padding * 2)) / (chartData.length - 1);
              const y1 = chartHeight + padding - (prevValue / maxDataValue) * chartHeight;
              const x2 = padding + (index * (chartWidth - padding * 2)) / (chartData.length - 1);
              const y2 = chartHeight + padding - (value / maxDataValue) * chartHeight;
              
              return (
                <Line
                  key={`line-${index}`}
                  p1={vec(x1, y1)}
                  p2={vec(x2, y2)}
                  color="#007bff"
                  style="stroke"
                  strokeWidth={3}
                />
              );
            })}
            
            {/* Draw data points */}
            {chartData.map((value, index) => {
              const x = padding + (index * (chartWidth - padding * 2)) / (chartData.length - 1);
              const y = chartHeight + padding - (value / maxDataValue) * chartHeight;
              
              return (
                <Circle
                  key={`point-${index}`}
                  cx={x}
                  cy={y}
                  r={6}
                  color="#007bff"
                />
              );
            })}
          </Canvas>
          
          {/* Day labels */}
          <View style={styles.chartLabels}>
            {dayLabels.map((label, index) => (
              <Text key={`label-${index}`} style={styles.dayLabel}>
                {label}
              </Text>
            ))}
          </View>
          
          {/* Display calorie values */}
          <View style={styles.calorieValues}>
            {chartData.map((value, index) => (
              <Text key={`value-${index}`} style={styles.calorieValue}>
                {Math.round(value)}
              </Text>
            ))}
          </View>
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
