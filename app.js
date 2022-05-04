//jshint esversion:6
require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const ejs = require('ejs')
const mongoose = require('mongoose')
const encrypt = require('mongoose-encryption') // using for basic encryption

const app = express()

//console.log(process.env.SECRET)
// IGNORE THE WARNINGS IN THE .ENV FILE
// also add the .env to the gitignore file b4 commiting

app.use(express.static('public'))
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }))

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true})

const userSchema = new mongoose.Schema({ //writing in this format to add encryption plugin later on
    email: String,
    password: String
})

//const secret = "theWankerWanksAllTheTime!!"
userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields:['password'] }); // remember to declare b4 model since userSchema is used in model
// this encrypts all the fields in our db unless we specify encryptedFields
// =>auto-encryption when we use < .save > and auto-decryption when we use < .find >
// in database the password is encrypted
// but this app.js can be hacked into and our secret will be exposed and jeopardized all users 
// if this is published in a remote site like github, our secret key will be exposed and then bad things will happen 
// SO USE ENVIRONMENT VARIABLES

const User = new mongoose.model('User', userSchema)

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login', (req, res) => {
    const username = req.body.username
    const password = req.body.password

    User.findOne({email: username}, (err, foundUser)=>{
        if(err){
            console.log(err)
        }else {
            if(foundUser){
                if(foundUser.password === password){
                    res.render('secrets')
                }
            }

        }
    })
})

app.get('/register', (req, res) => {
    res.render('register')
})

app.post('/register', (req, res)=>{
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    })
    newUser.save((err)=>{
        if(err){
            console.log(err);
        }else{
            res.render("secrets") //only render when registered
        }
    })
})




app.listen('3000', ()=>{
    console.log("listening again matey for you only!!")
})