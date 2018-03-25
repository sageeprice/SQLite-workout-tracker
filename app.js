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
app.get('/', (req, res) => renderAllLifts(res));

// Record new lifts.
app.get('/addLift', (req, res) => res.render('addLift'));
app.post('/liftSets', function(req, res) {
  storeAllWorkouts(req, res);
});

// Query for filtered data.
app.get('/query', (req, res) => res.render('query'));
app.get('/filteredLifts', (req, res) => queryWithFilters(req, res));

app.get('/chart', (req, res) => res.render('chart'));

app.get('/css/*', (req, res) => readResource(req, res, 'css'));
app.get('/js/*', (req, res) => readResource(req, res, 'javascript'));

// Function to respond with requested resource of the given type.
function readResource(req, res, resourceType) {
  // Current requests include a / at the beginning, drop it.
  fs.readFile(req.originalUrl.substr(1), function (err, data) {
    if (err) {
      console.error(err);
      res.writeHead(400);
      res.end();
      return;
    }
    res.writeHead(200, {"Content-Type": "text/" + resourceType});
    res.write(data);
    res.end();
  });
}

// TODO: handle mal-formed page requests more elegantly.
app.get('*', function(req, res) {
  console.log('Resource requested at URL:' + JSON.stringify(url.parse(req.originalUrl, false)));
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

  var flattenedSets = [];
  sets.forEach(function(set) {
    flattenedSets.push(set.e);
    flattenedSets.push(set.r);
    flattenedSets.push(set.w);
    flattenedSets.push(set.d);
  });
  const sql = buildInsertQuery(sets.length);
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

function buildInsertQuery(setCount) {
  var sql = `INSERT INTO lifts(type, reps, weight, creationDate) VALUES(?, ?, ?, ?)`;
  // Start at 1 since query already has one VALUES(..).
  for (i = 1; i < setCount; i++) {
    sql += `, (?, ?, ?, ?)`;
  }
  sql += `;`;
  return sql;
}

// Queries database for all lifts, renders as a list of text divs.
function renderAllLifts(res) {
  queryAndRender(buildSelectQuery({}), res);
}

// Queries database for all lifts fitting criteria specified in req.
function queryWithFilters(req, res) {
  // Use true to parse Query String.
  const queryParams = url.parse(req.originalUrl, true).query;
  queryAndRender(buildSelectQuery(queryParams), res, false);
}

// Queries DB with given SQL, and renders result as a list of text-filled divs.
// When optional parameter useLayout is set to false, the base page layout is
// not rendered as part of the response.
function queryAndRender(sql, res, useLayout = true) {
  // Accumulator object for workouts, matches template.
  var data = { workout: [] };
  // Base layout is not rendered when layout is set to false.
  if (!useLayout) {
    data.layout = false;
  }

  getConnection().each(sql, [], (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    // Load lift into workout object.
    data.workout.push({
      type: row.type,
      reps: row.reps,
      weight: row.weight,
      liftTime: formatDate(new Date(row.creationDate)),
    });
  }).close((err) => {
    if (err) {
      return console.error(err.message);
    }
    res.render('home', data);
  });
}

// Construct a SELECT query from the given parameters.
function buildSelectQuery(params) {
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

// Helper function to convert JS date to yyyy-mm-dd formatted string.
function formatDate(d) {
  var day = '' + d.getDate();
  var month = '' + (d.getMonth() + 1);
  var year = '' + d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
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

