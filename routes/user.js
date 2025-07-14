const { Router } = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const sendVerificationEmail = require("../services/emailVerification");
const { createTokenForUser } = require("../services/authentication");
const router = Router();

router.get("/signin", (req, res) => {

    return res.render("signin");
});

router.get("/signup", (req, res) => {
    return res.render("signup");
});

let temporaryUserStore = {};
router.post("/signup", async (req, res) => {
    const { fullName, email, password } = req.body;

    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    sendVerificationEmail(email, verificationCode);

    const hashedPassword = await bcrypt.hash(password, 10);

    temporaryUserStore[email] = {
        fullName, // Store fullName here
        email,
        password: hashedPassword,
        verificationCode
    };
    res.render('verify', { email, error: null });
});

// Verification route
router.post('/verify', (req, res) => {
    const { email, verificationCode } = req.body;

    // Retrieve user info from the temporary store
    const user = temporaryUserStore[email];

    if (user && user.verificationCode == verificationCode) {
        // If the code matches, complete the sign-up process
        const newUser = new User({
            fullName: user.fullName,
            email: user.email,
            password: user.password // Already hashed
        });

        // Save the user to the database
        newUser.save();

        // Remove the user from the temporary store
        delete temporaryUserStore[email];

        // Redirect to login page after successful signup
        res.redirect('/');
    } else {
        res.render('verify', { error: 'Invalid verification code', email });
    }
});

router.post("/signin", async (req, res) => {
    const { email, password } = req.body;
    try {
        // Find the user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.render('signin', { error: "Invalid email Please provide registered email address" });
        }

        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.render('signin', { error: "Password doesn't match" });
        }

        // If authentication is successful, generate a JWT token
        const token = createTokenForUser(user);
        // You can either send the token back to the client or store it in a cookie
        // For this example, let's set a cookie with the token
        res.cookie('token', token);
        // res.cookie('token', token, { path: '/', httpOnly: true, secure: true });


        // Redirect the user to the home page or dashboard
        res.redirect('/');
    } catch (error) {
        console.error("Error during sign-in:", error);
        // Render the signin page with an error message
        res.render('signin', { error: "Something went wrong. Please try again later." });
    }
});

router.get("/logout",(req,res)=>{
    res.clearCookie("token").redirect("/");
})

module.exports = router;
