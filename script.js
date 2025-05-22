const datePicker = document.getElementById('datePicker');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');

let tasks = []; // [{id, text, completed, date}]

const API_URL = 'http://127.0.0.1:5000/tasks';

async function loadTasks() {
  const date = datePicker.value;
  if (!date) {
    taskList.innerHTML = '';
    updateProgress(0, 0);
    return;
  }

  const res = await fetch(`${API_URL}?date=${date}`);
  tasks = await res.json();
  renderTasks();
  updateProgressCount();
}

async function addTask() {
  const date = datePicker.value;
  const text = taskInput.value.trim();

  if (!date) return alert('Please select a date.');
  if (!text) return alert('Task cannot be empty.');

  await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, text, completed: 0 })
  });

  taskInput.value = '';
  await loadTasks();
}

function renderTasks() {
  taskList.innerHTML = '';

  tasks.forEach((task, index) => {
    const li = document.createElement('li');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', async () => {
      task.completed = checkbox.checked ? 1 : 0;
      await updateTask(task);
      updateProgressCount();
    });
    li.appendChild(checkbox);

    const span = document.createElement('span');
    span.textContent = task.text;
    span.className = 'task-text';
    span.title = 'Click to edit';
    span.addEventListener('click', () => enableEditing(span, task, li));
    li.appendChild(span);

    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.className = 'delete-btn';
    delBtn.addEventListener('click', async () => {
      await deleteTask(task.id);
      await loadTasks();
    });
    li.appendChild(delBtn);

    taskList.appendChild(li);
  });
}

function enableEditing(span, task, li) {
  const input = document.createElement('input');
  input.type = 'text';
  input.value = task.text;
  input.className = 'edit-input';

  input.addEventListener('blur', async () => {
    const newText = input.value.trim();
    if (newText === '') {
      alert('Task cannot be empty!');
      input.focus();
      return;
    }
    task.text = newText;
    await updateTask(task);
    span.textContent = newText;
    li.replaceChild(span, input);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') input.blur();
    if (e.key === 'Escape') li.replaceChild(span, input); // cancel
  });

  li.replaceChild(input, span);
  input.focus();
}

async function updateTask(task) {
  await fetch(`${API_URL}/${task.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: task.text, completed: task.completed })
  });
}

async function deleteTask(id) {
  await fetch(`${API_URL}/${id}`, {
    method: 'DELETE'
  });
}

function updateProgressCount() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  updateProgress(total, completed);
}

function updateProgress(total, completed) {
  if (total === 0) {
    progressBar.style.width = '0%';
    progressText.textContent = `0 of 0 tasks completed`;
  } else {
    const percent = (completed / total) * 100;
    progressBar.style.width = percent + '%';
    progressText.textContent = `${completed} of ${total} tasks completed`;
  }
}

datePicker.addEventListener('change', loadTasks);
window.onload = () => {
  if (datePicker.value) loadTasks();
};  
