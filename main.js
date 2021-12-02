/*
 * Spaghetti code for now just to get the prototype up & working :)
 */
//-----------------------------
//#region State Management
//-----------------------------
let state = {
  courses: null,
  currentCourseIdx: 0,
  courseDomains: [],
  studentDomains: [],
  currentStudentStandards: [],
};
//#endregion

//-----------------------------
//#region Setup
//-----------------------------

// Canvas elements
let studentStandards = d3.select("#StudentStandards");
let standardsList = d3.select("#StandardsList");
let courseStandards = d3.select("#CourseStandards");

const toggleButton = document.querySelector("#ToggleSideView");

const courseSelector = document.querySelector("#CourseSelector");
const studentSelector = document.querySelector("#StudentSelector");

const WIDTH = 800;
const HEIGHT = 600;

const masteryColorScale = d3
  .scaleOrdinal()
  .domain([0, 3])
  .range(["#de425b", "#dbc667", "#79ab62", "#488f31"]);

// Set up legend
d3.select(".LegendKeys")
  .selectAll(".LegendKeys .Standard")
  .data([0, 1, 2, 3])
  .join("li")
  .attr("class", "Standard")
  .style("background-color", (d) => masteryColorScale(d));

// Add a tooltip
const tooltip = studentStandards
  .append("div")
  .style("opacity", 0)
  .attr("class", "Tooltip");

// Load in course metadata
d3.json("data/courses.json").then((courses) => {
  state.courses = courses;
  updateCourseDropdown();
});
//#endregion

//-----------------------------
//#region Event Handlers
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

  // Load default course
  const courseIdx = courseSelector.firstChild.value;
  state.currentCourseIdx = parseInt(courseIdx);
  loadCourseStandards();

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

  // Load default student
  const student = studentSelector.firstChild.value;
  loadStandards(student);
};

/** Updates current standards in state to match student */
const loadStandards = (student) => {
  // Get path of masteries for selected student
  const currentCourseName = state.courses[state.currentCourseIdx].name;
  const studentPath = `data/courses/${currentCourseName}/students/${student}.csv`;

  d3.csv(studentPath, d3.autoType).then((standards) => {
    state.currentStudentStandards = standards;
    state.studentDomains = Array.from(d3.group(standards, (s) => s.domain));
    state.studentDomains.reverse();
    render();
  });
};

/** Updates current course standards to show summary data */
const loadCourseStandards = () => {
  const course = state.courses[state.currentCourseIdx];

  state.courseDomains = Array.from(d3.group(course.standards, (s) => s.domain));
  state.courseDomains.reverse();
};

/** Change current course and update students / standards. */
courseSelector.addEventListener("change", (event) => {
  state.currentCourseIdx = parseInt(event.target.value);
  loadCourseStandards();
  updateStudentDropdown();
});

/** Load in data for the selected student and rerender */
studentSelector.addEventListener("change", (event) => {
  loadStandards(event.target.value);
});

/** Toggle between summary view vs list view */
toggleButton.addEventListener("click", (event) => {
  document.querySelector("#CourseStandards").classList.toggle("--active");
  document.querySelector("#StandardsList").classList.toggle("--active");
});

// Mouse and keyboard events for tooltip
// Three function that change the tooltip when user hover / move / leave a cell
const onMouseEnter = (event, standard) => {
  tooltip.style("opacity", 1);
  const standardInfo = document.querySelector(`#${standard.code}`);
  standardInfo.classList.toggle("--active");
};
const onMouseMove = (event, standard) => {
  const [mouseX, mouseY] = d3.pointer(event, studentStandards);
  tooltip
    .text(`${standard.code}: ${standard.standard}`)
    .style("left", `${mouseX - 80}px`)
    .style("top", `${mouseY + 30}px`);
};
const onMouseLeave = (event, standard) => {
  tooltip.style("opacity", 0);
  const standardInfo = document.querySelector(`#${standard.code}`);
  standardInfo.classList.toggle("--active");
};

//#endregion

//-----------------------------
//#region Render
//-----------------------------
const renderStandards = (container, data) => {
  container
    .selectAll(".Domain")
    .data(data)
    .join("div")
    .attr("class", "Domain")
    .html(
      (d) => `<h3 class="DomainLabel">${d[0]}</h3><ol class="Standards"></ol>`
    )
    .each(function (standards) {
      d3.select(this)
        .select(".Standards")
        .selectAll(".Standard")
        .data(standards[1])
        .join("li")
        .attr("class", "Standard")
        .style("background-color", (d) => masteryColorScale(d.mastery))
        .on("mouseenter", onMouseEnter)
        .on("mousemove", onMouseMove)
        .on("mouseleave", onMouseLeave)
        .html((d) => `<span class="StandardLabel">${d.code}</span>`);
    });
};

const renderStudentStandards = () => {
  renderStandards(studentStandards, state.studentDomains);
};

const renderCourseStandards = () => {
  renderStandards(courseStandards, state.courseDomains);
};

const renderStandardsList = () => {
  standardsList
    .selectAll(".ListDomain")
    .data(state.studentDomains)
    .join("li")
    .attr("class", "ListDomain")
    .html(
      (d) =>
        `<h3 class="DomainLabel">${d[0]}</h3><ol class="StandardsList"></ol>`
    )
    .each(function (standards) {
      d3.select(this)
        .select(".StandardsList")
        .selectAll(".ListStandard")
        .data(standards[1])
        .join("li")
        .attr("class", "ListStandard")
        .html(
          (d) =>
            `<li id="${d.code}" class="ListStandardLabel">${d.code}. ${d.standard}</span>`
        );
    });
};

/** Called whenever there is an update to data/state */
const render = () => {
  renderStudentStandards();
  renderCourseStandards();
  renderStandardsList();
};

//#endregion Render
