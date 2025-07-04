import { View, Text, Pressable, Image } from "react-native";
import { useTracking } from "../../hooks/TrackingContext";
import { useRouter } from "expo-router";
import React from "react";
import { styles } from "./index.styles";
import { Place } from "@mui/icons-material";
import PlaceholderCircle from "@/components/PlaceholderCircle";

export default function HomeScreen() {
  const router = useRouter();

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
    </View>
  );
}
