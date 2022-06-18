const express = require("express");
const app = express();
const http = require("http");
const servidor = http.createServer(app);
const dotenv = require('dotenv').config();
const moment = require('moment');
require('moment-timezone');

//PORT
const PORT = process.env.PORT || 3000

//Iniciando socket.io
const Socketio = require("socket.io");
const io = Socketio(servidor, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

let users = [];

const addUser = (name, socketId) => {
    !users.some((user) => user.socketId === socketId) &&
        users.push({ name, socketId });
};

const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (name) => {
    return users.find((user) => user.name === name);
};

io.on("connection", (socket) => {
    //when ceonnect
    console.log("a user connected.", socket.id);

    //take name and socketId from user
    socket.on("connected", (name) => {
        addUser(name, socket.id);
        io.emit("getUsers", users);
    });

    //send and get message
    socket.on("message", (name, message) => {
        //io.emit manda el mensaje a todos los clientes conectados al chat
        io.emit("messages", { name, message, messageDate: moment.tz('America/Caracas').format('h:mm a'), senderId: socket.id });
    });


    //when disconnect
    socket.on("disconnect", () => {
        removeUser(socket.id);
        io.emit("getUsers", users);
        console.log("a user disconnected!", socket.id);
    });
});

servidor.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));