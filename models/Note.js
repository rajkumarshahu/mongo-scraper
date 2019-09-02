var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new NoteSchema object
var NoteSchema = new Schema({
  _article: {
    type: String,
    ref: "Article",
  },
  text: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Export the Note model
module.exports = mongoose.model("Note", NoteSchema);
