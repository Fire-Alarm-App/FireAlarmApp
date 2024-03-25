const jwt = require('jsonwebtoken');
const root_dir = require('app-root-path');
const env = process.env.NODE_ENV || 'development'
const config = require(`${root_dir}/src/config/config.json`)[env];

function authenticateToken(req, res, next) {
    console.log("Authenticating token");
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token || authHeader === undefined) return res.sendStatus(401);

    console.log("Token not null. Checking for validity");
    jwt.verify(token, config.jwt_secret, (err, user) => {
        if (err) return res.sendStatus(403); // Invalid token
        console.log();
        req.user = user;
        next();
    });
    console.log("After JWT verify");
    // TODO Change so that this function is an endpoint for the React App to ping for authentication.
}

module.exports = authenticateToken;