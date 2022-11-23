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
import Button from '../components/Button';
import Editor from '../components/Editor';




const NewEditorPage = () => {

    const [openedEditor, setOpenedEditor] = useState("html");
    const [activeButton, setActiveButton] = useState("html");

    const [html, setHtml] = useState("");
    const [css, setCss] = useState("");
    const [js, setJs] = useState("");
    const [srcDoc, setSrcDoc] = useState(``);

    const onTabClick = (editorName) => {
        setOpenedEditor(editorName);
        setActiveButton(editorName);
    };

        useEffect(() => {
        const timeOut = setTimeout(() => {
            setSrcDoc(
            `
                <html>
                <body>${html}</body>
                <style>${css}</style>
                <script>${js}</script>
                </html>
            `
            )
        }, 250);

        return () => clearTimeout(timeOut)
    }, [html, css, js])

    // We use useRef hook to persist values between renders
    const socketRef = useRef(null);
    const codeRef = useRef(null);

    const location = useLocation();
    
    const { roomId } = useParams();
    const reactNavigator = useNavigate();
    const [clients, setClients] = useState([]);

    // console.log(roomId, location.state.username)



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



            // Listening for joined event
            socketRef.current.on(
                "JOINED",
                ({ clients, username, socketId }) => {
                    if (username !== location.state?.username) {
                        toast.success(`${username} joined the room.`);
                        console.log(`${username} joined`);
                    }
                    setClients(clients);
                    
                    socketRef.current.emit("SYNC_CODE", {
                        code: codeRef.current,
                        socketId,
                    });
                }
            );



            
            // Listening for disconnected
            socketRef.current.on(
                "DISCONNECTED",
                ({ socketId, username }) => {
                    toast.success(`${username} left the room.`);
                    setClients((prev) => {
                        return prev.filter(
                            (client) => client.socketId !== socketId
                        );
                    });
                }
            );
        }

        init()

        return () => {
            socketRef.current.disconnect();
            socketRef.current.off("JOINED");
            socketRef.current.off("DISCONNECTED");
        };

    }, []);


    async function copyRoomId() {
        try {
            await navigator.clipboard.writeText(roomId);
            toast.success('Room ID has been copied to your clipboard');
        } catch (err) {
            toast.error('Could not copy the Room ID');
            console.error(err);
        }
    }


    function leaveRoom() {
        reactNavigator('/');
    }


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
                    <h3 style = {{padding:"20px 0"}}>Online</h3>
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
                onClick={copyRoomId}
                >
                    Copy ROOM ID
                </button>
                <button className="btn leaveBtn" 
                onClick={leaveRoom}
                >
                    Leave
                </button>
            </div>


            <div className='colsWrapper'>

                <div className="editorWrap">

                    <div className='topWrapEditor'>
                        <div className='buttons'>
                            <Button
                            backgroundColor={activeButton === "html" ? "green" : ""}
                            title="HTML"
                            onClick={() => {
                                onTabClick("html");
                            }}
                            />
                            <Button
                            backgroundColor={activeButton === "css" ? "green" : ""}
                            title="CSS"
                            onClick={() => {
                                onTabClick("css");
                            }}
                            />
                            <Button
                            backgroundColor={activeButton === "js" ? "green" : ""}
                            title="JavaScript"
                            onClick={() => {
                                onTabClick("js");
                            }}
                            />
                        </div>

                        <div className='editors'>
                            {
                                openedEditor === "html" ? (
                                    <Editor
                                    language="xml"
                                    displayName="HTML"
                                    value={html}
                                    setEditorState={setHtml}
                                    socketRef={socketRef}
                                    roomId={roomId}
                                    onCodeChange={(code) => {
                                        codeRef.current = code;
                                    }}/>
                                ): openedEditor === "css" ? (
                                    <Editor
                                    language="css"
                                    displayName="CSS"
                                    value={css}
                                    setEditorState={setCss}
                                    socketRef={socketRef}
                                    roomId={roomId}
                                    onCodeChange={(code) => {
                                        codeRef.current = code;
                                    }}/>
                                    ) : (
                                    <Editor
                                    language="javascript"
                                    displayName="JS"
                                    value={js}
                                    setEditorState={setJs}
                                    socketRef={socketRef}
                                    roomId={roomId}
                                    onCodeChange={(code) => {
                                        codeRef.current = code;
                                    }}/>
                            )}
                            
                        </div>
                    </div>

                </div>

                <div className='iframe'>
                        <iframe
                            id="my_iframe"
                            srcDoc={srcDoc}
                            title="output"
                            sandbox="allow-scripts"
                            frameBorder="1"
                            width="100%"
                            height="100%"
                        />
                </div>
            </div>

        </div>
    );
};

export default NewEditorPage;



// const NewEditorPage = () => {
//     const [openedEditor, setOpenedEditor] = useState("html");
//     const [activeButton, setActiveButton] = useState("html");

//     const [html, setHtml] = useState('');
//     const [css, setCss] = useState('');
//     const [js, setJs] = useState('');
//     const [srcDoc, setSrcDoc] = useState(``);

//     const onTabClick = (editorName) => {
//         console.log(editorName)
//         console.log(activeButton)
//         setOpenedEditor(editorName);
//         setActiveButton(editorName);
//     };

//     useEffect(() => {
//         const timeOut = setTimeout(() => {
//             setSrcDoc(
//             `
//                 <html>
//                 <body>${html}</body>
//                 <style>${css}</style>
//                 <script>${js}</script>
//                 </html>
//             `
//             )
//         }, 250);

//         return () => clearTimeout(timeOut)
//     }, [html, css, js])

    

//     return (
//         <div className="App">
//         <p>Welcome to the Editor</p>

//         <div className="tab-button-container">
//             <Button
//             backgroundColor={activeButton === "html" ? "blue" : ""}
//             title="HTML"
//             onClick={() => {
//                 onTabClick("html");
//             }}
//             />
//             <Button
//             backgroundColor={activeButton === "css" ? "blue" : ""}
//             title="CSS"
//             onClick={() => {
//                 onTabClick("css");
//             }}
//             />
//             <Button
//             backgroundColor={activeButton === "js" ? "blue" : ""}
//             title="JavaScript"
//             onClick={() => {
//                 onTabClick("js");
//             }}
//             />
//         </div>
//         <div className="editor-container">
//             {openedEditor === "html" ? (
//             <Editor
//                 language="xml"
//                 displayName="HTML"
//                 value={html}
//                 setEditorState={setHtml}
//             />
//             ) : openedEditor === "css" ? (
//             <Editor
//                 language="css"
//                 displayName="CSS"
//                 value={css}
//                 setEditorState={setCss}
//             />
//             ) : (
//             <Editor
//                 language="javascript"
//                 displayName="JS"
//                 value={js}
//                 setEditorState={setJs}
//             />
//             )}
//         </div>

//         <div>
//             <iframe
//             id="my_iframe"
//             srcDoc={srcDoc}
//             title="output"
//             sandbox="allow-scripts"
//             frameBorder="1"
//             width="100%"
//             height="100%"
//             />
//         </div>
//         </div>
//     );
// }


// export default NewEditorPage;