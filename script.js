const STORAGE_KEY = "studentsData_v1";

// read saved students, or null if nothing valid is saved
function loadStudents() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : null;
  } catch (err) {
    return null;
  }
}

// save the current list
function saveStudents() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
  } catch (err) {
    console.error("Could not save to localStorage", err);
  }
}

// calculate total
function calTotal(student) {
  return student.html + student.css + student.javascript;
}
//calculate percentage
function calper(total) {
  return Number((total / 3).toFixed(2));
}

function calstatus(student) {
  if (student.html >= 35 && student.css >= 35 && student.javascript >= 35) {
    return "Pass";
  } else {
    return "Fail";
  }
}

//calculate grade
function calgrade(percentage, status) {
  if (status === "Fail") {
    return "F";
  } else if (percentage >= 90) {
    return "A";
  } else if (percentage >= 75) {
    return "B";
  } else {
    return "C";
  }
}

const results =
  loadStudents() ??
  studentsData.map(function (student) {
    const total = calTotal(student);
    const percentage = calper(total);
    const status = calstatus(student);
    const grade = calgrade(percentage, status);

    return { ...student, total, percentage, grade, status };
  });

// the student that was just added (shown in the 1st row)
let newStudent = null;

const studentTableBody = document.getElementById("studentTableBody");
const studentTable = document.getElementById("studentTable");
const emptyState = document.getElementById("emptyState");
const countInfo = document.getElementById("countInfo");

// the list currently shown in the table (so View knows which student was clicked)
let displayedList = [];

const totalStudents = document.getElementById("totalstudents");
const passedStudents = document.getElementById("passedstudents");
const failedStudents = document.getElementById("failedstudents");
const averagePer = document.getElementById("averageper");
const highestPer = document.getElementById("highestper");

//display Dashboard
function displayDashboard() {
  const total = results.length;
  const passed = results.filter((s) => s.status === "Pass").length;
  const failed = total - passed;
  const average =
    total === 0 ? 0 : results.reduce((sum, s) => sum + s.percentage, 0) / total;
  const highest =
    total === 0 ? 0 : Math.max(...results.map((s) => s.percentage));

  totalStudents.textContent = total;
  passedStudents.textContent = passed;
  failedStudents.textContent = failed;
  averagePer.textContent = average.toFixed(2) + "%";
  highestPer.textContent = highest.toFixed(2) + "%";
}

//Display the table
function displaytable(list) {
  displayedList = list;
  let rows = "";

  list.forEach(function (student, index) {
    rows += `
    <tr>
    <td>${index + 1}</td>
    <td>${student.name}</td>
    <td>${student.rollNo}</td>
    <td>${student.html}</td>
    <td>${student.css}</td>
    <td>${student.javascript}</td>
    <td>${student.total}</td>
    <td>${student.percentage}%</td>
    <td>${student.grade}</td>
    <td>${student.status}</td>
    <td><button class="view-btn" data-index="${index}">View</button></td>
    </tr>
    `;
  });
  studentTableBody.innerHTML = rows;

  const isEmpty = list.length === 0;
  studentTable.style.display = isEmpty ? "none" : "table";
  emptyState.style.display = isEmpty ? "block" : "none";
  countInfo.textContent = isEmpty
    ? ""
    : `Showing ${list.length} of ${results.length} students`;
}

const searchInput = document.getElementById("searchInput");
const filterSelect = document.getElementById("filterSelect");
const sortSelect = document.getElementById("sortSelect");

// search,filter,sort
function getfilter() {
  let data = [...results];

  //search
  const searchvalue = searchInput.value.trim().toLowerCase();
  if (searchvalue) {
    data = data.filter(
      (ad) =>
        ad.name.toLowerCase().includes(searchvalue) ||
        ad.rollNo.toLowerCase().includes(searchvalue),
    );
  }

  // filter
  const filtervalue = filterSelect.value;
  if (filtervalue === "pass") {
    data = data.filter((s) => s.status === "Pass");
  } else if (filtervalue === "fail") {
    data = data.filter((s) => s.status === "Fail");
  } else if (
    filtervalue === "a" ||
    filtervalue === "b" ||
    filtervalue === "c"
  ) {
    data = data.filter((s) => s.grade.toLowerCase() === filtervalue);
  }

  // sort
  const sortvalue = sortSelect.value;
  if (sortvalue === "name-asc") {
    data.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortvalue === "name-desc") {
    data.sort((a, b) => b.name.localeCompare(a.name));
  } else if (sortvalue === "highestper") {
    data.sort((a, b) => b.percentage - a.percentage);
  } else if (sortvalue === "lowestper") {
    data.sort((a, b) => a.percentage - b.percentage);
  } else if (sortvalue === "highestmar") {
    data.sort((a, b) => b.total - a.total);
  } else if (sortvalue === "lowestmar") {
    data.sort((a, b) => a.total - b.total);
  }

  // keep the newly added student in the 1st row
  if (newStudent && data.includes(newStudent)) {
    data = [newStudent, ...data.filter((s) => s !== newStudent)];
  }

  return data;
}

