---
---
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

// Helper methods to process state

/** Return [standard:{mastery:#}] for standards of current course*/
const generateStandardsFrequencies = () => {
  const course = state.courses[state.currentCourseIdx];
  return course.standards.map((s) => {
    return { mastery: s.mastery, code: s.code };
  });
};

//#endregion

//-----------------------------
//#region Setup
//-----------------------------
const dataURL = "https://raw.githubusercontent.com/lester-lee/student-standards-tracker/main/data";

// Canvas elements
let studentStandards = d3.select("#StudentStandards");
let standardsList = d3.select("#StandardsList");
let courseStandards = d3.select("#CourseStandards");

// Student Information Elements
const studentName = document.querySelector(".StudentName");
const studentStats = document.querySelector(".StudentStats");

// Course Aggregate Elements
const courseInformation = d3.select(".CourseInformation");
const courseDistributions = document.querySelector(".CourseDistributions");

//const toggleButton = document.querySelector("#ToggleSideView");

const courseSelector = document.querySelector("#CourseSelector");
const studentSelector = document.querySelector("#StudentSelector");

const WIDTH = 800;
const HEIGHT = 600;

const masteryColorScale = d3
  .scaleOrdinal()
  .domain(["1", "2", "3"])
  .range(["#eae0af", "#dec9c8", "#abb0d3" /*, "#7c9ed5"*/]);

// Set up legend
d3.select(".LegendKeys")
  .selectAll(".LegendKeys .Standard")
  .data([1, 2, 3])
  .join("li")
  .attr("class", "Standard")
  .style("background-color", (d) => masteryColorScale(d))
  .text((d) => d);

// Add a tooltip
const tooltip = d3.select(".Tooltip").style("opacity", "0");

// Load in course metadata
d3.json(dataURL+"/courses.json").then((courses) => {
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
  updateStudentInformation(student);
};

/** Updates student information to match selected student */
const updateStudentInformation = (student) => {
  // Helper function to calculate student stats
  const countStandards = (standards) => (mastery) => {
    const count = standards.filter((s) => s.mastery == mastery).length;
    const elem = document.createElement("span");
    elem.style.backgroundColor = masteryColorScale(mastery);
    elem.innerText = `${count}/${standards.length}`;
    return elem;
  };

  const listStandard = (code, mastery) => {
    const elem = document.createElement("span");
    elem.className = "Standard";
    elem.innerText = code;
    elem.style.backgroundColor = masteryColorScale(mastery);
    return elem;
  };

  // Update text to show student name
  studentName.innerText = student.replace("_", " ");

  // Get path of masteries for selected student
  const currentCourseName = state.courses[state.currentCourseIdx].name;
  const studentPath = `${dataURL}/courses/${currentCourseName}/students/${student.toLowerCase()}.csv`;

  d3.csv(studentPath, d3.autoType).then((standards) => {
    state.currentStudentStandards = standards;
    state.studentDomains = Array.from(d3.group(standards, (s) => s.domain));
    state.studentDomains.reverse();
    render();

    document
      .querySelector(".StudentStatsCounts")
      .replaceChildren(...[1, 2, 3].map(countStandards(standards)));

    document
      .querySelector(".StudentStatsList.--1")
      .replaceChildren(
        ...standards
          .filter((s) => s.mastery == 1)
          .map((s) => listStandard(s.code, 1))
      );

    document
      .querySelector(".StudentStatsList.--2")
      .replaceChildren(
        ...standards
          .filter((s) => s.mastery == 2)
          .map((s) => listStandard(s.code, 2))
      );
  });
};

/** Updates current course standards to show summary data */
const loadCourseStandards = () => {
  const course = state.courses[state.currentCourseIdx];

  state.courseDomains = Array.from(d3.group(course.standards, (s) => s.domain));
  state.courseDomains.reverse();

  // Update course distributions label
  d3.select(".CourseDistributionsLabel").text(
    `Class Distributions for ${course.title}`
  );
};

/** Change current course and update students / standards. */
courseSelector.addEventListener("change", (event) => {
  state.currentCourseIdx = parseInt(event.target.value);
  loadCourseStandards();
  updateStudentDropdown();
});

/** Load in data for the selected student and rerender */
studentSelector.addEventListener("change", (event) => {
  updateStudentInformation(event.target.value);
});

/** Toggle between summary view vs list view */
/*
toggleButton.addEventListener("click", (event) => {
  document.querySelector("#CourseStandards").classList.toggle("--active");
  document.querySelector("#StandardsList").classList.toggle("--active");
});
*/

// Mouse and keyboard events for tooltip
// Three function that change the tooltip when user hover / move / leave a cell
const onMouseEnter = (event, standard) => {
  tooltip.style("opacity", 1);
  /*
  const standardInfo = document.querySelector(`#${standard.code}`);
  standardInfo.classList.toggle("--active");
  */
};
const onMouseMove = (event, standard) => {
  const [mouseX, mouseY] = d3.pointer(event, studentStandards);
  tooltip
    .text(`${standard.code}: ${standard.standard}`)
    .style("left", `${mouseX - 30}px`)
    .style("top", `${mouseY + 20}px`);
};
const onMouseLeave = (event, standard) => {
  tooltip.style("opacity", 0);
  /*
  const standardInfo = document.querySelector(`#${standard.code}`);
  standardInfo.classList.toggle("--active");
  */
};

//#endregion

//-----------------------------
//#region Bar Charts
//-----------------------------
const generateChart = (standard) => {
  // Create the containing chart
  const chart = document.createElement("div");
  chart.className = "Distribution";

  const barsElem = document.createElement("div");
  barsElem.className = "DistributionBars";
  // Create bars for each mastery
  let bars = [];
  for (const [mastery, count] of Object.entries(standard.mastery)) {
    const bar = document.createElement("div");
    bar.className = "DistributionBar";
    bar.style.backgroundColor = masteryColorScale(mastery);
    bar.style.flex = count;
    bars.push(bar);
  }
  barsElem.replaceChildren(...bars);
  chart.append(barsElem);

  // Add a label at the bottom
  const label = document.createElement("span");
  label.innerText = standard.code;
  chart.append(label);
  return chart;
};

//#endregion Bar Charts

//-----------------------------
//#region Render
//-----------------------------
const renderStandards = (container, data) => {
  container
    .selectAll(".Domain")
    .data(data)
    .join("li")
    .attr("class", "Domain")
    .html(
      //(d) => `<h3 class="DomainLabel">${d[0]}</h3><ol class="Standards"></ol>`
      (d) => `<ol class="Standards"></ol>`
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

const renderStandardsDistributions = () => {
  const distribution = generateStandardsFrequencies();
  courseDistributions.replaceChildren(
    ...distribution.map((d) => generateChart(d))
  );
};

/** Called whenever there is an update to data/state */
const render = () => {
  renderStudentStandards();
  renderCourseStandards();
  renderStandardsList();
  renderStandardsDistributions();
};

//#endregion Render
