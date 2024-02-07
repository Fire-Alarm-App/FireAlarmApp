// noinspection TypeScriptValidateTypes

// Server setup
const express = require('express');
const root_dir = require("app-root-path");
const app = express();

// Swagger UI imports
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require('swagger-ui-express');

// Importing middlewares
const helmet = require('helmet');
const bodyParser = require('body-parser');
const cors = require('cors');
const errorhandler = require('errorhandler');
const morganMiddleware = require(`${root_dir}/src/middleware/logging.js`);

// Environment/Configuration details
const env = process.env.NODE_ENV || 'development'
const config = require(`${root_dir}/src/config/config.json`)[env];
const port = config.port;
const options = {
    "definition": {
        "openapi": "3.1.0",
        "info": {
            "title": "Blaze: Your Smart Home Fire Alarm",
            "version": "0.1.0",
            "description": "The web API for the Blaze smart home fire alarm",
            "license": {
                "name": "MIT",
                "url": "https://spdx.org/licenses/MIT.html"
            },
            "contact": {
                "name": "Blaze",
                "url": "",
                "email": "FAASeniorDesign@umich.edu"
            }
        },
        "servers": [
            {
                "url": `http://127.0.0.1:${port}`
            }
        ]
    },
    "apis": ["./src/controllers/*.js"]
};

// Routes
const pwa = require(`${root_dir}/src/controllers/pwa.controller.js`);

// DB Stuff
const db = require(`${root_dir}/src/models`);

// Applying middlewares.
app.use(helmet());
// Remove below app.use once in production, only use for testing
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "connect-src": ["'self'", `http://localhost:${port}`]
        }
    })
);
app.use(cors());
if (env === "development")
    app.use(errorhandler());

app.use(morganMiddleware);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Pre-flight requests
app.options('*', function(req, res) {
    res.sendStatus(200);
});


// Applying routes
app.use("/", pwa);

// Setting up Swagger Docs
const openApiSpecification = swaggerJsdoc(options);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiSpecification));

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
