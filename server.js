const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = process.env.PORT || 3000;

app.use(express.static("public")); // assuming index.html is in /public

const onlineUsers = {};

io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  socket.on("user_joined", (name) => {
    console.log(name);
    onlineUsers[socket.id] = name;
    console.log("User joined:", name);

    io.emit("user_joined_announcement", name);
    io.emit("update_user_list", Object.values(onlineUsers));
  });

  socket.on("send_message", (data) => {
    io.emit("receive_message", data);
  });

  socket.on("typing", () => {
    const name = onlineUsers[socket.id];
    if (name) {
      socket.broadcast.emit("user_typing", name);
    }
  });

  socket.on("stop_typing", () => {
    socket.broadcast.emit("user_stopped_typing");
  });

  socket.on("disconnect", () => {
    const name = onlineUsers[socket.id];
    console.log("User disconnected:", name);

    delete onlineUsers[socket.id];
    io.emit("update_user_list", Object.values(onlineUsers));
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on port ${port}`);
});
