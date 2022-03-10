from flask import Flask, request, jsonify
from matplotlib.pyplot import axis
import tensorflow as tf
import numpy as np
from PIL import Image
from tensorflow.keras.preprocessing.image import smart_resize, img_to_array
from ml.config import host, img_size, model_path
from utils import im_2_b64


app = Flask(__name__)

model = tf.keras.models.load_model(f'ml/{model_path}')

@app.route('/')
def index():
    return "Hello world!"

@app.route("/predict", methods=['POST'])
def predict():
    # https://stackoverflow.com/questions/70174676/how-to-send-an-numpy-array-or-a-pytorch-tensor-through-http-post-request-using-r
    file = Image.open(request.files['img'])
    img = img_to_array(file)
    img = smart_resize(img, (img_size, img_size))     
    print(img.shape)
    print(type(img))
    y = model.predict(np.expand_dims(img, axis=0))
    print(y)
    return jsonify({"pred": float(y[0, 0]), "base64Image": im_2_b64(file)})

if __name__ == "__main__":
    app.run(debug=True, host=host)