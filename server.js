require('dotenv').config()
var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");



// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
 app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Make public a static folder
app.use(express.static("public"));

// Routes
// =============================================================
require("./routes/article-api-routes.js")(app);
require("./routes/note-api-routes.js")(app);
require("./routes/html-api-routes.js")(app);



// Connect to the Mongo DB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true }, ()=>{
  console.log("MongoDB connected...")
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
