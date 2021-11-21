const fs = require("fs");
const path = require("path");
const parse = require("csv-parse/lib/sync");

/** Return array of objects from parsing @csvPath */
exports.parseCsv = (csvPath) => {
  const string = fs.readFileSync(csvPath).toString();
  return parse(string, { columns: true, skip_empty_lines: true });
};

/**
 *  Return array of {course,path,standards,roster}
 *  of each course
 */
exports.getCourses = () => {
  const coursesPath = path.resolve("data/courses");
  const courses = fs.readdirSync(coursesPath);
  return courses.map((course) => {
    const coursePath = path.resolve(`data/courses/${course}`);
    const rosterPath = path.resolve(coursePath, "roster.csv");
    const standardsPath = path.resolve(coursePath, "standards.csv");
    const titlePath = path.resolve(coursePath, "TITLE");
    return {
      name: course,
      path: coursePath,
      roster: this.parseCsv(rosterPath),
      standards: this.parseCsv(standardsPath),
      title: fs.readFileSync(titlePath).toString(),
    };
  });
};
