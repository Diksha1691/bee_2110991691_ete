// Importing the express library to create a web server
const express = require("express");

// Importing the mongoose library for MongoDB object modeling
const mongoose = require("mongoose");

// Importing the dotenv library to load environment variables from a .env file
const dotenv = require("dotenv");

// Importing the cors library for handling Cross-Origin Resource Sharing
const cors = require("cors");

// Importing the path module for handling file paths
const path = require("path");

// Creating an express application
const app = express();

// Importing the authSocket and socketServer functions from a custom socketServer module
const { authSocket, socketServer } = require("./socketServer");

// Importing route handlers for various entities (posts, users, comments, messages)
const posts = require("./routes/posts");
const users = require("./routes/users");
const comments = require("./routes/comments");
const messages = require("./routes/messages");

// Importing the PostLike and Post models for MongoDB
const PostLike = require("./models/PostLike");
const Post = require("./models/Post");

// Loading environment variables from a .env file
dotenv.config();

// Creating an HTTP server using the express app
const httpServer = require("http").createServer(app);

// Creating a socket.io instance and configuring CORS for specific origins
const io = require("socket.io")(httpServer, {
  cors: {
    origin: ["http://localhost:3000", "https://post-it-heroku.herokuapp.com"],
  },
});

// Using the authSocket middleware and defining the socketServer logic for each connection
io.use(authSocket);
io.on("connection", (socket) => socketServer(socket));

// Connecting to MongoDB using the MONGO_URI from the environment variables
mongoose.connect(
  process.env.MONGO_URI,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log("MongoDB connected");
  }
);

// Listening on the specified port or defaulting to 4000
httpServer.listen(process.env.PORT || 4000, () => {
  console.log("Listening");
});

// Middleware to parse incoming JSON requests
app.use(express.json());

// Middleware to enable Cross-Origin Resource Sharing
app.use(cors());

// Routing for API endpoints related to posts, users, comments, and messages
app.use("/api/posts", posts);
app.use("/api/users", users);
app.use("/api/comments", comments);
app.use("/api/messages", messages);

// Serving static files (React build) in production and handling client-side routing
if (process.env.NODE_ENV == "production") {
  app.use(express.static(path.join(__dirname, "/client/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client/build", "index.html"));
  });
}
