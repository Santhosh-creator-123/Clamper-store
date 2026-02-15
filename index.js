import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import session from "express-session";
import env from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables
env.config();

// Initialize app FIRST
const app = express();

// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// App settings
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
    session({
        secret: process.env.SESSION_SECRET || "secret_key",
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
            maxAge: 1000 * 60 * 60,
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());

// PostgreSQL connection
const db = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});

db.connect()
    .then(() => console.log("Database connected"))
    .catch((err) => console.error("Database connection error:", err.message));

// Sample Products
const products = [
    {
        id: 1,
        name: "Elegant Floral Wedding Invitation",
        type: "Wedding",
        price: 28.0,
        image: "/images/copper-card-1.jpg",
        description:
            "Beautiful copper wedding invitation with intricate floral design.",
    },
    {
        id: 2,
        name: "Multi-Couple Celebration Plaque",
        type: "Wedding",
        price: 45.0,
        image: "/images/copper-card-2.jpg",
        description:
            "Premium copper plaque featuring decorative borders.",
    },
    {
        id: 3,
        name: "Classic Invitation Card Set",
        type: "Invitation",
        price: 22.0,
        image: "/images/copper-card-3.jpg",
        description:
            "Traditional copper invitation cards with elegant borders.",
    },
];

// Routes
app.get("/", (req, res) => {
    res.render("home", { featuredProducts: products.slice(0, 3) });
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/cart", (req, res) => {
    res.render("cart");
});

app.get("/checkout", (req, res) => {
    res.render("checkout");
});

app.get("/products", (req, res) => {
    res.render("Products", { products });
});

app.get("/product/:id", (req, res) => {
    const productId = parseInt(req.params.id);
    const product = products.find((p) => p.id === productId);

    if (product) {
        res.render("product_detail", { product });
    } else {
        res.status(404).send("Product not found");
    }
});

// Authentication
passport.use(
    new Strategy(async function verify(username, password, cb) {
        try {
            const result = await db.query(
                "SELECT * FROM users WHERE email = $1",
                [username]
            );

            if (result.rows.length > 0) {
                const user = result.rows[0];
                bcrypt.compare(password, user.password, (err, valid) => {
                    if (err) return cb(err);
                    if (valid) return cb(null, user);
                    else return cb(null, false);
                });
            } else {
                return cb(null, false);
            }
        } catch (err) {
            return cb(err);
        }
    })
);

passport.serializeUser((user, cb) => {
    cb(null, user);
});

passport.deserializeUser((user, cb) => {
    cb(null, user);
});

// Start Server
const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
