/* ================================================================
   LIFE DASHBOARD — app.js
   This is the only JavaScript file for the entire project.

   HOW THIS FILE IS ORGANISED:
   Each stage adds its own clearly labelled section here.
   We never split into multiple JS files.

   TABLE OF CONTENTS (filled in as we build each stage):
   - Stage 1  : Initialisation check
   - Stage 2  : Greeting (time, date, greeting message)
   - Stage 3  : To-Do List
   - Stage 4  : Focus Timer
   - Stage 5  : Quick Links
   - Stage 6  : Light / Dark Mode
   - Stage 7  : Custom Name
   - Stage 8  : Custom Pomodoro Time
================================================================ */


/* ----------------------------------------------------------------
   STAGE 2 — GREETING SECTION
   Responsibilities:
     • Display a greeting based on the current hour
     • Display the live time (updates every second)
     • Display the current date
---------------------------------------------------------------- */

/**
 * getGreeting(hour)
 * Takes the current hour (0–23) and returns an appropriate greeting.
 * Reads userName from Local Storage — set in Stage 7.
 * Falls back to "friend" if no name has been saved yet.
 */
function getGreeting(hour) {
  const name = localStorage.getItem("userName") || "friend";
  if (hour >= 5 && hour < 12)  return `Good morning, ${name}.`;
  if (hour >= 12 && hour < 17) return `Good afternoon, ${name}.`;
  if (hour >= 17 && hour < 21) return `Good evening, ${name}.`;
  return `Good night, ${name}.`;
}

/**
 * updateGreeting()
 * Reads the current time, then writes the greeting, clock, and date
 * into the three HTML elements we set up in index.html.
 * Called once immediately, then every second via setInterval.
 */
function updateGreeting() {
  const now = new Date();

  /* --- Greeting message --- */
  const hour = now.getHours();
  document.getElementById("greetingMessage").textContent = getGreeting(hour);

  /* --- Live clock ---
     padStart(2, "0") ensures single-digit numbers show as "09" not "9".
  */
  const hours   = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  document.getElementById("greetingTime").textContent =
    `${hours}:${minutes}:${seconds}`;

  /* --- Current date ---
     toLocaleDateString() formats it nicely for the user's locale,
     e.g. "Saturday, August 15, 2026"
  */
  const dateOptions = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  document.getElementById("greetingDate").textContent =
    now.toLocaleDateString(undefined, dateOptions);
}

/* Run immediately so there's no blank flash on load */
updateGreeting();

/* Then repeat every 1000ms (1 second) to keep the clock live */
setInterval(updateGreeting, 1000);


/* ----------------------------------------------------------------
   STAGE 3 — TO-DO LIST
   Responsibilities:
     • Add, edit, complete, and delete tasks
     • Persist tasks in Local Storage so they survive page refresh

   DATA SHAPE (one task object):
     { id: Number, text: String, completed: Boolean }

   LOCAL STORAGE KEY: "tasks"
---------------------------------------------------------------- */

/* ---------- 1. State ----------
   'tasks' is our in-memory array. It is always kept in sync with
   Local Storage. We never read Local Storage mid-operation —
   we only read it once on load and write it on every change.
*/
let tasks = loadTasks();

/* ---------- 2. Local Storage helpers ---------- */

/**
 * loadTasks()
 * Reads the "tasks" key from Local Storage.
 * JSON.parse converts the saved string back into a JS array.
 * If nothing is saved yet, returns an empty array.
 */
function loadTasks() {
  const saved = localStorage.getItem("tasks");
  return saved ? JSON.parse(saved) : [];
}

/**
 * saveTasks()
 * Writes the current 'tasks' array to Local Storage as a JSON string.
 * Called every time the array changes (add / edit / complete / delete).
 */
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

/* ---------- 3. Render function ---------- */

/**
 * renderTasks()
 * Clears the <ul> and rebuilds it from the 'tasks' array.
 * This "re-render from source of truth" approach is simple and
 * avoids complex DOM diffing — fine for a small list.
 */
