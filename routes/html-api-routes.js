var db = require("../models");

module.exports = function(app){

app.get("/articles", function(req, res) {
    var data = {
        title: "huMONGOus News Scraper"
    };

    res.render("index",data)
});

app.get("/note", function(req, res) {

    var data = {

    };

    res.render("index",data)
});

}
