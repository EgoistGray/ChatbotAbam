class Main{
    constructor(){ 
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
        this.broadcastBtn = document.querySelector('input#broadcast');

        this.calendar.min = Date.now()
    }
    
    async _initDatabase(){
        // Cleanup and database fetching
        let tmp = await fetch('/getDatabase');
        let b = await tmp.json();
        
        this.database = b;
        
        tmp = undefined;
        b = undefined;

        this._renderDatabaseToHTML();

        this.broadcastBtn.addEventListener('click', _ => {
            _.stopPropagation();
            _.stopImmediatePropagation();
            console.log(this.database);
            fetch('/broadcast', {
                method : "POST"
            });
            alert('Broadcasted');
        })

        this.button.addEventListener('click', _ => {
            if(this.calendar.value === '' || this.textbox.value === '') {
                alert('Fill in the blanks!');
                return;
            };
            let date = new Date(this.calendar.value).toDateString().split(' ');
            date.shift();

            // Swap Month and Day
            let tmp = date[0];
            date[0] = date[1]
            date[1] = tmp;
            tmp = undefined;

            date = date.join(' ');

            // Add to database
            if(this.database[date] === undefined){
                this.database[date] = [];
            }

            this.database[date].push(this.textbox.value);
            this._renderDatabaseToHTML();
            this._updateDatabaseToServer();
        });

    }

    _parseDatabaseToHTML(){
        let deadlines = Object.keys(this.database).sort();
        let dataBoxesComponents = [];
        
        // Initalize deadline boxes ands tasks
        for(let date of deadlines){
            let tmp = document.createElement('div');
            tmp.classList.toggle(this.taskContainer.class);
            
            let deadlineTitle = document.createElement('div');
            deadlineTitle.classList.toggle(this.taskContainer.construct[0]);
            deadlineTitle.textContent = date;
            
            // Set the deadline title
            tmp.appendChild(deadlineTitle);
            
            let taskBox = this._parseToTaskBoxComponent();
            // Input the tasks on that day
            for(let task of this.database[date]){
                taskBox.appendChild(this._parseToTaskComponent(task));
            }
            tmp.appendChild(taskBox);
            dataBoxesComponents.push(tmp);
        };
        return dataBoxesComponents;
    }
    
    _parseToTaskBoxComponent(){
        let task = document.createElement('div');
        task.classList.toggle(this.taskContainer.construct[1]);
        return task;
    }
    _parseToTaskComponent(title){
        let taskContainer = document.createElement('div');
        taskContainer.classList.toggle('task');
        
        let task = document.createElement('div');
        task.classList.toggle('taskTitle');
        task.textContent = title;

        let deleteBtn = document.createElement('input');
        deleteBtn.type = "button";
        deleteBtn.value = "Delete";
        
        taskContainer.appendChild(task);
        taskContainer.appendChild(deleteBtn);

        return taskContainer;
    }

    _renderDatabaseToHTML(){
        // Scan for empty date
        Object.keys(this.database).map(date => {
            if(this.database[date].length === 0){
                delete this.database[date];
            }
        });
        this._updateDatabaseToServer();
        if(Object.keys(this.database).length === 0){
            console.log(111);
            this.broadcastBtn.className = 'hideBroadcast';
            this.scheduleInterface.innerHTML = "";
            return;
        } else {
            this.broadcastBtn.className = '';
        }
        // Clear first (lazy)
        this.scheduleInterface.innerHTML = "";

        let componentsToRender = this._parseDatabaseToHTML();

        componentsToRender.map( component => {
            console.log(component);
            this.scheduleInterface.appendChild(component);
        });

        // Reset textboxes
        this.textbox.value = "";
        this.calendar.value = "";

        // Set all event listeners
        document.querySelectorAll('input[type="Button"]').forEach( item => {
            item.addEventListener('click', _ => {
 
                let targettedDateBox = item.parentElement.parentElement.parentElement;
                let deadline = targettedDateBox.children[0].textContent;
                let taskName = item.parentElement.children[0].textContent;
                
                targettedDateBox = undefined;

                // Remove item at local database and update at remote database
                this.database[deadline].splice(this.database[deadline].indexOf(taskName), 1);
                this._updateDatabaseToServer();
                this._renderDatabaseToHTML();
            });
        });
    }

    async _updateDatabaseToServer(){
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