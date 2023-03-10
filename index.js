const express = require("express");
const { default: mongoose } = require("mongoose");
const app = express();
const User = require("./models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// const session = require('express-session')
const SECRET_KEY = "JWTSECRET";
let JWTID,
  INFO = null,MyTable=null;
// const Name = 'ABDUL SUHAIB'

mongoose.connect("mongodb://localhost:27017/myProject");

// app.use(express.static(__dirname + '/public'));
app.use("/public", express.static("public"));
app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.urlencoded({ extended: true }));
// app.use(session({
//     secret:'keyboard'
// }))

app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

app.get("/", async (req, res) => {
  const filter = {};
  const all = await User.find(filter);
  MyTable = all
  // console.log(all)
  res.render("home", { Name: INFO, Table: all });
});
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  const { password, username } = req.body;
  const hash = await bcrypt.hash(password, 12);
  const user = new User({
    username,
    password: hash,
  });
  await user.save();

  const token = jwt.sign({ username: user.username, id: user._id }, SECRET_KEY);
  const decoded = jwt.verify(token, SECRET_KEY);
  INFO = decoded.username;
  JWTID = decoded.id;
  res.redirect("/secret");
});

app.get("/login", (req, res) => {
  res.render("login");
});
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username: username });
  if (user) {
    const validPassword = await bcrypt.compare(password, user.password);
    if (validPassword) {
      const token = jwt.sign(
        { username: user.username, id: user._id },
        SECRET_KEY
      );
      const decoded = jwt.verify(token, SECRET_KEY);
      INFO = decoded.username;
      JWTID = decoded.id;
      // console.log("you are logged in " + user + token);
      // console.log("you are logged in " + decoded.id);
      res.redirect("/secret");
    } else {
      res.redirect("/login");
    }
  } else {
    res.redirect("/register");
  }
});
app.post("/logout", (req, res) => {
  JWTID = null;
  INFO = null;
  res.redirect("/");
});

app.get("/secret", (req, res) => {
  if (!JWTID) {
    res.redirect("/login");
  }
  res.render("secret");
});

app.get("/delete/:id", async (req, res)=>{
  const user = await User.deleteOne({ _id: req.params.id });
  console.log(user)
  res.redirect('/secret')
})

app.get('/update/:id',async(req, res)=>{
  const filter = {};
  const all = await User.find(filter);
  console.log(req.params.id)
  res.render('update',{UserID:req.params.id,Users:all})
})
app.post('/update/:id',async(req, res)=>{
  const { username , password } = req.body
  const update= await User.findByIdAndUpdate(req.params.id,{username:username})
  console.log(req.params.id)
  console.log(update)
  res.redirect('/')

})

app.listen(3000, () => {
  console.log("serving your app on 3000");
});
