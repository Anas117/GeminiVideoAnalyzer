import React, {useEffect, useState} from 'react';
import api from "../api.js";
import VideoTutorial from "./VideoTutorial.jsx";

const TutorialsTable = ({tutorials}) => {

    const [editingTutorialId, setEditingTutorialId] = useState(null);
    const [currentEditContent, setCurrentEditContent] = useState("");

    const handleDownloadJson = (tutorial) => {

        const jsonString = JSON.stringify( tutorial.transcript, null);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        a.download = 'transcript';

        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleEditClick = (tutorial) => {
        setEditingTutorialId(tutorial.id);
        console.log(tutorial.content);
        setCurrentEditContent(tutorial.content);
    };

    const handleEditContentChange = (e) => {
        setCurrentEditContent(e.target.value);
    };

    const handleSaveEdit = async () => {
        try {
            const editingTutorial = tutorials.find(t=>t.id===editingTutorialId);
            editingTutorial.content=currentEditContent;
            await api.post('/editTutorial', editingTutorial);
        } catch (error) {
          console.error("Error editing tutorial", error);
        }
        setEditingTutorialId(null);
        setCurrentEditContent("");
    };

    const handleCancelEdit = () => {
        setEditingTutorialId(null);
        setCurrentEditContent("");
    };


   if (!tutorials || tutorials.length === 0) {
    return (
      <div className="w-full text-center text-gray-600 mt-8 p-4 bg-white rounded-lg shadow-xl border border-gray-200">
        No tutorials available. Upload a transcript or a video to see them here.
      </div>
    );
  }
  return (
    <div className="bg-white p-8 rounded-lg shadow-xl w-full border border-gray-200 mt-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">Generated Tutorials</h2>
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-3/5"
              >
                Tutorial Content
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/20"
              >
                Uploader
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/20"
              >
                Date & Time
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-3/5"
              >
                Transcript
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tutorials.map((tutorial) => (
              <tr key={tutorial.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 w-3/5">
                  {editingTutorialId === tutorial.id ? (
                    <textarea
                      value={currentEditContent}
                      onChange={handleEditContentChange}
                      rows="10"
                      className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm text-gray-900 mb-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <div className="text-sm text-gray-900 mb-1 whitespace-pre-wrap">
                      {tutorial.content}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 mt-2">
                    {editingTutorialId === tutorial.id ? (
                      <>
                        <button
                          onClick={handleSaveEdit}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-150 ease-in-out"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleEditClick(tutorial)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-purple-700 bg-purple-100 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-150 ease-in-out"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap w-1/10">
                    <div className="text-sm">
                    {tutorial.uploader && tutorial.uploader !== 'Anonymous' ? (
                      <a
                        href={`https://github.com/${tutorial.uploader}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {tutorial.uploader}
                      </a>
                    ) : (
                      <span className="text-gray-900">{tutorial.uploader}</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap w-1/10">
                  <div className="text-sm text-gray-900">{tutorial.timestamp}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium w-1/5">
                    {tutorial.video ? (
                    <VideoTutorial videoName={tutorial.video} timestampRanges={tutorial.clips}/>
                  ) : (
                    <button
                    onClick={() => handleDownloadJson(tutorial)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Download
                  </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TutorialsTable;
