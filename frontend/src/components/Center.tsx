import React from "react";
import { StyleProp, View, ViewStyle } from "react-native";

interface Props {
  style?: StyleProp<ViewStyle>;
}

export const Center: React.FC<Props> = ({ children, style }) => {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        ...(style as {}),
      }}
    >
      {children}
    </View>
  );
};
