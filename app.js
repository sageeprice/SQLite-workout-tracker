//////////////////////////////////////////////////////
// Imports used.
//////////////////////////////////////////////////////

// Use express framework, name it app.
const express = require('express');
// bodyParser for parsing forms
const bodyParser = require('body-parser');
// handlebars for templating
var hbs = require('express-handlebars');
// Module for url parsing.
var url = require('url');

// Import sqlite3 to interact with sqlite via Node.
const sqlite3 = require('sqlite3').verbose();
// Load file system module, needed to read form file.
const fs = require('fs');
// Initialize app with Express
const app = express();


//////////////////////////////////////////////////////
// SET UP express app and routing
//////////////////////////////////////////////////////

// Define handlebars default layout.
app.engine('handlebars', hbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// Use the bodyParser to read POST of form data.
app.use(bodyParser.urlencoded({ extended: false}));

////// Routing
// Default path.
app.get('/', (req, res) => displayLiftsFromTemplate(res));

app.get('/addLift', (req, res) => addLiftFromTemplate(res));

// Form submission
app.post('/liftSets', function(req, res) {
  storeAllWorkouts(req, res);
});

// Query for filtered data
app.get('/query', (req, res) => querySpecific(res));
app.get('/filteredLifts', (req, res) => queryWithFilters(req, res));

app.get('/css/*', (req, res) => readResource(req, res, 'css'));
app.get('/js/*', (req, res) => readResource(req, res, 'javascript'));

// Function to respond with requested resource of the given type.
function readResource(req, res, resourceType) {
  // Current requests include a / at the beginning, drop it.
  fs.readFile(req.originalUrl.substr(1), function (err, data) {
    if (err) {
      console.log(err);
      res.writeHead(400);
      res.end();
      return;
    }
    res.writeHead(200, {"Content-Type": "text/" + resourceType});
    res.write(data);
    res.end();
  });
}


app.get('*', function(req, res) {
  res.writeHead(404);
  res.end();
});


// Listen on port 8000
app.listen(8000, () => console.log('App listening on port 8000!'));



//////////////////////////////////////////////////////
// Application logic, interacting with database.
//////////////////////////////////////////////////////
// TODO: move this logic into a separate file.

// The set of valid lifts that can be performed.
const lifts = ['deadlift', 'bench press', 'squats', 'pull-ups'];

// Opens connection to local SQLite file.
function getConnection() {
  return new sqlite3.Database('./test.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.error(err.message);
    }
  });
}

// Writes workouts to DB and redirects to home page.
// Note: accepts multiple workouts as an array.
function storeAllWorkouts(req, res) {
  const b = req.body;

  console.log(b);
  var sets = [];
  for (i = 0; i < Object.keys(b).length / 3; i++) {
    if (!lifts.includes(b["exercise_"+i])) {
      return res.status(422).send(
          'Cannot save workout, got poorly formatted exercise name:'
          + b["exercise_"+i]);
    }
    sets.push({
      e: b["exercise_"+i],
      w: b["weight_"+i],
      r: b["reps_"+i],
      d: (new Date).getTime(),
    });
  }
  console.log(sets);

  var flattenedSets = [];
  sets.forEach(function(set) {
    flattenedSets.push(set.e);
    flattenedSets.push(set.r);
    flattenedSets.push(set.w);
    flattenedSets.push(set.d);
  });
  const sql = getLiftInsertStatement(sets.length);
  console.log(sql);
  getConnection().run(sql, flattenedSets, function(err) {
    if (err) {
      return console.error(err.message);
    }
    console.log(`Inserted row with row ID ${this.lastID}`);
  }).close((err) => {
    if (err) {
      return console.error(err.message);
    }
    // PRG pattern: https://en.wikipedia.org/wiki/Post/Redirect/Get
    return res.redirect("/");
  });
}

function getLiftInsertStatement(setCount) {
  var sql = `INSERT INTO lifts(type, reps, weight, creationDate) VALUES(?, ?, ?, ?)`;
  // Start at 1 since query already has one VALUES(..).
  for (i = 1; i < setCount; i++) {
    sql += `, (?, ?, ?, ?)`;
  }
  sql += `;`;
  return sql;
}


// Retrieve workouts from DB, insert into template and display.
function displayLiftsFromTemplate(res) {

  // Accumulator object for workouts, matches template.
  var data = {workout: []}

  let db = getConnection();
  let sql = `SELECT * FROM lifts`;
  db.each(sql, [], (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    // Load lift into workout object.
    data.workout.push({
      type: row.type,
      reps: row.reps,
      weight: row.weight,
      liftTime: new Date(row.creationDate)
    });
  }).close((err) => {
    if (err) {
      return console.error(err.message);
    }
    // Render extracted data with hbs.
    res.render('home', data);
  });
}

function addLiftFromTemplate(res) {
  res.render('addLift');
}

function querySpecific(res) {
  res.render('query');
}

function queryWithFilters(req, res) {
  console.log("Received request for resource: " + req.originalUrl);
  // Use true to parse Query String.
  console.log(url.parse(req.originalUrl, true));

  const queryParams = url.parse(req.originalUrl, true).query;
  let sql = buildQuery(queryParams);
  console.log("Searching with query: " + sql);

  getConnection().each(sql, [], (err, row) => {
    if (err) {
      return console.error(err.message);
    }

    const liftTime = new Date(row.creationDate);
    res.write(`<div>${row.type} for ${row.reps} reps at ${row.weight} on ${liftTime}</div>`);
  }).close((err) => {
    if (err) {
      return console.error(err.message);
    }
    res.end();
  });
}

// Construct a SELECT query from the given parameters.
function buildQuery(params) {
  var query = 'SELECT * FROM lifts';
  if (Object.keys(params).length !== 0) {
    query += ' WHERE ';
    var clauses = [];
    Object.keys(params).forEach(p =>
        clauses.push(`${p} = "${params[p].replace('+', ' ')}"`));
    query += clauses.join(' AND ');
  }
  return query;
}


// Retrieve workouts from file, and output as list.
// Manually generates the HTML page.
// DEPRECATED: keeping this around for posterity/reference.
function displayWorkouts(res) {
 let db = getConnection();
 // Set the response HTTP header with HTTP status and Content type
 res.writeHead(200, {'Content-Type': 'text/html'});

 let sql = `SELECT * FROM lifts`;

 db.each(sql, [], (err, row) => {
   if (err) {
     return console.error(err.message);
   }

   const liftTime = new Date(row.creationDate);

   res.write(`<div>${row.type} for ${row.reps} reps at ${row.weight} on ${liftTime}</div>`);
 }).close((err) => {
   if (err) {
     return console.error(err.message);
   }
   // TODO: stylize link.
   res.write('<a href="/form">Add a lift</a>');
   // Send the response.
   res.end();
 });
}

