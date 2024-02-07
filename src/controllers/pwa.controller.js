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

// Applying routes
router.post("/notify", notifyUser);
router.post("/subscribe", subscribe);
router.get("/confirm", confirmAlarm);
router.get("/response", logResponse);
router.post('/alarm', configureAlarm);

// Express Routes
/**
 * @openapi
 * /notify:
 *  post:
 *    summary: Notifies user responsible for alarm
 *    description: Notifies a user responsible for the fire alarm based on the ID
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              username:
 *                type: string
 *                description: The user's id.
 *                example: bcsotty
 *              notification:
 *                type: object
 *                properties:
 *                  title:
 *                    type: string
 *                    description: The title of the displayed notification
 *                    example: Fire Detected!
 *                  message:
 *                    type: string
 *                    description: The message attached to the notification
 *                    example: Fire confirmed in room 104.
 *    responses:
 *      200:
 *        description: Push notification sent successfully
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                totalSubscriptions:
 *                  type: integer
 *                  description: The number of subscriptions the user has (Devices)
 *                  example: 2
 *                successfulNotifications:
 *                  type: integer
 *                  description: The number of notifications that successfully were sent to the user
 *                  example: 1
 *                errors:
 *                  type: array
 *                  description: The list of any errors that occurred when sending notifications
 *                  example: [Error occurred when sending notification]
 *                  items:
 *                    type: string
 *      404:
 *        description: User not found in Users/Subscriptions
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  description: The error when finding the user in the DB
 *                  example: Couldn't find user with provided username
 */
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
        return res.status(404).json({"error": "Couldn't find user with provided username"});
    }
    const user = users[0];
    const dbSubscriptions = await db.subscription.findAll({where: { userId: user.id }});
    if (dbSubscriptions.length === 0) {
        return res.status(404).json({ "error": "Couldn't find user in subscriptions"})
    }

    let successfulNotifications = 0;
    let errors = [];

    for (let subscription of dbSubscriptions) {
        const sub = {
            endpoint: subscription.endpoint,
            expirationTime: subscription.expirationTime,
            keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth
            }
        };

        const notification = body.notification;

        try {
            await push.sendNotification(sub, JSON.stringify(notification));
            console.log(`Notification sent successfully to ${username}`);
            successfulNotifications++;
        } catch (err) {
            console.log(`Error sending notification to ${username}: `, err);
            errors.push(`Error occurred when sending notification`);
        }
    }

    return res.status(200).json({
        "totalSubscriptions": dbSubscriptions.length,
        "successfulNotifications": successfulNotifications,
        "errors": errors
    });
}


/**
 * @openapi
 *
 * /subscribe:
 *   post:
 *     summary: Subscribes user to push notifications
 *     description: Subscribes user specified in request to receive notifications from the web server
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sub:
 *                 type: object
 *                 description: The subscription object generated by the web API push manager
 *                 properties:
 *                   endpoint:
 *                     type: string
 *                     description: The generated web endpoint
 *                   expirationTime:
 *                     type: string
 *                     description: The expiration time for the subscription (DOMHighResTimeStamp or null)
 *                     example: null
 *                   keys:
 *                     type: object
 *                     properties:
 *                       p256dh:
 *                         type: string
 *                         description: The Elliptic curve Diffie-Hellman public key
 *                       auth:
 *                         type: string
 *                         description: The authentication secret described in webpush-encryption-08 standard
 *               user:
 *                 type: string
 *                 description: The username of the user who is subscribing
 *                 example: bcsotty
 *     responses:
 *       200:
 *         description: User successfully subscribed
 *         content:
 *           text/html:
 *             example: Subscription linked to bcsotty successfully
 *       404:
 *         description: User not found in database
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error displayed when user not in DB
 *                   example: User not found
 *       409:
 *         description: Endpoint already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: The error displayed when duplicate endpoint is submitted
 *                   example: Duplicate endpoint error
 *       500:
 *         description: Unknown internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: The error displayed when an unknown failure occurred
 *                   example: An unexpected error has occurred
 * */
