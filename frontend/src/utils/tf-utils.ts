import * as jpeg from "jpeg-js";
import * as tf from "@tensorflow/tfjs";
import { Buffer } from "buffer";

export const imageToTensor = (rawImageData: jpeg.BufferLike) => {
  const TO_UINT8ARRAY = true;
  const { width, height, data } = jpeg.decode(rawImageData, {
    useTArray: TO_UINT8ARRAY,
  });
  // Drop the alpha channel info for mobilenet
  const buffer = new Uint8Array(width * height * 3);
  let offset = 0; // offset into original data
  for (let i = 0; i < buffer.length; i += 3) {
    buffer[i] = data[offset];
    buffer[i + 1] = data[offset + 1];
    buffer[i + 2] = data[offset + 2];

    offset += 4;
  }

  return tf.tensor3d(buffer, [height, width, 3]);
};

export const base64ToTensor = async (data: string) => {
  try {
    const rawImageData = Buffer.from(data, "base64");
    const imageTensor = imageToTensor(rawImageData);
    return imageTensor;
  } catch (error) {
    console.log(error);
  }
};
