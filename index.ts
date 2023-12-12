// noinspection TypeScriptValidateTypes

// Server setup
const express = require('express');
const app = express();
const root_dir = require('app-root-path');

// Importing middlewares
const helmet = require('helmet');
const bodyParser = require('body-parser');
const cors = require('cors');
const errorhandler = require('errorhandler');
const { morganMiddleware } = require(`${root_dir}/src/middleware/logging.js`);

// Other imports
const path = require('path');

// Environment/Configuration details
const env = process.env.NODE_ENV || 'development'
const config = require(`${root_dir}/src/config/config.json`)[env];
const port = config.port;

// Routes
const pwa = require(`${root_dir}/src/controllers/pwa.controller.js`);

// DB Stuff
const db = require(`${root_dir}/src/models`);

// Applying middlewares.
app.use(helmet());
app.use(cors());
if (env === "development"){}
    app.use(errorhandler());

app.use(morganMiddleware);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Pre-flight requests
app.options('*', function(req, res) {
    res.sendStatus(200);
});

// Applying routes
app.use("/", pwa);

// Initialize DB models and start server
db.sequelize.sync({ force: false }).then(function () {
    app.listen(port, (err) => {
        if (err) {
            throw err;
        }
        /* eslint-disable no-console */
        console.log('Server listening for connections at http://127.0.0.1:' + port);
    });
});
