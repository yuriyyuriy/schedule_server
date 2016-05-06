// Load required packages
var mongoose = require('mongoose');

// Define our beer schema
var Schema = mongoose.Schema;
var reviewSchema = new Schema({
	user_id: { type: String, required: true },
	class_name: { type: String, required: true },
	class_number: { type: String, required: true },
	difficulty: { type: String, required: true },
	text: { type: String, required: true },
	average_gpa: String,
	workload: String
});

// Export the Mongoose model
module.exports = mongoose.model('reviews', reviewSchema);
