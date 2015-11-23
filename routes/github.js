/**
 * Created by James on 11/22/2015.
 */
var spawn = require('child_process').spawn;

var express = require('express');
var router = express.Router();

router.post('/', function (req, res){
   spawn('sh', ['./hooks/post-receive']);

    res.status(200);
    res.send();
});

module.exports = router;