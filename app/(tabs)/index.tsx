import { View, Text, Pressable, ScrollView } from "react-native";
import { useTracking } from "../../hooks/TrackingContext";
import { useRouter } from "expo-router";
import React from "react";
import { styles } from "../../styles/index.styles";
import PlaceholderCircle from "@/components/PlaceholderCircle";
import RecentActivities from "@/components/RecentActivities";
import ProgressChart from "@/components/ProgressChart";

export default function HomeScreen() {
  const router = useRouter();
  const { data } = useTracking();

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
        <ProgressChart foodEntries={data.foodEntries} waterEntries={data.waterEntries} />
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
