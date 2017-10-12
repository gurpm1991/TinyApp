var express = require("express");
var app = express();
var cookieParser = require('cookie-parser')
var PORT = process.env.PORT || 8080; // default port 8080


app.use(cookieParser())
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
}

function attemptLogin(useremail, password) {
  for (let user in users) {
    if (users[user].email === useremail && users[user].password === password) {
      return user;
    }
  }
}

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

app.post("/register", (req, res) => {
  const username = req.body.username;
  console.log(username);
  const password = req.body.password;
  console.log(password);



  if (username === "" || password === "") {

  	res.status(400).send("You attempted to log in with invalid credentials")
  	return;
  	//failed attempt due to already existing user
  	// res.render('urls_register', { errorFeedback: 'failed to find a user.'});
  	// console.log('You attempted to log in with invalid credentials');
   } else {
   	for (var k in users) {
   		console.log(users[k])
   		if (users[k].email == username) {
   			res.status(400).send("DUPLICATE!");
   			return;
   		}
 	 }

 	 //success

	  let id = generateRandomString();

	  let newUser = {"id": id, "username": username, "password": password};

	  users[id] = newUser;

	  console.log(newUser);

  	  res.cookie('username', newUser.username);
  	  res.cookie('password', newUser.password);
  
	  res.redirect("/urls")

   	}
  // const user = attemptLogin(username, password);

});

app.get("/", (req, res) => {
  
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls.json", (req, res) => {
  
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {  
  let templateVars = { urls: urlDatabase,
  					   users: users[req.cookies["users_id"]]};
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

app.get("/register", (req, res) => {
	let templateVars = { urls: urlDatabase,
  						users: users[req.cookies["users_id"]]};


	res.render("urls_register", templateVars)
});



app.post("/urls", (req, res) => {
  let longurl = req.body.longURL;
  console.log(longurl)
  let shortURL = generateRandomString()
  urlDatabase[shortURL] = longurl;
  console.log(urlDatabase);

  res.redirect(`http://localhost:8080/urls/${shortURL}`);
});


app.post("/login", (req, res) => {
  let username = req.body.username;
  console.log(username);
  res.cookie("username", username);

	res.redirect("http://localhost:8080/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
	res.redirect("http://localhost:8080/urls");
});


app.post("/urls/:id", (req, res) => {
   urlDatabase[req.params.id] = req.body.longURL;
   
   res.redirect("/urls");
});


app.post("/urls/:id/delete", (req, res) => {
	delete urlDatabase[req.params.id];
	res.redirect(`http://localhost:8080/urls`);
})


app.get("/urls/:id", (req, res) => { 
  let templateVars = { shortURL: req.params.id,
  					   longurl: urlDatabase[req.params.id] 
  					   users: users[req.cookies["users_id"]]};
  res.render("urls_show", templateVars);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});