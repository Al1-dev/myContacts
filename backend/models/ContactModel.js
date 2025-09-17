const mongoose = require("mongoose");
const { Schema } = mongoose;
const ContactSchema = new Schema({
    firstName: String,
    lastName: String,
    phone: String,
    userId: String
})
const Contact = mongoose.model('Contact', ContactSchema);
module.exports = Contact;