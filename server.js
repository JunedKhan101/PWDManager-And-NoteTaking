const express = require('express');
const mongoose = require('mongoose');
const app = express();
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');
const User = require('./Models/User');
const { verify }  = require('./middleware/verify');
const user = require("./routes/user");
const InitiateMongoServer = require("./config/db");
const pwds = require('./Models/pwds');
const methodOverride = require('method-override');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.json());
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

app.use(require("express-session")({    
    secret:"tYI2QdsgZ4ug9ezuVkd6cLN3G",    
    resave: false,    
    saveUninitialized: false
}));
app.use(cookieParser());
app.use(methodOverride('_method'));
InitiateMongoServer();

app.get('/', verify, async (req, res) => {
    const currentuser = await User.findOne({ _id: req.userid });
    res.render('pages/index', { currentuser: currentuser });
});

app.get('/login', verify, (req, res) => {
    res.render('pages/login');
});

app.get('/signup', verify, (req, res) => {
    res.render('pages/signup');
});
app.get('/pwds', verify, async (req, res) => {
    const pwdModels = await pwds.find({ relateduserid: req.userid });
    res.render('pages/pwds', { pwdModels: pwdModels });
});
app.post('/pwds', verify, async (req, res) => {
    const { title, body } = req.body;

    var pwdModel = await pwds.create({ relateduserid: req.userid, title: title, body: body });
    res.redirect('/pwds');
});
app.get('/delete/:id', async (req, res) => {
    const id = req.params.id;
    const pwd = await pwds.findByIdAndDelete(id, (err) => {
        if (err) console.log(err);
        else console.log("Deleted Succesfully!");
    });
    res.redirect('/pwds');
});
app.get('/edit/:id', async (req, res) => {
    const id = req.params.id;
    const pwd = await pwds.findById(id);
    res.render('pages/edit', {pwd: pwd});
});
app.put('/update/:id', async (req, res) => {
    const id = req.params.id;
    const { title, body } = req.body;
    const pwd = await pwds.updateOne({id: id}, { title: title, body: body });
    res.redirect('/pwds');
});
app.get('/allusers', async (req, res) => {
    const users = await User.find({});
    res.json(users);
});
app.get('/allpwds', async (req, res) => {
    const allpwds = await pwds.find({});
    res.json(allpwds);
});
app.get('/deluser/:uname', async (req, res) => {
    const users = await User.deleteOne({username: req.params.uname});
    res.send("successfull");
});
app.get('/delpwd/:title', async (req, res) => {
    const pwdModel = await pwds.deleteOne({title: req.params.title});
    res.send("successfull");
});
app.use("/", user);
app.listen(process.env.PORT || 5000, () => console.log('Server up and running at http://localhost:5000'));