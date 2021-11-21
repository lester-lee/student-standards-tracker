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
  init();
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

/** Creates an option for each course */
const updateCourseDropdown = () => {
  state.courses.forEach((course, idx) => {
    CourseSelector.appendChild(createOption(course.title, idx));
  });
};

/** Creates an option for each student in current course */
const updateStudentDropdown = () => {
  const students = state.courses[state.currentCourseIdx].roster.map((student) =>
    createOption(
      `${student.first} ${student.last}`,
      `${student.first}_${student.last}`
    )
  );
  StudentSelector.replaceChildren(...students);
};

/** Change current course and update students / standards. */
CourseSelector.addEventListener("change", (event) => {
  state.currentCourseIdx = parseInt(event.target.value);
  updateStudentDropdown();
});

/** Load in data for the selected student and rerender */
StudentSelector.addEventListener("change", (event) => {
  // Get path of masteries for selected student
  const currentCourseName = state.courses[state.currentCourseIdx].name;
  const studentPath = `data/courses/${currentCourseName}/students/${event.target.value}.csv`;

  d3.csv(studentPath, d3.autoType).then((standards) => {
    state.currentStandards = standards;
    console.log("state.currentStandards :>> ", state.currentStandards);
    render();
  });
});

//-----------------------------
// Render
//-----------------------------

/** This function runs after courses are loaded */
const init = () => {
  canvas = d3.select(".StandardsViz");
  render();
};

/** Called whenever there is an update to data/state */
const render = () => {
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
