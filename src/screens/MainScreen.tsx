import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import tw from "../styling/tw";
import Illustration from "../../assets/mole-abduct.svg";
import { Camera, CameraProps } from "expo-camera";
import { Dimensions } from "react-native";

type ParamList = {
  Camera: undefined;
  GetStarted: undefined;
  Result: { imageUri: string };
};

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

const CameraScreen: React.FC<NativeStackScreenProps<ParamList, "Camera">> = ({
  navigation,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraProps, setCameraProps] = useState<CameraProps>({
    type: Camera.Constants.Type.back,
  });
  const camera = useRef<Camera>(null);

  const cameraDim = Math.min(
    Dimensions.get("window").width,
    Dimensions.get("window").height
  );

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
      const supportedRatios = await camera.current?.getSupportedRatiosAsync();
      if (!supportedRatios?.includes("1:1")) {
        setError("Your device camera does not support 1:1 aspect ratio.");
      } else {
        setCameraProps((cameraProps) => {
          cameraProps.ratio = "1:1";
          return cameraProps;
        });
      }
    })();
  }, [camera]);

  if (error) {
    return (
      <View
        style={tw`w-full h-full bg-white flex justify-center items-center px-4`}
      >
        <Text style={tw`text-xl font-bold mt-8 text-center`}>{error}</Text>
      </View>
    );
  }

  if (hasPermission === null) {
    return (
      <View
        style={tw`w-full h-full bg-white flex justify-center items-center px-4`}
      >
        <Text style={tw`text-xl font-bold mt-8 text-center`}>
          Grant access to camera
        </Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={tw`w-full h-full bg-white flex justify-start items-center`}>
      <Camera
        pictureSize=""
        ref={camera}
        type={cameraProps.type}
        style={tw`flex flex-col w-[${cameraDim}px] h-[${cameraDim}px]`}
        ratio={cameraProps.ratio}
        flashMode={"on"}
        autoFocus
        useCamera2Api={true}
        zoom={1}
      ></Camera>
      <View
        style={tw`bg-offwhite-light w-40 self-center rounded-sm border border-offwhite mt-12`}
      >
        <TouchableOpacity
          style={tw`py-4 px-8`}
          onPress={async () => {
            if (camera.current) {
              let photo = await camera.current.takePictureAsync();
              console.log(photo);
              navigation.navigate("Result", { imageUri: photo.uri });
            }
          }}
        >
          <Text style={tw`text-black text-center`}>Take picture</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const ResultScreen: React.FC<NativeStackScreenProps<ParamList, "Result">> = ({
  navigation,
  route,
}) => {
  console.log(route.params.imageUri);

  return (
    <View
      style={tw`w-full h-full bg-white flex justify-center items-center px-4`}
    >
      <Text>This is result screen</Text>
    </View>
  );
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
