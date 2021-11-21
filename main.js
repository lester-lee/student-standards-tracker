/*
 * Spaghetti code for now just to get the prototype up & working :)
 */
//-----------------------------
// State Management
//-----------------------------
let state = {
  courses: null,
  currentCourseIdx: 0,
  currentStandards: [],
};

//-----------------------------
// Setup
//-----------------------------
// Canvas options
let canvas = d3.select("#StandardsViz");
const WIDTH = 800;
const HEIGHT = 600;

const masteryColorScale = d3
  .scaleOrdinal()
  .domain(["0", "1", "2", "3"])
  .range(["#de425b", "#dbc667", "#79ab62", "#488f31"]);

// Set up legend
d3.select(".LegendKeys")
  .selectAll(".LegendKeys .Standard")
  .data([0, 1, 2, 3])
  .join("li")
  .attr("class", "Standard")
  .style("background-color", (d) => masteryColorScale(d))
  .append("span")
  .attr("class", "StandardLabel")
  .text(d => d);

// Load in course metadata
const courseSelector = document.querySelector("#CourseSelector");
const studentSelector = document.querySelector("#StudentSelector");
d3.json("data/courses.json").then((courses) => {
  state.courses = courses;
  updateCourseDropdown();
});

//-----------------------------
// Event Handlers
//-----------------------------
/** Creates an option with value and text set to @name */
const createOption = (name, value) => {
  let option = document.createElement("option");
  option.innerText = name;
  option.value = value;
  return option;
};

/** Creates an option for each course and update students */
const updateCourseDropdown = () => {
  state.courses.forEach((course, idx) => {
    courseSelector.appendChild(createOption(course.title, idx));
  });
  updateStudentDropdown();
};

/** Creates an option for each student in current course and load standards */
const updateStudentDropdown = () => {
  const students = state.courses[state.currentCourseIdx].roster.map((student) =>
    createOption(
      `${student.first} ${student.last}`,
      `${student.first}_${student.last}`
    )
  );
  studentSelector.replaceChildren(...students);
  const student = studentSelector.firstChild.value;
  loadStandards(student);
};

/** Updates current standards in state to match student */
const loadStandards = (student) => {
  // Get path of masteries for selected student
  const currentCourseName = state.courses[state.currentCourseIdx].name;
  const studentPath = `data/courses/${currentCourseName}/students/${student}.csv`;

  d3.csv(studentPath, d3.autoType).then((standards) => {
    state.currentStandards = standards;
    render();
  });
};

/** Change current course and update students / standards. */
courseSelector.addEventListener("change", (event) => {
  state.currentCourseIdx = parseInt(event.target.value);
  updateStudentDropdown();
});

/** Load in data for the selected student and rerender */
studentSelector.addEventListener("change", (event) => {
  loadStandards(event.target.value);
});

//-----------------------------
// Render
//-----------------------------
/** Called whenever there is an update to data/state */
const render = () => {
  let standards = canvas
    .selectAll(".Standard")
    .data(state.currentStandards)
    .join("div")
    .attr("class", "Standard")
    .style("background-color", (d) => masteryColorScale(d.mastery))
    .append("span")
    .attr("class", "StandardLabel")
    .text(d => d.code);
};