function renderTasks() {
  const list  = document.getElementById("todoList");
  const empty = document.getElementById("todoEmpty");

  /* Clear whatever was there before */
  list.innerHTML = "";

  /* Show or hide the empty-state message */
  empty.style.display = tasks.length === 0 ? "block" : "none";

  /* Build one <li> per task */
  tasks.forEach(function(task) {
    const li = document.createElement("li");
    li.className = "todo-item" + (task.completed ? " completed" : "");
    li.dataset.id = task.id;   /* store id on the element for easy lookup */

    /* -- Checkbox -- */
    const checkbox = document.createElement("input");
    checkbox.type      = "checkbox";
    checkbox.className = "todo-checkbox";
    checkbox.checked   = task.completed;
    checkbox.addEventListener("change", function() {
      toggleTask(task.id);
    });

    /* -- Task text (the span shown normally) -- */
    const span = document.createElement("span");
    span.className   = "todo-text";
    span.textContent = task.text;

    /* -- Edit input (hidden until user clicks Edit) -- */
    const editInput = document.createElement("input");
    editInput.type      = "text";
    editInput.className = "todo-edit-input";
    editInput.value     = task.text;
    editInput.style.display = "none";   /* hidden by default */
    /* Allow saving by pressing Enter in the edit field */
    editInput.addEventListener("keydown", function(e) {
      if (e.key === "Enter") saveTask(task.id, editInput.value);
    });

    /* -- Edit button -- */
    const btnEdit = document.createElement("button");
    btnEdit.className   = "btn-todo-action btn-edit";
    btnEdit.textContent = "Edit";
    btnEdit.addEventListener("click", function() {
      /* Switch to edit mode: show input, hide text and Edit btn, show Save btn */
      span.style.display      = "none";
      editInput.style.display = "block";
      btnEdit.style.display   = "none";
      btnSave.style.display   = "inline-block";
      editInput.focus();
    });

    /* -- Save button (hidden until Edit is clicked) -- */
    const btnSave = document.createElement("button");
    btnSave.className       = "btn-todo-action btn-save";
    btnSave.textContent     = "Save";
    btnSave.style.display   = "none";
    btnSave.addEventListener("click", function() {
      saveTask(task.id, editInput.value);
    });

    /* -- Delete button -- */
    const btnDelete = document.createElement("button");
    btnDelete.className   = "btn-todo-action btn-delete";
    btnDelete.textContent = "Delete";
    btnDelete.addEventListener("click", function() {
      deleteTask(task.id);
    });

    /* Assemble the <li> */
    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(editInput);
    li.appendChild(btnEdit);
    li.appendChild(btnSave);
    li.appendChild(btnDelete);

    list.appendChild(li);
  });
}

/* ---------- 4. CRUD operations ---------- */

/**
 * addTask(text)
 * Creates a new task object and adds it to the array.
 * Date.now() gives a unique numeric ID based on the timestamp.
 */
function addTask(text) {
  text = text.trim();
  if (!text) return;   /* ignore empty input */

  const newTask = {
    id:        Date.now(),
    text:      text,
    completed: false
  };

  tasks.push(newTask);
  saveTasks();
  renderTasks();
}

/**
 * toggleTask(id)
 * Flips the completed boolean on the matching task.
 */
function toggleTask(id) {
  tasks = tasks.map(function(task) {
    if (task.id === id) {
      return { ...task, completed: !task.completed };
    }
    return task;
  });
  saveTasks();
  renderTasks();
}

/**
 * saveTask(id, newText)
 * Updates the text of the matching task (used when editing).
 */
function saveTask(id, newText) {
  newText = newText.trim();
  if (!newText) return;   /* don't allow saving an empty task */

  tasks = tasks.map(function(task) {
    if (task.id === id) {
      return { ...task, text: newText };
    }
    return task;
  });
  saveTasks();
  renderTasks();
}

/**
 * deleteTask(id)
 * Removes the matching task from the array using filter().
 */
function deleteTask(id) {
  tasks = tasks.filter(function(task) {
    return task.id !== id;
  });
  saveTasks();
  renderTasks();
}

/* ---------- 5. Event listeners ---------- */

/* Add button click */
document.getElementById("btnAddTodo").addEventListener("click", function() {
  const input = document.getElementById("todoInput");
  addTask(input.value);
  input.value = "";   /* clear the field after adding */
  input.focus();
});

/* Also add a task when the user presses Enter in the input field */
document.getElementById("todoInput").addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    addTask(this.value);
    this.value = "";
  }
});

/* ---------- 6. Initial render ----------
   Load and display any tasks saved from a previous session.
*/
renderTasks();


