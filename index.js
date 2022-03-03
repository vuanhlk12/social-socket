const dotenv = require("dotenv");

dotenv.config();

const io = require("socket.io")(process.env.PORT, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://social-fe.vercel.app",
      "https://social-fe-vuanhlk12.vercel.app",
    ],
  },
});

let users = [];

const addUser = (userId, socketId) => {
  console.log("addUser", userId);
  !users.some((user) => user?.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  console.log("removeUser", socketId);
  users = users.filter((user) => user?.socketId !== socketId);
};

const getUser = (userId) => {
  console.log("getUser", userId);
  return users.find((user) => user?.userId === userId);
};

io.on("connection", (socket) => {
  //when ceonnect
  console.log("a user connected. ", socket.id, "port", process.env.PORT);

  //take userId and socketId from user
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });

  //send and get message
  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    const user = getUser(receiverId);
    io.to(user?.socketId).emit("getMessage", {
      senderId,
      text,
    });
  });

  //when disconnect
  socket.on("disconnect", () => {
    console.log("a user disconnected!");
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});
