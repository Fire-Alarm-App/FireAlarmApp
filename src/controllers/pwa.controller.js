// Express router setup
const express = require('express');
const router = express.Router();

// Other imports
const path = require('path');
const root_dir = require('app-root-path');

router.get("/", home);
router.post("/notify", notifyUser)

// Express Routes
function home (req, res) {
    let index_path = path.join(root_dir + "/index.html");
    res.sendFile(index_path);
}

function notifyUser (req, res) {
    // TODO Need to add security to ensure only the fire alarm server can call this endpoint
    const body = req.body;
    const sub = body.sub; // TODO replace this with call to DB to get subscription details
    const notification = body.notification;

    console.log(notification);
    console.log(JSON.stringify(notification));
    push.sendNotification(sub, JSON.stringify(notification))
        .then((response) => {
            console.log('Received push response: ', response);
            return res.json(response);
        });
}

module.exports = router;