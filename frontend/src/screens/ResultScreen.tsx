import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { Text, Image, View } from "react-native";
import tw from "../styling/tw";
import "@tensorflow/tfjs-react-native";
import { ParamList } from "./MainScreen";
import MalignantIllustration from "../../assets/doctors.svg";
import UncertainIllustration from "../../assets/confirmed.svg";
import BenignIllustration from "../../assets/well-done.svg";
import mime from "mime";

enum Prediction {
  MALIGNANT = "Malignant",
  UNCERTAIN = "Uncertain",
  BENIGN = "Benign",
}

const ResultScreen: React.FC<NativeStackScreenProps<ParamList, "Result">> = ({
  navigation,
  route,
}) => {
  const [result, setResult] = useState<{
    value: number;
    class: Prediction;
    base64Image: string;
  } | null>(null);

  const [error, setError] = useState<string>("");

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
      .then(({ pred, base64Image }) => {
        setResult((old) => ({
          value: pred,
          class: Prediction.BENIGN,
          base64Image: base64Image,
        }));
      })
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
    <View style={tw`w-full h-full bg-white flex items-center p-4`}>
      {result.class == Prediction.MALIGNANT ? (
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
      ) : result.class == Prediction.UNCERTAIN ? (
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
      {/*<Image
        style={tw`rounded-sm`}
        resizeMode={"contain"}
        width={500 / 4}
        height={500 / 4}
        source={{
          uri: route.params.imgUri,
        }}
      />*/}
      <View style={tw`w-full flex flex-row items-center justify-start mt-12`}>
        <Image
          style={tw`rounded-sm`}
          resizeMode={"contain"}
          width={500 / 4}
          height={500 / 4}
          source={{
            uri: `data:image/jpeg;base64,${result.base64Image}`,
          }}
        />
        <View style={tw`ml-4 flex flex-col`}>
          <Text style={tw`text-lg font-bold`}>Your result:</Text>
          <Text style={tw``}>
            Malignant probability: {result.value.toFixed(4)}
          </Text>
          <Text style={tw``}>Prediction: {result.class}</Text>
        </View>
      </View>
    </View>
  );
};

export default ResultScreen;
