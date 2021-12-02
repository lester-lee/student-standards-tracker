/*
 * For each course in the `courses` directory,
 * read through the roster to get list of students.
 * For each student, copy `standards.csv` to `students`
 */
const fs = require("fs");
const path = require("path");
const stringify = require("csv-stringify/lib/sync");
const { getCourses } = require("../lib/util");

const DUMMY = true; // TODO: Should probably use yargs but this works for now

/**
 * Generates masteries and converts @standards to csv
 * @param standards array of standards objects
 */
const generateMasteries = (standards) => {
  standards.forEach((s) => {
    s.mastery = DUMMY ? Math.floor(Math.random() * 4) : 0;
    if (s.mastery < 3) {
      s.mastery += Math.random() > 0.9 ? 1 : 0;
    } // So not as many 0s
  });
  return standards;
};

//-----------------------------
// Main Script
//-----------------------------

// Get array of courses
const courses = getCourses();
console.log(
  `Generating blank standards for students in: ${courses.map((c) => c.name)}`
);

// Process students/standards for each course
courses.forEach((course) => {
  // Write new first_last.csv for each student into students directory
  course.roster.forEach((student) => {
    // Needs to be different for each student so generateMasteries called here
    const standardsString = stringify(generateMasteries(course.standards), {
      header: true,
    });
    const studentPath = path.join(
      course.path,
      "students",
      `${student.first}_${student.last}.csv`
    );
    fs.writeFile(studentPath, standardsString, (error) => {
      if (error) {
        console.error(
          `Error writing standards for ${student.first} ${student.last} in ${course.name}`
        );
        throw error;
      }
      console.log(
        `Initialized standards for ${student.first} ${student.last} in ${course.name}`
      );
    });
  });
});
