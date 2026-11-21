const STORAGE_KEY = "meine-aufgaben-v1";

const dateElement = document.querySelector("#date");
const form = document.querySelector("#taskForm");
const input = document.querySelector("#taskInput");
const taskList = document.querySelector("#taskList");
const template = document.querySelector("#taskTemplate");
const listTitle = document.querySelector("#listTitle");
const todayCount = document.querySelector("#todayCount");
const tomorrowCount = document.querySelector("#tomorrowCount");
const doneCount = document.querySelector("#doneCount");
const progressRing = document.querySelector("#progressRing");
const progressText = document.querySelector("#progressText");
const clearDone = document.querySelector("#clearDone");
const tabs = document.querySelectorAll(".tab");

let tasks = loadTasks();
let currentView = "today";

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function newId() {
  if (window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random()}`;
}

function formatDate() {
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long"
  }).format(new Date());
}

function render() {
  taskList.replaceChildren();

  const today = tasks.filter((task) => task.day === "today" && !task.done);
  const tomorrow = tasks.filter((task) => task.day === "tomorrow" && !task.done);
  const done = tasks.filter((task) => task.done);

  todayCount.textContent = today.length;
  tomorrowCount.textContent = tomorrow.length;
  doneCount.textContent = done.length;

  let visibleTasks;
  if (currentView === "tomorrow") {
    visibleTasks = tomorrow;
    listTitle.textContent = "Morgen";
  } else if (currentView === "done") {
    visibleTasks = done;
    listTitle.textContent = "Erledigt";
  } else {
    visibleTasks = today;
    listTitle.textContent = "Heute";
  }

  if (visibleTasks.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty";

    if (currentView === "today") {
      empty.textContent = "Keine Aufgaben für heute.";
    } else if (currentView === "tomorrow") {
      empty.textContent = "Keine Aufgaben für morgen.";
    } else {
      empty.textContent = "Noch keine erledigten Aufgaben.";
    }

    taskList.appendChild(empty);
  } else {
    visibleTasks.forEach((task) => renderTask(task));
  }

  const percentage = tasks.length === 0 ? 0 : Math.round((done.length / tasks.length) * 100);
  progressText.textContent = `${percentage}%`;
  progressRing.style.setProperty("--progress", `${percentage}%`);
  progressRing.setAttribute(
    "aria-label",
    `${done.length} von ${tasks.length} Aufgaben erledigt`
  );

  clearDone.classList.toggle("visible", done.length > 0);
}

function renderTask(task) {
  const node = template.content.cloneNode(true);
  const article = node.querySelector(".task");
  const title = node.querySelector(".task-title");
  const check = node.querySelector(".check");
  const move = node.querySelector(".move");
  const remove = node.querySelector(".delete");

  article.classList.toggle("done", task.done);
  title.textContent = task.title;

  if (task.done) {
    check.setAttribute("aria-label", "Aufgabe wieder öffnen");
  } else {
    check.setAttribute("aria-label", "Aufgabe erledigen");
  }

  if (task.day === "tomorrow") {
    move.textContent = "Heute";
    move.setAttribute("aria-label", "Auf heute verschieben");
  } else {
    move.textContent = "Morgen";
    move.setAttribute("aria-label", "Auf morgen verschieben");
  }

  check.addEventListener("click", () => {
    task.done = !task.done;
    saveTasks();
    render();
  });

  move.addEventListener("click", () => {
    task.day = task.day === "today" ? "tomorrow" : "today";
    saveTasks();
    render();
  });

  remove.addEventListener("click", () => {
    tasks = tasks.filter((item) => item.id !== task.id);
    saveTasks();
    render();
  });

  taskList.appendChild(node);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = input.value.trim();

  if (!title) {
    input.focus();
    return;
  }

  tasks.unshift({
    id: newId(),
    title,
    day: "today",
    done: false
  });

  input.value = "";
  currentView = "today";
  tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.view === "today"));
  saveTasks();
  render();
  input.focus();
});

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    currentView = tab.dataset.view;
    tabs.forEach((item) => item.classList.toggle("active", item === tab));
    render();
  });
});

clearDone.addEventListener("click", () => {
  tasks = tasks.filter((task) => !task.done);
  saveTasks();
  render();
});

dateElement.textContent = formatDate();
render();
