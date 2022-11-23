import React, { useState } from 'react';
import { v4 as uuidV4 } from 'uuid';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {BsCodeSlash, BsCode} from "react-icons/bs"
const Home = () => {
    
    const navigate = useNavigate();
    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('');

    const createNewRoom = (e) => {
        e.preventDefault();
        const id = uuidV4();
        setRoomId(id);
        toast.success('Created a new room');
    };

    const joinRoom = () => {
        if (!roomId || !username) {
            toast.error('ROOM ID & username is required');
            return;
        }

        // Redirect
        navigate(`/editor/${roomId}`, {
            state: {
                username,
            },
        });
    };

    const handleInputEnter = (e) => {
        if (e.code === 'Enter') {
            joinRoom();
        }
    };

    return (
        <div className="homePageWrapper">

            <header className='codeLogo'>
                {/* < BsCode style={{fontSize:"50px"}} /> */}
                <img src="/code-sync.png"  alt="" />
                    <p className='bigWindow'>Best Collaborative Real-Time Editor</p>

                {/* < BsCodeSlash style={{fontSize:"50px"}} /> */}

            </header>

            <div className="formWrapper">
                {/* <h4 className="mainLabel">Paste invitation ROOM ID</h4> */}
                <div className="inputGroup">
                    <input
                        type="text"
                        className="inputBox"
                        placeholder="ROOM ID"
                        onChange={(e) => setRoomId(e.target.value)}
                        value={roomId}
                        onKeyUp={handleInputEnter}
                    />
                    <input
                        type="text"
                        className="inputBox"
                        placeholder="USERNAME"
                        onChange={(e) => setUsername(e.target.value)}
                        value={username}
                        onKeyUp={handleInputEnter}
                    />
                    <button className="btn joinBtn" onClick={joinRoom}>
                        Join
                    </button>
                    <p className="createInfo">
                        <span>
                        Don't have an invite? &nbsp;
                        </span>
                        
                        <a
                            onClick={createNewRoom}
                            href="#"
                            className="createNewBtn"
                        >
                            create new room
                        </a>
                    </p>
                </div>
            </div>

            <footer>
                <h4>
                    @2022, All rights reserved.
                </h4>
            </footer>
        </div>
    );
};

export default Home;