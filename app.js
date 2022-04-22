require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const _ = require("lodash");
const app = express();
const encrypt = require("mongoose-encryption");

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect("mongodb+srv://admin-mihail:myDatabase@myowncluster.ajqri.mongodb.net/platformDB", { useNewUrlParser: true });
// mongo "mongodb+srv://myowncluster.ajqri.mongodb.net/myFirstDatabase" --username admin-mihail

const userSchema = new mongoose.Schema ({
  username:{type: String, required:true},
  email: {type: String, required:true},
  password: {type: String, required:true},
  confirmPassword: {type: String, required:true}
})



userSchema.plugin(encrypt, {secret: process.env.secret, encryptedFields: ['password', 'confirmPassword']});

const articleSchema = {
  title: String,
  content: String,
  description: String
}

const User = new mongoose.model("User", userSchema);
const Article = new mongoose.model("Article",  articleSchema);

const art1 = new Article({
  title: "HTML",
  content: "https://www.w3schools.com/html/",
  description:"The HyperText Markup Language or HTML is the standard markup language for documents designed to be displayed in a web browser."
});

const art2 = new Article({
  title: "CSS",
  content: "https://www.w3schools.com/css/",
  description:"Cascading Style Sheets (CSS) is a style sheet language used for describing the presentation of a document written in a markup language such as HTML. CSS is a cornerstone technology of the World Wide Web, alongside HTML and JavaScript."
});

const art3 = new Article({
  title: "JAVASCRIPT",
  content: "https://www.javascript.com/",
  description:"JavaScript (/ˈdʒɑːvəskrɪpt/), often abbreviated JS, is a programming language that is one of the core technologies of the World Wide Web, alongside HTML and CSS."
});

const defaultArticles = [art1, art2, art3];



app.get("/", function(req, res) {
res.render("startPage");
})

app.get("/login", function(req, res) {
res.render("login");
})

app.post("/login", function(req, res){
  const username = req.body.email;
  const password = req.body.password;

  User.findOne({email: username}, function(err, foundUser){
    if(err){
      console.log(err);
    }else{
      if(foundUser){
        if(foundUser.password === password){
          res.render("home", {userName: foundUser.username});
        }
      }
    }
  })

  app.get("/contact", function(req, res){
     res.render("contact");
  })

  app.get("/articles", function(req, res){
    Article.find({}, function(err, foundArticles){
      if (foundArticles.length === 0) {
        Article.insertMany(defaultArticles, function(err){
          if (err) {
            console.log(err);
          } else {
            console.log("Successfully savevd default items to DB.");
          }
       })
       res.redirect("/articles");
      }else {
        res.render("Articles", {ArtTitle: "Usefull Documentation", newListArt: foundArticles});
      }
    })
   })
  app.post("/articles", function(req, res){
    const articleName = req.body.newTitle;
    const articleLink = req.body.newLink;
    const articleDescrip = req.body.newDescription;


    const article = new Article({
      title: articleName,
      content: articleLink,
      description: articleDescrip
    })
    article.save();
    res.redirect("/articles");
  })

  app.post("/delete", function(req, res){
    const checkedArticleId = req.body.checkbox;
      Article.findByIdAndRemove(checkedArticleId, function(err){
        if (!err) {
          console.log("Successfully deleted checked item.");
          res.redirect("/articles");
        }
      })
    })
  app.get("/view", function(req, res){
     res.render("view");
  })
})

app.get("/register", function(req, res) {
res.render("register");
})

app.post("/register", function(req, res){

   const newUser = new User ({
     username: req.body.rusername,
     email: req.body.remail,
     password: req.body.rpassword,
     confirmPassword: req.body.rcpassword,
   })

    newUser.save(function(err){
      if(err){
        console.log(err);
      }else{
        res.render("home", {userName: req.body.rusername});
      }
  })
})
let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}


app.listen(port, function() {
  console.log("Server started");
});
