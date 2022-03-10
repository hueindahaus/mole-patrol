import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useMemo, useState } from "react";
import { Text, Image, View, ScrollView, Dimensions } from "react-native";
import tw from "../styling/tw";
import "@tensorflow/tfjs-react-native";
import { ParamList } from "./MainScreen";
import MalignantIllustration from "../../assets/doctors.svg";
import UncertainIllustration from "../../assets/confirmed.svg";
import BenignIllustration from "../../assets/well-done.svg";
import mime from "mime";

enum Prediction {
  MALIGNANT = "malignant",
  UNCERTAIN = "Uncertain",
  BENIGN = "benign",
}

const ResultScreen: React.FC<NativeStackScreenProps<ParamList, "Result">> = ({
  navigation,
  route,
}) => {
  const [result, setResult] = useState<{
    y_score: number;
    y_pred: Prediction;
    base64Image: string;
    base64SalientMap: string;
  } | null>(null);

  const [error, setError] = useState<string>("");

  const [height, width] = useMemo(
    () => [Dimensions.get("window").height, Dimensions.get("window").width],
    []
  );

  useEffect(() => {
    const formdata = new FormData();
    const uri = route.params.imgUri;
    formdata.append("img", {
      //@ts-ignore
      uri,
      name: "img",
      type: mime.getType(uri)!,
    });

    fetch(process.env.BACKEND_URL!, {
      method: "post",
      body: formdata,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
      .then(async (res) => res.json())
      .then(
        ({
          y_pred,
          y_score,
          base64Image,
          base64SalientMap,
        }: {
          y_pred: string;
          y_score: number;
          base64Image: string;
          base64SalientMap: string;
        }) => {
          setResult({
            y_score: y_score,
            y_pred: y_pred as Prediction,
            base64Image: base64Image,
            base64SalientMap: base64SalientMap,
          });
        }
      )
      .catch((err) => console.error(err));
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

  if (result === null) {
    return (
      <View
        style={tw`w-full h-full bg-white flex justify-center items-center px-4`}
      >
        <Text>Loading</Text>
      </View>
    );
  }

  return (
    <ScrollView>
      <View style={tw`w-full h-full bg-white flex items-center p-4`}>
        {result.y_pred == Prediction.MALIGNANT ? (
          <View
            style={tw`w-full flex flex-col justify-center items-center mt-16`}
          >
            <MalignantIllustration width={256} height={216} style={tw``} />
            <Text style={tw`text-xl font-bold mt-6`}>
              Your result came out malignant.
            </Text>
            <Text style={tw`text-base mt-4`}>
              Unfortunately, the result came out positive in our system. But
              don't panic! Our system is not 100% correct. Contact a doctor and
              schedule a checkup to get an accurate diagnosis.
            </Text>
          </View>
        ) : result.y_pred == Prediction.UNCERTAIN ? (
          <View
            style={tw`w-full flex flex-col justify-center items-center mt-16`}
          >
            <UncertainIllustration width={256} height={216} style={tw``} />
            <Text style={tw`text-xl font-bold mt-6`}>
              There is a high uncertainty.
            </Text>
            <Text style={tw`text-base mt-4`}>
              Please, try scanning the mark several times as meticulous as
              possible. If this result comes up regularly, we recommend
              scheduling a checkup with a doctor to be sure.
            </Text>
          </View>
        ) : (
          <View
            style={tw`w-full flex flex-col justify-center items-center mt-16`}
          >
            <BenignIllustration width={256} height={216} style={tw``} />
            <Text style={tw`text-xl font-bold mt-6`}>
              We got some good news!
            </Text>
            <Text style={tw`text-base mt-4`}>
              Your mark seem to be benign! Just to be sure, you should scan
              several times and be as accurate as possible in your scanning.
            </Text>
          </View>
        )}

        <View
          style={tw`w-full flex flex-row items-center justify-between mt-12`}
        >
          <Image
            style={tw`rounded-sm w-1/2 h-42`}
            resizeMode={"contain"}
            source={{
              uri: `data:image/jpeg;base64,${result.base64Image}`,
            }}
          />
          <Image
            style={tw`rounded-sm w-1/2 h-42`}
            resizeMode={"contain"}
            source={{
              uri: `data:image/jpeg;base64,${result.base64SalientMap}`,
            }}
          />
        </View>
        <View style={tw`mt-8 ml-4 flex flex-col w-full`}>
          <Text style={tw`text-lg font-bold`}>Your result:</Text>
          <Text style={tw``}>
            Malignant probability: {result.y_score.toFixed(4)}
          </Text>
          <Text style={tw``}>Prediction: {result.y_score}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default ResultScreen;