/* ----------------------------------------------------------------
   STAGE 4 — FOCUS TIMER
   Responsibilities:
     • Count down from a set duration (default 25 minutes)
     • Start, Stop (pause), and Reset controls
     • Update the display every second
     • Show a status message and visual cue when time is up

   STATE VARIABLES:
     timerDuration  — total seconds for the current session (e.g. 1500)
     timerRemaining — seconds left on the countdown
     timerInterval  — ID returned by setInterval; null when not running
     timerRunning   — boolean guard so we never start two intervals

   NOTE: timerDuration will be made configurable in Stage 8.
---------------------------------------------------------------- */

/* ---------- 1. State ---------- */
const DEFAULT_MINUTES  = 25;

/**
 * Read the saved Pomodoro duration from Local Storage.
 * If nothing is saved yet, fall back to DEFAULT_MINUTES.
 * parseInt() converts the stored string back to a number.
 */
const savedMinutes     = parseInt(localStorage.getItem("pomodoroTime")) || DEFAULT_MINUTES;

let timerDuration      = savedMinutes * 60;  /* in seconds */
let timerRemaining     = timerDuration;
let timerInterval      = null;
let timerRunning       = false;

/* ---------- 2. Helper: format seconds as MM:SS ---------- */

/**
 * formatTime(seconds)
 * Converts a raw second count into a "MM:SS" string.
 * e.g. 90 → "01:30"
 */
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
}

/* ---------- 3. Display update ---------- */

/**
 * updateTimerDisplay()
 * Writes the current remaining time into the DOM.
 * Also keeps the minutes input field in sync with timerDuration.
 */
function updateTimerDisplay() {
  document.getElementById("timerDisplay").textContent = formatTime(timerRemaining);
  /* Keep the number input showing the current session's minute value */
  document.getElementById("timerMinutes").value = Math.floor(timerDuration / 60);
}

/* ---------- 4. Timer controls ---------- */

/**
 * startTimer()
 * Begins the countdown. Guard clause prevents double-starting.
 * Each tick subtracts 1 from timerRemaining.
 * Automatically stops and signals "Time's up!" when it reaches 0.
 */
function startTimer() {
  if (timerRunning) return;   /* already running — do nothing */
  if (timerRemaining === 0) return;   /* don't start on 0 */

  timerRunning = true;
  document.getElementById("timerStatus").textContent = "Running";

  timerInterval = setInterval(function() {
    timerRemaining--;
    updateTimerDisplay();

    if (timerRemaining <= 0) {
      /* Time's up — stop the interval and update the UI */
      clearInterval(timerInterval);
      timerInterval = null;
      timerRunning  = false;

      document.getElementById("timerDisplay").textContent = "00:00";
      document.getElementById("timerDisplay").classList.add("times-up");
      document.getElementById("timerStatus").textContent  = "Time's up! 🎉";
    }
  }, 1000);
}

/**
 * stopTimer()
 * Pauses the countdown without resetting it.
 * Clears the interval but keeps timerRemaining where it is,
 * so startTimer() can resume from the same point.
 */
function stopTimer() {
  if (!timerRunning) return;   /* already stopped — do nothing */

  clearInterval(timerInterval);
  timerInterval = null;
  timerRunning  = false;

  document.getElementById("timerStatus").textContent = "Paused";
}

/**
 * resetTimer()
 * Cancels any running interval and restores the full duration.
 */
function resetTimer() {
  clearInterval(timerInterval);
  timerInterval  = null;
  timerRunning   = false;
  timerRemaining = timerDuration;

  /* Clear the "times-up" red colour if it was applied */
  document.getElementById("timerDisplay").classList.remove("times-up");
  document.getElementById("timerStatus").textContent = "Idle";

  updateTimerDisplay();
}

/* ---------- 5. Event listeners ---------- */
document.getElementById("btnTimerStart").addEventListener("click", startTimer);
document.getElementById("btnTimerStop").addEventListener("click", stopTimer);
document.getElementById("btnTimerReset").addEventListener("click", resetTimer);

/* ---------- 6. Initial display ---------- */
updateTimerDisplay();


/* ----------------------------------------------------------------
   STAGE 5 — QUICK LINKS
   Responsibilities:
     • Add a named link with a URL
     • Display saved links as clickable pills
     • Delete individual links
     • Persist links in Local Storage

   DATA SHAPE (one link object):
     { id: Number, name: String, url: String }

   LOCAL STORAGE KEY: "links"
---------------------------------------------------------------- */

/* ---------- 1. State ---------- */
let links = loadLinks();

