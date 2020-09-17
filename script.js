// масив обєктів для зберігання видів діяльності
const activities = [
    {id: 1, name: 'Програмування', size: '2 години', diff: 2},
    {id: 2, name: 'Англійська', size: '2 години', diff: 5},
    {id: 3, name: 'Фізкультура', size: '1 година', diff: 9},
]
//масив обєктів для зберігання квестів
const quests = [
    {id: 4, activityID: 1, from: '2020-09-14', to: '2020-09-20',
    done: 2, total: 7, reward: 14, status: 'ongoing'},
    {id: 5, activityID: 3, from: '2020-09-12', to: '2020-09-12',
    done: 1, total: 1, reward: 5, status: 'done'},
]
// плани на виконання квесту
const todos = [
    {id: 6, questID: 5, date: '2020-09-12', confidence: 1, status: 'done'},
    {id: 7, questID: 4, date: '2020-09-14', confidence: 1, status: 'done'},
    {id: 8, questID: 4, date: '2020-09-15', confidence: 1, status: 'done'},
    {id: 9, questID: 4, date: '2020-09-16', confidence: 1, status: 'planned'},
    {id: 10, questID: 4, date: '2020-09-17', confidence: 2, status: 'planned'},
    {id: 11, questID: 4, date: '2020-09-18', confidence: 2, status: 'planned'},
    {id: 12, questID: 4, date: '2020-09-19', confidence: 2, status: 'planned'},
    {id: 13, questID: 4, date: '2020-09-20', confidence: 2, status: 'planned'},
]
//обєкт для перетворення статусу з інгл на укр
const statusUKR = {done: 'завершено', ongoing: 'триває', failed: 'провалено'}
// для збільшення значень ID
let nextID = 7
// показник віри в себе (кількість очок)
let confidence = 50 

showActivities()
showQuests()
showConfidence()
// показ дати і часу через кожну секунду
setInterval(showDateTime, 1000)
// виконуємо функції щоразу коли додається нова діяльність(activity)
saveNewActivityBtn.onclick = () => {
    saveNewActivity()
    showActivities()
}
// робимо функції для закриття модальних вікон
alertGlass.onclick = event => { 
    if (event.target == alertGlass || event.target.innerText == 'ok') {
        alertGlass.hidden = true
    }
}

takeQuestBtn.onclick = () => {
    takeNewQuest()
    showQuests()
    showConfidence()
    showActivities()
}

//////////////////////////////////////////////////////////////////////////////
// побудова елементу списку діяльностей
function buildActivityItem(activity) {
    const ongoing = quests.find(quest => quest.activityID == activity.id && quest.status == 'ongoing')
    return `
        <li>
            <details>
                <summary>
                    <span title="Діяльність">${activity.name}</span>
                    <span title="міра виконання">${activity.size}</span>
                    <span title="суб'єктивна складність">${activity.diff}</span>
                </summary>
                <div>
                ${ongoing ? '' :`
                    <button data-id="${activity.id}" data-diff="${activity.diff}">
                        Взяти квест
                    </button>`}

                    <button>Редагувати</button>
                    <button>🗑️</button>
                </div>
            </details>            
        </li>
    `
}
//побудова елементу списку квестів
function buildQuestItem(quest) {
    const activity = activities.find(activity => activity.id == quest.activityID)    

    return `
        <li>
            <details>
                <summary>
                    <span title="квест на діяльність">${activity.name}</span>
                    <span title="міра кожного виконання">${activity.size}</span>
                    <span title="суб'єктивна складність">${activity.diff}</span>
                    <span title="дата початку">з ${isoToGOST(quest.from)}</span>
                    <span title="можлива дата завершення">по ${isoToGOST(quest.to)}</span>
                    <span><span title="кількість днів виконання позаду">${quest.done}/</span><span title="передбачена тривалість квесту">${quest.total} днів</span></span>
                    <span title="завдаток/винагорода по завершенню">${quest.reward}</span>
                    <span title="статус квесту">${statusUKR[quest.status]}</span>
                </summary>
                <div>
                    <button>Деталі</button>
                    <button>Провалити</button>
                    <button>В архів</button>
                </div>
            </details>            
        </li>
    `
}

