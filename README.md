# mongo-scraper

* Mongo-Scraper is a web app that lets users view and leave comments on the latest news.

1. Whenever a user visits the site, the app scrapes stories from a Al Jazeera and display them for the user. Each scraped article is saved to application database. The app is able to scrape and display the following information for each article:

     * Headline - the title of the article

     * Summary - a short summary of the article

     * URL - the url to the original article

2. Users are also able to leave comments on the articles displayed and revisit them later. The comments are saved to the database as well and associated with their articles. Users are also able to delete comments left on articles. All stored comments are visible to every user.

## Getting Started

* Download and unzip the project.

## Prerequisites

* [Install node.js](https://nodejs.org/en/download/)

## Running app

```sh
cd mongo-scraper

npm install (to install dependencies)

node server (to start the server)

```

## Technology Used

* HTML
* CSS
* JavaScript
* nodejs
* Express
* Materialize
* Mongoose
* MongoDB
* axios
* cheerio
* express-handlebars

## Deployment

* This app is deployed to Heroku:
https://tranquil-brook-31969.herokuapp.com/

### Author

* [Raj Kumar Shahu](https://rajkumarshahu.com)
