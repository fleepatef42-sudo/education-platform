const storageKey = "studyflow-education-page";

const subjectSelect = document.getElementById("taskSubject");
const taskForm = document.getElementById("taskForm");
const taskTitleInput = document.getElementById("taskTitle");
const taskDateInput = document.getElementById("taskDate");
const taskPriorityInput = document.getElementById("taskPriority");
const taskList = document.getElementById("taskList");
const taskFilters = document.getElementById("taskFilters");
const subjectGrid = document.getElementById("subjectGrid");
const sessionGrid = document.getElementById("sessionGrid");
const quickNote = document.getElementById("quickNote");
const saveNoteBtn = document.getElementById("saveNoteBtn");
const noteStatus = document.getElementById("noteStatus");
const loadDemoBtn = document.getElementById("loadDemoBtn");
const timerDisplay = document.getElementById("timerDisplay");
const timerStatus = document.getElementById("timerStatus");
const timerToggleBtn = document.getElementById("timerToggleBtn");
const timerResetBtn = document.getElementById("timerResetBtn");
const timerPresets = document.getElementById("timerPresets");

const statCompletion = document.getElementById("statCompletion");
const statHours = document.getElementById("statHours");
const statExam = document.getElementById("statExam");
const statExamLabel = document.getElementById("statExamLabel");
const statStreak = document.getElementById("statStreak");
const nextSessionTitle = document.getElementById("nextSessionTitle");
const nextSessionMeta = document.getElementById("nextSessionMeta");
const nextSessionTime = document.getElementById("nextSessionTime");

let currentFilter = "all";
let timerPreset = 25;
let remainingSeconds = timerPreset * 60;
let timerInterval = null;

function formatInputDate(date) {
    return date.toISOString().split("T")[0];
}

function addDays(baseDate, days) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + days);
    return date;
}

function generateId(prefix) {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function createInitialState() {
    const today = new Date();

    return {
        streak: 6,
        note: "مراجعة قوانين الفيزياء قبل جلسة المساء، وتجهيز أسئلة اللغة الإنجليزية الشفهية.",
        subjects: [
            {
                id: "math",
                name: "الرياضيات",
                progress: 72,
                focus: "تكامل وتفاضل",
                examDate: formatInputDate(addDays(today, 2))
            },
            {
                id: "physics",
                name: "الفيزياء",
                progress: 58,
                focus: "الكهرباء والموجات",
                examDate: formatInputDate(addDays(today, 4))
            },
            {
                id: "english",
                name: "اللغة الإنجليزية",
                progress: 81,
                focus: "Writing + Vocabulary",
                examDate: formatInputDate(addDays(today, 6))
            },
            {
                id: "programming",
                name: "البرمجة",
                progress: 64,
                focus: "JavaScript DOM",
                examDate: formatInputDate(addDays(today, 9))
            }
        ],
        tasks: [
            {
                id: generateId("task"),
                title: "حل 10 مسائل على التكامل",
                subject: "الرياضيات",
                dueDate: formatInputDate(today),
                priority: "high",
                done: false
            },
            {
                id: generateId("task"),
                title: "تلخيص فصل الكهرباء في صفحة واحدة",
                subject: "الفيزياء",
                dueDate: formatInputDate(addDays(today, 1)),
                priority: "medium",
                done: false
            },
            {
                id: generateId("task"),
                title: "مراجعة كلمات الوحدة السادسة",
                subject: "اللغة الإنجليزية",
                dueDate: formatInputDate(today),
                priority: "low",
                done: true
            }
        ],
        sessions: [
            {
                id: generateId("session"),
                title: "مراجعة رياضيات",
                time: "08:00 - 09:30",
                detail: "تمارين تكامل مع اختبار قصير",
                duration: 1.5,
                done: true
            },
            {
                id: generateId("session"),
                title: "فيزياء",
                time: "11:00 - 12:15",
                detail: "حل مسائل على دوائر التوالي والتوازي",
                duration: 1.25,
                done: false
            },
            {
                id: generateId("session"),
                title: "جلسة كتابة إنجليزي",
                time: "15:00 - 15:45",
                detail: "فقرة قصيرة وتصحيح الأخطاء",
                duration: 0.75,
                done: false
            },
            {
                id: generateId("session"),
                title: "مراجعة برمجة",
                time: "19:00 - 20:00",
                detail: "DOM events + mini practice",
                duration: 1,
                done: false
            }
        ]
    };
}

function loadState() {
    const savedState = localStorage.getItem(storageKey);

    if (!savedState) {
        return createInitialState();
    }

    try {
        const parsed = JSON.parse(savedState);
        return {
            streak: Number(parsed.streak) || 6,
            note: typeof parsed.note === "string" ? parsed.note : "",
            subjects: Array.isArray(parsed.subjects) ? parsed.subjects : createInitialState().subjects,
            tasks: Array.isArray(parsed.tasks) ? parsed.tasks : createInitialState().tasks,
            sessions: Array.isArray(parsed.sessions) ? parsed.sessions : createInitialState().sessions
        };
    } catch (error) {
        return createInitialState();
    }
}

let state = loadState();

function saveState() {
    localStorage.setItem(storageKey, JSON.stringify(state));
}

function formatArabicDate(dateString) {
    return new Date(dateString).toLocaleDateString("ar-EG", {
        day: "numeric",
        month: "short"
    });
}

function getRelativeLabel(dateString) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const target = new Date(dateString);
    target.setHours(0, 0, 0, 0);

    const dayDiff = Math.round((target - today) / 86400000);

    if (dayDiff === 0) {
        return "اليوم";
    }

    if (dayDiff === 1) {
        return "غدًا";
    }

    if (dayDiff > 1) {
        return `بعد ${dayDiff} أيام`;
    }

    return "فات الموعد";
}

