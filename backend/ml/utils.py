from io import BytesIO
import base64
import tensorflow as tf
import numpy as np
import matplotlib.pyplot as plt
from PIL import Image

def round_by_threshold(x, threshold):
    if x > threshold:
        return 1
    else:
        return 0


def extract_salient_maps(model, img):
    images = tf.Variable(img, dtype=float)

    with tf.GradientTape() as tape:
        pred = model(images, training=False)
        class_idxs_sorted = np.argsort(pred.numpy().flatten())[::-1]
        loss = pred[0][class_idxs_sorted[0]]
        
    grads = tape.gradient(loss, images)

    dgrad_abs = tf.math.abs(grads)

    dgrad_max_ = np.max(dgrad_abs, axis=3)[0]

    arr_min, arr_max  = np.min(dgrad_max_), np.max(dgrad_max_)
    grad_eval = (dgrad_max_ - arr_min) / (arr_max - arr_min + 1e-18)
    
    cm = plt.get_cmap('jet')
    salient_map = cm(grad_eval)

    salient_map = Image.fromarray((salient_map[:, :, :3] * 255).astype(np.uint8))

    buff = BytesIO()
    salient_map.save(buff,format="jpeg")
    salient_map_file = Image.open(buff)

    return salient_map_file
