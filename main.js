/*
 * Spaghetti code for now just to get the prototype up & working
 */

const TODO = null;
// First load default course (first one in dataset + student one)
// Load csv and convert into JS objects
// Use d3 to bind each standard to a circle

//-----------------------------
// State Management
//-----------------------------
let state = {
  currentCourseIdx: 0,
  currentStudentIdx: 0,
  currentStandards: [],
  courses: null,
  students: null,
};

//-----------------------------
// Setup
//-----------------------------
// Canvas options
let canvas;
const WIDTH = 800;
const HEIGHT = 600;

// Load in course metadata
const CourseSelector = document.querySelector("#CourseSelector");
const StudentSelector = document.querySelector("#StudentSelector");
d3.json("data/courses.json").then((courses) => {
  state.courses = courses;
  updateCourseDropdown();
  updateStudentDropdown();
});

/** Creates an option with value and text set to @name */
const createOption = (name) => {
  let option = document.createElement("option");
  option.innerText = name;
  option.value = name;
  return option;
};

const updateCourseDropdown = () => {
  state.courses.forEach((course) => {
    CourseSelector.appendChild(createOption(course.title));
  });
};

const updateStudentDropdown = () => {
  const students = state.courses[state.currentCourseIdx].roster.map((student) =>
    createOption(`${student.first} ${student.last}`)
  );
  StudentSelector.replaceChildren(...students);
};

//-----------------------------
// Event Handlers
//-----------------------------

//-----------------------------
// Render
//-----------------------------

/** This function runs once when the data is loaded */
const init = () => {
  // Get default options from dropdown menus
  state.currentCourse = CourseSelector.value;
  state.currentStudent = StudentSelector.value;

  console.debug("Initial state: ", state);

  canvas = d3.select(".StandardsViz");

  const masteryColorScale = d3
    .scaleOrdinal()
    .domain(["0", "1", "2", "3"])
    .range(["red", "purple", "blue", "green"]);

  let standards = canvas
    .selectAll(".Standard")
    .data(state.currentStandards)
    .join("div")
    .attr("class", "Standard")
    .attr("style", (d, i) => {
      return `background-color:${masteryColorScale(
        d.mastery
      )};border:5px solid black;`;
    })
    .text((d) => d.code);
};

/** Called whenever there is an update to data/state */
const render = () => {};
