import cv2
import numpy as np
from PIL import Image
from io import BytesIO
import matplotlib.pyplot as plt

def preprocess_image(image_bytes):
    """
    Preprocess the fingerprint image to enhance features.
    Converts to grayscale and applies thresholding for binarization.
    """
    # Open the image from byte data
    image = Image.open(BytesIO(image_bytes))
    image = image.convert('L')  # Convert to grayscale

    # Convert to a numpy array for OpenCV processing
    image_array = np.array(image)

    # Apply adaptive thresholding to get a clean binary image
    # Adjust blockSize and C for your images as needed
    thresholded = cv2.adaptiveThreshold(image_array, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                       cv2.THRESH_BINARY, 11, 2)

    # Display the processed image (for debugging purposes)
    plt.imshow(thresholded, cmap='gray')
    plt.title('Processed Image')
    plt.show()

    return thresholded

import cv2
import numpy as np

def extract_minutiae_features(skeleton):
    """
    Extract minutiae features from a skeletonized fingerprint image.
    This function identifies ridge endings and bifurcations using the fingerprint skeleton.
    """
    minutiae = []

    # We assume the skeleton image is binary (0 and 255), with 255 representing ridges
    # The structure for minutiae detection is a 3x3 kernel to detect ridge endings or bifurcations

    # Create a 3x3 neighborhood for minutiae detection
    kernel = np.array([[-1, -1, -1],
                       [-1,  8, -1],
                       [-1, -1, -1]])

    # Iterate over each pixel in the skeletonized image
    for i in range(1, skeleton.shape[0] - 1):
        for j in range(1, skeleton.shape[1] - 1):
            # Create a 3x3 block centered at (i, j)
            block = skeleton[i-1:i+2, j-1:j+2]

            # Check if we have a ridge pixel (255) in the block
            if skeleton[i, j] == 255:
                # Count the number of non-zero pixels in the neighborhood
                count = np.count_nonzero(block)

                # If the pixel is a ridge ending (only one non-zero neighbor), it's a ridge ending
                if count == 2:
                    minutiae.append((i, j, "ending"))

                # If the pixel is a bifurcation (three non-zero neighbors), it's a bifurcation
                elif count == 3:
                    minutiae.append((i, j, "bifurcation"))

    # Debug: Print the minutiae count
    print(f"Detected {len(minutiae)} minutiae points")
    
    return minutiae


def hash_minutiae(minutiae):
    """
    Hash the minutiae features. Here, we'll use a simple method.
    In a real-world scenario, you would hash the minutiae data more securely.
    """
    # A simple way to "hash" the minutiae is to convert them to a string and hash that.
    minutiae_str = ''.join([f"{x[0]},{x[1]}" for x in minutiae])  # Convert to a string
    return hash(minutiae_str)  # Basic hash for demonstration