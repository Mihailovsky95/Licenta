const mongoose = require("mongoose");

const articleSchema = ({
  title: String,
  content: String,
  description: String
})

const htmlArt = new Article ({
  title: "Html",
  content:"https://www.w3schools.com/html/",
  description: "HTML is the standard markup language for Web pages."
})
htmlArt.save();

const cssArt = new Article ({
  title: "CSS",
  content:"https://www.w3schools.com/css/",
  description: "CSS is the language we use to style an HTML document."
})
cssArt.save();

const jsArt = new Article ({
  title: "JS",
  content:"https://www.javascript.com/",
  description: "JavaScript este un limbaj de programare orientat obiect bazat pe conceptul prototipurilor. Este folosit mai ales pentru introducerea unor funcționalități în paginile web, codul JavaScript din aceste pagini fiind rulat de către browser."
})
jsArt.save();

const nodeArt = new Article ({
  title: "Node.js",
  content:"https://nodejs.org/en/",
  description: "Node.js este un mediu de execuție JavaScript de fundal multiplatformă cu sursă deschisă, care rulează pe motorul V8 și execută cod JavaScript în afara unui navigator web."
})
nodeArt.save();

const defArticles = [htmlArt, cssArt, jsArt, nodeArt];


module.exports = defArticles;
