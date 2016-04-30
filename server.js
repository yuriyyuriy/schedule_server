// Get the packages we need
var express = require('express');
var mongoose = require('mongoose');

var Classes = require('./models/classes.js');
var Reviews = require('./models/reviews.js');
var Users = require('./models/users.js');

var bodyParser = require('body-parser');
var router = express.Router();

//replace this with your Mongolab URL
mongoose.connect('mongodb://yuriyt:498rk@ds021010.mlab.com:21010/cs498rk_mp4');





var users_model = mongoose.model('users', Users);
var classes_model = mongoose.model('classes', Classes);
var reviews_model = mongoose.model('reviews', Reviews);


// Create our Express application
var app = express();

// Use environment defined port or 3000
var port = process.env.PORT || 3000;

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
var classesRoute= router.route('/classes');
var classesIDRoute= router.route('/classes/:id');
var reviewsRoute= router.route('/reviews');
var reviewsIDRoute= router.route('/reviews/:id');
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

});

/*
GET/POST routes for the classes



*/
classesRoute.get(function(req, res) {
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


	var cur_query= classes_model.find(where).
	limit(limit).
	sort(sort).
	select(select).
	skip(skip);
	var callback= function(err,classes){
		if (err){
	        res.status(500).json({ message: 'Database error', data: []});
        	res.end();
	    }
	    else{
	    	res.json({"message":"OK", "data":classes});
		}
	};
	if ((req.query['count']=="true")|(req.query['count']=='"true"')){
		cur_query.count().exec(callback);
	}
	else{
		cur_query.exec(callback);
	}
  
});
classesRoute.post(function(req, res) {
	if((req.body.crn==null)||(req.body.condensed==null)||(req.body.full_name==null)||(req.body.year==null)||(req.body.semester==null)){
		res.status(500).json({message: "You're missing certain information about the class", data: []});
	}
	else{
		classes_model.findOne({ 'crn': req.body.crn, 'year': req.body.year, 'semester': req.body.semester }, function(err, found_class){
			if (found_class){
				res.status(500).json({message: "This class for the year/semester already exists, please choose another one", data: []});
			}
			else{
				var new_class = new classes_model();
			    new_class.crn = req.body.crn;
				new_class.condensed= req.body.condensed;
				new_class.full_name= req.body.full_name
				new_class.year = req.body.year;
				new_class.semester = req.body.semester;

				if (req.body.description){
					new_class.description= req.body.description;
				}

			    // save the bear and check for errors
			    new_class.save(function(err) {
			        if (err){
			            res.status(500).json({ message: 'Database error', data: []});
        				res.end();
        			}
        			else{
			        	res.status(201).json({ message: 'Class created with crn '+new_class.crn, data: new_class });
			    	}
			    });
			}
		});
	}
});
classesRoute.options(function(req, res) {
	res.writeHead(200);
    res.end();
});
classesIDRoute.get(function(req, res) {
	classes_model.findById(req.params.id, function(err, found_class) {
            if (err){
                res.status(500).json({ message: 'Database error', data: []});
            	res.end();
            }
            else if(!found_class){
            	res.status(404).json({ message: 'Class not found', data: []});
            }
            else{
            	res.json({ message:'OK', data:found_class});
            }
    });
});
classesIDRoute.put(function(req, res) {
	classes_model.findById(req.params.id, function(err, found_class) {
		if (!found_class){
			res.status(404).json({ message: 'Class not found', data: []});
		}
		else{
	        if (err)
	            res.status(500).json({ message: 'Database error', data: []});
        	else if((req.body.crn==null)||(req.body.year==null)||(req.body.semester==null)){
				res.status(500).json({message: "You need both a crn and year/semester to update", data: []});
			}
			else{ 	
		        found_class.crn = req.body.crn;
		        found_class.year = req.body.year;
		        found_class.semester= req.body.semester;
		        if (req.body.description){
		        	found_class.description= req.body.description;
		        }
		        if (req.body.full_name){
		        	found_class.full_name= req.body.full_name;
		        }
		        if (req.body.condensed){
		        	found_class.condensed= req.body.condensed;
		        }


	    		classes_model.findOne({ $and: [ { 'crn': req.body.crn }, { 'year': req.body.year }, { 'semester': req.body.semester } ] }, function(err, i_class){
	    			if (err){
		            	res.status(500).json({ message: 'Database error', data: []});
					}
					else{
		    			if ((i_class)&&(i_class._id!=req.params.id)){
							res.status(500).json({message: "CRN + Semester + Year combination already exists, please choose another one", data: []});
						}
						else{
		        			found_class.save(function(err) {
				            if (err){
				            	res.status(500).json({ message: 'Database error', data: []});
        						res.end();
        					}
        					else{
				            	res.json({ message: 'Class updated', data:found_class });
				        	}
				        	});
				        }
			    	}
			    });
    		}
    	}

    });
});
classesIDRoute.delete(function(req, res) {
	classes_model.remove({
            _id: req.params.id
        }, function(err, found_class) {
            if (err){
                res.status(500).json({ message: 'Database error', data: []});
            }
            else if ((found_class==null)||(found_class==undefined)){
            	res.status(404).json({ message: 'Class not found', data: []});
            }
            else if(found_class.result.n === 0){
            	res.status(404).json({ message: 'Class not found', data: []});
            }
            else{
            	res.status(200).json({ message: 'Class deleted', data: [] });
        	}
    });
});