// вивід списку діяльностей
function showActivities() {
    activityList.innerHTML = activities.map(buildActivityItem).join('')
    activityList.querySelectorAll('details').forEach(element => {
        element.ontoggle = closeOtherDetails
    });
    activityList.querySelectorAll('button').forEach(btn => {
        if (btn.innerText.trim() == 'Взяти квест') {
            btn.onclick = () => {
                if (confidence >= +btn.dataset.diff) showGetQuestModal(btn.dataset.id)
                else showAlert('Недостатньо віри в себе на цей квест')
            }
        }
    })
}
// вивід списку квестів
function showQuests() {
    questList.innerHTML = quests.map(buildQuestItem).join('')
    questList.querySelectorAll('details').forEach(element => {
        element.ontoggle = closeOtherDetails
    });
}
//функція для збереження діяльностей з інпутів
function saveNewActivity() {
    if (nameInput.value && sizeInput.value && diffInput.value) {
        const newActivity = {
            id: nextID++,
            name: nameInput.value, 
            size: sizeInput.value, 
            diff: diffInput.value
        }
        activities.push(newActivity)
        nameInput.value = ''
        sizeInput.value = ''
        diffInput.value = ''
    } else {
        alert ('Не всі поля заповнені')
    }
}

// додається новий квест і закриваємо модальне вікно
function takeNewQuest() {
    const newQuest = {
        id: nextID++, 
        activityID: takeQuestBtn.dataset.id, 
        from: questFromInput.value, 
        to: questToInput.value,
        done: 0, 
        total: questDurationInput.value, 
        reward: questPledgeInput.value, 
        status: 'ongoing'
    }
    confidence -= newQuest.reward
    quests.push(newQuest)

    getQuestGlass.hidden = true //закримаэмо модалку  
}

//функція для згортання зайвих datails
//функція для закривання лишніх спойлерів, коли натискаєм на один із них
function closeOtherDetails(event) {
    if (closeOtherDetails.active) return 
    closeOtherDetails.active = true //флаг для функції

    this.closest('.brick-list').querySelectorAll('[open]').forEach(details => {
        if (details != event.target) details.open = false 
    }) 
    setTimeout(() => closeOtherDetails.active = false, 0)
}

// вивід показника віри в себе на екрані 
function showConfidence() {
    confidenceView.innerText = confidence
}

// функція для запису дати у стандартному форматі ISO
function dateToISO(dateObject) {
    const year = dateObject.getFullYear()
    let month = dateObject.getMonth()+1
    if (month < 10) month = '0' + month
    let date = dateObject.getDate()
    if (date < 10) date = '0' + date
    return `${year}-${month}-${date}`
}
// функція для запису дати iso у форматі ГОСТ
function isoToGOST(isoDate) {
    const [year, month, date] = isoDate.split('-')
    return `${date}.${month}.${year}`
}
// функція для інформування про щось
function showAlert(msg) {
    alertMsg.innerText = msg
    alertGlass.hidden = false
}
// функція для показу актуальної дати та часу
function showDateTime() {
    dateTimeView.innerHTML = `<div>${getCurrentDate()}</div><h3>${getCurrentTime()}</h3>`
}
// функція для визначення поточної дати
function getCurrentDate() {
    return isoToGOST(dateToISO(new Date))
}
// функція для визначення поточного часу
function getCurrentTime() {
    const date = new Date
    let hour = date.getHours()
    let minute = date.getMinutes()
    if (hour < 10) hour = '0' + hour
    if (minute < 10) minute = '0' + minute
    return `${hour}:${minute}`
}
