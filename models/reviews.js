// Load required packages
var mongoose = require('mongoose');

// Define our beer schema
var Schema = mongoose.Schema;
var reviewSchema = new Schema({
	user_id: { type: String, required: true },
	class_id: { type: String, required: true },
	rating: { type: String, required: true },
	text: { type: String, required: true },
	average_gpa: String,
	workload
});

// Export the Mongoose model
module.exports = mongoose.model('review', reviewSchema);
