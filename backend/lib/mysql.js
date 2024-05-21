const mysqlConfig = require('../config');
const mysql2 = require('mysql2');

let connection = null;

const getClient = () => {
    return connection;
}

exports.getClient = getClient;

const connect = () => {
    if (!connection) {
        connection = mysql2.createConnection(mysqlConfig);
    }
    return connection;
}

exports.connect = connect;
