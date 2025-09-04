const taskList = document.getElementById("taskList");
const newTaskInput = document.getElementById("newTask");
const addTaskButton = document.getElementById("addTask");
const titleTasks = document.getElementById("titleTasks");

newTaskInput.placeholder = chrome.i18n.getMessage("placeholderNew");
addTaskButton.textContent = chrome.i18n.getMessage("buttonAdd");

chrome.storage.local.get("tasks", (data) => {
  if (data.tasks) {
    data.tasks.forEach(addTaskToUI);
  }
});

function addTaskToUI(task) {
  const li = document.createElement("li");
  li.className =
    "list-group-item d-flex align-items-center justify-content-between";

  const leftDiv = document.createElement("div");
  leftDiv.className = "d-flex align-items-center flex-grow-1";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "form-check-input me-2";
  checkbox.checked = task.done;

  const span = document.createElement("span");
  span.textContent = task.text;
  span.className = "task-text";
  if (task.done) span.style.textDecoration = "line-through";

  checkbox.addEventListener("change", () => {
    task.done = checkbox.checked;
    span.style.textDecoration = task.done ? "line-through" : "none";
    saveTasks();
  });

  leftDiv.appendChild(checkbox);
  leftDiv.appendChild(span);

  const editBtn = document.createElement("button");
  editBtn.className = "btn-edit ms-2 p-1";
  editBtn.innerHTML = '<i class="bi bi-pencil"></i>';

  editBtn.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "text";
    input.value = span.textContent;
    input.className = "form-control form-control-sm";

    leftDiv.replaceChild(input, span);
    input.focus();

    const saveEdit = () => {
      span.textContent = input.value.trim() || span.textContent;
      leftDiv.replaceChild(span, input);
      saveTasks();
    };

    input.addEventListener("blur", saveEdit);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") saveEdit();
    });
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "btn-delete ms-2 p-1";
  deleteBtn.innerHTML = '<i class="bi bi-trash2"></i>';

  deleteBtn.addEventListener("click", () => {
    li.remove();
    saveTasks();
  });

  li.appendChild(leftDiv);
  li.appendChild(editBtn);
  li.appendChild(deleteBtn);
  taskList.appendChild(li);
}

window.sortable = new Sortable(taskList, {
  animation: 150,
  ghostClass: 'sortable-ghost',
  filter: 'input,button,i',
  preventOnFilter: false,
  onEnd: () => saveTasks(),
});

function saveTasks() {
  const tasks = [];
  taskList.querySelectorAll("li").forEach((li) => {
    const checkbox = li.querySelector("input");
    const text = li.querySelector("span").textContent;
    tasks.push({ text, done: checkbox.checked });
  });
  chrome.storage.local.set({ tasks });
}

addTaskButton.addEventListener("click", () => {
  const text = newTaskInput.value.trim();
  if (text) {
    addTaskToUI({ text, done: false });
    saveTasks();
    newTaskInput.value = "";
  }
});

newTaskInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    const text = newTaskInput.value.trim();
    if (text) {
      addTaskToUI({ text, done: false });
      saveTasks();
      newTaskInput.value = "";
    }
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
  popoverTriggerList.map(el => new bootstrap.Popover(el))
});

document.querySelectorAll("[data-i18n]").forEach(el => {
  const msg = chrome.i18n.getMessage(el.getAttribute("data-i18n"));
  if (msg) el.textContent = msg;
});
