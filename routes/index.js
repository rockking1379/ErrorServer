var express = require('express');
var router = express.Router();
var sqlite3 = require('sqlite3');
var fs = require('fs');

var ERROR_CREATE = 'CREATE TABLE IF NOT EXISTS Error(error_id INTEGER NOT NULL,error_time DATE NOT NULL, error_message VARCHAR(100) NOT NULL,error_stacktrace TEXT NOT NULL)';
var EVENT_CREATE = 'CREATE TABLE IF NOT EXISTS Event(event_id INTEGER NOT NULL, event_time DATE NOT NULL, event_message VARCHAR(100) NOT NULL, event_user_name VARCHAR(100) NOT NULL)';

router.get('/', function(req, res){
  res.status(200);
  res.send('this worked');
});

router.post('/', function(req, res) {
  //default to HTTP OK
  res.status(200);

  //check if log file would exist
  //process the log
  var relPathToFile = './data/db/' + req.body.log_date + '.db';

  fs.open(relPathToFile, 'wx', function(err, fd){
    if(err)
    {
      console.log(err);
      res.status(500);
      res.send();
    }
    else
    {
      fs.close(fd, function(err){
        if(err){
          console.log(err);
          res.status(500);
          res.send();
        }
        else
        {
          processLog(req, res);
        }
      });
    }
  });

  //send response back
});

function processLog(logRequest, logResponse){
  var log = logRequest.body;
  var relPathToFile = './data/db/' + log.log_date + '.db';
  fs.realpath(relPathToFile, function(error, path){
    if(error)
    {
      logResponse.status(500);
      console.error('file path invalid');
    }
    else
    {
      var db = new sqlite3.Database(path);

      db.exec(ERROR_CREATE, function(err){
        if(err)
        {
          logResponse.status(500);
          console.log(err);
        }
        else
        {
          db.exec(EVENT_CREATE, function(err){
            if(err)
            {
              logResponse.status(500);
              console.log(err);
            }
            else
            {
              log.errors.forEach(function(element, index, array){
                db.run("INSERT INTO Error(error_id, error_time, error_message, error_stacktrace) VALUES(?,?,?,?)",
                    [element.error_id, element.error_time, element.error_message, element.error_stacktrace], function(err){
                      if(err)
                      {
                        logResponse.status(500);
                        console.log(err);
                      }
                    });
              });

              log.events.forEach(function(element){
                db.run("INSERT INTO Event(event_id, event_time, event_message, event_user_name) VALUES(?,?,?,?)", [element.event_id, element.event_time, element.event_message, element.event_user_name], function(err){
                  if(err)
                  {
                    logResponse.status(500);
                    console.log(err);
                  }
                });
              });
            }
          });
        }
      });
    }
  });

  logResponse.send();
}

module.exports = router;
