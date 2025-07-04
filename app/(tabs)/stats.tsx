import { View, Text, StyleSheet } from "react-native";
import React from "react";

export default function StatsScreen() {
  return (
    <View style={styles.container}>
      <Text>Stats Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
});