function getPriorityLabel(priority) {
    if (priority === "high") {
        return "عالية";
    }

    if (priority === "medium") {
        return "متوسطة";
    }

    return "هادئة";
}

function renderSubjectOptions() {
    subjectSelect.innerHTML = state.subjects
        .map((subject) => `<option value="${subject.name}">${subject.name}</option>`)
        .join("");
}

function renderTasks() {
    const todayString = formatInputDate(new Date());

    const filteredTasks = state.tasks.filter((task) => {
        if (currentFilter === "today") {
            return task.dueDate === todayString;
        }

        if (currentFilter === "done") {
            return task.done;
        }

        return true;
    });

    if (!filteredTasks.length) {
        taskList.innerHTML = `<div class="empty-state">لا توجد عناصر في هذا الفلتر حاليًا.</div>`;
        return;
    }

    taskList.innerHTML = filteredTasks
        .map((task) => {
            const priorityClass = `tag--${task.priority}`;
            const title = task.done ? "إلغاء الاكتمال" : "تحديد كمكتملة";
            const icon = task.done ? "undo-2" : "check";

            return `
                <article class="task-item ${task.done ? "is-done" : ""}">
                    <div class="task-item__top">
                        <div>
                            <strong class="task-item__title">${task.title}</strong>
                            <div class="task-meta">موعد التنفيذ: ${formatArabicDate(task.dueDate)}</div>
                        </div>

                        <div class="tag-row">
                            <span class="tag tag--subject">${task.subject}</span>
                            <span class="tag ${priorityClass}">${getPriorityLabel(task.priority)}</span>
                        </div>
                    </div>

                    <div class="task-item__bottom">
                        <div class="task-meta">${task.done ? "تم التنفيذ" : "قيد المتابعة"}</div>

                        <div class="task-actions">
                            <button class="icon-button" type="button" data-action="toggle-task" data-id="${task.id}" aria-label="${title}">
                                <i data-lucide="${icon}"></i>
                            </button>
                            <button class="icon-button" type="button" data-action="delete-task" data-id="${task.id}" aria-label="حذف المهمة">
                                <i data-lucide="trash-2"></i>
                            </button>
                        </div>
                    </div>
                </article>
            `;
        })
        .join("");

    window.lucide?.createIcons();
}

