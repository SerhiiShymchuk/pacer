
// закриваэмо модальне вікно для планів квесту
todoGlass.onclick = event => { 
    if (event.target == todoGlass || event.target.innerText == 'Ok') {
        todoGlass.hidden = true
    }
}
// клік
showTodoBtn.onclick = () => {
    showTodoToday()
    if (!todoList.children.length) {
        todoList.innerHTML = '<center>Планів на сьогодні немає. Варто взяти квест</center>'
    }
    showTodoModal()
}
//клік на кнопку ок чи фолс
todoList.onclick = event => {
    if (event.target.tagName == 'BUTTON') {
        const status = event.target.innerText == '✔️'? 'done' : 'failed'
        setTodoStatus(event.target.closest('li').dataset.id, status)
        showConfidence()
        showTodoToday()
        showQuests()
        showActivities()
    } 
}

// функція для показу модального вікна з планами на сьогодні
function showTodoModal() {
    todoGlass.hidden = false
}
// функція для побудови елементу списку планів
function buildTodoItem(todo) {
    const quest = quests.find(quest => quest.id == todo.questID)    
    const activity = activities.find(activity => activity.id == quest.activityID)    
    return `
        <li class="${todo.status}" data-id="${todo.id}">
            ${todo.status == 'done' ? '<span>✔️</span>' 
            : (todo.status == 'failed' ? '<span>❌</span>' 
            : '<span><button>✔️</button><button>❌</button></span>')}
            ${todo.status == 'planned' ? '' : '<div></div>'}
            <span>${activity.name}</span>
            <span>${activity.size}</span>
            <span>+${todo.confidence}</span>
        </li>
    `
}
// функція для виводу планів на сьогодні
function showTodoToday() {
    todoList.innerHTML = todos.filter(todo => {
        const date = new Date
        if (todo.date != dateToISO(date)) return
        else if (todo.status !== 'failed') return true
        const quest = quests.find(quest => quest.id == todo.questID)
        //const yesterday = new Date(date - 86400000)
        date.setDate(date.getDate() - 1)
        const alreadyFailed = todos.find(todo => todo.questID == quest.id 
            && todo.date == (dateToISO(date)) && todo.status == 'failed')
        return !alreadyFailed
    })
        .map(buildTodoItem).join('')
} 
// функція для зміни статусу плану і кількості очок
function setTodoStatus(todoID, status) {
    const todo = todos.find(todo => todo.id == todoID)
    todo.status = status
    const quest = quests.find(quest => quest.id == todo.questID)
    if (status == 'done') {
        quest.progress++
        confidence(todo.confidence)
        updateQuestStatus(quest)
        populateQuestTodos(quest)    
    } else {
        const canceledTodos = todos.filter(todo => todo.questID == quest.id && todo.status == 'planned')
        canceledTodos.forEach(todo => todo.status = 'failed')
        if (quest.status != 'ongoing') todos = todos.filter(todo => !canceledTodos.includes(todo))
        updateQuestStatus(quest)
    }
    localStorage.todos = JSON.stringify(todos)
}
//функція для зміни статусу квесту в залежності від плану
function updateQuestStatus(quest /* or quest.id */) {
    //якщо передали не обэкт квесту то тоді це його айді
    if (typeof quest != 'object') quest = quests.find(q => q.id == quest)
    if (quest.status != 'ongoing' ) return quest.status
    
    if (quest.progress >= quest.total) {
        confidence(quest.confidence)
        quest.status = 'done'
        const activity = activities.find(activity => activity.id == quest.activityID)
        if (quest.total >= +localStorage.etap &&
            activity.diff >= quest.confidence/quest.total &&
            activity.diff > 1) {
                activity.diff--
                localStorage.activities = JSON.stringify(activities)
        }
    }
    else if (todos.some(todo => todo.questID == quest.id && todo.status == 'failed')) { 
        quest.status = 'failed'
        const activity = activities.find(activity => activity.id == quest.activityID)
        if (activity.diff <= quest.confidence/quest.total) {
            activity.diff++
            localStorage.activities = JSON.stringify(activities)
        }
    }
    localStorage.quests = JSON.stringify(quests)
    return quest.status
}
//функція для створення нових todo для quest
function populateQuestTodos(quest) {
    const questTodos = todos.filter(todo => todo.questID == quest.id)
    if (!quest.progress && !questTodos.length) {
        addNewTodos(quest)
    } else if (quest.status == 'done' && questTodos.every(todo => todo.status == 'done')) {
        continueInertia(questTodos)
    }
}

function addNewTodos(quest) {
    const diff = quest.confidence/quest.total
    const date = new Date(quest.from)
    date.setDate(date.getDate() - 1)
    const yesterdayTodos = todos.filter(todo => todo.date == dateToISO(date) && todo.status == 'done')
    const lastTodo = yesterdayTodos.find(todo => {
        const q = quests.find(quest => quest.id == todo.questID)
        return quest.activityID == q.activityID
    })
    const n = lastTodo?.n || 0
    for (let i = 0; i < quest.total; i++) {
        const date = new Date(quest.from)
        if (!i) {
            const activityQuestsIDs = quests.filter(q => q.activityID == quest.activityID)
                .map(quest => quest.id)
            const inertiaTodo = todos.findIndex(todo => todo.date == dateToISO(date) &&
                activityQuestsIDs.includes(todo.questID) && todo.status == 'planned')
            if (inertiaTodo !== -1)
                todos.splice(inertiaTodo, 1)
        }
        date.setDate(date.getDate() + i)

        const newTodo = {
            id: newID(),
            questID: quest.id,
            date: dateToISO(date),
            confidence: Math.min(diff, Math.floor((i + n + 1) ** 0.5)),
            status: 'planned',
            n: i + n + 1,
        }
        todos.push(newTodo)
    }
    localStorage.todos = JSON.stringify(todos)
}

function continueInertia(questTodos) {
    const lastTodo = questTodos[questTodos.length - 1]
    const date = new Date(lastTodo.date)
    date.setDate(date.getDate() + 1)
    const newTodo = { ...lastTodo, id: newID(), date: dateToISO(date), status: 'planned' }
    todos.push(newTodo)
    if (newTodo.date < dateToISO(new Date)) {
        overdueTodos.push(newTodo)
        overdueTodos.sort((a, b) => a.date < b.date ? -1 : 1)
        groupedOverdueTodos[newTodo.date] =
            [...groupedOverdueTodos[newTodo.date] || [], newTodo]
    }
    localStorage.todos = JSON.stringify(todos)
}
