import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import GetStartedScreen from "./GetStartedScreen";
import CameraScreen from "./CameraScreen";
import ResultScreen from "./ResultScreen";

export type ParamList = {
  Camera: undefined;
  GetStarted: undefined;
  Result: { imgUri: string };
};

const MainScreen: React.FC = ({}) => {
  const Stack = createNativeStackNavigator<ParamList>();

  return (
    <Stack.Navigator>
      <Stack.Screen name="GetStarted" component={GetStartedScreen} />
      <Stack.Screen name="Camera" component={CameraScreen} />
      <Stack.Screen name="Result" component={ResultScreen} />
    </Stack.Navigator>
  );
};

export default MainScreen;
