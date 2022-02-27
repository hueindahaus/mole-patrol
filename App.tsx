import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AppTabs } from "./src/components/AppTabs";

interface Props {}

const App: React.FC<Props> = ({}) => {
  return (
    <NavigationContainer>
      <AppTabs />
    </NavigationContainer>
  );
};

export default App;
