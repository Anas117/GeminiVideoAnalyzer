import os
import aiofiles
import uvicorn
from fastapi import FastAPI, UploadFile,HTTPException,File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import httpx
from sqlite_setup import select_tutorials, Tutorial, update_tutorial
from gemini import generate_tutorial,  generate_video_tutorial
from dotenv import load_dotenv

load_dotenv()

client_id = os.getenv("CLIENT_ID")
client_secret = os.getenv("CLIENT_SECRET")
app = FastAPI()

origins = [
    "http://localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],)

@app.get("/getAccessToken")
async def get_access_token(code:str):
    params = {
        'client_id': client_id,
        'client_secret': client_secret,
        'code': code,
    }
    headers = {
        'Accept': 'application/json',
    }
    async with httpx.AsyncClient() as client:
        response = await client.post(url='https://github.com/login/oauth/access_token',params=params,headers=headers)
    return response.json()


@app.get("/getUserInfo")
async def get_user_info(access_token: str):
    headers = {
        'Accept': 'application/json',
        'Authorization': f'Bearer {access_token}',
    }
    async with httpx.AsyncClient() as client:
        response = await client.get(url='https://api.github.com/user',headers=headers)
    return response.json()

@app.post("/uploadTranscript")
async def upload_json_transcript(transcript: UploadFile, uploader: str):

    print(f"Received file: {transcript.filename}, content type: {transcript.content_type}, from user: {uploader}")

    if transcript.content_type != "application/json":
        print(f"Invalid file type uploaded: {transcript.content_type}. Expected application/json.")
        raise HTTPException(
            status_code=400, detail="Invalid file type. Only JSON files are allowed."
        )
    content = transcript.file.read()
    generate_tutorial(content,uploader)

@app.post("/uploadVideo")
async def upload_video(uploader: str,video: UploadFile=File(...)):
    print(f"Received file: {video.filename}, content type: {video.content_type}, from user: {uploader}")
    try:
        out_file_path = f"videos/{video.filename}"
        async with aiofiles.open(out_file_path, 'wb') as out_file:
            content = await video.read()  # async read
            await out_file.write(content)  # async write

    except IOError as e:
        print(f"Error saving video file: {e}")
        raise
    finally:
        generate_video_tutorial(video, uploader)

@app.get("/tutorials")
async def get_tutorials(uploader: str):
    return select_tutorials(uploader)

@app.post("/editTutorial")
async def edit_tutorial(edited_tutorial: Tutorial):
    return update_tutorial(edited_tutorial)

@app.get("/getVideo/")
async def get_video(video_name: str):
    video_path = os.path.join("videos", f"{video_name}")
    if not os.path.exists(video_path):
        raise HTTPException(status_code=404, detail="Video not found")
    return FileResponse(video_path, media_type="video/mp4")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)