import mediapipe as mp
import numpy as np
import time
import cv2
import numpy as np
import math
import os
from collections import deque
import logging
import math
import numpy as np
import time
import os
import json
from PIL import Image, ImageDraw, ImageFont


### SWIPE DETECTION LOGIC

def leftSwipeDetection(leftWristLocations):
    return leftWristLocations[0][0] - leftWristLocations[-1][0] > 100

def rightSwipeDetection(rightWristLocations):
    return rightWristLocations[-1][0] - rightWristLocations[0][0] > 100

def upSwipeDetection(rightWristLocations):
    return rightWristLocations[0][1] - rightWristLocations[-1][1] > 100


### MAPPING LOGIC

def mapTops(pose_points, img):
    # Distance between shoulders
    shoulder_distance = math.sqrt((pose_points[1][0] - pose_points[0][0]) ** 2 + (pose_points[1][1] - pose_points[0][1]) ** 2)
    
    # Scale offsets
    shoulder_scale_factor = shoulder_distance / 250 
    shoulder_x_offset = int(100 * shoulder_scale_factor)
    hip_x_offset = int(180 * shoulder_scale_factor)
    shoulder_y_offset = int(50 * shoulder_scale_factor)
    
    # height-to-width ratio of input image
    heightToWidth = img.shape[0] / img.shape[1]
    width = int(math.fabs(pose_points[1][0] - pose_points[0][0]) * heightToWidth)
    height = int(width * heightToWidth)
    
    src = np.array([[0, 0], [width, 0], [width, height], [0, height]], dtype='float32')
    
    dest = np.array([
        [pose_points[0][0] + shoulder_x_offset, pose_points[0][1] - shoulder_y_offset], # Left shoulder
        [pose_points[1][0] - shoulder_x_offset, pose_points[1][1] - shoulder_y_offset], # Right shoulder
        [pose_points[3][0] - hip_x_offset, pose_points[3][1]], # Right hip
        [pose_points[2][0] + hip_x_offset, pose_points[2][1]] # Left hip
    ], dtype='float32')
    
    # Map image points onto pase points
    transform = cv2.getPerspectiveTransform(src, dest)
    img = cv2.resize(img, (width, height))
    
    return img, transform


def mapBottoms(pose_points, img):
    # Distance between hips
    hip_distance = math.sqrt((pose_points[1][0] - pose_points[0][0]) ** 2 + (pose_points[1][1] - pose_points[0][1]) ** 2)
    
    # Scale offsets
    hip_scale_factor = hip_distance / 250
    hip_x_offset = int(150 * hip_scale_factor)
    ankle_x_offset = int(150 * hip_scale_factor)
    # ankle_y_offset = int(200 * hip_scale_factor) # if needed
    hip_y_offset = int(70 * hip_scale_factor)
    
    # height-to-width ratio of input image
    heightToWidth = img.shape[0] / img.shape[1]
    width = int(math.fabs(pose_points[1][0] - pose_points[0][0]) * heightToWidth)
    height = int(width * heightToWidth)
    
    src = np.array([[0, 0], [width, 0], [width, height], [0, height]], dtype='float32')
    
    dest = np.array([
        [pose_points[0][0] + hip_x_offset, pose_points[0][1] - hip_y_offset], # Left shoulder
        [pose_points[1][0] - hip_x_offset, pose_points[1][1] - hip_y_offset], # Right shoulder
        [pose_points[3][0] - ankle_x_offset, pose_points[3][1]], # Right hip
        [pose_points[2][0] + ankle_x_offset, pose_points[2][1]] # Left hip
    ], dtype='float32')
    
    
    # Map image points onto pase points
    transform = cv2.getPerspectiveTransform(src, dest)
    img = cv2.resize(img, (width, height))
    
    return img, transform

def overlay_clothing(frame, clothing_img, transform):
    transformed_clothing = cv2.warpPerspective(clothing_img, transform, (frame.shape[1], frame.shape[0]))

    # Handle transparency channel
    if transformed_clothing.shape[-1] == 4: # transparency
        alpha_channel = transformed_clothing[:, :, 3] / 255.0 
        for c in range(0, 3): 
            frame[:, :, c] = (1.0 - alpha_channel) * frame[:, :, c] + alpha_channel * transformed_clothing[:, :, c]
    else: # direct overlay
        mask = transformed_clothing > 0  # non-zero pizel -> clothing
        frame[mask] = transformed_clothing[mask]

    return frame


