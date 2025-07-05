import { View, Text, Pressable, Dimensions } from "react-native";
import { useTracking } from "../../hooks/TrackingContext";
import { useRouter } from "expo-router";
import React from "react";
import { styles } from "../styles/index.styles";
import PlaceholderCircle from "@/components/PlaceholderCircle";
import { Canvas, Rect } from "@shopify/react-native-skia";

export default function HomeScreen() {
  const router = useRouter();
  const { width } = Dimensions.get("window");

  const data = [3, 5, 2, 4, 6, 1, 4]; // Example y-values
  const chartHeight = 200;
  const chartWidth = width - 40;
  const barWidth = chartWidth / data.length - 10;
  const maxDataValue = Math.max(...data);

  return (
    <View style={styles.container}>
      {/* Overview Section */}
      <View style={styles.overview}>
        <Text style={styles.header}>Overview</Text>
        <View style={styles.overviewGrid}>
          <Pressable style={styles.card} onPress={() => router.push("/food")}>
            <PlaceholderCircle backgroundColor="#F9A8D4FF"></PlaceholderCircle>
            <Text>Food Intake</Text>
          </Pressable>
          <Pressable style={styles.card} onPress={() => router.push("/water")}>
            <PlaceholderCircle backgroundColor="#93C5FDFF"></PlaceholderCircle>
            <Text>Water Intake</Text>
          </Pressable>
          <Pressable
            style={styles.card}
            onPress={() => console.log("Sleep pressed")}
          >
            <PlaceholderCircle backgroundColor="#D8B4FEFF"></PlaceholderCircle>
            <Text>Sleep</Text>
          </Pressable>
          <Pressable
            style={styles.card}
            onPress={() => console.log("Stress pressed")}
          >
            <PlaceholderCircle backgroundColor="#86EFACFF"></PlaceholderCircle>
            <Text>Stress</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.progressSnapshot}>
        <Text style={styles.header}>Progress Snapshot</Text>
        <Text>Graph goes here</Text>
        <View>
          <Canvas style={{ width: chartWidth, height: chartHeight }}>
            {data.map((value, index) => {
              const barHeight = (value / maxDataValue) * chartHeight;
              return (
                <Rect
                  key={index}
                  x={index * (barWidth + 10)}
                  y={chartHeight - barHeight}
                  width={barWidth}
                  height={barHeight}
                  color="#007bff"
                  r={4}
                />
              );
            })}
          </Canvas>
        </View>
      </View>
    </View>
  );
}
