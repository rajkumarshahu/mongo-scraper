// *********************************************************************************
// api-routes.js - this file offers a set of routes for displaying and saving data to the db
// *********************************************************************************

// Dependencies
// =============================================================
var axios = require("axios");
var cheerio = require("cheerio");
// Requiring our models
var db = require("../models");

var getAllLinks = function(article) {
  return article.link;
}

// Routes
// =============================================================
module.exports = function(app) {
  app.get("/", function(req, res) {
    db.Article.find({}, null, { sort: { created: -1 } }, function(err, data) {
      console.log(data);
      if (data.length === 0) {
        res.render("message", {
          message:
            "No articles saved. Please click Scrape it button to get news from BBC.",
        });
      } else {
        res.render("index", { articles: data });
      }
    });
  });

  app.get("/note", function(req, res) {
    db.Note.find({}, null, function(err, data) {
      console.log(data)
      if (data.length === 0) {
        res.render("notemessage", {
          noteMessage:
            "No notes saved. Please click add note  button.",
        });
      } else {
        res.render("articles", { notes: data });
      }
    });
  });
  // scrapped page is index
  app.get("/index", function(req, res) {
    var storeArr = [];

    var article_links = [];

    db.Article.find({}, null, function(err, articles) {
      article_links = articles.map(getAllLinks);

      // First, we grab the body of the html with axios
      axios.get("https://www.aljazeera.com/topics/country/canada.html").then(function(response) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(response.data);

        $("div.row.topics-sec-item.default-style").each(function(i, element) {
          if(i >= 10){
            return false;
          }

          var result = {};
          result.id = i + 1;
          result.title = $(this).children('div.topics-sec-item-cont').children('a').children('h2').text();
          result.link = $(this).children('div.topics-sec-item-cont').children('a').attr('href');
          result.snippet = $(this).children('div.topics-sec-item-cont').children('p.topics-sec-item-p').text();
          result.imageUrl = $(this).children('div.topics-sec-item-img').children('a').children('img.img-responsive').attr('src');

          if(!article_links.includes(result.link)) {
            storeArr.push(result);
          }
        });
        res.render("index", { articles: storeArr });
      });


    });
  });

  // This is the route used to save an article
  app.post("/articles", function(req, res) {

    // Load the req.body into a variable for ease of use
    var savedArticle = req.body;
    console.log(savedArticle)
    // Create the new article document
    db.Article.create(savedArticle, function(err, doc) {
      if (err) {
        // If there is an error or the entry already exists
        // log the error in the console and redirect to index
        console.log(err);
        res.redirect("/index");
      } else {
        // redirect to index
        res.redirect("/index");
      }
    });
  });

  // Route for getting all Articles from the db
  app.get("/articles", function(req, res) {
    // Grab every document in the Articles collection
    db.Article.find({})
      .populate("note")
      // Execute the callback
      .exec(function(err, articles) {
        if (err) {
          // If error send error
          res.send(err);
        } else {
          // Save each article document into an array
          var allSavedArticles = articles.map(function(article) {
            return article;
          });
          // Render the array in the articles route for handlebars
          res.render("articles", { articles: allSavedArticles });
        }
      });
  });

  // Route for grabbing a specific Article by id, populate it with it's note
  app.get("/articles/:id", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.findOne({ _id: req.params.id })
      // ..and populate all of the notes associated with it
      .populate("note")
      .then(function(dbArticle) {
        // If we were able to successfully find an Article with the given id, send it back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

  // Route for saving/updating an Article's associated Note
  app.post("/articles/:id", function(req, res) {
    console.log("Req",req.body)
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
      .then(function(dbNote) {
        // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
        // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
        // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
        return db.Article.findOneAndUpdate(
          { _id: req.params.id },
          { note: dbNote._id },
          { new: true }
        );
      })
      .then(function(dbArticle) {
        // If we were able to successfully update an Article, send it back to the client

        res.render("articles", { notes: dbArticle });
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

  // Route for saving a new Note to the db and associating it with a article
  app.post("/submit", function(req, res) {
    // Create a new Note in the db
    db.Note.create(req.body)
      .then(function(dbNote) {
        // If a Note was created successfully, find one User (there's only one) and push the new Note's _id to the User's `notes` array
        // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
        // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
        return db.Article.findOneAndUpdate(
          {},
          { $push: { notes: dbNote._id } },
          { new: true }
        );
      })
      .then(function(dbArticle) {
        // If the User was updated successfully, send it back to the client
        res.redirect("/articles");
      })
      .catch(function(err) {
        // If an error occurs, send it back to the client
        res.json(err);
      });
  });

  app.get("/delete", function(req, res) {
    db.Article.deleteMany()
      .then(function() {
        res.redirect("/");
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

  // Route to delete a note
  app.delete("/note", function(req, res) {
    // Load the req.body.id into a variable for ease of use
    var noteId = req.body.id;
    // Remove the appropriate note
    db.Note.remove({ _id: noteId }, function(err, note) {
      if (err) {
        // If error, send error
        res.send(err);
      } else {
        // Redirect to saved articles
        res.redirect("/articles");
      }
    });
  });
};