function updateTable() {
  displaytable(getfilter());
}

// when the user changes search/filter/sort, the normal order applies again
function onControlChange() {
  newStudent = null;
  updateTable();
}

searchInput.addEventListener("input", onControlChange);
filterSelect.addEventListener("change", onControlChange);
sortSelect.addEventListener("change", onControlChange);

displayDashboard();
updateTable();

const addstudent = document.getElementById("addstudent");
const resultForm = document.getElementById("resultForm");
const modalTitle = document.getElementById("modalTitle");

const studentName = document.getElementById("studentName");
const rollNo = document.getElementById("rollNo");
const htmlMarks = document.getElementById("htmlMarks");
const cssMarks = document.getElementById("cssMarks");
const jsMarks = document.getElementById("jsMarks");

const errName = document.getElementById("err-name");
const errRoll = document.getElementById("err-roll");
const errHtml = document.getElementById("err-html");
const errCss = document.getElementById("err-css");
const errJs = document.getElementById("err-js");

function clearErrors() {
  [errName, errRoll, errHtml, errCss, errJs].forEach(
    (el) => (el.textContent = ""),
  );
  [studentName, rollNo, htmlMarks, cssMarks, jsMarks].forEach((el) =>
    el.classList.remove("invalid"),
  );
}

function clearform() {
  studentName.value = "";
  rollNo.value = "";
  htmlMarks.value = "";
  cssMarks.value = "";
  jsMarks.value = "";
  clearErrors();
}

//Add student
addstudent.addEventListener("click", () => {
  modalTitle.textContent = "Add Student";
  clearform();
  resultForm.style.display = "block";
});
const closebtn = document.getElementById("closebtn");

closebtn.addEventListener("click", () => {
  resultForm.style.display = "none";
});

// ---------- Validation ----------
function validateMarks(value) {
  if (value.trim() === "") return "Marks are required.";
  if (!/^\d+(\.\d+)?$/.test(value.trim()))
    return "Marks should accept numbers only.";
  const numValue = Number(value);
  if (numValue < 0 || numValue > 100) return "Marks must be between 0 and 100.";
  return "";
}

function validateName(value) {
  const v = value.trim();
  if (v === "") return "Student name should not be empty.";
  if (!/^[\p{L}][\p{L}\s.'-]*$/u.test(v))
    return "Student name should not contain numbers.";
  return "";
}

// ignoreStudent = the student being edited (so their own roll no. isn't a duplicate)
function validateRoll(value, ignoreStudent = null) {
  const v = value.trim();
  if (v === "") return "Roll number should not be empty.";
  const duplicate = results.some(
    (s) => s !== ignoreStudent && s.rollNo.toLowerCase() === v.toLowerCase(),
  );
  if (duplicate) return "This roll number already exists.";
  return "";
}

// checks a set of fields, shows errors, returns true if all are valid
function runValidation(checks) {
  let isValid = true;
  checks.forEach(({ input, errorEl, message }) => {
    errorEl.textContent = message;
    input.classList.toggle("invalid", message !== "");
    if (message) isValid = false;
  });
  return isValid;
}

function validateForm() {
  clearErrors();
  return runValidation([
    {
      input: studentName,
      errorEl: errName,
      message: validateName(studentName.value),
    },
    { input: rollNo, errorEl: errRoll, message: validateRoll(rollNo.value) },
    {
      input: htmlMarks,
      errorEl: errHtml,
      message: validateMarks(htmlMarks.value),
    },
    {
      input: cssMarks,
      errorEl: errCss,
      message: validateMarks(cssMarks.value),
    },
    { input: jsMarks, errorEl: errJs, message: validateMarks(jsMarks.value) },
  ]);
}

// ---------- Save student ----------
resultForm.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  const student = {
    name: studentName.value.trim(),
    rollNo: rollNo.value.trim(),
    html: Number(htmlMarks.value),
    css: Number(cssMarks.value),
    javascript: Number(jsMarks.value),
  };

  const total = calTotal(student);
  const percentage = calper(total);
  const status = calstatus(student);
  const grade = calgrade(percentage, status);

  newStudent = { ...student, total, percentage, grade, status };
  results.unshift(newStudent);
  saveStudents();

  // reset search and filter so the new student is visible in the 1st row
  searchInput.value = "";
  filterSelect.value = "all";

  displayDashboard();
  updateTable();

  resultForm.style.display = "none";
});

// ---------- View / Edit / Delete ----------
const viewModal = document.getElementById("viewModal");

const viewName = document.getElementById("viewName");
const viewRoll = document.getElementById("viewRoll");
const viewHtml = document.getElementById("viewHtml");
const viewCss = document.getElementById("viewCss");
const viewJs = document.getElementById("viewJs");
const viewTotal = document.getElementById("viewTotal");
const viewPercentage = document.getElementById("viewPercentage");
const viewGrade = document.getElementById("viewGrade");
const viewStatus = document.getElementById("viewStatus");

