const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt");
const User = require("../models/UserModel");
const jwt = require("jsonwebtoken");
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthRequest'
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Missing fields or invalid data
 *       500:
 *         description: Server error
 */
router.post("/register", async (req, res, cb) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ "error": "Email and password are required" });
        }
        if (!isEmailValid(email)) {
            return res.status(422).json({ "error": "Invalid email address" });
        }
        if (!isPasswordValid(password)) {
            return res.status(422).json({ "error": "Invalid password" });
        }
        if (await User.findOne({ email })) {
            return res.status(409).json({ "error": "Email already in use" });
        }
        const securedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            email,
            password: securedPassword
        });
        await user.save();
        return res.status(201).json({ id: user._id });
    } catch (e) {
        return res.status(500).json({ "error": "internal server error" });
    }
})
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token
 *       400:
 *         description: Missing fields
 *       500:
 *         description: Server error
 */
router.post("/login", async (req, res, cb) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ "error": "Email and password are required" });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ "error": "Invalid credentials" });
        }
        const isPasswordMatching = await bcrypt.compare(password, user.password);
        if (!isPasswordMatching) {
            return res.status(401).json({ "error": "Invalid credentials" });
        }
        const SECRET = process.env.SECRET
        if (!SECRET) {
            return res.status(500).json({ "error": "internal server error" })
        }
        const token = jwt.sign({ "email": user.email, "id" : user._id}, SECRET, { expiresIn: "1d" });
        return res.status(200).json({token})
    } catch (e) {
        return res.status(500).json({ "error": "internal server error" });
    }
})


function isEmailValid(email) {
    if (typeof email !== 'string') return false;
    if (email.length > 254) return false;
    const basicRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,63}$/;
    if (!basicRegex.test(email)) return false;
    const [local, domain] = email.split('@');
    if (!local || !domain) return false;
    if (local.startsWith('.') || local.endsWith('.')) return false;
    if (domain.startsWith('-') || domain.endsWith('-')) return false;
    if (local.includes('..') || domain.includes('..')) return false;
    return true;
}
function isPasswordValid(password) {
    if (typeof password !== 'string') return false;
    if (password.length < 10 || password.length > 128) return false;
    return true;
}

module.exports = router;