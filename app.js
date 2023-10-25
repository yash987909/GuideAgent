import 'dotenv/config'
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import passport from "passport";
import passportLocalMongoose from 'passport-local-mongoose';
import session  from "express-session";
import GoogleStrategy from "passport-google-oauth20";
import findOrCreate from "mongoose-findorcreate";


const app = express();
const port = 3000;
let profilePicture;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');
app.use(session({
    secret: "Little Secret",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

main().catch(err=>console.log(err));

async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/guide');
}

const userSchema = new mongoose.Schema({ 
    googleEmail: String,
    googleId: String,
    googlePicture: String,
    secret: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User",userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
    done(null, user);
  });
  
passport.deserializeUser(function(user, done) {
    done(null, user);
  });

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/guide"
    // userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
    },
    function(accessToken, refreshToken, profile, cb) {
        profilePicture=profile._json.picture;
        User.findOrCreate({ googleEmail: profile.emails[0].value, googleId:profile.id, googlePicture:profile._json.picture }, function (err, user) {
            return cb(err, user);
        });
  }
));

app.get("/", (req, res) => {
    if(req.isAuthenticated()){
        res.render("index.ejs",{profilePicture});
    } else {
        res.redirect("/login");
    }
    
});

app.get("/auth/google",
    passport.authenticate("google",{scope: ["profile","email"]})
);

app.get('/auth/google/guide', 
  passport.authenticate('google', { failureRedirect: "/login" }),
  (req, res)=> {
    // Successful authentication, redirect Secrets.
    res.redirect('/');
  });

app.get("/login", (req, res) => {
    res.render("login.ejs");
});

app.get("/signup", (req, res) => {
    res.render("signup.ejs");
});

app.get("/logout",(req,res)=>{
    req.logout(function(err) {
        if(err){
            console.log(err);
        }
        res.redirect('/');
    });
})

// Handle the POST request and perform the redirect
app.post('/', (req, res) => {
    console.log(req.body);
    res.redirect("/");
});




app.listen(port, () => {
    console.log(`Server started on ${port}`);
});