async function subscribe (req, res) {
    const body = req.body;
    const subscription = body.sub;
    const username = body.user;

    const user = await db.user.findOne({ where: {username: username } });
    try {
        if (user) {
            const sub = await user.createSubscription({
                endpoint: subscription.endpoint,
                expirationTime: subscription.expirationTime,
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth
            });
            console.log(`Subscription linked to ${username} successfully`);
            return res.status(200).send(`Subscription linked to ${username} successfully`);
        }
        else {
            return res.status(404).json({"error": "User not found"});
        }
    }
    catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({"error": "Duplicate endpoint error"})
        } else {
            console.log("An unexpected error has occurred: ", err);
            return res.status(500).json({"error": "An unexpected error has occurred"});
        }
    }
}


// Map for storing alarm notifications while in processing
let alarmMap = new Map();


/**
 * Returns a promise that delays for the number of seconds specified
 *
 * @param seconds The number of seconds to delay.
 * @return Promise - The promise that will time out for the number of seconds
 * */
function delay (seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}


/**
 * Returns the current UNIX timestamp
 *
 * @return number - The current UNIX timestamp
 * */
function getCurrentTimeStamp () {
    return Date.now();
}


/**
 * @openapi
 *
 * /confirm:
 *   get:
 *     summary: Sends push notification for user to confirm alarm status
 *     description: Sends a web-push notification that has prompts the user to confirm/deny the existence of a fire.
 *     parameters:
 *       - in: query
 *         name: alarmId
 *         schema:
 *           type: string
 *         description: The ID of the alarm to be confirmed
 *     responses:
 *       200:
 *         description: The confirmation prompt was successfully sent.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 confirmed:
 *                   type: boolean
 *                   description: True if the alarm was confirmed, False if it wasn't, and null if the user didn't respond in time
 *                   example: null
 *                 totalSubscriptions:
 *                   type: integer
 *                   description: The number of subscriptions the user has (Devices)
 *                   example: 2
 *                 successfulNotifications:
 *                   type: integer
 *                   description: The number of notifications that successfully were sent to the user
 *                   example: 1
 *                 errors:
 *                   type: array
 *                   description: The list of any errors that occurred when sending notifications
 *                   example: [Error occurred when sending notification]
 *                   items:
 *                     type: string
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Invalid/missing query parameter
 *                   example: Missing or incorrect parameters
 *       404:
 *         description: Unable to find alarm, alarm doesn't have user, or user doesn't have subscription
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: The error that occurred
 *                   example: Couldn't find alarm with provided alarm ID
 *       500:
 *         description: Unknown server error (Likely DB related)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unknown error occurred
 *
 * */
async function confirmAlarm (req, res) {
    // Receives alarm ID from controller -> Gets primary user for alarm from DB -> Notifies primary user of the fire and
    // asks for confirmation -> Wait for response to come from the PWA -> If response not received within 10 seconds,
    // return "null", otherwise return "true" or "false" corresponding to confirmed/denied.
    const params = req.query;
    if (!params.alarmId)
        return res.status(400).json({"error": "Missing or incorrect parameters"});

    const alarmId = params.alarmId;
    let alarm = null;
    let dbSubscriptions = null;
    try {
        const alarms = await db.alarm.findAll({
            where: {
                alarmSerial: alarmId
            }
        });
        if (alarms.length === 0)
            return res.status(404).json({"error": "Couldn't find alarm with provided alarm ID"});

        alarm = alarms[0];
        if (!alarm.userId)
            return res.status(404).json({"error": "Alarm doesn't have a user assigned"});

        dbSubscriptions = await db.subscription.findAll({where: {userId: alarm.userId}});
        if (dbSubscriptions.length === 0)
            return res.status(404).json({"error": "Couldn't find user in subscriptions"});
    } catch (err) {
        console.error('Unknown error occurred: ', err);
        return res.status(500).json({ 'error': 'Unknown error occurred' });
    }

    let successfulNotifications = 0;
    let errors = [];

    for (let subscription of dbSubscriptions) {
        const sub = {
            endpoint: subscription.endpoint,
            expirationTime: subscription.expirationTime,
            keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth
            }
        };

        const notification = {
            'title': 'Alarm Confirmation',
            'message': `Alarm was triggered at ${alarm.location}. Please confirm the existence of a fire.`,
            'actions': [
                {
                    'action': 'confirm',
                    'title': 'Confirm Alarm',
                    'type': 'button'
                },
                {
                    'action': 'deny',
                    'title': 'False Alarm',
                    'type': 'button'
                }
            ]
        };

        try {
            await push.sendNotification(sub, JSON.stringify(notification));
            console.log(`Confirm prompt successfully sent`);
            successfulNotifications++;
        } catch (err) {
            console.log(`Error sending confirm prompt: `, err);
            errors.push(`Error occurred when sending notification`);
        }
    }

    // Below code handles communicating back to controller
    const currentTime = getCurrentTimeStamp();
    const key = `${alarm.id}-${currentTime}`;
    alarmMap.set(key, [res, alarm.userId, dbSubscriptions.length, successfulNotifications, errors]);
    await delay(10);
    if (alarmMap.get(key)) {
        alarmMap.delete(key);
        return res.status(200).json({
            'confirmed': 'null',
            'totalSubscriptions': dbSubscriptions.length,
            'successfulNotifications': successfulNotifications,
            'errors': errors
        });
    }
}


