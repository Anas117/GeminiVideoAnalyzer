import React, {use, useEffect, useState} from 'react';
import api from "../api.js";
import TutorialGenerator from "./TutorialGenerator.jsx";

const User = ({ accessToken }) => {
  const [userData, setUserData] = useState({});

   useEffect(() => {
    getUserInfo();
  }, []);

   async function getUserInfo() {
        const response = await api.get("/getUserInfo", {params: {access_token: accessToken}});
        setUserData(response.data);
    }

  return (
      <>
          <div className="absolute top-4 left-4 flex items-center space-x-4 p-2 rounded-lg bg-white bg-opacity-100 shadow-md z-10">
        <img width="70px" height="70px" src={userData.avatar_url} className="rounded-full border border-gray-300" />
        <h4 className="text-gray-800 text-lg font-semibold">Logged in as {userData.login}</h4>
      </div>
          {userData.login && (
              <TutorialGenerator uploader={userData.login}/>
          )}
      </>
  );
};

export default User;