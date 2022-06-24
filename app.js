require('dotenv').config();
var favicon = require('serve-favicon');
const express = require("express");
const expressSession = require("express-session");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const handlebars = require("express3-handlebars").create();
const _ = require("lodash");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const flash = require("connect-flash");
const fs = require("fs");
const multer = require('multer');
const path = require('path');
const uuid = require('uuid').v4;
const url = require('url');
const Video = require('./Modules/Video');
const {Article, defaultArticles} = require('./Modules/Article');
const User = require('./Modules/User');
const initFolder = 'E:/licenta/uploads/';
var capitalize = require('lodash.capitalize');
var messageArt = "";
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(express.static("uploads"));
app.use(cookieParser("secretStringForCookies"));
app.use(expressSession({
  "cookie": {maxAge: null},
  "key":"user_id",
  "secret":"User secret Object Id",
  "resave":true,
  "saveUninitialized":true
}));
app.use(flash());


const storage = multer.diskStorage({
   destination: (req, file, cb) => {
       cb(null, 'uploads')
   },
   filename: (req, file, cb) => {
       const { originalname } = file;
       // or
       // uuid, or fieldname
       cb(null, originalname);
   }
})
const upload = multer({ storage });


function getUser(id, callBack){
  User.findOne({_id: ObjectId(id)}, function(err, user){callBack(user)});
}

mongoose.connect("mongodb+srv://admin-mihail:myDatabase@myowncluster.ajqri.mongodb.net/platformDB", { useNewUrlParser: true, useUnifiedTopology: true});
// mongo "mongodb+srv://myowncluster.ajqri.mongodb.net/myFirstDatabase" --username admin-mihail

app.use('/favicon.ico', express.static('imagini/favicon.ico'));

app.get("/", function(req, res) {
res.render("startPage");
})

app.get("/login", function(req, res) {
  res.render("login", {falseCredential: messageArt});
  messageArt = "";
})


app.post("/welcome", function(req, res){

  const username = req.body.email;
  const password = req.body.password;

  User.findOne({email: username}, function(err, foundUser){
    if(foundUser == null){
      messageArt = "You entered a wrong E-mail";
      res.redirect("login")
    }else{
      if(foundUser){
        bcrypt.compare(password, foundUser.password, function(err, result) {
          if(result === true){
            req.session.user_id = foundUser._id;
            res.render("home", {RegisteredName: foundUser.username, "isLogin": req.session.user_id ? true : false})
          }else{
            messageArt = "You entered a wrong Password";
            res.redirect("login")
            }
          })
        }
      }
    })
})
app.get("/welcome", function(req, res){

  if (req.session.user_id){
    User.findOne({_id: req.session.user_id}, function(err, foundUser){
      if(foundUser == null){
        res.send("Cant find User try again");
      }else{
        res.render("home", {RegisteredName: foundUser.username});
        }
      })
    }
})

app.post("/register", function(req, res){

  reqEmail =  _._.toLower(req.body.remail);
  reqUser1 = _._.toLower(req.body.rusername);
  reqUser  = _.startCase(reqUser1);
  criptPass = req.body.rpassword;


  User.findOne({email: reqEmail}, function(err, foundUser){
     if (foundUser == null) {
     bcrypt.hash(criptPass, saltRounds, function(err, hash) {
       const newUser = new User ({
         username: reqUser,
         email: reqEmail,
         password: hash,
       })
        newUser.save(function(err, foundUser){
          if(err){
            console.log(err);
          }else{
            req.session.user_id = foundUser._id;
            res.render("home", {RegisteredName: _.trim(reqUser)});
          }
      })
    })
   }else{
       messageArt = "E-mail allready exists";
       res.redirect("register");
     }
  })
})

app.get("/register", function(req, res) {
res.render("register", {falseCredential: messageArt});
messageArt = "";
})



app.get("/contact", function(req, res){
  if (req.session.user_id){
    res.render("contact");
  }else{
    res.redirect("login");
  }
})
app.get("/articles", function(req, res) {
  if (req.session.user_id){
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
      res.render("Articles", {ArtTitle: "Usefull Documentation", newListArt: foundArticles, messageAlert: messageArt});
      messageArt="";
    }
  })
}else{
  res.redirect("login");
 }
})

 app.post("/delete", function(req, res){
   const checkedArticleId = req.body.checkbox;

   Article.find({}, function(err, foundArticles){
     if (foundArticles.length < 5) {
       messageArt = "You are not autorized to delete the predefined bookmarks";
       res.redirect("/articles")
      } else {
      Article.findByIdAndRemove(checkedArticleId, function(err){
       if (!err) {
         messageArt="Successfully deleted checked item";
         res.redirect("/articles");
       }
     })
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



 app.get("/upload", function(req, res){
   if (req.session.user_id){
     res.render("upload")
   }else{
     res.redirect("login");
   }
 })

 app.get("/views", function(req, res){
   if (req.session.user_id){
     res.render("views")
   }else{
     res.redirect("login");
   }
 })

 app.get("/logout", function(req, res){
  req.session.destroy();
  res.redirect("login");
 })




  app.post('/upload', upload.array('avatar'), (req, res) => {
        return res.redirect("upload");
    });

// let port = process.env.PORT;
// if(port == null || port == ""){
//   port = 3000;
// }
app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
// app.listen(port, function() {
//   console.log("Server has started");
// });
