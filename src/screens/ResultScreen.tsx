import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import tw from "../styling/tw";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-react-native";
import { ParamList } from "./MainScreen";
import { base64ToTensor } from "../utils/tf-utils";
import { Rank, Tensor } from "@tensorflow/tfjs";

const ResultScreen: React.FC<NativeStackScreenProps<ParamList, "Result">> = ({
  navigation,
  route,
}) => {
  const [tfReady, setTfReady] = useState<boolean>(false);

  useEffect(() => {
    //anonymous func
    (async function () {
      await tf.setBackend("cpu");
      await tf.ready();

      // Convert base64 encoded image to tensor -> resize to inputDim x inputDim -> add batch dim
      let imageTensor = await base64ToTensor(route.params.imageBase64Encoded);
      imageTensor = await tf.image.resizeBilinear(imageTensor!, [256, 256]);
      const imageTensorWithBatch = await tf.expandDims(imageTensor, 0);

      const model = tf.sequential();
      model.add(
        tf.layers.conv2d({
          inputShape: [256, 256, 3],
          filters: 32,
          kernelSize: 3,
          activation: "relu",
        })
      );
      model.add(tf.layers.maxPool2d({ poolSize: [2, 2] }));
      model.add(
        tf.layers.conv2d({ filters: 64, kernelSize: 3, activation: "relu" })
      );
      model.add(tf.layers.flatten());
      model.add(tf.layers.dense({ units: 64, activation: "relu" }));
      model.add(tf.layers.dense({ units: 1, activation: "sigmoid" }));
      model.compile({
        optimizer: "adam",
        loss: "binaryCrossentropy",
        metrics: ["accuracy"],
      });

      const yPred = model.predict(imageTensorWithBatch) as Tensor<Rank>;
      console.log(yPred);
      console.log(await yPred.data());
    })();
  }, []);

  if (!tfReady) {
    return (
      <View
        style={tw`w-full h-full bg-white flex justify-center items-center px-4`}
      >
        <Text>Loading</Text>
      </View>
    );
  }

  return (
    <View
      style={tw`w-full h-full bg-white flex justify-center items-center px-4`}
    >
      <Text>This is result screen</Text>
    </View>
  );
};

export default ResultScreen;
