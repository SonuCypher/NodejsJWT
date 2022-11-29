const express = require("express");
const { default: mongoose } = require("mongoose");
const app = express();
const User = require("./models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const session = require('express-session')
// const Name = 'ABDUL SUHAIB'

mongoose.connect("mongodb://localhost:27017/myProject");

app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret:'keyboard'
}))

app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
})


app.get("/", (req, res) => {
  res.render("home");
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
  req.session.user_id = user._id;
  res.redirect("/secret");
});

app.get("/login", (req, res) => {
  res.render("login");
});
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username:username });
  if (user) {
    const validPassword = await bcrypt.compare(password, user.password);
    if (validPassword) {
      req.session.user_id = user._id;  
      res.redirect('/secret');
    } else {
      res.redirect('/login');
    }
  } else {
    res.redirect('/register');
  }
});
app.post('/logout',(req,res)=>{
     req.session.user_id = null
    // req.session.destroy()
    res.redirect('/')
})

 app.get('/secret', (req, res)=>{
    if(!req.session.user_id){
        res.redirect('/login')
    }
     res.render('secret')
 })

app.listen(3000, () => {
  console.log("serving your app on 3000");
});