/**
 * @openapi
 * /response:
 *   get:
 *     summary: Log user response to alarm confirmation
 *     description: Takes user response to the alarm confirmation and sends it back to the controller
 *     parameters:
 *       - in: query
 *         name: confirmed
 *         schema:
 *           type: boolean
 *         description: Whether the alarm has been confirmed or is a false alarm
 *       - in: query
 *         name: userId
 *         schema:
 *           type: int
 *         description: The user ID of the user giving response. (Replaced with token in future)
 *     responses:
 *       200:
 *         description: Response received by server
 *         example: Response received
 *         type:
 *           text/html
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Missing or incorrect parameters
 */
async function logResponse (req, res) {
    // Receives user response to the confirm alarm prompt and sends the response
    // TODO: Add validation on the query parameters per openAPI spec
    // TODO: Needs to retrieve user info based on tokens for selecting the correct response
    const params = req.query;
    if (!params.confirmed || !params.userId)
        return res.status(400).json({ 'error': 'Missing or incorrect parameters' });

    const userId = parseInt(params.userId);
    const confirmed = (params.confirmed === 'true'); // Since params are strings, this converts to the proper type
    for (const [key, value] of alarmMap) {
        console.log(value[1], userId);
        if (value[1] === userId) {
            value[0].status(200).json({
                'confirmed': confirmed,
                'totalSubscriptions': value[2],
                'successfulNotifications': value[3],
                'errors': value[4]
            });
            alarmMap.delete(key);
        }
    }
    return res.status(200).send('Response received');
}


/**
 * @openapi
 *
 * /alarm:
 *   post:
 *     summary: Configures new/existing alarms
 *     description: Sets up and configures new/existing alarms. Currently, hardcoded with no request body for alpha.
 *     responses:
 *       200:
 *         description: The alarm was successfully linked
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               description: Success message
 *               example: Alarm successfully linked
 *       404:
 *         description: Unable to find alarm or user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: The error that occurred
 *                   example: Unable to find alarm
 *       500:
 *         description: Unexpected error occurred
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: Unexpected error occurred
 *
 */
async function configureAlarm (req, res) {
    // This will be used in the future for setting up and configuring existing alarms. Currently just hardcoded for alpha
    const alarm = await db.alarm.findOne({ where: { alarmSerial: '1' } });
    try {
        if (alarm) {
            db.user.findOne({ where: {username: 'bcsotty'} }).then(user => {
                if (user) {
                    user.setAlarm(alarm)
                        .then( () => {
                            console.log('Alarm 1 successfully linked to bcsotty');
                            return res.status(200).send('Alarm successfully linked');
                        })
                        .catch(err => {
                            console.error('Error linking alarm to bcsotty: ', err);
                            return res.status(500).send('Error linking alarm');
                        });
                } else {
                    res.status(404).json({ 'error': 'Unable to find user' });
                }
            });
        } else {
            return res.status(404).json({ 'error': 'Unable to find alarm' });
        }
    } catch (err) {
        console.log('Unknown error occurred: ', err);
        return res.status(500).json({ 'error': 'Unexpected error occurred' });
    }
}


module.exports = router;