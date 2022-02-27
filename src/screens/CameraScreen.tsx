import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import tw from "../styling/tw";
import { Camera, CameraProps } from "expo-camera";
import { Dimensions } from "react-native";
import { ParamList } from "./MainScreen";
import CameraMarks from "../../assets/camera-marks.svg";
import * as ImageManipulator from "expo-image-manipulator";
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/core";

const CameraScreen: React.FC<NativeStackScreenProps<ParamList, "Camera">> = ({
  navigation,
}) => {
  const isFocused = useIsFocused();
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
  }, []);

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
      {isFocused && (
        <Camera
          ref={camera}
          type={cameraProps.type}
          style={tw`flex flex-col w-[${cameraDim}px] h-[${cameraDim}px]`}
          ratio={cameraProps.ratio}
          flashMode={"off"}
          autoFocus
          useCamera2Api={true}
          zoom={0}
        >
          <View
            style={tw`flex flex-col h-full w-full justify-center items-center`}
          >
            <CameraMarks style={tw`h-[${256}px] w-[${256}px]`}></CameraMarks>
          </View>
        </Camera>
      )}
      <View style={tw`w-full h-full`}>
        <TouchableOpacity
          style={tw`w-full h-1/2 flex justify-center items-center`}
          onPress={async () => {
            if (camera.current) {
              try {
                let { uri, width, height } =
                  await camera.current.takePictureAsync({
                    base64: false,
                  });

                const { base64: imageBase64Encoded } =
                  await ImageManipulator.manipulateAsync(
                    uri,
                    [
                      {
                        crop: {
                          height: 256,
                          width: 256,
                          originX: Math.floor((width - 256) / 2),
                          originY: Math.floor((height - 256) / 2),
                        },
                      },
                    ],
                    { base64: true }
                  );

                navigation.navigate("Result", {
                  imageBase64Encoded: imageBase64Encoded!,
                });
              } catch (error) {
                console.log(error);
              }
            }
          }}
        >
          <View style={tw`flex flex-row justify-center items-center`}>
            <Text style={tw`text-black`}>Tap anywhere to capture</Text>
            <Ionicons
              name="scan-outline"
              style={tw`text-black ml-4`}
              size={24}
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CameraScreen;
