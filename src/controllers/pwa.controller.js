// Express router setup
const express = require('express');
const router = express.Router();

// Other imports
const path = require('path');
const root_dir = require('app-root-path');
const db = require(`${root_dir}/src/models`);
const env = process.env.NODE_ENV || 'development'
const config = require(`${root_dir}/src/config/config.json`)[env];

// Web-push setup
const push = require('web-push');
const pushDetails = config.push_details;
push.setVapidDetails(`mailto:${pushDetails.email}`, pushDetails.publicKey, pushDetails.privateKey);

router.get("/", home);
router.post("/notify", notifyUser);
router.post("/subscribe", subscribe);

// Express Routes
function home (req, res) {
    let index_path = path.join(root_dir + "/index.html");
    res.sendFile(index_path);
}

async function notifyUser (req, res) {
    // TODO Need to add security to ensure only the fire alarm server can call this endpoint
    const body = req.body;
    const username = body.username;
    const users = await db.user.findAll({
        attributes: ['id'],
        where: {
            username: username
        }
    });
    if (users.length !== 1) {
        return res.json({"error": "Couldn't find user with username"});
    }
    const user = users[0];
    const subscriptions = await db.subscription.findAll({where: { userId: user.id }});
    if (subscriptions.length !== 1) {
        return res.json({ "error": "Couldn't find user in subscriptions"})
    }
    const subscription = subscriptions[0];
    const sub = {
        endpoint: subscription.endpoint,
        expirationTime: subscription.expirationTime,
        keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth
        }
    };
    const notification = body.notification;

    push.sendNotification(sub, JSON.stringify(notification))
        .then((response) => {
            console.log('Received push response: ', response);
            return res.json(response);
        });
}

async function subscribe (req, res) {
    // Function saves the JSON subscription object to the DB.
    const body = req.body;
    const subscription = body.sub;
    const username = body.user;
    const sub = await db.subscription.create({ endpoint: subscription.endpoint,
        expirationTime: subscription.expirationTime, p256dh: subscription.keys.p256dh, auth: subscription.keys.auth });

    db.user.findAll().then(users => {
        users.forEach(user => {
            if (user.username === username)
                user.setSubscription(sub)
                    .then( () => {
                        console.log(`Subscription linked to ${username} successfully`);
                    })
                    .catch(err => {
                        console.error('Error linking subscription to user:', err);
                    });
        });
    });
    return res.json({"sub-id": sub.id});
}

module.exports = router;