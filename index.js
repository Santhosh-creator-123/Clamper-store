import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt, { hash } from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import session from "express-session";
import env from "dotenv";
import crypto from "crypto";
import axios from "axios";

//port
const app = express();
const port = 3000;
const saltRounds = 10;
env.config();
app.use(bodyParser.json());


//session
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV,
            httpOnly: true,
            maxAge: 1000 * 60 * 60,
        }
    })
);

//Middleware
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//passport Middleware
app.use(passport.initialize());
app.use(passport.session());

//connecting to database
const db = new pg.Client({
    user: process.env.PG_USER,
    host:process.env.PG_HOST,
    database:process.env.PG_DATABASE,
    password:process.env.PG_PASSWORD,
    port:process.env.PG_PORT,
});
db.connect();

//Home
app.get("/", (req, res) => {
  res.render("home.ejs");
});

//Login
app.get("/login", (req, res) => {
  res.render("login.ejs");
});

//Register
app.get("/register", (req, res) => {
  res.render("register.ejs");
});

//logout
app.get("/logout", (req, res) => {
    req.logout(function(err) {
        if(err) {
            return next(err);
        }
        res.redirect("/");
    });
});
// Cart route
app.get("/cart", (req, res) => {
  res.render("cart.ejs"); // cart.ejs inside views/
});

// Checkout route
app.get("/checkout", (req, res) => {
  res.render("checkout.ejs"); // checkout.ejs inside views/
});
app.get("/products", (req, res) => {
  res.render("products.ejs");
});



app.post("/register", async (req, res) => {
    const email = req.body.username;
    const password = req.body.password;

    try{
        const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [
            email,
        ]);
        if (checkResult.rows.length > 0) {
            res.redirect("/login");
        }else {
            bcrypt.hash(password, saltRounds, async(err, hash) => {
                if (err) {
                    console.error("Error hashing password:", err);
                }else {
                    const result = await db.query("INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *", [
                        email, hash
                    ]);
                    const user = result.rows[0];
                    req.login(user, (err) => {
                        console.log("success");
                        res.redirect("/checkout");
                    });
                }
            });
        }

    }catch (err) {
        console.log(err);
    }
});

app.post("/login",
  passport.authenticate("local", {
    successRedirect: "/checkout",   // 👈 if login works, go to checkout
    failureRedirect: "/login"       // 👈 if login fails, stay on login page
  })
);


passport.use(
    "local",
    new Strategy(async function verify(username, password, cb) {
        try {
            const result = await db.query("SELECT * FROM users WHERE email = $1", [
                username,
            ]);
            if(result.rows.length > 0) {
                const user = result.rows[0];
                const storedHashedPassword = user.password;
                bcrypt.compare(password, storedHashedPassword, (err, valid) => {
                    if (err) {
                        console.error("Error comparing password:", err );
                        return cb(err);
                    } else {
                        if (valid) {
                            return cb(null, user);
                        }else {
                            return cb(null, false);
                        }
                    }
                });

            }else {
                return cb("User not found");
            }
        } catch (err){
            console.log(err);
        }
    })
);

passport.serializeUser((user, cb) => {
    cb(null, user);
});

passport.deserializeUser((user, cb) => {
    cb(null, user);
});


app.listen(port,() => {
    console.log(`Server listening to the port${port}!`);
})