/* ---------- 2. Local Storage helpers ---------- */

/**
 * loadLinks()
 * Reads saved links from Local Storage.
 * Returns an empty array if nothing is saved yet.
 */
function loadLinks() {
  const saved = localStorage.getItem("links");
  return saved ? JSON.parse(saved) : [];
}

/**
 * saveLinks()
 * Writes the current links array to Local Storage.
 */
function saveLinks() {
  localStorage.setItem("links", JSON.stringify(links));
}

/* ---------- 3. Render function ---------- */

/**
 * renderLinks()
 * Clears the links container and rebuilds it from the links array.
 * Each link becomes a pill with an anchor tag and a delete button.
 */
function renderLinks() {
  const container = document.getElementById("linksList");
  const empty     = document.getElementById("linksEmpty");

  container.innerHTML = "";

  empty.style.display = links.length === 0 ? "block" : "none";

  links.forEach(function(link) {
    /* Outer pill container */
    const div = document.createElement("div");
    div.className = "link-item";

    /* The clickable anchor — opens in a new tab */
    const anchor = document.createElement("a");
    anchor.href      = link.url;
    anchor.target    = "_blank";          /* open in new tab */
    anchor.rel       = "noopener noreferrer"; /* security best practice */
    anchor.className = "link-anchor";
    anchor.textContent = link.name;

    /* Delete button — the × symbol */
    const btnDelete = document.createElement("button");
    btnDelete.className   = "btn-link-delete";
    btnDelete.textContent = "×";
    btnDelete.title       = "Remove link";
    btnDelete.addEventListener("click", function() {
      deleteLink(link.id);
    });

    div.appendChild(anchor);
    div.appendChild(btnDelete);
    container.appendChild(div);
  });
}

/* ---------- 4. Add and Delete ---------- */

/**
 * addLink(name, url)
 * Validates that both fields are filled and that the URL looks valid,
 * then creates a new link object and saves it.
 */
function addLink(name, url) {
  name = name.trim();
  url  = url.trim();

  if (!name || !url) return;   /* both fields are required */

  /* Prepend https:// if the user forgot the protocol */
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }

  const newLink = {
    id:   Date.now(),
    name: name,
    url:  url
  };

  links.push(newLink);
  saveLinks();
  renderLinks();
}

/**
 * deleteLink(id)
 * Removes the link with the matching id from the array.
 */
function deleteLink(id) {
  links = links.filter(function(link) {
    return link.id !== id;
  });
  saveLinks();
  renderLinks();
}

/* ---------- 5. Event listener ---------- */

document.getElementById("btnAddLink").addEventListener("click", function() {
  const nameInput = document.getElementById("linkNameInput");
  const urlInput  = document.getElementById("linkUrlInput");

  addLink(nameInput.value, urlInput.value);

  /* Clear both inputs after adding */
  nameInput.value = "";
  urlInput.value  = "";
  nameInput.focus();
});

/* Allow adding a link by pressing Enter in either input field */
["linkNameInput", "linkUrlInput"].forEach(function(inputId) {
  document.getElementById(inputId).addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
      document.getElementById("btnAddLink").click();
    }
  });
});

/* ---------- 6. Initial render ---------- */
renderLinks();


/* ----------------------------------------------------------------
   STAGE 6 — LIGHT / DARK MODE
   Responsibilities:
     • Toggle the .dark-mode class on <body>
     • Update the button label to reflect the current state
     • Save the user's preference to Local Storage
     • Apply the saved preference on every page load

   LOCAL STORAGE KEY: "theme"  →  value: "dark" or "light"
---------------------------------------------------------------- */

/**
 * applyTheme(theme)
 * Adds or removes .dark-mode from <body> and updates the button label.
 * @param {string} theme — "dark" or "light"
 */
function applyTheme(theme) {
  const btn = document.getElementById("btnTheme");

  if (theme === "dark") {
    document.body.classList.add("dark-mode");
    btn.textContent = "☀️ Light Mode";
  } else {
    document.body.classList.remove("dark-mode");
    btn.textContent = "🌙 Dark Mode";
  }
}

/**
 * toggleTheme()
 * Reads the current state, flips it, saves it, and applies it.
 */
function toggleTheme() {
  /* If body currently has .dark-mode, switch to light; otherwise switch to dark */
  const newTheme = document.body.classList.contains("dark-mode") ? "light" : "dark";
  localStorage.setItem("theme", newTheme);
  applyTheme(newTheme);
}

