var express = require("express");
var app = express();
var cookieParser = require('cookie-parser');
var PORT = process.env.PORT || 8080; // default port 8080
app.use(cookieParser());
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

var urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    id: "userRandomID"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    id: "user2RandomID"
  },
  "a35bb2": {
    longURL: "http://www.facebook",
    id: "user3RandomID"
  }
};

function generateRandomString() {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
};

app.get("/register", (req, res) => {
  let templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies.userID]
  };

  res.render("urls_register", templateVars)
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (email === "" || password === "") {

  	res.status(400).send("You attempted to log in with invalid credentials")
  	return;
  } else {
    // console.log(users, "TESTING123")
    // console.log(username);
    for (var k in users) {
     	// console.log(users[k])
     	if (users[k].email == email) {
     		res.status(400).send("DUPLICATE!");
     		return;
     	};
   	};

    let id = generateRandomString();
    let newUser = {"id": id, "email": email, "password": password};
    users[id] = newUser;
    // console.log(newUser);
    res.cookie('userID', newUser.id);
	  res.redirect("/urls")
  };
});

app.get("/", (req, res) => {
  res.end("Hello?");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]
  let shortURL = req.params.shortURL
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  if (!req.cookies.userID){
    res.redirect('/login');
  } else {
    res.render("urls_new", {user: users[req.cookies.userID]});
  }
});

app.get("/urls", (req, res) => {  
  if (!req.cookies.users){
    res.redirect('./login');
    return;
  }
  let templateVars = {
    urls: urlDatabase,
    user: users[req.cookies.userID]
  };
  res.render("urls_index.ejs", templateVars);
});

app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  // console.log(longurl)
  let shortURL = generateRandomString()
  urlDatabase[shortURL] = longURL;
  // console.log(urlDatabase);
  res.redirect(`http://localhost:8080/urls/${shortURL}`);
});


app.get("/login", (req, res) => {
	let templateVars = { 
    urls: urlDatabase,
  	user: users[req.cookies.userID]
  };
	res.render("login", templateVars);
});

app.post("/login", (req, res) => {
	let email = req.body.email;
	let password = req.body.password;

	for (var x in users) {
		if ((users[x].email === email) && (users[x].password === password)){
			res.redirect("urls");
		} else {
			console.log ("error")
		}
	}
});

app.post("/logout", (req, res) => {
  res.clearCookie('userID');
	res.redirect("http://localhost:8080");
});

app.get("/urls/:id", (req, res) => { 
  let templateVars = { 
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[req.cookies.userID] 
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
   urlDatabase[req.params.id] = req.body.longURL; 
   res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
	delete urlDatabase[req.params.id];
	res.redirect(`http://localhost:8080/urls`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});