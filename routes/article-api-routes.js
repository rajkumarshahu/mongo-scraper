// *********************************************************************************
// api-routes.js - this file offers a set of routes for displaying and saving data to the db
// *********************************************************************************

// Dependencies
// =============================================================
var axios = require("axios");
var cheerio = require("cheerio");
// Requiring our models
var db = require("../models");

// Routes
// =============================================================
module.exports = function(app) {
  app.get("/", function(req, res) {
    res.render("home");
  });

  // A GET route for scraping the echoJS website
  app.get("/scrape", function(req, res) {
    var storeArr = [];
    // First, we grab the body of the html with axios
  axios.get("https://www.bbc.com/news/world/us_and_canada").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $(".gs-c-promo-body").each(function(i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .find('div > a > h3')
        .text();
      result.link = $(this)
        .find("div > a")
        .attr("href");

        // Push new article object to storeArr
        storeArr.push(result);
      });
      res.render("index", { articles: storeArr });
    });
  });

  // This is the route used to save an article
  app.post("/articles", function(req, res) {
    // Load the req.body into a variable for ease of use
    var savedArticle = req.body;
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
      .then(function(dbArticle) {
        // If we were able to successfully find Articles, send them back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
    res.render("articles", { articles: dbArticle });
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
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

  // Route to post note
  app.post("/note", function(req, res) {
    // Load the req.body into a variable for ease of use
    var comment = req.body;
    // Find the appropriate article document
    db.Article.findOne(
      {
        title: note.title,
      },
      function(err, article) {
        // Create new comment document
        db.Note.create(
          {
            _article: article._id,
            text: note.text,
          },
          function(err, doc) {
            // Push comment doc to article
            article.note.push(doc);
            // Save the article doc
            article.save(function(err) {
              if (err) {
                // If error, send error
                res.send(err);
              } else {
                // Redirect to saved articles
                res.redirect("/articles");
              }
            });
          }
        );
      }
    );
  });
};