/* Wire up the toggle button in the header */
document.getElementById("btnTheme").addEventListener("click", toggleTheme);

/* On page load, read the saved preference and apply it immediately.
   If nothing is saved yet, default to light mode. */
const savedTheme = localStorage.getItem("theme") || "light";
applyTheme(savedTheme);


/* ----------------------------------------------------------------
   STAGE 7 — CUSTOM NAME IN GREETING
   Responsibilities:
     • Show an inline edit form when the ✏️ button is clicked
     • Save the entered name to Local Storage key "userName"
     • Update the greeting immediately after saving
     • Allow cancelling without saving

   LOCAL STORAGE KEY: "userName"
   getGreeting() (Stage 2) already reads this key — no changes needed there.
---------------------------------------------------------------- */

/* Grab the elements we need */
const btnNameEdit      = document.getElementById("btnNameEdit");
const btnNameSave      = document.getElementById("btnNameSave");
const btnNameCancel    = document.getElementById("btnNameCancel");
const greetingNameForm = document.getElementById("greetingNameForm");
const nameInput        = document.getElementById("nameInput");

/**
 * openNameForm()
 * Shows the edit form and pre-fills it with the currently saved name.
 */
function openNameForm() {
  const currentName = localStorage.getItem("userName") || "";
  nameInput.value = currentName;
  greetingNameForm.style.display = "flex";
  nameInput.focus();
  nameInput.select();   /* select all text so typing replaces it */
}

/**
 * closeNameForm()
 * Hides the edit form without saving.
 */
function closeNameForm() {
  greetingNameForm.style.display = "none";
}

/**
 * saveName()
 * Reads the input, saves to Local Storage, closes the form,
 * and immediately triggers a greeting refresh.
 */
function saveName() {
  const newName = nameInput.value.trim();

  if (newName) {
    localStorage.setItem("userName", newName);
  } else {
    /* If the user cleared the field, remove the saved name
       so the greeting falls back to "friend" */
    localStorage.removeItem("userName");
  }

  closeNameForm();
  updateGreeting();   /* defined in Stage 2 — refreshes the greeting text immediately */
}

/* Event listeners */
btnNameEdit.addEventListener("click", openNameForm);
btnNameCancel.addEventListener("click", closeNameForm);
btnNameSave.addEventListener("click", saveName);

/* Also save when the user presses Enter inside the name input */
nameInput.addEventListener("keydown", function(e) {
  if (e.key === "Enter")  saveName();
  if (e.key === "Escape") closeNameForm();
});


/* ----------------------------------------------------------------
   STAGE 8 — CUSTOM POMODORO TIME
   Responsibilities:
     • Allow the user to set a custom timer duration in minutes
     • Save the chosen value to Local Storage
     • Load the saved value on page load (handled above in Stage 4 init)
     • Prevent changing the duration while the timer is running

   LOCAL STORAGE KEY: "pomodoroTime"  →  value: number (minutes)
---------------------------------------------------------------- */

/**
 * setCustomTimer()
 * Reads the minutes input, validates it, updates timerDuration,
 * saves to Local Storage, and resets the display.
 * Does nothing if the timer is currently running.
 */
function setCustomTimer() {
  /* Don't allow changing the time mid-session */
  if (timerRunning) {
    alert("Stop the timer before changing the duration.");
    return;
  }

  const input   = document.getElementById("timerMinutes");
  const minutes = parseInt(input.value);

  /* Validate: must be a number between 1 and 120 */
  if (isNaN(minutes) || minutes < 1 || minutes > 120) {
    alert("Please enter a number between 1 and 120.");
    input.value = Math.floor(timerDuration / 60);  /* restore current value */
    return;
  }

  /* Update the timer state */
  timerDuration  = minutes * 60;
  timerRemaining = timerDuration;

  /* Persist the choice */
  localStorage.setItem("pomodoroTime", minutes);

  /* Reset the display and status */
  document.getElementById("timerDisplay").classList.remove("times-up");
  document.getElementById("timerStatus").textContent = "Idle";
  updateTimerDisplay();
}

/* Wire up the Set button */
document.getElementById("btnTimerSet").addEventListener("click", setCustomTimer);

/* Also apply when the user presses Enter inside the minutes input */
document.getElementById("timerMinutes").addEventListener("keydown", function(e) {
  if (e.key === "Enter") setCustomTimer();
});
