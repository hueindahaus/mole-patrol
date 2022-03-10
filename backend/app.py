from flask import Flask, request, jsonify
from matplotlib.pyplot import axis
import tensorflow as tf
import numpy as np
from PIL import Image
from tensorflow.keras.preprocessing.image import smart_resize, img_to_array
from ml.config import host, img_size, model_path, threshold
from utils import im_2_b64
from ml.utils import extract_salient_maps, round_by_threshold


app = Flask(__name__)

#model = tf.keras.models.load_model(f'ml/{model_path}')
model = tf.keras.models.load_model(f'ml/models/test/checkpoint_primary')

@app.route('/')
def index():
    return "Hello world!"

@app.route("/predict", methods=['POST'])
def predict():
    # https://stackoverflow.com/questions/70174676/how-to-send-an-numpy-array-or-a-pytorch-tensor-through-http-post-request-using-r
    img_file = Image.open(request.files['img'])
    img = img_to_array(img_file)
    img = smart_resize(img, (img_size, img_size))     
    #print(img.shape)
    #print(type(img))

    # Extract salient map
    img *= 1.0 / 255
    img = np.expand_dims(img, axis=0)
    y_score= float(model.predict(img)[0, 0])
    salient_map = extract_salient_maps(model, img)

    # Determine class
    y_pred = "malignant" if round_by_threshold(y_score, threshold=threshold) == 1 else "benign"

    return jsonify({"y_score": y_score, "y_pred": y_pred, "base64Image": im_2_b64(img_file), "base64SalientMap": im_2_b64(salient_map)})

if __name__ == "__main__":
    app.run(debug=True, host=host)