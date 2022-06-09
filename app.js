require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const _ = require("lodash");
const app = express();
const md5 = require("md5");
const http=require("http");
const expressSession = require("express-session");
const fs = require("fs");
const multer = require('multer');
const path = require('path');
const uuid = require('uuid').v4;
const url = require('url');
const Video = require('./Modules/Video');
const Article = require('./Modules/Article');
const User = require('./Modules/User');
const initFolder = 'E:/licenta/uploads/';
var capitalize = require('lodash.capitalize');


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(express.static("uploads"));
app.use(expressSession({
  "key":"user_id",
  "secret":"User secret Object Id",
  "resave":true,
  "saveUninitialized":true
}));

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


app.get("/", function(req, res) {
res.render("startPage");
})

app.get("/login", function(req, res) {
res.render("login");
})

app.post("/welcome", function(req, res){

  const username = req.body.email;
  const password = md5(req.body.password);

  User.findOne({email: username}, function(err, foundUser){
    if(foundUser == null){
      res.send("Email does not exists");
    }else{
      if(foundUser){
        if(foundUser.password === password){
          req.session.user_id = foundUser._id;
          res.render("home", {RegisteredName: foundUser.username, "isLogin": req.session.user_id ? true : false});
        }else{
          res.send("Password incorrect");
        }
      }
    }
  })
})

app.post("/register", function(req, res){

  reqEmail =  _._.toLower(req.body.remail);
  reqUser1 = _._.toLower(req.body.rusername);
  reqUser  = _.capitalize(reqUser1);
  criptPass = md5(req.body.rpassword);


  User.findOne({email: reqEmail}, function(err, foundUser){
     if (foundUser == null) {
       const newUser = new User ({
         username: reqUser,
         email: reqEmail,
         password: criptPass,
       })
        newUser.save(function(err, foundUser){
          if(err){
            console.log(err);
          }else{
            req.session.user_id = foundUser._id;
            res.render("home", {RegisteredName: _.trim(reqUser)});
          }
      })
   }else{
       res.send("Email allready exists");
     }
  })

})

app.get("/register", function(req, res) {
res.render("register");
})

app.get("/welcome", function(req, res){
  if (req.session.user_id){
    res.render("home");
  }else{
    res.render("login");
  }
  })

app.get("/contact", function(req, res){
  if (req.session.user_id){
    res.render("contact");
  }else{
    res.render("login");
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
      res.render("Articles", {ArtTitle: "Usefull Documentation", newListArt: foundArticles});
    }
  })
 }else{
  res.render("login");
 }
 })

 app.get("/upload", function(req, res){
   if (req.session.user_id){
     res.render("upload")
   }else{
     res.render("login")
   }
 })

 app.get("/view", function(req, res){
   if (req.session.user_id){
     res.render("view")
   }else{
     res.render("login")
   }
 })

 app.get("/logout", function(req, res){
  req.session.destroy();
  res.redirect("login");
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


  app.post('/upload', upload.array('avatar'), (req, res) => {
        return res.redirect("upload");
    });



  app.get("/video1", function(req, res){

    const range = req.headers.range;
    if (!range) {
      res.status(400).send("Requires Range header");
    }

    const videoPath = "E:/licenta/uploads/HTML.mp4";
    const videoSize = fs.statSync(videoPath).size;
    const CHUNK_SIZE = 10 ** 6; // 1MB
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

// Create headers
  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };

  res.writeHead(206, headers);

  const videoStream = fs.createReadStream(videoPath, { start, end });

  videoStream.pipe(res);
});


app.get("/video2", function(req, res){

    const range = req.headers.range;
    if (!range) {
      res.status(400).send("Requires Range header");
    }

 const videoPath = "E:/licenta/uploads/JS1.mp4";
 const videoSize = fs.statSync(videoPath).size;
 const CHUNK_SIZE = 10 ** 6; // 1MB
 const start = Number(range.replace(/\D/g, ""));
 const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

// Create headers
 const contentLength = end - start + 1;
 const headers = {
 "Content-Range": `bytes ${start}-${end}/${videoSize}`,
 "Accept-Ranges": "bytes",
 "Content-Length": contentLength,
 "Content-Type": "video/mp4",
 };

 res.writeHead(206, headers);

 const videoStream = fs.createReadStream(videoPath, { start, end });

 videoStream.pipe(res);
 });

app.get("/video3", function(req, res){

    const range = req.headers.range;
    if (!range) {
      res.status(400).send("Requires Range header");
    }

 const videoPath = "E:/licenta/uploads/BTSTR.mp4";
 const videoSize = fs.statSync(videoPath).size;
 const CHUNK_SIZE = 10 ** 6; // 1MB
 const start = Number(range.replace(/\D/g, ""));
 const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

// Create headers
 const contentLength = end - start + 1;
 const headers = {
 "Content-Range": `bytes ${start}-${end}/${videoSize}`,
 "Accept-Ranges": "bytes",
 "Content-Length": contentLength,
 "Content-Type": "video/mp4",
 };

 res.writeHead(206, headers);

 const videoStream = fs.createReadStream(videoPath, { start, end });

 videoStream.pipe(res);
 });

app.get("/video4", function(req, res){

    const range = req.headers.range;
    if (!range) {
      res.status(400).send("Requires Range header");
    }

 const videoPath = "E:/licenta/uploads/CSS.mp4";
 const videoSize = fs.statSync(videoPath).size;
 const CHUNK_SIZE = 10 ** 6; // 1MB
 const start = Number(range.replace(/\D/g, ""));
 const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

// Create headers
 const contentLength = end - start + 1;
 const headers = {
 "Content-Range": `bytes ${start}-${end}/${videoSize}`,
 "Accept-Ranges": "bytes",
 "Content-Length": contentLength,
 "Content-Type": "video/mp4",
 };

 res.writeHead(206, headers);

const videoStream = fs.createReadStream(videoPath, { start, end });

videoStream.pipe(res);
});


app.get("/video5", function(req, res){

    const range = req.headers.range;
    if (!range) {
      res.status(400).send("Requires Range header");
    }

 const videoPath = "E:/licenta/uploads/Nodejs.mp4";
 const videoSize = fs.statSync(videoPath).size;
 const CHUNK_SIZE = 10 ** 6; // 1MB
 const start = Number(range.replace(/\D/g, ""));
 const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

// Create headers
 const contentLength = end - start + 1;
 const headers = {
 "Content-Range": `bytes ${start}-${end}/${videoSize}`,
 "Accept-Ranges": "bytes",
 "Content-Length": contentLength,
 "Content-Type": "video/mp4",
 };

res.writeHead(206, headers);

const videoStream = fs.createReadStream(videoPath, { start, end });

videoStream.pipe(res);
});

app.get("/video6", function(req, res){

    const range = req.headers.range;
    if (!range) {
      res.status(400).send("Requires Range header");
    }

 const videoPath = "E:/licenta/uploads/EJS.mp4";
 const videoSize = fs.statSync(videoPath).size;
 const CHUNK_SIZE = 10 ** 6; // 1MB
 const start = Number(range.replace(/\D/g, ""));
 const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

// Create headers
 const contentLength = end - start + 1;
 const headers = {
 "Content-Range": `bytes ${start}-${end}/${videoSize}`,
 "Accept-Ranges": "bytes",
 "Content-Length": contentLength,
 "Content-Type": "video/mp4",
 };

 res.writeHead(206, headers);

 const videoStream = fs.createReadStream(videoPath, { start, end });

 videoStream.pipe(res);
 });

let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started");
});
