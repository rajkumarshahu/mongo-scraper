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
};

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
      console.log(data);
      if (data.length === 0) {
        res.render("notemessage", {
          noteMessage: "No notes saved. Please click add note  button.",
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
      axios
        .get("https://www.aljazeera.com/topics/country/canada.html")
        .then(function(response) {
          // Then, we load that into cheerio and save it to $ for a shorthand selector
          var $ = cheerio.load(response.data);

          $("div.row.topics-sec-item.default-style").each(function(i, element) {
            if (i >= 10) {
              return false;
            }

            var result = {};
            result.id = i + 1;
            result.title = $(this)
              .children("div.topics-sec-item-cont")
              .children("a")
              .children("h2")
              .text();
            result.link = $(this)
              .children("div.topics-sec-item-cont")
              .children("a")
              .attr("href");
            result.snippet = $(this)
              .children("div.topics-sec-item-cont")
              .children("p.topics-sec-item-p")
              .text();
            result.imageUrl = $(this)
              .children("div.topics-sec-item-img")
              .children("a")
              .children("img.img-responsive")
              .attr("src");

            if (!article_links.includes(result.link)) {
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
    console.log(savedArticle);
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
          //console.log(articles);
          // Save each article document into an array
          // var allSavedArticles = articles.map(function(article) {
          //   return article;
          // });
          // Render the array in the articles route for handlebars
          res.render("articles", { articles: articles });
        }
      });
  });


  // Route for saving a new Note to the db and associating it with a article
  app.post("/submit", function(req, res) {
    var note = req.body;
    //console.log(note);
    db.Article.findOne(
      {
        _id: note.article_id,
      },
      function(err, article) {
        db.Note.create({
          _article: article.id,
          text: note.text,
        }).then(function(dbNote) {
            // console.log('dbnote');
            // console.log(dbNote);
            // console.log('note article-id');
            // console.log(note.article_id);
            // If a Note was created successfully, find one User (there's only one) and push the new Note's _id to the User's `notes` array
            // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
            // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
            return db.Article.findOneAndUpdate(
              { _id: note.article_id },
              { $push: { note: dbNote._id } },
              { new: true }
            );
        }).then(function(dbArticle) {
          // If the User was updated successfully, send it back to the client
          res.redirect("/articles");
        })
        .catch(function(err) {
          // If an error occurs, send it back to the client
          res.json(err);
        });
      }
    )
  });

  // Delete articles and notes
  app.get("/delete", function(req, res) {
    db.Note.deleteMany()
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });

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
  app.post("/deleteNote", function(req, res) {
    // Load the req.body.id into a variable for ease of use
    var noteId = req.body.id;

    db.Note.find({_id:noteId})
    .exec(function(err, note) {

      if(!note[0]._article) {
        console.log('Error!');
        return false;
      }
      db.Article.updateOne(
        {_id: note[0]._article},
        {$pull : {note: noteId }},
        function (err, numAffected) {
          if(err) {
            console.log(err);
          } else {
            db.Note.remove({ _id: noteId }, function(err, note) {
              if (err) {
                // If error, send error
                res.send(err);
              } else {
                // Redirect to saved articles
                res.redirect("/articles");
              }
            });
          }
        }
      );
    });

  });
};
