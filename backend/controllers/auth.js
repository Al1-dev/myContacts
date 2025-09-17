const jwt = require("jsonwebtoken")
function verifyAuth(req, res, cb) {
    const tokenRaw = req.headers.authorization || req.headers.Authorization;
    if (!tokenRaw || !tokenRaw.startsWith("Bearer ")) {
        return res.status(401).json({ "error": "token required" })
    }
    const token = tokenRaw.split(" ")[1];
    const SECRET = process.env.SECRET;
    if (!SECRET) {
        return res.status(500).json({ "error": "internal server error" })
    }
    try {
        const _ = jwt.verify(token, SECRET);
        req.email = _.email;
        req.userId = _.id;
        cb();
    }
    catch (e) {
        return res.status(401).json({ "error": "invalid token" })
    }

}
module.exports = verifyAuth;