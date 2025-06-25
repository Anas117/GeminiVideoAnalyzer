import os
import time
from google import generativeai as genai
from fastapi import UploadFile
from dotenv import load_dotenv
import json
from sqlite_setup import insert_tutorial, insert_video_tutorial

load_dotenv()

genai.configure(api_key=os.getenv("GENAI_API_KEY"))

model = "gemini-1.5-flash"

def generate_tutorial(transcript, uploader):
    prompt =   f"Extract relevant steps from the transcript.Generate a clear step-by-step tutorial summarizing how the issue was resolved.Include steps only when meaningful.(avoid trivial dialogue) Here is the transcript:{transcript}"
    result = genai.GenerativeModel(model).generate_content(prompt)
    insert_tutorial(result.text, transcript, uploader)

def generate_video_tutorial(video: UploadFile, uploader: str):
    video_path = f"videos/{video.filename}"
    uploaded_video = genai.upload_file(
        path=video_path,
        display_name=video.filename,
        mime_type=video.content_type
    )
    print(f"File uploaded successfully. Name: {uploaded_video.name}")
    print("Waiting for video processing...")
    while uploaded_video.state.name == "PROCESSING":
        time.sleep(5)
        uploaded_video = genai.get_file(name=uploaded_video.name)

    if uploaded_video.state.name == "FAILED":
        raise ValueError(f"Video processing failed for file: {uploaded_video.name}")

    prompt = """
    You are an expert technical assistant. Based on the provided video, which shows a
    client having an issue with a product, generate a clear, step-by-step tutorial 
    summarizing how the issue was resolved. 
    
    Instructions:
    1.  Only include meaningful steps that are essential to the resolution.
    2.  Avoid trivial dialogue or unnecessary details.
    3.  Provide your response in a valid JSON format.
    4.  The JSON object must have two fields:
        - 'content': A list of strings, where each string is a step in the tutorial.
        - 'clips': A list of strings, where each string is a timestamp range (e.g., "00:10-00:25") 
                   for the video subclip that illustrates the corresponding step.
    5.  Ensure the number of 'content' steps and 'clips' timeframes are exactly the same.
    """
    result = genai.GenerativeModel(model).generate_content(
        contents=[uploaded_video,prompt],
    )

    dict_result = json.loads(extract_json_from_string(result.text))
    insert_video_tutorial('\n\n'.join(dict_result['content']),'|'.join(dict_result['clips']), video.filename, uploader)

def extract_json_from_string(s: str):
    start_index = min(s.index('{'), s.index('['))
    end_index = max(s.rfind('}'), s.rfind(']'))
    if end_index == -1:
        return ""
    return s[start_index : end_index + 1]