def load_clothing_data(json_path):
    with open(json_path, "r") as file:
        data = json.load(file)
    
    return data
    
### Desktop/Mirror mode toggle
desktop = True

leftWristLocations = deque(maxlen=10)
rightWristLocations = deque(maxlen=10)

font_clothing_name = ImageFont.truetype("static/fonts/Inter/static/Inter_24pt-Bold.ttf", 20)
font_clothing_type = ImageFont.truetype("static/fonts/Inter/static/Inter_24pt-Bold.ttf", 12)

tops_json_path = "static/images/tops/tops.json"
bottoms_json_path = "static/images/bottoms/bottoms.json"

clothing_tops = load_clothing_data(tops_json_path)
clothing_bottoms = load_clothing_data(bottoms_json_path)


last_left_swipe_time = 0
last_right_swipe_time = 0
swipe_delay = 1

clothing_tops_index = 0
clothing_bottoms_index = 0
clothing_top_selected = False

mp_drawing = mp.solutions.drawing_utils
mp_pose = mp.solutions.pose

cap = cv2.VideoCapture(0)


# Media pipe instance
with mp_pose.Pose(min_detection_confidence = 0.5, min_tracking_confidence = 0.5) as pose:
    while True:
        ### CAMERA FEED 
        ret, frame = cap.read()

        # if image not captured
        if not ret or frame is None:
            break
        
        ### POSE DETECTION LOGIC 

        # Recolor image to RGB
        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        image.flags.writeable = False
      
        # Make detection
        results = pose.process(image)
    
        # Recolor back to BGR
        image.flags.writeable = True
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
        
        
        try:
            ### EXTRACT LANDMARKS

            if not results.pose_landmarks:
                continue

            landmarks = results.pose_landmarks.landmark

            
            ### COORDINATE LOGIC
        
            # Get joint coordinates
            left_wrist = [landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].x,landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].y]
            right_wrist = [landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].x,landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].y]

            left_shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x,landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
            right_shoulder = [landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].x,landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].y]

            left_hip = [landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].x,landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y]
            right_hip = [landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value].x,landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value].y]
            
            left_ankle = [landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].x,landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].y]
            right_ankle = [landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE.value].x,landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE.value].y]

            norm_coord = [frame.shape[1], frame.shape[0]] if desktop else [frame.shape[0], frame.shape[1]]

            # Normalize joint coordinates
            left_wrist_coords = tuple(np.multiply(left_wrist, norm_coord).astype(int))
            right_wrist_coords = tuple(np.multiply(right_wrist, norm_coord).astype(int))

            left_shoulder_coords = tuple(np.multiply(left_shoulder, norm_coord).astype(int))
            right_shoulder_coords = tuple(np.multiply(right_shoulder, norm_coord).astype(int))

            left_hip_coords = tuple(np.multiply(left_hip, norm_coord).astype(int))
            right_hip_coords = tuple(np.multiply(right_hip, norm_coord).astype(int)) 
            
            left_ankle_coords = tuple(np.multiply(left_ankle, norm_coord).astype(int))
            right_ankle_coords = tuple(np.multiply(right_ankle, norm_coord).astype(int))

            upper_coords = [left_shoulder_coords, right_shoulder_coords, left_hip_coords, right_hip_coords]
            lower_coords = [left_hip_coords, right_hip_coords, left_ankle_coords, right_ankle_coords]



            ### 2D MAPPING LOGIC
            for point in [left_shoulder_coords, right_shoulder_coords, left_hip_coords, right_hip_coords]:
                cv2.circle(frame, point, 5, (0, 255, 0), -1)

            # Overlay bottom
            bottom_image = cv2.imread(os.path.join("static/images/bottoms", clothing_bottoms[clothing_bottoms_index]["file"]),cv2.IMREAD_UNCHANGED)
            bottom_image, transform = mapBottoms(lower_coords, bottom_image)
            frame = overlay_clothing(frame, bottom_image, transform)
            
            # Overlay top
            top_image = cv2.imread(os.path.join("static/images/tops", clothing_tops[clothing_tops_index]["file"]),cv2.IMREAD_UNCHANGED)
            top_image, transform = mapTops(upper_coords, top_image)
            frame = overlay_clothing(frame, top_image, transform)




            ### SWIPE DETECTION LOGIC

            # Append current wrist locations
            leftWristLocations.append(left_wrist_coords)
            rightWristLocations.append(right_wrist_coords)
            
            current_time = time.time()

            # left swipe check -> decrease clothing index
            if leftSwipeDetection(leftWristLocations):
                if current_time - last_left_swipe_time > swipe_delay:
                    last_left_swipe_time = current_time
                    if clothing_top_selected:
                        if clothing_tops_index == 0:
                            clothing_tops_index = len(clothing_tops) - 1
                        else:
                            clothing_tops_index -= 1
                    else:
                        if clothing_bottoms_index == 0:
                            clothing_bottoms_index = len(clothing_bottoms) - 1
                        else:
                            clothing_bottoms_index -= 1
                        
                
            # right swipe check -> increase clothing index
            if rightSwipeDetection(rightWristLocations):
                if current_time - last_right_swipe_time > swipe_delay:
                    last_right_swipe_time = current_time
                    if clothing_top_selected:
                        if clothing_tops_index == len(clothing_tops) - 1 :
                            clothing_tops_index = 0
                        else:
                            clothing_tops_index += 1
                    else:
                        if clothing_bottoms_index == len(clothing_bottoms) - 1:
                            clothing_bottoms_index = 0
                        else:
                            clothing_bottoms_index += 1
                        
            # up swipe check -> alternate top and bottom arrays
            if upSwipeDetection(rightWristLocations):
                if current_time - last_right_swipe_time > swipe_delay:
                    last_right_swipe_time = current_time
                    clothing_top_selected = not clothing_top_selected
        
            


            ### INFO DISPLAY LOGIC

            # Colors
            TEXT_COLOR = (0, 0, 0)
            DISPLAY_COLOR = (0, 0, 0)

            # Transparency
            ALPHA = 0.25 

            # Box Dimensions
            box_width, box_height = 300, 75

            # Create overlay for transparency
            overlay = frame.copy()

            # Black Rectangle
            cv2.rectangle(overlay, (0, 0), 
                        (box_width, box_height), 
                        DISPLAY_COLOR, thickness=-1)

            # Apply transparency
            cv2.addWeighted(overlay, ALPHA, frame, 1 - ALPHA, 0, frame)

            # OpenCV frame -> PIL Image
            pil_image = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
            draw = ImageDraw.Draw(pil_image)

            # Clothing type
            clothing_type = "TOP" if clothing_top_selected else "BOTTOM"
            item_name = clothing_tops[clothing_tops_index]["name"].upper() if clothing_top_selected else clothing_bottoms[clothing_bottoms_index]["name"].upper()

            # Center clothing name text
            text_bbox = font_clothing_name.getbbox(item_name)
            text_width = text_bbox[2] - text_bbox[0]
            text_height = text_bbox[3] - text_bbox[1]

            text_x = (box_width - text_width) // 2
            text_y = (box_height - text_height) // 2

            # Clothing type
            draw.text((10, 10), clothing_type, font=font_clothing_type, fill=TEXT_COLOR)

            # Clothing name
            draw.text(((box_width - text_width) // 2, (box_height - text_height) // 2), item_name, font=font_clothing_name, fill=TEXT_COLOR)

            # PIL Image -> OpenCV
            frame = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)

            
            if not desktop:
                frame = cv2.rotate(frame, cv2.ROTATE_90_COUNTERCLOCKWISE)

            ### TERMINATE
            if cv2.waitKey(10) & 0xFF == ord('q'):
                break
            
            cv2.imshow('Result', frame)

            
        except Exception as e:
            print(f"An error occurred during pose estimation or clothing mapping: {e}")
        except:
            pass


    cap.release()
    cv2.destroyAllWindows()
