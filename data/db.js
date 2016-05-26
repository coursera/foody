"use strict";

const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const state = {
  connection: null,
  connected: false,
  connecting: false,
  status: null,
};

exports.connect = (dbFile) => {
  if (!state.connected && !state.connecting) {
    state.connecting = true;
    state.connection = new sqlite3.Database(dbFile);

    state.connection.on('error', (e) => {
      state.connecting = false;
      state.connected = false;
      throw new Error(e);
    });

    state.connection.on('open', () => {
      state.connecting = false;
      state.connected = true;
    });
  }

  return state.connection;
};

exports.state = state;

exports.getOne = (sql, params) => {
  return new Promise((resolve, reject) => {
    state.connection.get(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

exports.getAll = (sql, params) => {
  return new Promise((resolve, reject) => {
    state.connection.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

exports.serialize = (func) => {
  return new Promise((resolve, reject) => {
    try {
      resolve(state.connection.serialize(func));
    } catch (err) {
      reject(err);
    }
  });
};

exports.run = (sql, params) => {
  return new Promise((resolve, reject) => {
    // can't use es6 because it overrides 'this' from sqlite3
    state.connection.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this);
      }
    });
  });
};