const viewErrName = document.getElementById("view-err-name");
const viewErrRoll = document.getElementById("view-err-roll");
const viewErrHtml = document.getElementById("view-err-html");
const viewErrCss = document.getElementById("view-err-css");
const viewErrJs = document.getElementById("view-err-js");

const editBtn = document.getElementById("editBtn");
const saveChangesBtn = document.getElementById("saveChangesBtn");
const deleteBtn = document.getElementById("deleteBtn");
const closeViewBtn = document.getElementById("closeViewBtn");

const editableInputs = [viewName, viewRoll, viewHtml, viewCss, viewJs];

// the student currently open in the modal (object reference, not an index)
let currentStudent = null;

function clearViewErrors() {
  [viewErrName, viewErrRoll, viewErrHtml, viewErrCss, viewErrJs].forEach(
    (el) => (el.textContent = ""),
  );
  editableInputs.forEach((el) => el.classList.remove("invalid"));
}

function fillViewModal(student) {
  viewName.value = student.name;
  viewRoll.value = student.rollNo;
  viewHtml.value = student.html;
  viewCss.value = student.css;
  viewJs.value = student.javascript;
  viewTotal.value = student.total;
  viewPercentage.value = student.percentage + "%";
  viewGrade.value = student.grade;
  viewStatus.value = student.status;
}

function setEditMode(on) {
  editableInputs.forEach((el) => (el.readOnly = !on));
  saveChangesBtn.style.display = on ? "block" : "none";
  editBtn.style.display = on ? "none" : "block";
}

function viewStudent(student) {
  currentStudent = student;
  fillViewModal(student);
  clearViewErrors();
  setEditMode(false);
  viewModal.style.display = "flex";
}

function closeViewModal() {
  viewModal.style.display = "none";
  currentStudent = null;
}

// click on any "View" button in the table
studentTableBody.addEventListener("click", (e) => {
  const btn = e.target.closest(".view-btn");
  if (!btn) return;
  viewStudent(displayedList[Number(btn.dataset.index)]);
});

closeViewBtn.addEventListener("click", closeViewModal);

// click on the dark background closes the modal
viewModal.addEventListener("click", (e) => {
  if (e.target === viewModal) closeViewModal();
});

editBtn.addEventListener("click", () => {
  setEditMode(true);
});

saveChangesBtn.addEventListener("click", () => {
  clearViewErrors();

  const isValid = runValidation([
    {
      input: viewName,
      errorEl: viewErrName,
      message: validateName(viewName.value),
    },
    {
      input: viewRoll,
      errorEl: viewErrRoll,
      message: validateRoll(viewRoll.value, currentStudent),
    },
    {
      input: viewHtml,
      errorEl: viewErrHtml,
      message: validateMarks(viewHtml.value),
    },
    {
      input: viewCss,
      errorEl: viewErrCss,
      message: validateMarks(viewCss.value),
    },
    { input: viewJs, errorEl: viewErrJs, message: validateMarks(viewJs.value) },
  ]);

  if (!isValid) return;

  currentStudent.name = viewName.value.trim();
  currentStudent.rollNo = viewRoll.value.trim();
  currentStudent.html = Number(viewHtml.value);
  currentStudent.css = Number(viewCss.value);
  currentStudent.javascript = Number(viewJs.value);

  currentStudent.total = calTotal(currentStudent);
  currentStudent.percentage = calper(currentStudent.total);
  currentStudent.status = calstatus(currentStudent);
  currentStudent.grade = calgrade(
    currentStudent.percentage,
    currentStudent.status,
  );
  saveStudents();

  displayDashboard();
  updateTable();
  closeViewModal();
});

const confirmModal = document.getElementById("confirmModal");
const confirmText = document.getElementById("confirmText");
const confirmYesBtn = document.getElementById("confirmYesBtn");
const confirmNoBtn = document.getElementById("confirmNoBtn");

// Delete button opens the confirmation popup
deleteBtn.addEventListener("click", () => {
  confirmText.textContent = `Are you sure you want to delete ${currentStudent.name} (${currentStudent.rollNo})? This cannot be undone.`;
  confirmModal.style.display = "flex";
});

// Cancel keeps the student and goes back to the details popup
confirmNoBtn.addEventListener("click", () => {
  confirmModal.style.display = "none";
});

// clicking the dark background also cancels
confirmModal.addEventListener("click", (e) => {
  if (e.target === confirmModal) confirmModal.style.display = "none";
});

// Yes, Delete removes the student and closes both popups
confirmYesBtn.addEventListener("click", () => {
  const index = results.indexOf(currentStudent);
  if (index !== -1) results.splice(index, 1);
  if (newStudent === currentStudent) newStudent = null;
  saveStudents();

  displayDashboard();
  updateTable();

  confirmModal.style.display = "none";
  closeViewModal();
});
