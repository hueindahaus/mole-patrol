import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useMemo, useRef, useState } from "react";
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

  const [pictureSize, setPictureSize] = useState<string>();

  const camera = useRef<Camera>(null);

  const cameraDim = useMemo(
    () =>
      Math.min(Dimensions.get("screen").width, Dimensions.get("screen").height),
    []
  );

  const cameraScale = useMemo(() => Dimensions.get("screen").scale, []);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
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
          type={Camera.Constants.Type.back}
          style={tw`flex flex-col w-[${cameraDim}px] h-[${cameraDim}px]`}
          ratio={"1:1"}
          flashMode={"off"}
          autoFocus
          useCamera2Api={false}
          zoom={0.4}
          pictureSize={pictureSize}
          onCameraReady={async () => {
            const supportedRatios =
              await camera.current?.getSupportedRatiosAsync();
            if (supportedRatios?.includes("1:1")) {
              const ratio = "1:1";

              const supportedPictureSizes =
                await camera.current?.getAvailablePictureSizesAsync(ratio);

              const bestSupportedPictureSizeIndex = supportedPictureSizes
                ?.map((picSize) =>
                  Math.abs(
                    cameraDim * cameraScale - parseInt(picSize.split("x")[0])
                  )
                )
                .map((x, i) => [x, i])
                .reduce((r, a) => (a[0] < r[0] ? a : r))[1];

              if (supportedPictureSizes && bestSupportedPictureSizeIndex) {
                const bestSupportedPictureSize =
                  supportedPictureSizes[bestSupportedPictureSizeIndex];
                setPictureSize(bestSupportedPictureSize);
              }
            } else {
              setError("Your device camera does not support 1:1 aspect ratio.");
            }
          }}
        >
          <View
            style={tw`flex flex-col h-full w-full justify-center items-center`}
          >
            <CameraMarks
              height={cameraDim * 0.6}
              width={cameraDim * 0.6}
            ></CameraMarks>
          </View>
        </Camera>
      )}
      <View style={tw`w-full h-full`}>
        <TouchableOpacity
          style={tw`w-full h-1/2 flex justify-center items-center`}
          onPress={async () => {
            if (camera.current) {
              console.log(camera.current.props.pictureSize);
              try {
                let { uri, width, height } =
                  await camera.current.takePictureAsync({
                    base64: false,
                  });

                console.log(width + " " + height);

                const cropDim = cameraDim * cameraScale * 0.6;

                const {
                  uri: imgUri,
                  width: w,
                  height: h,
                } = await ImageManipulator.manipulateAsync(
                  uri,
                  [
                    {
                      crop: {
                        height: cropDim,
                        width: cropDim,
                        originX: Math.floor((width - cropDim) / 2),
                        originY: Math.floor((height - cropDim) / 2),
                      },
                    },
                  ],
                  { base64: false }
                );
                console.log(w);
                console.log(h);

                navigation.navigate("Result", {
                  imgUri,
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
