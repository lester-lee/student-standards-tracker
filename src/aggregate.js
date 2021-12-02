const fs = require("fs");
const path = require("path");
const parse = require("csv-parse/lib/sync");
const { getCourses } = require("../lib/util");

// Get array of courses
const courses = getCourses();

// Get stats on student standards
courses.forEach((course) => {
  // Load all student data
  let allStudentStandards = [];
  course.roster.forEach((student) => {
    const studentPath = path.join(
      course.path,
      "students",
      `${student.first}_${student.last}.csv`
    );
    const studentString = fs.readFileSync(studentPath).toString();
    const studentStandards = parse(studentString, {
      columns: true,
      skip_empty_lines: true,
    });
    allStudentStandards.push(studentStandards);
  });

  // Calculate stats for all students

  const meanStandards = allStudentStandards.reduce((prev, cur) => {
    for (let i = 0; i < prev.length; i++) {
      prev[i].mastery = parseInt(prev[i].mastery) + parseInt(cur[i].mastery);
    }
    return prev;
  });

  const numStudents = course.roster.length;
  meanStandards.map((standard) => (standard.mastery /= numStudents));

  course.standards = meanStandards;
});

// Write metadata to courses.json
fs.writeFile("data/courses.json", JSON.stringify(courses), (error) => {
  if (error) {
    console.error(error);
  } else {
    console.log(`Wrote courses to data/courses.json.`);
  }
});
