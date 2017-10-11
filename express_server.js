var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

function generateRandomString() {
	return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
}

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "a35bb2": "http://www.facebook"
};

app.get("/", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {  
  let templateVars = { urls: urlDatabase };
  res.render("urls_index.ejs", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]
  let shortURL = req.params.shortURL
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  let longurl = req.body.longURL;
  console.log(longurl)
  let shortURL = generateRandomString()
  urlDatabase[shortURL] = longurl;
  console.log(urlDatabase);

  res.redirect(`http://localhost:8080/urls/${shortURL}`);
});

app.post("/urls/:id", (req, res) => {
  

});


app.post("/urls/:id/delete", (req, res) => {
	delete urlDatabase[req.params.id];
	res.redirect(`http://localhost:8080/urls`);
})

app.get("/urls/:id", (req, res) => { 
  let templateVars = { shortURL: req.params.id,
  					   longurl: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});