import React, { useState, useEffect, useRef } from 'react';
import api from "../api.js";

const timeStringToSeconds = (timeStr) => {
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 3) { // HH:MM:SS
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    if (parts.length === 2) { // MM:SS
        return parts[0] * 60 + parts[1];
    }
    return 0; // Invalid format
};

const parseTimestampRanges = (rangesStr) => {
    if (!rangesStr) return [];
    try {
        return rangesStr.split('|').map((range, index) => {
            const [startStr, endStr] = range.split('-');
            if (!startStr || !endStr) return null;

            return {
                id: `clip-${index}`,
                name: `Step ${index + 1}`,
                start: timeStringToSeconds(startStr.trim()),
                end: timeStringToSeconds(endStr.trim()),
                originalRange: range,
            };
        }).filter(Boolean);
    } catch (error) {
        console.error("Error parsing timestamp ranges:", error);
        return [];
    }
};

const VideoTutorial = ({ videoName, timestampRanges }) => {

    const [videoFile, setVideoFile] = useState(null);
    const videoRef = useRef(null);
    const [clips, setClips] = useState([]);
    const [activeClip, setActiveClip] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchVideo = async () => {
      try {
        setLoading(true);
        let objectUrl;

        const params = new URLSearchParams([['video_name', videoName]]);
        const response = await api.get('/getVideo', {
            params: params,
            responseType: 'blob'
        });
        console.log(response);
        objectUrl = URL.createObjectURL(response.data);
        setVideoFile(objectUrl);

      } catch (error) {
        console.error("Failed to fetch video using axios:", error);
      } finally {
        setLoading(false);
      }
    };

    /*const fetchVideo = async() => {
        const params = new URLSearchParams([['video_name', videoName]]);
        const response = await api.get('/getVideo', {params});
        console.log(response.data);
        setVideoFile(response.data);
    }*/

    useEffect(() => {
        fetchVideo()
    }, []);

    useEffect(() => {
        const parsedClips = parseTimestampRanges(timestampRanges);
        setClips(parsedClips);
    }, [timestampRanges]);

    const handlePlayClip = (clip) => {
        if (videoRef.current) {
            videoRef.current.currentTime = clip.start;
            videoRef.current.play();
            setActiveClip(clip);
        }
    };

    const handleTimeUpdate = () => {
        if (activeClip && videoRef.current && videoRef.current.currentTime >= activeClip.end) {
            videoRef.current.pause();
            setActiveClip(null);
        }
    };

    if (loading) {
        return (
        <div className="flex items-center justify-center bg-gray-100 font-inter">
            <p className="text-xl text-gray-700">Loading video...</p>
        </div>
        );
    }

    return (
        <div className="bg-gray-900 text-white p-4 sm:p-6 lg:p-8 font-sans w-full max-w-4xl mx-auto rounded-xl shadow-2xl w-full">
            <p className="text-sm text-gray-400 mb-6">Click on a clip below to play a specific segment.</p>
                <div className="lg:col-span-2 bg-black rounded-lg overflow-hidden">
                    <video
                        ref={videoRef}
                        src={videoFile}
                        width="100%"
                        onTimeUpdate={handleTimeUpdate}
                        className="w-full h-full object-cover"
                    >
                        Your browser does not support the video tag.
                    </video>
                </div>

                <div className="lg:col-span-1">
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                        {clips.length > 0 ? (
                            clips.map((clip) => (
                                <button
                                    key={clip.id}
                                    onClick={() => handlePlayClip(clip)}
                                    className={`w-24 text-left p-3 rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 ${
                                        activeClip?.id === clip.id 
                                        ? 'bg-cyan-500 text-white shadow-lg' 
                                        : 'bg-gray-800 hover:bg-gray-700'
                                    }`}
                                >
                                    <p className="font-bold">{clip.name}</p>
                                    <p className="text-sm opacity-80">{clip.originalRange}</p>
                                </button>
                            ))
                        ) : (
                            <p className="text-gray-500 italic">No timestamp ranges provided.</p>
                        )}
                    </div>
            </div>
        </div>
    );
};

export default VideoTutorial;