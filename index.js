const express = require("express");
const app = express();
const http = require("http");
const servidor = http.createServer(app);
require('dotenv').config();
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


io.on("connection", (socket) => {
    //al conectarse un usuario
    console.log("a user connected.", socket.id);

    //añadir nuevo usuario al array
    socket.on("connected", (name) => {
        addUser(name, socket.id);
        io.emit("getUsers", users);
    });

    //recibir y enviar mensajes
    socket.on("message", (name, message) => {
        //mandar el mensaje a todos los usuarios conectados al chat
        io.emit("messages", { name, message, messageDate: moment.tz('America/Caracas').format('h:mm a'), senderId: socket.id });
    });


    //al desconectarse un usuario
    socket.on("disconnect", () => {
        removeUser(socket.id);
        io.emit("getUsers", users);
    });
});

servidor.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));