const mongoose = require("mongoose");
const config = require("config");
const auth = require("./routes/auth");
const accessControls = require("./middleware/accessControls");
const Tutors = require("./routes/Tutors");
const Institutes = require("./routes/Institutes");
const Areas = require("./routes/Areas");
const Coordinators = require("./routes/Coordinators");
const Admins = require("./routes/Admins");
const AcademicDetails = require("./routes/AcademicDetails");
const Reports = require("./routes/Reports");
const Relations = require("./routes/Relations");
const Trainees = require("./routes/Trainees");
// const customers = require('./routes/customers');
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const socketIO = require("socket.io");
const io = socketIO(server);

//--------------------------- Chat ------------------------------------------//

io.sockets.on("connection", socket => {
  // just like on the client side, we have a socket.on method that takes a callback function
  console.log("connected", socket.id);
  socket.on("message", message => {
    // once we get a 'change color' event from one of our clients, we will send it to the rest of the clients
    // we make use of the socket.emit method again with the argument given to use from the callback function above
    console.log("message: ", message);
    io.sockets.emit("message", message);
  });

  // disconnect is fired when a client leaves the server
  socket.on("disconnect", () => {});
});

//--------------------------------------------------------------------------------------//

if (!config.get("jwtPrivateKey")) {
  console.error("FATAL ERROR: jwtPrivateKey is not defined");
  process.exit(1);
}

const mongoHost = process.env.MONGO_HOST || "localhost";
const mongoPort = process.env.MONGO_PORT || "27017";
//const urlDB = `mongodb://admin:admin@${mongoHost}:${mongoPort}/beliba_homa?retryWrites=true&authSource=admin`;
const urlDB = `mongodb://${mongoHost}:${mongoPort}/beliba_homa`;

mongoose
  .connect(urlDB)
  .then(() => console.log("Connected to MongoDB..."))
  .catch(err => console.error("Could not connect to MongoDB...", err));

app.use(express.json());
app.use(accessControls);
app.use("/api/tutors", Tutors);
app.use("/api/coordinators", Coordinators);
app.use("/api/admins", Admins);
app.use("/api/academicDetails", AcademicDetails);
app.use("/api/reports", Reports);
app.use("/api/trainees", Trainees);
app.use("/api/institutes", Institutes);
app.use("/api/relations", Relations);
app.use("/api/areas", Areas);
app.use("/api/auth", auth);
// app.use('/api/customers', customers);

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on port ${port}...`));

server.listen(4001, () => {
  console.log("Listening to chat on port 4001");
});
