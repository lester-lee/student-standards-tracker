/*
 * Spaghetti code for now just to get the prototype up & working :)
 */
//-----------------------------
// State Management
//-----------------------------
let state = {
  courses: null,
  currentCourseIdx: 0,
  domains: [],
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
  .style("background-color", (d) => masteryColorScale(d));

// Add a tooltip
const tooltip = canvas
  .append("div")
  .style("opacity", 0)
  .attr("class", "Tooltip");

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
    state.domains = Array.from(d3.group(standards, (s) => s.domain));
    state.domains.reverse();
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

// Mouse and keyboard events for tooltip
// Three function that change the tooltip when user hover / move / leave a cell
const onMouseOver = (d) => {
  tooltip.style("opacity", 1);
  //d3.select(this).style("stroke", "black").style("opacity", 1);
};
const onMouseMove = (event, standard) => {
  const [mouseX, mouseY] = d3.pointer(event, canvas);
  tooltip
    .text(`${standard.code}: ${standard.standard}`)
    .style("left", `${mouseX}px`)
    .style("top", `${mouseY + 18}px`);
};
const onMouseLeave = (d) => {
  tooltip.style("opacity", 0);
  //d3.select(this).style("stroke", "none").style("opacity", 0.8);
};

//-----------------------------
// Render
//-----------------------------
/** Called whenever there is an update to data/state */
const render = () => {
  let domains = canvas
    .selectAll(".Domain")
    .data(state.domains)
    .join("div")
    .attr("class", "Domain")
    .style("border", "1px solid red;")
    .html(
      (d) => `<h3 class="DomainLabel">${d[0]}</h3><ol class="Standards"></ol`
    )
    .each(function (standards) {
      d3.select(this)
        .select(".Standards")
        .selectAll(".Standard")
        .data(standards[1])
        .join("li")
        .attr("class", "Standard")
        .style("background-color", (d) => masteryColorScale(d.mastery))
        .html((d) => `<span class="StandardLabel">${d.code}</span>`)
        .on("mouseover", onMouseOver)
        .on("mousemove", onMouseMove)
        .on("mouseleave", onMouseLeave);
    });
};
