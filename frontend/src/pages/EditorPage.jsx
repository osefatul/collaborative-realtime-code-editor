import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import ACTIONS from '../Actions';
import Client from '../components/Client';
import EditorCom from '../components/EditorCom';
import { initSocket } from '../socket';
import {
    useLocation,
    useNavigate,
    Navigate,
    useParams,
} from 'react-router-dom';





const EditorPage = () => {


    // We use useRef hook to persist values between renders
    const socketRef = useRef(null);
    const codeRef = useRef(null);

    const location = useLocation();
    
    const { roomId } = useParams();
    const reactNavigator = useNavigate();
    const [clients, setClients] = useState([]);

    console.log(roomId, location.state.username)



    useEffect(() => {

        const init = async ()=> {
            socketRef.current = await initSocket()
            // console.log(socketRef)

            // Error handling
            socketRef.current.on('connect_error', (err) => handleErrors(err));
            socketRef.current.on('connect_failed', (err) => handleErrors(err));
            function handleErrors(e) {
                console.log('socket error', e);
                toast.error('Socket connection failed, try again later.');
                reactNavigator('/');
            }

            // Send roomId and user to server
            socketRef.current.emit("JOIN", {
                roomId,
                username: location.state?.username,
            });
        }

        init()

    }, []);


    if (!location.state) {
        return <Navigate to="/" />;
    }

    return (
        <div className="mainWrap">

            <div className="aside">
                <div className="asideInner">
                    <div className="logo">
                        <img
                            className="logoImage"
                            src="/code-sync.png"
                            alt="logo"
                        />
                    </div>
                    <h3>Connected</h3>
                    <div className="clientsList">
                        {clients.map((client) => (
                            <Client
                                key={client.socketId}
                                username={client.username}
                            />
                        ))}
                    </div>
                </div>
                <button className="btn copyBtn" 
                // onClick={copyRoomId}
                >
                    Copy ROOM ID
                </button>
                <button className="btn leaveBtn" 
                // onClick={leaveRoom}
                >
                    Leave
                </button>
            </div>


            <div className="editorWrap">
                <EditorCom
                    socketRef={socketRef}
                    roomId={roomId}
                    onCodeChange={(code) => {
                        codeRef.current = code;
                    }}
                />
            </div>
        </div>
    );
};

export default EditorPage;