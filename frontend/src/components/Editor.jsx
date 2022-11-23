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

const [theme, setTheme] = useState("dracula")

const handleChange = (editor, data, value) => {
setEditorState(value);
console.log(value)

const code = value
onCodeChange(value)

socketRef.current.emit("CODE_CHANGE", {
    roomId,
    code,
});

}

const themeArray = ['dracula', 'monokai', 'mdn-like', 'the-matrix', 'night']




const onChange  = (editor, data, value) => {

// onCodeChange(value)

// socketRef.current.emit("CODE_CHANGE", {
//     roomId,
//     value,
// });

}



    const editorRef = useRef(null);

    useEffect(() => {

        async function init() {
            
            // editorRef.current = CodeMirror.fromTextArea(
            //     document.getElementById('realtimeEditor'),
            //     {
            //         mode: { name: 'javascript', json: true },
            //         theme: 'dracula',
            //         autoCloseTags: true,
            //         autoCloseBrackets: true,
            //         lineNumbers: true,
            //     }
            // );

            editorRef.current.on('change', (instance, changes) => {
                const { origin } = changes;
                const code = instance.getValue();
                onCodeChange(code);

                if (origin !== 'setValue') {
                    socketRef.current.emit("CODE_CHANGE", {
                        roomId,
                        code,
                    });
                }
            });
        }

        init();

    }, []);



    useEffect(() => {
        if (socketRef.current) {
            socketRef.current.on("CODE_CHANGE", ({ code }) => {
                if (code !== null) {
                    editorRef.current.setValue(code);
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

        value= {value}
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
        onChange={onChange}
    />
</div>
)
}

export default Editor
