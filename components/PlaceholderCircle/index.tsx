import React from "react";
import { View, ViewStyle } from "react-native";

interface PlaceholderCircleProps {
  backgroundColor?: string;
  size?: number;
  style?: ViewStyle;
  children?: React.ReactNode;
}

const PlaceholderCircle: React.FC<PlaceholderCircleProps> = ({
  backgroundColor = "#F9A8D4FF",
  size = 40,
  style,
  children,
}) => (
  <View
    style={[
      {
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor,
        marginBottom: 8,
        alignItems: "center",
        justifyContent: "center",
      },
      style,
    ]}
  >
    {children}
  </View>
);

export default PlaceholderCircle;
