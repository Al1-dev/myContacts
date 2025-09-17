if (process.env.NODE_ENV !== 'production') {
    require("dotenv").config();
}
const path = require("path")
const fs = require("fs")
const express = require("express");
const setupSwagger = require('./swagger');
const mongoose = require("mongoose");
const authRouter = require("./routers/auth");
const contactRouter = require("./routers/contacts");
const cors = require("cors")
const app = express();
const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };
const PORT = process.env.PORT || 3e3;
console.log(`Starting a server at ${PORT}`)
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, '0.0.0.0');
}
app.use(express.json());
app.use(cors())
app.use("/auth", authRouter);
app.use("/contacts", contactRouter);
setupSwagger(app);
async function run() {
    const uri = process.env.MONGO_DB_URI || process.env.MONGODB_URI || "";
    if (uri === "") {
        console.error("need url for mongo connection")
        return
    }
    await mongoose.connect(uri, clientOptions);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
}
run().catch(console.dir);
module.exports = app;