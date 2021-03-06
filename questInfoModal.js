questInfoModal.firstElementChild.onclick = () => {
    showActivityInfoModal(questInfoModal.firstElementChild.dataset.id)
    questInfoGlass.hidden = true
}
questInfoModal.querySelector('ul').onclick = event => {
    if (event.target.tagName == 'BUTTON') {
        const status = event.target.innerText == '✔️'? 'done' : 'failed'
        const todoID = event.target.closest('li').dataset.id
        const {questID} = todos.find(todo => todo.id == todoID)
        const quest = quests.find(quest => quest.id == questID)
        setTodoStatus(todoID, status)
        showConfidence()
        showActivities()
        showQuests()
        prepQuestInfoModal(quest)
        if (quest.status == 'done') 
            event.currentTarget.lastElementChild.scrollIntoView({behavior:'smooth'})
    }
}

// функція для підготовки значень діяльності та квесту в розмітку модалки "деталі" 
function prepQuestInfoModal(quest) {
    const activity = activities.find(activity => activity.id == quest.activityID)
    questInfoModal.firstElementChild.dataset.id = activity.id
    const spans = questInfoModal.querySelectorAll('div>span')
    spans[0].innerText = activity.name
    spans[1].innerText = activity.size
    spans[2].innerText = quest.confidence/quest.total
    spans[3].innerText = isoToGOST(quest.from)
    spans[4].innerText = isoToGOST(quest.to)
    spans[5].innerText = quest.progress
    spans[6].innerText = quest.total
    spans[7].innerText = quest.confidence
    spans[8].innerText = quest.status == 'done' ? '✔️' : quest.status == 'failed' ? '❌' : ''
    spans[9].innerText = statusUKR[quest.status]
    showQuestTodos(quest)
}
// функція для показу даних квесту та діяльності в модалці деталей
function showQuestInfoModal(questID) {
    const quest = quests.find(quest => quest.id == questID)
    prepQuestInfoModal(quest)
    questInfoGlass.hidden = false
}
// побудова елементу списку звітів по датам
function buildQuestTodoItem(todo, i, todos) {
    return `
        <li class="${todo.status}" data-id="${todo.id}">
            <span>
                ${todo.status == 'done' ? '✔️' 
                : (todo.status == 'failed' ? '❌' 
                : i && todos[i-1].status != 'done' || todo.date > dateToISO(new Date) ? ''
                : '<span><button>✔️</button><button>❌</button></span>')}
            </span>
            <span>${isoToWeekDay(todo.date)}</span>
            <span>+${todo.confidence}</span>
        </li>
    `
}
// функція для показу списку всіх виконань в рамках квесту
function showQuestTodos(quest) {
    const questTodos = todos.filter(todo => todo.questID == quest.id)
    questInfoModal.querySelector('ul').innerHTML = questTodos.map(buildQuestTodoItem).join('')
}
