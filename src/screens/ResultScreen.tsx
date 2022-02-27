import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { Text, Image, View } from "react-native";
import tw from "../styling/tw";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-react-native";
import { ParamList } from "./MainScreen";
import { base64ToTensor } from "../utils/tf-utils";
import { Rank, Tensor } from "@tensorflow/tfjs";
import MalignantIllustration from "../../assets/doctors.svg";
import UncertainIllustration from "../../assets/confirmed.svg";
import BenignIllustration from "../../assets/well-done.svg";

enum Prediction {
  MALIGNANT = "Malignant",
  UNCERTAIN = "Uncertain",
  BENIGN = "Benign",
}

const ResultScreen: React.FC<NativeStackScreenProps<ParamList, "Result">> = ({
  navigation,
  route,
}) => {
  const [prediction, setPrediction] = useState<{
    value: number;
    class: Prediction;
  } | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    //anonymous func
    (async function () {
      try {
        await tf.setBackend("cpu");
        await tf.ready();

        // Convert base64 encoded image to tensor -> resize to inputDim x inputDim -> add batch dim
        let imageTensor = await base64ToTensor(route.params.imageBase64Encoded);
        imageTensor = await tf.image.resizeBilinear(imageTensor!, [256, 256]);
        const imageTensorWithBatch = await tf.expandDims(imageTensor, 0);

        //@TODO replace model
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

        const yPred = await (
          model.predict(imageTensorWithBatch) as Tensor<Rank>
        ).data();
        const value = yPred[0];
        setPrediction({
          value: value,
          class:
            value > 0.7
              ? Prediction.MALIGNANT
              : value > 0.4
              ? Prediction.UNCERTAIN
              : Prediction.BENIGN,
        });
      } catch (err) {
        console.log(err);
      }
    })();
  }, []);

  if (error) {
    return (
      <View
        style={tw`w-full h-full bg-white flex justify-center items-center px-4`}
      >
        <Text>{error}</Text>
      </View>
    );
  }

  if (prediction === null) {
    return (
      <View
        style={tw`w-full h-full bg-white flex justify-center items-center px-4`}
      >
        <Text>Loading</Text>
      </View>
    );
  }

  return (
    <View style={tw`w-full h-full bg-white flex items-center p-4`}>
      {prediction.class == Prediction.MALIGNANT ? (
        <View
          style={tw`w-full flex flex-col justify-center items-center mt-16`}
        >
          <MalignantIllustration width={256} height={216} style={tw``} />
          <Text style={tw`text-xl font-bold mt-6`}>
            Your result came out malignant.
          </Text>
          <Text style={tw`text-base mt-4`}>
            Unfortunately, the result came out positive in our system. But don't
            panic! Our system is not 100% correct. Contact a doctor and schedule
            a checkup. To get an accurate diagnosis.
          </Text>
        </View>
      ) : prediction.class == Prediction.UNCERTAIN ? (
        <View
          style={tw`w-full flex flex-col justify-center items-center mt-16`}
        >
          <UncertainIllustration width={256} height={216} style={tw``} />
          <Text style={tw`text-xl font-bold mt-6`}>
            There is a high uncertainty.
          </Text>
          <Text style={tw`text-base mt-4`}>
            Please, try scanning the mark several times as meticulous as
            possible. If this result comes up regularly, we recommend scheduling
            a checkup with a doctor to be sure.
          </Text>
        </View>
      ) : (
        <View
          style={tw`w-full flex flex-col justify-center items-center mt-16`}
        >
          <BenignIllustration width={256} height={216} style={tw``} />
          <Text style={tw`text-xl font-bold mt-6`}>We got some good news!</Text>
          <Text style={tw`text-base mt-4`}>
            Your mark seem to be benign! Just to be sure, you should scan
            several times and be as accurate as possible in your scanning.
          </Text>
        </View>
      )}

      <View style={tw`w-full flex flex-row items-center justify-start mt-12`}>
        <Image
          style={tw`rounded-sm`}
          resizeMode={"contain"}
          width={256 / 4}
          height={256 / 4}
          source={{
            uri: `data:image/png;base64,${route.params.imageBase64Encoded}`,
          }}
        />
        <View style={tw`ml-4 flex flex-col`}>
          <Text style={tw`text-lg font-bold`}>Your result:</Text>
          <Text style={tw``}>
            Malignant probability: {prediction.value.toFixed(4)}
          </Text>
          <Text style={tw``}>Prediction: {prediction.class}</Text>
        </View>
      </View>
    </View>
  );
};

export default ResultScreen;
