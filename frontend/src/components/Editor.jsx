import React, { useEffect, useRef, useState } from 'react';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/theme/material.css';

import 'codemirror/theme/mdn-like.css';
import 'codemirror/theme/the-matrix.css';
import 'codemirror/theme/night.css';

import 'codemirror/mode/xml/xml';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/css/css';

import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/edit/closetag';

import { Controlled as ControlledEditorComponent } from 'react-codemirror2';






const Editor = ({ language, value, setEditorState, socketRef, roomId, onCodeChange  }) => {


const editorRef = useRef(null);
const [theme, setTheme] = useState("dracula")
const [code, setCode] = useState("");


const handleChange = (editor, data, value, event) => {

    setEditorState(value);
    setCode(value)
    onCodeChange(value);

    async function init() {
        if(value)
        await socketRef.current.emit("CODE_CHANGE", {
            roomId,
            code,
        });
    }

    init();
}

const themeArray = ['dracula', 'monokai', 'mdn-like', 'the-matrix', 'night']







    useEffect(() => {

        async function init() {
            console.log(code)
            onCodeChange(editorRef.current.props.value);
            setCode(editorRef.current.props.value)

            if(editorRef.current.props.value)
            socketRef.current.emit("CODE_CHANGE", {
                roomId,
                code,
            });
        }

        init();

    }, [code]);



    useEffect(() => {

        if (socketRef.current) {
            socketRef.current.on("CODE_CHANGE", ({ serverCode }) => {
                console.log(serverCode)
                if (code !== undefined)  {
                    setCode(serverCode);
                    setEditorState(serverCode)
                }
            });
        }

        return () => {
            socketRef.current.off("CODE_CHANGE");
        };
    }, [socketRef.current]);

    





return (
<div className="editorContainer">
    <div className='themes'>
        <label for="cars">Choose a theme: </label> 
        <select name="theme" onChange={(el) => {
            setTheme(el.target.value)
        }}>
            {
            themeArray.map( theme => (
                <option option key={theme + 234} value={theme}>{theme}</option>
            ))
            }
        </select>
    </div>

    <ControlledEditorComponent
        onBeforeChange={handleChange}
        ref={editorRef}
        value= {code}
        className="code-mirror-wrapper"
        options={{
            lineWrapping: true,
            lint: true,
            mode: language,
            lineNumbers: true,
            theme: theme,
            autoCloseTags: true,
            autoCloseBrackets: true, 
        }}
        // onChange={onChange}
    />
</div>
)
}

export default Editor