function renderSubjects() {
    subjectGrid.innerHTML = state.subjects
        .map((subject) => `
            <article class="subject-card">
                <div class="subject-card__top">
                    <div>
                        <h3>${subject.name}</h3>
                        <p>${subject.focus}</p>
                    </div>
                    <strong>${getRelativeLabel(subject.examDate)}</strong>
                </div>

                <div class="progress-track" aria-hidden="true">
                    <div class="progress-bar" style="width: ${subject.progress}%"></div>
                </div>

                <div class="slider-row">
                    <input type="range" min="0" max="100" value="${subject.progress}" data-subject-id="${subject.id}">
                    <output>${subject.progress}%</output>
                </div>
            </article>
        `)
        .join("");
}

function renderSessions() {
    sessionGrid.innerHTML = state.sessions
        .map((session) => `
            <article class="session-card ${session.done ? "is-done" : ""}">
                <div class="session-card__meta">
                    <span>${session.time}</span>
                    <span>${session.duration.toFixed(2).replace(".00", "")} ساعة</span>
                </div>
                <div>
                    <h3>${session.title}</h3>
                    <p>${session.detail}</p>
                </div>
                <button class="btn ${session.done ? "btn--secondary" : "btn--primary"}" type="button" data-action="toggle-session" data-id="${session.id}">
                    <i data-lucide="${session.done ? "rotate-ccw" : "check-check"}"></i>
                    ${session.done ? "تراجع" : "تمت الجلسة"}
                </button>
            </article>
        `)
        .join("");

    window.lucide?.createIcons();
}

function updateSummary() {
    const completedTasks = state.tasks.filter((task) => task.done).length;
    const completion = state.tasks.length ? Math.round((completedTasks / state.tasks.length) * 100) : 0;
    const completedHours = state.sessions
        .filter((session) => session.done)
        .reduce((sum, session) => sum + Number(session.duration), 0);
    const nextExamSubject = [...state.subjects]
        .sort((first, second) => new Date(first.examDate) - new Date(second.examDate))[0];
    const nextSession = state.sessions.find((session) => !session.done) || state.sessions[0];

    statCompletion.textContent = `${completion}%`;
    statHours.textContent = completedHours.toFixed(1);
    statStreak.textContent = `${state.streak} أيام`;

    if (nextExamSubject) {
        statExam.textContent = nextExamSubject.name;
        statExamLabel.textContent = `${getRelativeLabel(nextExamSubject.examDate)} - ${formatArabicDate(nextExamSubject.examDate)}`;
    } else {
        statExam.textContent = "--";
        statExamLabel.textContent = "لا يوجد موعد بعد";
    }

    if (nextSession) {
        nextSessionTitle.textContent = nextSession.title;
        nextSessionMeta.textContent = nextSession.detail;
        nextSessionTime.textContent = nextSession.time;
    } else {
        nextSessionTitle.textContent = "لا توجد جلسات";
        nextSessionMeta.textContent = "ابدأ بإضافة جلسة إلى الجدول اليومي.";
        nextSessionTime.textContent = "--";
    }
}

function renderAll() {
    renderSubjectOptions();
    renderTasks();
    renderSubjects();
    renderSessions();
    quickNote.value = state.note;
    updateSummary();
}

