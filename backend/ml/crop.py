
from PIL import Image
from pathlib import Path
from tqdm import tqdm

def crop(image):

    (width, height) = image.size

    crop_size = min(width, height)

    
    start_y = (height - crop_size) // 2
    start_x = (width - crop_size) // 2

    crop_area = (start_x, start_y, width-start_x, height-start_y)

    return image.crop(crop_area)

import numpy as np
import os

def main():

    input_path = "./data/images"
    output_path = "./data/images_cropped"
    current_path = Path(__file__).parent.resolve()
    input_dir = current_path / Path(input_path)
    output_dir = current_path / Path(output_path)
    output_dir.mkdir(parents=True, exist_ok=True)

    # iterate through the names of contents of the folder
    extensions = ['*.jpg', '*.png', '*.jpeg']
    files = []
    for ext in extensions:
        p = input_dir.glob(ext)
        files.extend([x for x in p if x.is_file()])
    

    for file in tqdm(files):
        # create the full input path and read the file
        with Image.open(file) as image:
            image = crop(image)

            save_path = output_dir / file.name
            image.save(save_path, "JPEG")

    


if __name__ == '__main__':
    main()
