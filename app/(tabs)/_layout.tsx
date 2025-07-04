import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function TabLayout() {
  return (
    <View style={styles.container}>
      {/* Global Banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerText}>🥗 Food Tracker</Text>
      </View>

      {/* Tab Navigator Below */}
      <Tabs screenOptions={{ headerShown: false }}>
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="water"
          options={{
            title: "Water",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="water" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="food"
          options={{
            title: "Food",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="fast-food" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="stats"
          options={{
            title: "Stats",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="bar-chart" color={color} size={size} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  banner: {
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eee",
  },
  bannerText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
