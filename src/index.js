const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generateMeassage,
  generateLocationMessage,
} = require("./utils/messages");
const {
  addUser,
  getUser,
  removeUser,
  getUsersInRoom,
} = require("./utils/users");

const app = express();
const server = http.createServer(app); //creating a server however express do this behind the scene.
const io = socketio(server); // creating instance of socket.io

const port = process.env.PORT || 3000;

const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

// server (emit) -> client (receive) - countUpdated
// client (emit) -> server (receive) - increment

//socket.emit --> sends an event to a specific client.
//io.emit -->sends an event to every connected client.
//socket.broadcast.emit --> sends an event to everyone connected exept for the  user who sent the event
//io.to.emit --> it emits an event to everybody in a specific room
// socket.broadcast.to.emit--> it sends an event to everyone connected in a specific room  exept for the  user who sent the event

//this runs when a new user joins the chat
io.on("connection", (socket) => {
  console.log("New Websocket Connection");

  socket.on("join", (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    //sending to client
    socket.emit("message", generateMeassage('Admin',"Welcome!"));
    //socket.broadcast.emit is used to display the content to all the connected user except for the user who sent it
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMeassage( 'Admin',`${user.username} has joined the chat!`)
      );
      io.to(user.room).emit('roomData',{
          room:user.room,
          users: getUsersInRoom(user.room)
      })

    callback();
  });

  //receiving data from client
  socket.on("sendMessage", (message, callback) => {
    const filter = new Filter();

    const user = getUser(socket.id);
    //checking if any user has send bad-words
    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed");
    }

    // io.emit is used to display the content to all the connected user
    io.to(user.room).emit("message", generateMeassage(user.username,message));
    callback(); //for acknowledgement
  });

  socket.on("sendLocation", (location, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(
        user.username,
        `https://google.com/maps?q=${location.latitude},${location.longitude}`
      )
    );
    callback();
  });

  //this runs when a user leaves the chat
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        generateMeassage('Admin',`${user.username} has left the chat!`)
      );
      io.to(user.room).emit('roomData',{
          room:user.room,
          users: getUsersInRoom(user.room)
      })
    }
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
