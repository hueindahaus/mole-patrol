import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import HomeScreen from "../screens/HomeScreen";
import MainScreen from "../screens/MainScreen";

interface Props {}

type ParamList = {
  Home: undefined;
  Scan: undefined;
};

export const AppTabs: React.FC<Props> = ({}) => {
  const Tab = createMaterialTopTabNavigator<ParamList>();

  return (
    <Tab.Navigator
      tabBarPosition="bottom"
      screenOptions={{
        tabBarLabelStyle: { fontSize: 14 },
        tabBarStyle: { backgroundColor: "white" },
        tabBarIndicatorStyle: {
          backgroundColor: "black",
          top: 0,
          borderRadius: 9999,
        },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Scan" component={MainScreen} />
    </Tab.Navigator>
  );
};
