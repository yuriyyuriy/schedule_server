//Default route
/*var express = require('express');
var router = express.Router();
var app = express();

var port = process.env.PORT || 3000;
console.log("Express server running on " + port);

app.use('/api', router);
var homeRoute = router.route('/');
homeRoute.get(function(req, res) {
      res.json({ message: 'Hello World!' });
      console.log("get here");
});

app.listen(process.env.PORT || port);
*/


// Get the packages we need
var express = require('express');
var mongoose = require('mongoose');
var Tasks = require('./models/tasks.js');
var Users = require('./models/users.js');
var bodyParser = require('body-parser');
var router = express.Router();

//replace this with your Mongolab URL
mongoose.connect('mongodb://yuriyt:498rk@ds021010.mlab.com:21010/cs498rk_mp4');




var users_model = mongoose.model('users', Users);
var tasks_model = mongoose.model('tasks', Tasks);


// Create our Express application
var app = express();

// Use environment defined port or 3000
var port = process.env.PORT || 8080;

//Allow CORS so that backend and frontend could pe put on different servers
var allowCrossDomain = function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept");
  next();
};
app.use(allowCrossDomain);

// Use the body-parser package in our application
app.use(bodyParser.urlencoded({
  extended: true
}));

// All our routes will start with /api
app.use('/api', router);

//Default route here

//Llama route

var usersRoute= router.route('/users');
var usersIDRoute= router.route('/users/:id');
var tasksRoute= router.route('/classes');
var tasksIDRoute= router.route('/classes/:id');
var reviewsRoute= router.route('/reviews');
var tasksIDRoute= router.route('/reviews/:id');
var verificationRoute= router.route('/verify');


usersRoute.get(function(req, res) {
	where={};
	limit=0;
	skip=0;
	sort={};
	select={};
	if (req.query['where']){
		where= JSON.parse(req.query['where']);
	}
	if (req.query['limit']){
		limit= parseInt(req.query['limit']);
	}
	if (req.query['sort']){
		sort= JSON.parse(req.query['sort']);
	}
	if (req.query['select']){
		select= JSON.parse(req.query['select']);
	}
	if (req.query['skip']){
		skip= parseInt(req.query['skip']);
	}


	var cur_query= users_model.find(where).
	limit(limit).
	sort(sort).
	select(select).
	skip(skip);
	var callback= function(err,users){
		if (err){
	        res.status(500).json({ message: 'Database error', data: []});
        	res.end();
	    }
	    else{
	    	res.json({"message":"OK", "data":users});
		}
	};
	if ((req.query['count']=="true")|(req.query['count']=='"true"')){
		cur_query.count().exec(callback);
	}
	else{
		cur_query.exec(callback);
	}
  
});
usersRoute.post(function(req, res) {
	if((req.body.username==null)||(req.body.email==null)||(req.body.password==null)){
		res.status(500).json({message: "You need both a username, password and email", data: []});
	}
	else{
		users_model.findOne({ 'email': req.body.email }, function(err, user){
			if (user){
				res.status(500).json({message: "Email already exists, please choose another one", data: []});
			}
			else{
				users_model.findOne({ 'username': req.body.username }, function(err, user){
					if (user){
						res.status(500).json({message: "Username already exists, please choose another one", data: []});
					}
					else{
						var user = new users_model();
					    user.name = req.body.username;
					    user.email= req.body.email;
					    user.password= req.body.password;

					    // save the bear and check for errors
					    user.save(function(err) {
					        if (err){
					            res.status(500).json({ message: 'Database error', data: []});
		        				res.end();
		        			}
		        			else{
					        	res.status(201).json({ message: 'User created with name '+user.username+' and email '+user.email, data: user });
					    	}
					    });
					}
				});
			}
		});
	}
});
usersRoute.options(function(req, res) {
	res.writeHead(200);
    res.end();
});
usersIDRoute.get(function(req, res) {
	users_model.findById(req.params.id, function(err, user) {
            if (err){
                res.status(500).json({ message: 'Database error', data: []});
            	res.end();
            }
            else if(!user){
            	res.status(404).json({ message: 'User not found', data: []});
            }
            else{
            	res.json({ message:'OK', data:user});
            }
    });
});
usersIDRoute.put(function(req, res) {
	users_model.findById(req.params.id, function(err, user) {
		if (!user){
			res.status(404).json({ message: 'User not found', data: []});
		}
		else{
	        if (err)
	            res.status(500).json({ message: 'Database error', data: []});
        	else if((req.body.name==null)||(req.body.email==null)){
				res.status(500).json({message: "You need both a name and an email to update", data: []});
			}
			else{ 	
		        user.username = req.body.username;
		        user.email= req.body.email


	    		users_model.findOne({ $or: [ { 'email': req.body.email }, { 'username': req.body.username } ] }, function(err, i_user){
	    			if (err){
		            	res.status(500).json({ message: 'Database error', data: []});
					}
					else{
		    			if ((i_user)&&(i_user._id!=req.params.id)){
							res.status(500).json({message: "Email or Username already exists, please choose another one", data: []});
						}
						else{
		        			user.save(function(err) {
				            if (err){
				            	res.status(500).json({ message: 'Database error', data: []});
        						res.end();
        					}
        					else{
				            	res.json({ message: 'User updated', data:user });
				        	}
				        	});
				        }
			    	}
			    });
    		}
    	}

    });
});
usersIDRoute.delete(function(req, res) {
	users_model.remove({
            _id: req.params.id
        }, function(err, user) {
            if (err){
                res.status(500).json({ message: 'Database error', data: []});
            }
            else if ((user==null)||(user==undefined)){
            	res.status(404).json({ message: 'User not found', data: []});
            }
            else if(user.result.n === 0){
            	res.status(404).json({ message: 'User not found', data: []});
            }
            else{
            	res.status(200).json({ message: 'User deleted', data: [] });
        	}
    });
});

verificationRoute.post(function(req, res) {
	if((req.body.username==null)||(req.body.password==null)){
		res.status(500).json({message: "You need both a username and password to verify", data: []});
	}
	else{
		User.findOne({ username: req.body.username }, function(err, user) {
	        if (err){
                res.status(500).json({ message: 'Database error', data: []});
            }

	        // test a matching password
	        user.comparePassword(req.body.password, function(err, isMatch) {
	            if (err){
                	res.status(500).json({ message: 'Database error', data: []});
            	}
            	else{
            		if (!isMatch){
            			res.status(404).json({ message: 'User/Password pair not found', data: []});
            		}
            		else{
            			res.status(200).json({ message: 'Password verified', data: []});
            		}
            	}
	        });
    	});
	}

}

// Start the server
app.listen(port);
console.log('Server running on port ' + port);

