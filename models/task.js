import mongoose from "mongoose";
import timespan, { TimeSpan } from "timespan";

const intervalSchema = new mongoose.Schema({
    begin: {
        type: Date,
        required: true,
    },
    end: {
        type: Date,
        // ongoing intervals have end = null
        validate: function (val) {
            return val == null ? true : val >= this.begin;
        },
    },
});

// TODO: Refactor to use Mongoose schema
function getDuration(interval) {
    if (interval.end == null) return null;
    return timespan.fromDates(interval.begin, interval.end);
}

function getTotalDuration(intervals) {
    const durations = intervals.map((i) => getDuration(i));
    return durations.reduce((a, b) => {
        a.add(b);
        return a;
    }, new TimeSpan(0));
}

const taskSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        default: "todo",
        enum: ["todo", "doing", "done"],
    },
    intervals: [intervalSchema],
});

// Anonymous function instead of arrow function to bind "this"
taskSchema.methods.workDuration = function () {
    return getTotalDuration(this.intervals);
};

// Plain Old JavaScript Object with Duration
taskSchema.methods.pojoWithDuration = function() {
    const duration = this.workDuration();
    const task = this.toObject();
    task.duration = duration;
    return task;
}
const Task = mongoose.model("Task", taskSchema);

export default Task;
