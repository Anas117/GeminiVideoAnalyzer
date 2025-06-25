import './App.css'
import Fruits from "./components/Fruits.jsx";
import User from "./components/User.jsx";
import {useEffect,useState} from "react";
import api from './api.js'
import JsonUploader from "./components/TutorialGenerator.jsx";


const CLIENT_ID = "Ov23li04NkEyAhZHooJo";

function App() {

    const [rerender, setRerender] = useState(false);

    useEffect(()=>{
        const url = window.location.search;
        const urlParams = new URLSearchParams(url);
        const code = urlParams.get("code");
        if(code && (localStorage.getItem("accessToken") === null )){
            async function getAccessToken() {
                const response = await api.get("/getAccessToken", {params: {code: code}});
                if(response.data.access_token){
                    localStorage.setItem("accessToken", response.data.access_token);
                    setRerender(!rerender);
                }
            }
            getAccessToken()
        }
    },[]);

    function loginWithGithub(){
        window.location.assign("https://github.com/login/oauth/authorize?client_id=" + CLIENT_ID);
    }

  return (
    <>
        {localStorage.getItem("accessToken") ?
        <>
             <div className="absolute top-4 right-4 flex items-center space-x-4 p-2 rounded-lg bg-white bg-opacity-100 shadow-md z-10">
            <button onClick={()=>{
                localStorage.removeItem("accessToken");
                setRerender(!rerender);
            }}>
                Logout
            </button>
            </div>
             <User accessToken={localStorage.getItem("accessToken")}/>
        </>
            :
        <>
            <button onClick={loginWithGithub}>
                Login with Github
            </button>
        </>
        }
    </>
  )
}

export default App
