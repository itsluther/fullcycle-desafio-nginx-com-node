require('dotenv').config();
const mysql = require('mysql2/promise');
const express = require('express');
const faker = require('faker');

const dbClient = mysql.createPool(process.env.CONNECTION_STRING);
const app = express();
const port = process.env.PORT;

async function insertPeople(name) {
  const sql = 'INSERT INTO people(name) VALUES (?);';
  await dbClient.query(sql, name);
}

async function getPeoples() {
  let connection;
  try {
    connection = await dbClient.getConnection();
    const [rows] = await connection.query('SELECT id, name FROM people;');
    return rows;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

app.get('/', async (req, res) => {
  const name = faker.name.firstName();
  await insertPeople(name);
  const peoples = await getPeoples();

  let table = '<table>';
  table += '<tr><th>ID</th><th>Name</th></tr>';
  for (let people of peoples) {
    table += `<tr><td>${people.id}</td><td>${people.name}</td></tr>`;
  }
  table += '</table>';
  response = '<h1>Full Cycle Rocks!</h1>' + table;

  res.send(response);
});

process.on('SIGINT', () => {
  dbClient.end();
  process.exit();
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Running API on port: ${port}`);
});
