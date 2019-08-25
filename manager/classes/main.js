class Main {
    constructor() {
        this.taskContainer = {};
        this.taskContainer.class = "dateBox";
        this.taskContainer.construct = ['deadline', 'taskBox'];
        this.taskClass = 'task';
        this.database = {};

        this._initDatabase();

        // Elements
        this.scheduleInterface = document.querySelector('div#schedule');
        this.textbox = document.querySelector('input#addEvent');
        this.calendar = document.querySelector('input#date');
        this.button = document.querySelector('input#add');
        this.broadcastController = document.querySelector('input#broadcast');
        this.subject = document.querySelector('select');

        this.calendar.min = Date.now()
    }

    async _initDatabase() {
        // Cleanup and database fetching
        let tmp = await fetch('/getDatabase');
        let b = await tmp.json();

        this.database = b;

        tmp = undefined;
        b = undefined;

        this._renderDatabaseToHTML();

        this.broadcastController.addEventListener('click', _ => {
            _.stopPropagation();
            _.stopImmediatePropagation();
            fetch('/broadcast', {
                method: "POST"
            });
            alert('Broadcasted');
        })

        this.button.addEventListener('click', _ => {
            if (this.calendar.value === '' || this.textbox.value === '') {
                alert('Fill in the blanks!');
                return;
            };
            let date = new Date(this.calendar.value).toDateString().split(' ');
            let day = date.shift();

            // Swap Month and Day
            let tmp = date[0];
            date[0] = date[1]
            date[1] = tmp;
            tmp = undefined;

            date[1] = this._parseToIndonesianMonth(date[1]);

            date.unshift(this.getIndonesianDay(day) + ',');

            date = date.join(' ');

            // Add to database
            if (this.database[date] === undefined) {
                this.database[date] = {};
            }

            this.database[date][this.subject.value] = this.textbox.value;
            this.subject.selectedIndex = 0;
            this._renderDatabaseToHTML();
            this._updateDatabaseToServer();
        });

    }

    _parseToIndonesianMonth(date) {
        switch (date) {
            case 'Jan':
                date = 'Januari'
                break;

            case 'Des':
                date = 'Desember'
                break;

            case 'Feb':
                date = 'Februari'
                break;

            case 'Mar':
                date = 'Maret'
                break;

            case 'Apr':
                date = 'April'
                break;

            case 'May':
                date = 'May'
                break;

            case 'Jun':
                date = 'Juni'
                break;

            case 'Jul':
                date = 'Juli'
                break;

            case 'Aug':
                date = 'Agustus'
                break;

            case 'Sep':
                date = 'September'
                break;

            case 'Oct':
                date = 'Oktober'
                break;

            case 'Nov':
                date = 'November'
                break;

            default:
                break;
        }
        return date;
    }

    getIndonesianDay(day) {
        switch (day) {
            case 'Sun':
                day = "Minggu";
                break;
            case 'Mon':
                day = "Senin";
                break;
            case 'Tue':
                day = "Selasa";
                break;
            case 'Wed':
                day = "Rabu";
                break;
            case 'Thu':
                day = "Kamis";
                break;
            case 'Fri':
                day = "Jumat";
                break;
            case 'Sat':
                day = "Sabtu";
        }
        return day;
    }

    _returnDateAsNumber(date){
        let compariton = 'Januari Februari Maret April May Juni Juli Agustus September Oktober November Desember'.split(' ');
        return compariton.indexOf(date);
    }

    _parseDatabaseToHTML() {
        let deadlines = Object.keys(this.database).sort( (a,b) => {
            a = a.split(' ').map(Number);
            a.shift();

            b = b.split(' ').map(Number);
            b.shift();

            // The 10 multiplication is to signify how important is the factor
            let tmpCompare1 = parseInt(a[0]) + this._returnDateAsNumber(a[1]) * 10 + a[2] * 100;
            let tmpCompare2 = parseInt(b[0]) + this._returnDateAsNumber(a[1]) * 10 + b[2] * 100;

            return tmpCompare1 - tmpCompare2;
        });
        let dataBoxesComponents = [];

        // Initalize deadline boxes ands tasks
        for (let date of deadlines) {
            let tmp = document.createElement('div');
            tmp.classList.toggle(this.taskContainer.class);

            let deadlineTitle = document.createElement('div');
            deadlineTitle.classList.toggle(this.taskContainer.construct[0]);
            deadlineTitle.textContent = date;

            // Set the deadline title
            tmp.appendChild(deadlineTitle);

            let taskBox = this._parseToTaskBoxComponent();

            // Input the tasks on that day
            for (let subject of Object.keys(this.database[date])) {
                // Append the subject
                taskBox.appendChild(this._parseToTaskTitleComponent(subject));
                // Append the description
                taskBox.appendChild(this._getAsDescriptionComponent(this.database[date][subject]));
            }

                tmp.appendChild(taskBox);
                dataBoxesComponents.push(tmp);
            }
            return dataBoxesComponents;
        }

    _parseToTaskBoxComponent() {
        let task = document.createElement('div');
        task.classList.toggle(this.taskContainer.construct[1]);
        return task;
    }

    _getAsDescriptionComponent(description) {
        let dscComponent = document.createElement('div');
        dscComponent.classList.toggle('taskDescription');
        dscComponent.textContent = description;
        return dscComponent;
    }

    _parseToTaskTitleComponent(title) {
        let taskContainer = document.createElement('div');
        taskContainer.classList.toggle('task');

        // Title is the subject of the files
        let task = document.createElement('div');
        task.classList.toggle('taskTitle');
        task.textContent = title;

        let deleteBtn = document.createElement('input');
        deleteBtn.type = "button";
        deleteBtn.value = "Delete";
        deleteBtn.id = "deleteBtn";

        taskContainer.appendChild(task);
        taskContainer.appendChild(deleteBtn);

        return taskContainer;
    }

    _renderDatabaseToHTML() {
        // Scan for empty date
        Object.keys(this.database).map(date => {
            if (this.database[date].length === 0) {
                delete this.database[date];
            }
        });
        this._updateDatabaseToServer();
        if (Object.keys(this.database).length === 0) {
            this.scheduleInterface.innerHTML = "";
            this.broadcastController.className = 'hideBroadcast';
        } else {
            this.broadcastController.className = '';
        }
        // Clear first (lazy)
        this.scheduleInterface.innerHTML = "";

        let componentsToRender = this._parseDatabaseToHTML();
        componentsToRender.map(component => {
            this.scheduleInterface.appendChild(component);
        });

        // Reset textboxes
        this.textbox.value = "";
        this.calendar.value = "";

        // Set all event listeners
        document.querySelectorAll('input[type="Button"]#deleteBtn').forEach(item => {
            item.addEventListener('click', _ => {
                let targettedDateBox = item.parentElement.parentElement.parentElement;
                let targettedTaskComponent = item.parentElement;
                let subject = targettedTaskComponent.children[0].textContent;
                let deadline = targettedDateBox.children[0].textContent;

                targettedDateBox = undefined;
                targettedTaskComponent = undefined;

                // Remove item at local database and update at remote database
                delete this.database[deadline][subject];
                if(Object.keys(this.database[deadline]).length === 0){
                    delete this.database[deadline];
                }

                this._updateDatabaseToServer();
                this._renderDatabaseToHTML();
            });
        });
        
    }

    async _updateDatabaseToServer() {
        await fetch('/updateDatabase', {
            method: "POST",
            body: JSON.stringify(this.database),
            headers: {
                'Content-type': "application/json"
            }
        });
    }
}

window.addEventListener('load', _ => new Main());