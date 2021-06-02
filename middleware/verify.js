const jwt = require("jsonwebtoken");
const User = require("../Models/User");
require('dotenv').config();

exports.verify = async (req, res, next) => {
    let accessToken = req.cookies.jwt;

    // if there is no token stored in cookies, the request is unauthorized
    if (!accessToken){
        console.log('No access token present');
        if (req.url === '/')
            return res.render('pages/index', { user: 0 } );
        else if (req.url === '/login' || req.url === '/signup')
            return res.render(`pages${req.url}`, { user: 0 } );
    }
    let payload;
    try {
        jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, decodedtoken) => {
            if (err) console.log(err);
            req.userid = decodedtoken.user.id;
        });
        next();
    }
    catch(e) {
        //if an error occured return request unauthorized error
        console.log(e);
        // return res.status(401).send();
    }
}