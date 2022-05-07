import mongoose from "mongoose";
import timespan, { TimeSpan } from "timespan";

const intervalSchema = new mongoose.Schema({
    begin: {
        type: Date,
        required: true,
    },
    end: {
        type: Date,
        required: true,
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
        console.log(a.add);
        // TODO: correctly copy the timespan
        a = { ...a };
        console.log(a.add);
        // a.add(b);
        return a;
    }, new TimeSpan(0));
}

// function addIntervals(a, b) {
//     const start = a.start;
//     if (b.start < start) start = b.start;

//     const end = a.end;
//     if (end != null && (b.end == null || b.end > end)) end = b.end;
//     return { start: start, end: end };
// }

// function sumIntervals(intervals) {
//     if (intervals.length == 0) return null;
//     if (intervals.length == 1) return { ...intervals[0] };
//     let a = { ...intervals[0] };
//     for (let i = 1; i < intervals.length; i++) {
//         b = intervals[i];
//         a = addIntervals(a, b);
//     }
//     return a;
// }

// function addDuration(a, b) {
//     if (a.end == null || b.end == null) return null;

//     a.d;

//     const start = a.start;
//     if (b.start < start) start = b.start;

//     const end = a.end;
//     if (end != null && (b.end == null || b.end > end)) end = b.end;
//     return { start: start, end: end };
// }

// function sumDuration(intervals) {}

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
const Task = mongoose.model("Task", taskSchema);

export default Task;
