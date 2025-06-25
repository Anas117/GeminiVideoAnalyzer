import React, {useEffect, useState} from 'react';
import api from "../api.js";
import TutorialsTable from "./TutorialsTable.jsx";

const TutorialGenerator = ({uploader}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedVideoFile, setSelectedVideoFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadVideoStatus, setUploadVideoStatus] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [videoErrorMessage, setVideoErrorMessage] = useState('');
  const [tutorials, setTutorials] = useState([]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/json') {
      setSelectedFile(file);
      setUploadStatus('');
      setErrorMessage('');
    } else {
      setSelectedFile(null);
      setUploadStatus('');
      setErrorMessage('Please select a valid JSON file.');
    }
  };

  const handleVideoFileChange = (event) => {
    const file = event.target.files[0];
    console.log(file.type);
    if (file && file.type === 'video/mp4') {
      setSelectedVideoFile(file);
      setUploadVideoStatus('');
      setVideoErrorMessage('');
    } else {
      setSelectedVideoFile(null);
      setUploadVideoStatus('');
      setVideoErrorMessage('Please select a valid MP4 file.');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMessage('No file selected.');
      return;
    }

    setUploadStatus('Uploading...');
    setErrorMessage('');

    const formData = new FormData();
    formData.append('transcript', selectedFile);

    try {
      const response = await api.post('/uploadTranscript', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        params: {uploader: uploader},
      });

      setUploadStatus('Upload successful!');
      console.log('Upload successful:', response.data);
      await fetchTutorials()
    } catch (error) {
      setUploadStatus('Upload failed.');
    }
  };

  const handleVideoUpload = async () => {
    if (!selectedVideoFile) {
      setVideoErrorMessage('No file selected.');
      return;
    }

    setUploadVideoStatus('Uploading...');
    setVideoErrorMessage('');

    const formData = new FormData();
    formData.append('video', selectedVideoFile);

    try {
      const response = await api.post('/uploadVideo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        params: {uploader: uploader},
      });

      setUploadVideoStatus('Upload successful!');
      console.log('Upload successful:', response.data);
      await fetchTutorials()
    } catch (error) {
      setUploadVideoStatus('Upload failed.');
    }
  };

  const fetchTutorials = async() => {
        console.log(uploader)
        const params = new URLSearchParams([['uploader', uploader]]);
        const response = await api.get('/tutorials', {params});
        setTutorials(response.data.tutorials);
        console.log(response.data.tutorials);
  }

  useEffect(() => {
    fetchTutorials()
  }, []);

  return (
      <div className="rounded-xl flex flex-col items-center p-4 min-h-screen bg-purple-100 font-sans w-fit">
        <div className="flex flex-col md:flex-row items-start justify-center gap-8 w-full max-w-7xl mt-10 mb-8">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-7xl border border-gray-200 mt-10 mb-8"> {/* Added mb-8 for spacing */}
        <div className="mb-6">
          <label htmlFor="json-upload" className="block text-sm font-medium text-gray-700 mb-2">
            Select transcript file:
          </label>
          <input
            id="json-upload"
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-md file:border-0
                       file:text-sm file:font-semibold
                       file:bg-blue-50 file:text-blue-700
                       hover:file:bg-blue-100"
          />
        </div>

        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploadStatus === 'Uploading...'}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-bold text-white
                     bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                     disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
        >
          {uploadStatus === 'Uploading...' ? 'Uploading...' : 'Upload JSON'}
        </button>

        {uploadStatus && (
          <p className={`mt-4 text-center font-medium ${uploadStatus.includes('successful') ? 'text-green-600' : 'text-blue-600'}`}>
            {uploadStatus}
          </p>
        )}
        {errorMessage && (
          <p className="mt-4 text-center font-medium text-red-600">
            {errorMessage}
          </p>
        )}
      </div>
        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 mt-10 mb-8"> {/* Added mb-8 for spacing */}
        <div className="mb-6">
          <label htmlFor="json-upload" className="block text-sm font-medium text-gray-700 mb-2">
            Select video file:
          </label>
          <input
            id="mp4-upload"
            type="file"
            accept=".mp4"
            onChange={handleVideoFileChange}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-md file:border-0
                       file:text-sm file:font-semibold
                       file:bg-blue-50 file:text-blue-700
                       hover:file:bg-blue-100"
          />
        </div>

        <button
          onClick={handleVideoUpload}
          disabled={!selectedVideoFile || uploadVideoStatus === 'Uploading...'}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-bold text-white
                     bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                     disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
        >
          {uploadVideoStatus === 'Uploading...' ? 'Uploading...' : 'Upload MP4'}
        </button>

        {uploadVideoStatus && (
          <p className={`mt-4 text-center font-medium ${uploadVideoStatus.includes('successful') ? 'text-green-600' : 'text-blue-600'}`}>
            {uploadVideoStatus}
          </p>
        )}
        {videoErrorMessage && (
          <p className="mt-4 text-center font-medium text-red-600">
            {videoErrorMessage}
          </p>
        )}
      </div>
        </div>
      { uploader && (
        <TutorialsTable tutorials={tutorials}/>
      )}
    </div>
  );
};

export default TutorialGenerator;
