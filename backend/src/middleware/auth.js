const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
    let token = req.headers.authorization;

    if (!token || !token.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Not authorized, no token" });
    }

    try {
        token = token.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Not authorized, token failed" });
    }
};

module.exports = protect;