/*
GET/POST routes for the reviews



*/
reviewsRoute.get(function(req, res) {
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


	var cur_query= reviews_model.find(where).
	limit(limit).
	sort(sort).
	select(select).
	skip(skip);
	var callback= function(err,reviews){
		if (err){
	        res.status(500).json({ message: 'Database error', data: []});
        	res.end();
	    }
	    else{
	    	res.json({"message":"OK", "data":reviews});
		}
	};
	if ((req.query['count']=="true")|(req.query['count']=='"true"')){
		cur_query.count().exec(callback);
	}
	else{
		cur_query.exec(callback);
	}
  
});
reviewsRoute.post(function(req, res) {
	if((req.body.user_id==null)||(req.body.class_id==null)||(req.body.rating==null)||(req.body.text==null)){
		res.status(500).json({message: "You're missing certain information about the reviews", data: []});
	}
	else{
		reviews_model.findOne({ 'crn': req.body.crn, 'year': req.body.year, 'semester': req.body.semester }, function(err, found_review){
			if (found_review){
				res.status(500).json({message: "This review already exists, please choose another one", data: []});
			}
			else{
				var new_review = new reviews_model();
			    new_review.user_id = req.body.user_id;
				new_review.class_id= req.body.class_id;
				new_review.rating= req.body.rating;
				new_review.text = req.body.text;

				if (req.body.average_gpa){
					new_review.average_gpa= req.body.average_gpa;
				}
				if (req.body.workload){
					new_review.workload= req.body.workload;
				}
			    // save the bear and check for errors
			    new_review.save(function(err) {
			        if (err){
			            res.status(500).json({ message: 'Database error', data: []});
        				res.end();
        			}
        			else{
			        	res.status(201).json({ message: 'New review created for '+new_review.class_id, data: new_review });
			    	}
			    });
			}
		});
	}
});
reviewsRoute.options(function(req, res) {
	res.writeHead(200);
    res.end();
});
reviewsIDRoute.get(function(req, res) {
	reviews_model.findById(req.params.id, function(err, found_review) {
            if (err){
                res.status(500).json({ message: 'Database error', data: []});
            	res.end();
            }
            else if(!found_class){
            	res.status(404).json({ message: 'Review not found', data: []});
            }
            else{
            	res.json({ message:'OK', data:found_review});
            }
    });
});
reviewsIDRoute.put(function(req, res) {
	reviews_model.findById(req.params.id, function(err, found_review) {
		if (!found_review){
			res.status(404).json({ message: 'Review not found', data: []});
		}
		else{
	        if (err)
	            res.status(500).json({ message: 'Database error', data: []});
        	else if((req.body.class_id==null)||(req.body.user_id==null)||(req.body.rating==null)||(req.body.text==null)){
				res.status(500).json({message: "You need both a more information about the review to update", data: []});
			}
			else{ 	
		        found_review.class_id = req.body.class_id;
		        found_review.user_id = req.body.user_id;
		        found_review.rating= req.body.rating;
		        found_review.text= req.body.text;
		        if (req.body.average_gpa){
		        	found_review.average_gpa= req.body.average_gpa;
		        }
		        if (req.body.workload){
		        	found_review.workload= req.body.workload;
		        }
		        if (req.body.condensed){
		        	found_class.condensed= req.body.condensed;
		        }


	    		reviews_model.findOne({ $and: [ { 'class_id': req.body.crn }, { 'user_id': req.body.year } ] }, function(err, i_review){
	    			if (err){
		            	res.status(500).json({ message: 'Database error', data: []});
					}
					else{
		    			if ((i_review)&&(i_review._id!=req.params.id)){
							res.status(500).json({message: "Cannot create another review for same class by same user", data: []});
						}
						else{
		        			found_review.save(function(err) {
				            if (err){
				            	res.status(500).json({ message: 'Database error', data: []});
        						res.end();
        					}
        					else{
				            	res.json({ message: 'Review updated', data:found_review });
				        	}
				        	});
				        }
			    	}
			    });
    		}
    	}

    });
});
reviewsIDRoute.delete(function(req, res) {
	reviews_model.remove({
            _id: req.params.id
        }, function(err, found_review) {
            if (err){
                res.status(500).json({ message: 'Database error', data: []});
            }
            else if ((found_review==null)||(found_review==undefined)){
            	res.status(404).json({ message: 'Review not found', data: []});
            }
            else if(found_review.result.n === 0){
            	res.status(404).json({ message: 'Review not found', data: []});
            }
            else{
            	res.status(200).json({ message: 'Review deleted', data: [] });
        	}
    });
});

// Start the server
app.listen(port);
console.log('Server running on port ' + port);

