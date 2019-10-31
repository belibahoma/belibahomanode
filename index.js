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

if (!config.get("jwtPrivateKey")) {
  console.error("FATAL ERROR: jwtPrivateKey is not defined");
  process.exit(1);
}

const mongoHost = process.env.MONGO_HOST || "localhost";
const mongoPort = process.env.MONGO_PORT || "27017";
// const urlDB = `mongodb://admin:admin@${mongoHost}:${mongoPort}/beliba_homa?retryWrites=true&authSource=admin`;
// const urlDB =
//   config.get("mongoAddress") ||
//   `mongodb://${mongoHost}:${mongoPort}/beliba_homa`;
const urlDB = `mongodb://${mongoHost}:${mongoPort}/test`;
console.log("host is " + mongoHost + " and port is  " + mongoPort);

console.log(urlDB);

mongoose
  .connect(urlDB,  { useUnifiedTopology: true, useNewUrlParser: true })
  .then(() => console.log("Connected to MongoDB..."))
  .catch(err => console.error("Could not connect to MongoDB...", err));
mongoose.set('useCreateIndex', true);

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
require("./utils/prod")(app);
// app.use('/api/customers', customers);

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on port ${port}...`));
