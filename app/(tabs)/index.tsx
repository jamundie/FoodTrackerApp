import { View, Text, Button } from "react-native";
import { useTracking } from "../../hooks/TrackingContext";
import { useRouter } from "expo-router";
import React from "react";
import { styles } from "./index.styles";

export default function HomeScreen() {
  const { data, addWater, addFood } = useTracking();
  const router = useRouter();

  return <View style={styles.container}></View>;
}
