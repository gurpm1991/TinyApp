const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
app.use(cookieSession({
  name: 'session',
  keys: ['userID']
  }));
app.set("view engine", "ejs");

//generates 6 character random key for shortURL
function generateRandomString() {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
};
//test data
let users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "a"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "b"
  }
};
//test data
var urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "04251c"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "02868b"
  },
  "a35bb2": {
    longURL: "http://www.facebook",
    userID: "023168b"
  }
};
//main page welcome
app.get("/", (req, res) => {
  res.end("<html><body>Hello<b>World</b></body></html>\n");
});
//get to render URLS
app.get('/urls', (req, res) => {
  var userID = req.session.userID;
  var user = users[userID];
  let newDatabase = {};

  for (var key in urlDatabase) {
    if (urlDatabase[key].userID === userID) {
      newDatabase[key] = urlDatabase[key];
    }
  }
  let templateVars = { urls: newDatabase, user: user };
  res.render("urls_index", templateVars);
});
//update URL if user matches
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.session.userID};
  console.log(urlDatabase); 
  res.redirect("/urls");        
});
//render to urls if logged in
app.get("/urls/new", (req, res) => {
  var userID = req.session.userID;
  var user = users[userID];
  if (req.session.userID) {
    res.render("urls_new", {user: user});
    return;
  }
  //otherwise redirected to login
  res.redirect("/login");
});
//get to render register page
app.get("/register", (req, res) => {
  var userID = req.session.userID;
  var user = users[userID];
  res.render("register", {user: user});
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const userID = generateRandomString();

  if(email == "" || password == "") {
    res.status(400).send("Please enter a valid email and password.");
    return;
  }
  for (key in users) {
    if (email === users[key].email) {
      res.status(400).send("Duplicate! Already Registered!");
      return;
    }
  }   
  users[userID] = {id: userID, email: req.body.email, password: hashedPassword};
  console.log("users at userID", users[userID]);
  req.session.userID = users[userID].id;
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  res.render("login");
})
//confirms email & password w/ database
app.post("/login", (req, res) => {
  for (var key in users) {
    if (req.body.email === users[key].email) {
      if (require("bcrypt").compareSync(req.body.password, users[key].password)) {
        req.session.userID = users[key].id;
        res.redirect("/urls");
        return;
      } else {
        res.status(403).send("Sorry, your password doesnt match our records");
        return;
      }
    } 
  }
  res.status(403).send("Sorry, you are not yet registered!");
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//render page to edit ONLY if logged in
app.get("/urls/:id", (req, res) => {
  var userID = req.session.userID;
  var user = users[userID];
  if (userID === urlDatabase[req.params.id].userID) {
    let templateVars = {shortURL: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: user };
    res.render("urls_show", templateVars);
  } else {
    //otherwise you're redirected
    res.status(400).send("Please verify that you are logged in.");
  }
});

app.post("/urls/:id", (req, res) => {
  if (req.session.userID === urlDatabase[req.params.id].userID) {
    urlDatabase[req.params.id] = {longURL: req.body.longURL, userID: req.session.userID};
    console.log(req.body.longURL);
    res.redirect("/urls");
    return;
  }
  res.send("You are only able to edit URLs you create."); 
})

app.post("/urls/:key/delete", (req, res) => {
  if (req.session.userID === urlDatabase[req.params.key].userID) {
    delete urlDatabase[req.params.key];
    res.redirect("/urls");
    return;
  }
  res.send("You may not delete a URL that you did not create.");
})
//cookie reset
app.post("/logout", (req, res) => {
  req.session = null; 
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});