var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new UserSchema object
var ArticleSchema = new Schema({
  title: {
    type: String,
    trim: true,
    required: true
  },
  link: {
    type: String,
    required: true,
    unique:true
  },
  snippet:{
      type: String,
      trim: true
  },
  imageUrl:{
    type: String
},
  timestamp: {
    type: Date,
    default: Date.now
},


  // `note` is an object that stores a Note id
  // The ref property links the ObjectId to the Note model
  // This allows us to populate the Article with an associated Note
  note: {
    type: Schema.Types.ObjectId,
    ref: "Note"
  }
});

// Export the Article model
module.exports = mongoose.model('Article', ArticleSchema);