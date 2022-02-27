import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { Pressable, Text, View } from "react-native";
import tw from "../styling/tw";
import Illustration from "../../assets/mole-abduct.svg";
import { ParamList } from "./MainScreen";

const GetStartedScreen: React.FC<
  NativeStackScreenProps<ParamList, "GetStarted">
> = ({ navigation }) => {
  return (
    <View
      style={tw`w-full h-full bg-white flex justify-center items-center px-4`}
    >
      <Illustration width={256} height={216} />
      <Text style={tw`text-xl font-bold mt-8 text-center`}>
        Let's reveal the mole!
      </Text>
      <Pressable
        onPress={async () => {
          navigation.navigate("Camera");
        }}
        style={tw`bg-primary py-4 px-8 rounded-sm mt-12`}
      >
        <Text style={tw`text-white text-base`}></Text>
      </Pressable>
    </View>
  );
};

export default GetStartedScreen;
