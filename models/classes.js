// Load required packages
var mongoose = require('mongoose');

// Define our beer schema
var Schema = mongoose.Schema;
var classSchema = new Schema({
	subject: { type: String, required: true },
	number: { type: String, required: true },
	full_name: { type: String, required: true },
	year: { type: String, required: true },
	start: { type: String, required: true },
	end: { type: String, required: true },
	days: { type: String, required: true },
	semester: { type: String, required: true },
	description: String,
	reviews: [String]
});

// Export the Mongoose model
module.exports = mongoose.model('classes', classSchema);
