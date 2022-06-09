const express = require("express");
const app = express();
const path = require("path");
var Rollbar = require("rollbar");

app.use(express.json());

var rollbar = new Rollbar({
    accessToken: "e3ca31e2a5ca4c9783e7edf758a44c54",
    captureUncaught: true,
    captureUnhandledRejections: true,
});

// record a generic message and send it to Rollbar
rollbar.error("Hello world!");

const students = ["Jimmy", "Timothy", "Jimothy"];

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/index.html"));
});

app.get("/api/students", (req, res) => {
    rollbar.info("Someone requested to see all students");
    res.status(200).send(students);
});

app.post("/api/students", (req, res) => {
    rollbar.info("Someone requested to add a new student");

    let { name } = req.body;

    const index = students.findIndex((student) => {
        return student === name;
    });

    try {
        if (index === -1 && name !== "") {
            students.push(name);
            res.status(200).send(students);
        } else if (name === "") {
            rollbar.log("Someone tried to add a student with an empty string");
            res.status(400).send("You must enter a name.");
        } else {
            rollbar.log("someone tried to add a duplicate student");
            res.status(400).send("That student already exists.");
        }
    } catch (err) {
        console.log(err);
    }
});

app.delete("/api/students/:index", (req, res) => {
    rollbar.info("Someone requested to delete a student");

    const targetIndex = +req.params.index;

    students.splice(targetIndex, 1);
    res.status(200).send(students);
});

const port = process.env.PORT || 5050;

app.listen(port, () => console.log(`Server listening on ${port}`));
