import { MaterialTopTabBarProps } from "@react-navigation/material-top-tabs";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Pressable, Text, View } from "react-native";
import tw from "../styling/tw";
import Illustration from "../../assets/mole-search.svg";

const HomeScreen: React.FC<MaterialTopTabBarProps> = ({ navigation }) => {
  return (
    <View
      style={tw`w-full h-full bg-white flex justify-center items-center px-4`}
    >
      <StatusBar style="auto" />
      <Illustration width={256} height={256} />
      <Text style={tw`text-xl font-bold mt-8 text-center`}>
        Suspicious mark on your skin?
      </Text>
      <Text style={tw`mt-8 text-sm leading-5 opacity-50`}>
        Mole Patrol uses artificial intelligence to identify malignant skin
        marks. Test yourself in a matter of seconds.
      </Text>
      <Pressable
        onPress={() => {
          navigation.navigate("Scan");
        }}
        style={tw`bg-primary py-4 px-8 rounded-sm mt-12`}
      >
        <Text style={tw`text-white text-base`}>Get started</Text>
      </Pressable>
    </View>
  );
};

export default HomeScreen;
