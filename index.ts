const express = require("express");
const bodyparser = require("body-parser");
const app = express();
const http = require("http");
const server = new http.Server(app);
const port = 3000;
const helmet = require("helmet");
const path = require("path");
const morgan = require("morgan");
const push = require('web-push');
const multer = require('multer');
const upload = multer();
const root_dir = path.dirname(require.main.filename);

app.use(helmet());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static('static'));
app.use(morgan('combined'));

let vapid_keys = {
    publicKey: "BDNhhvCejJLGp8C1DSl0rzwdmONmv7EsfJTk0TG0flkvmvacsY9IkufqR63Ykfs8o-goFKEYxra7vUwxBURj8rs",
    privateKey: "VsKnDHOzOdt3sEzaW6OYcbk4b-k_nFqeMkcgDS5Cq34"
};
push.setVapidDetails('mailto:FAASeniorDesign@umich.edu', vapid_keys.publicKey, vapid_keys.privateKey);

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');
    next();
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
})

//pre-flight requests
app.options('*', function(req, res) {
    res.sendStatus(200);
});

app.all('/', (req, res) => {
    if (req.method === 'GET') {
        let pth = path.join(root_dir + '/index.html');
        res.sendFile(pth);
    }
    res.end();
});

app.post('/notify', upload.array(), (req, res, next) => {
    // TODO Need to add security to ensure only the fire alarm server can call this endpoint
    const body = req.body;
    const sub = body.sub;
    const notification = body.notification;

    console.log(notification);
    console.log(JSON.stringify(notification));
    push.sendNotification(sub, JSON.stringify(notification))
        .then((response) => {
            console.log("Received push response: ", response);
            return res.json(response);
        });
    // return res.json({});
});

server.listen(port, (err) => {
    if (err) {
        throw err;
    }
    /* eslint-disable no-console */
    console.log('Server listening for connections at http://127.0.0.1:' + port);
});

module.exports = server;