function updateTimerDisplay() {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;

    timerDisplay.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function updateTimerButtons(isRunning) {
    timerToggleBtn.innerHTML = `
        <i data-lucide="${isRunning ? "pause" : "play"}"></i>
        ${isRunning ? "إيقاف" : "ابدأ"}
    `;
    window.lucide?.createIcons();
}

function setPreset(minutes) {
    timerPreset = minutes;
    remainingSeconds = timerPreset * 60;
    stopTimer();
    updateTimerDisplay();
    updateTimerButtons(false);
    timerStatus.textContent = `تم اختيار جلسة ${minutes} دقيقة.`;

    [...timerPresets.querySelectorAll("button")].forEach((button) => {
        button.classList.toggle("is-active", Number(button.dataset.minutes) === minutes);
    });
}

function handleTaskSubmit(event) {
    event.preventDefault();

    const title = taskTitleInput.value.trim();

    if (!title) {
        return;
    }

    state.tasks.unshift({
        id: generateId("task"),
        title,
        subject: subjectSelect.value,
        dueDate: taskDateInput.value,
        priority: taskPriorityInput.value,
        done: false
    });

    saveState();
    renderTasks();
    updateSummary();
    taskForm.reset();
    taskDateInput.value = formatInputDate(new Date());
    subjectSelect.selectedIndex = 0;
    taskPriorityInput.value = "high";
}

function handleTaskListClick(event) {
    const button = event.target.closest("button[data-action]");

    if (!button) {
        return;
    }

    const { action, id } = button.dataset;

    if (action === "toggle-task") {
        state.tasks = state.tasks.map((task) => (
            task.id === id ? { ...task, done: !task.done } : task
        ));
    }

    if (action === "delete-task") {
        state.tasks = state.tasks.filter((task) => task.id !== id);
    }

    saveState();
    renderTasks();
    updateSummary();
}

function handleTaskFilterClick(event) {
    const button = event.target.closest("button[data-filter]");

    if (!button) {
        return;
    }

    currentFilter = button.dataset.filter;

    [...taskFilters.querySelectorAll("button")].forEach((filterButton) => {
        filterButton.classList.toggle("is-active", filterButton.dataset.filter === currentFilter);
    });

    renderTasks();
}

function handleSubjectChange(event) {
    if (event.target.matches("input[type='range'][data-subject-id]")) {
        const subjectId = event.target.dataset.subjectId;
        const progress = Number(event.target.value);

        state.subjects = state.subjects.map((subject) => (
            subject.id === subjectId ? { ...subject, progress } : subject
        ));

        event.target.nextElementSibling.textContent = `${progress}%`;
        event.target.closest(".subject-card").querySelector(".progress-bar").style.width = `${progress}%`;
        saveState();
        updateSummary();
    }
}

function handleSessionClick(event) {
    const button = event.target.closest("button[data-action='toggle-session']");

    if (!button) {
        return;
    }

    const sessionId = button.dataset.id;

    state.sessions = state.sessions.map((session) => (
        session.id === sessionId ? { ...session, done: !session.done } : session
    ));

    saveState();
    renderSessions();
    updateSummary();
}

function handleSaveNote() {
    state.note = quickNote.value.trim();
    saveState();
    noteStatus.textContent = "تم حفظ الملاحظة على هذا الجهاز.";
}

function handleLoadDemo() {
    state = createInitialState();
    saveState();
    renderAll();
    setPreset(25);
    noteStatus.textContent = "تمت إعادة تحميل البيانات التجريبية.";
}

function handleTimerToggle() {
    if (timerInterval) {
        stopTimer();
        updateTimerButtons(false);
        timerStatus.textContent = "تم إيقاف الجلسة مؤقتًا.";
        return;
    }

    updateTimerButtons(true);
    timerStatus.textContent = `جلسة تركيز ${timerPreset} دقيقة شغالة الآن.`;

    timerInterval = window.setInterval(() => {
        remainingSeconds -= 1;
        updateTimerDisplay();

        if (remainingSeconds <= 0) {
            stopTimer();
            remainingSeconds = 0;
            updateTimerDisplay();
            updateTimerButtons(false);
            timerStatus.textContent = "أحسنت، الجلسة انتهت. خذ راحة قصيرة.";
        }
    }, 1000);
}

function handleTimerReset() {
    setPreset(timerPreset);
    timerStatus.textContent = "تمت إعادة المؤقت لنفس المدة.";
}

function attachEvents() {
    taskForm.addEventListener("submit", handleTaskSubmit);
    taskList.addEventListener("click", handleTaskListClick);
    taskFilters.addEventListener("click", handleTaskFilterClick);
    subjectGrid.addEventListener("input", handleSubjectChange);
    sessionGrid.addEventListener("click", handleSessionClick);
    saveNoteBtn.addEventListener("click", handleSaveNote);
    loadDemoBtn.addEventListener("click", handleLoadDemo);
    timerToggleBtn.addEventListener("click", handleTimerToggle);
    timerResetBtn.addEventListener("click", handleTimerReset);

    timerPresets.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-minutes]");

        if (!button) {
            return;
        }

        setPreset(Number(button.dataset.minutes));
    });
}

function init() {
    taskDateInput.value = formatInputDate(new Date());
    renderAll();
    setPreset(timerPreset);
    attachEvents();
    window.lucide?.createIcons();
}

init();
