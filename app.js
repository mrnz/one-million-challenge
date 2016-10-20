var port = 8006,
		express = require('express'),
		app = express(),
		router = express.Router(),
		generateList = require('./scripts/generateList')();

app.use('/api', router);
app.use(express.static(__dirname + "/public")); 

router.get('/generateBooks/:amount',function(req, res, next){
  
  var amount = parseInt( Math.abs(req.params.amount) );
  amount = isNaN( amount ) ? 0 : amount;
  res.json( generateList( amount ) );
  
});

app.listen( port, () => console.info('App is listening quietly on port '+ port) );