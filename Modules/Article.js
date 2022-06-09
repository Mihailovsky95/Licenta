const mongoose = require("mongoose");

const articleSchema = ({
  title: String,
  content: String,
  description: String
})



const Article = new mongoose.model("Article",  articleSchema);

module.exports = Article;
