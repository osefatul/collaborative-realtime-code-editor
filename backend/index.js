const { info } = require('console');
const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const ACTIONS = require("./Actions")

const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('build'));
app.use((req, res, next) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});


const userSocketMap = {};

function getAllConnectedClients(roomId) {
    // Map
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
        (socketId) => {
            return {
                socketId,
                username: userSocketMap[socketId],
            };
        }
    );
}

io.on('connection', (socket) => {
    console.log('socket connected', socket.id);


    // receive a message from the client - When joined
    socket.on("JOIN", ({ roomId, username }) => {

        // store new user socket id and username...
        userSocketMap[socket.id] = username;
        socket.join(roomId);

        // get all clients that already are in the room.
        const clients = getAllConnectedClients(roomId);
        console.log(clients)

        clients.forEach(({ socketId }) => {
            io.to(socketId).emit("JOINED", {
                clients,
                username,
                socketId: socket.id,
            });
        });
    });


    // receive a message from the client when code changed
    // socket.on("CODE_CHANGE", ({ roomId, code }) => {
    //     console.log("roomId:" + roomId, code);
    //     socket.in(roomId).emit("CODE_CHANGE", { serverCode:code});
    // });

    socket.on("XML_CODE_CHANGE", ({ roomId, code }) => {
        console.log("xml roomId:" + roomId, code);

        socket.in(roomId).emit("XML_CODE_CHANGE", { xml:code});
    });

    socket.on("CSS_CODE_CHANGE", ({ roomId, code }) => {
        console.log("css roomId:" + roomId, code);

        socket.in(roomId).emit("CSS_CODE_CHANGE", { css:code});
    });

    socket.on("JS_CODE_CHANGE", ({ roomId, code }) => {
        console.log("js roomId:" + roomId, code);

        socket.in(roomId).emit("JS_CODE_CHANGE", { js:code});
    });





    // receive a message from the client code synced.

    // socket.on("SYNC_CODE", ({ socketId, code }) => {
    //     console.log("sync code:" + code);
    //     io.to(socketId).emit("CODE_CHANGE", { code });
    // });

    socket.on("XML_SYNC_CODE", ({ socketId, code }) => {
        console.log("xml sync code:" + code);
        io.to(socketId).emit("XML_CODE_CHANGE", { code });
    });

    socket.on("CSS_SYNC_CODE", ({ socketId, code }) => {
        console.log("css sync code:" + code);
        io.to(socketId).emit("CSS_CODE_CHANGE", { code });
    });

    socket.on("JS_SYNC_CODE", ({ socketId, code }) => {
        console.log("js sync code:" + code);
        io.to(socketId).emit("JS_CODE_CHANGE", { code });
    });





    // receive a message from the client when leave.
    socket.on('disconnecting', () => {
        const rooms = [...socket.rooms];
        rooms.forEach((roomId) => {
            socket.in(roomId).emit("DISCONNECTED", {
                socketId: socket.id,
                username: userSocketMap[socket.id],
            });
        });
        delete userSocketMap[socket.id];
        socket.leave();
    });
});




const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));