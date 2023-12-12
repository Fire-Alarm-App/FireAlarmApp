'use strict';

const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');

const basename = path.basename(path.join(import.meta.path, "index.js"));
const env = process.env.NODE_ENV || 'development';
const config = require(import.meta.path + '/../config/config.json')[env];
const db = {};
let sequelize;

if (config.use_env_variable) {
    sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
    const db_info = config.database;
    sequelize = new Sequelize(db_info.database, db_info.user, db_info.password, { dialect: 'mysql' });
}

fs
    .readdirSync(import.meta.path)
    .filter(file => {
        return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
    })
    .forEach(file => {
        const model_func = require(path.join(import.meta.path, file))
        const model = model_func(sequelize, Sequelize.DataTypes);
        db[model.name] = model;
    });

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Loading test data for demo purposes
insertTestData();

async function insertTestData() {
    const users = await db.user.findAll()
    if (users.length === 0) {
        db.user.create({ firstName: 'Brett', lastName: 'Csotty', username: 'bcsotty', password: '123' });
        db.user.create({ firstName: 'Nico', lastName: 'Bokhari', username: 'nbokhari', password: '123' });
    }
}

module.exports = db;