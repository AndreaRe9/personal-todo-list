(function(window, document, undefined){
  const electron = require('electron')
  const path = require('path');
  const app = electron.remote.app;

  let webRoot = path.dirname(__dirname)
  window.model = require(path.join(webRoot, 'js','model.js'));
  const utils = require(path.join(webRoot, 'js', 'utils.js'));
  window.model.db = path.join(app.getPath('userData'), 'todolist.db');

  var sections = ['today','this-week','long-term'];

  window.onload = init;
  
    function init(){
      document.getElementById("menu_i").addEventListener('click', toggleMenu);
      document.getElementById("newevent").addEventListener('click', newTodo);
      document.getElementById("today").addEventListener('click', loadHome);
      document.getElementById("this-week").addEventListener('click', loadWeek);
      document.getElementById("long-term").addEventListener('click', loadLongTerm);
      document.getElementById("prev-month").addEventListener('click',prevMonth);
      document.getElementById("next-month").addEventListener('click',nextMonth);
      document.getElementById("month-name").addEventListener('click',currentMonth);


      document.addEventListener('click', function(event) {
        if (!event.target.classList.contains("float_btn") && !event.target.classList.contains("plus_btn")) {
          document.getElementById('float-menu').style.display = 'none';
        }
      })

      updateView('today'); //default, on startup
      setupCalendar(); //default, on startup

      function updateEvents(i){
        var clone = document.getElementsByClassName("list-row")[i].cloneNode(true);
        document.getElementsByClassName("list-row")[i].parentNode.replaceChild(clone, document.getElementsByClassName("list-row")[i]);
        document.getElementsByClassName("list-box")[i].addEventListener('click', strikeTodo, false);
        document.getElementsByClassName("list-row")[i].addEventListener('mouseover', showTools, false);
        document.getElementsByClassName("list-row")[i].addEventListener('mouseout', hideTools, false);
        document.getElementsByClassName("list-row")[i].addEventListener('focusout', changeTodo, false);
        document.getElementsByClassName("list-row")[i].addEventListener('click', focusonText, false);
        document.getElementsByClassName("delete")[i].addEventListener('click', deleteTodo, false );
        document.getElementsByClassName("priority")[i].addEventListener('click', setNotePriority, false );
      }

      function loadHome(){
        updateView('today',true);
        document.getElementById('current').innerText = "today";
        clearSelected(this);
      }

      function loadWeek(){
        updateView('this-week', true);
        document.getElementById('current').innerText = "this week";
        clearSelected(this);
      } 
      function loadLongTerm(){
        updateView('long-term', true);
        document.getElementById('current').innerText = "the future";
        clearSelected(this);
      }

      function getCurrentSection(){
        return document.getElementsByClassName("selected")[0].getAttribute('id');
      }

      function clearSelected(element){
        var sections = document.getElementsByClassName("section");
        for (var i = 0; i <sections.length; i++) {
          if(sections[i].classList.contains("selected")) sections[i].classList.remove("selected");
        }
        element.classList.add('selected');
      }

      function toggleMenu(){
        var menu= document.getElementById("sidebar");
        menu.classList.toggle("open_menu");
        var right_pane = document.getElementById("pane");
        right_pane.classList.toggle("adapt_pane");
        var menu_icon = document.getElementById("menu_i")
        menu_icon.classList.toggle("down");
      }

      function changeTodo(){
        var row = this;
        var text = row.getElementsByClassName('list-text')[0].innerText;
        if(text.length==0){
          row.getElementsByClassName('delete')[0].click();
        }
        else{
          var isDone = row.getElementsByClassName('done').length==1;
          var priority = row.getElementsByClassName('relevant').length==1;
          if(isDone) isDone=1;
          else isDone=0;
          
          if(priority) priority=1;
          else priority=0;
          
          if(row.getAttribute('id')===null){
            window.model.insertTodo(text,getCurrentSection(),row.getAttribute("tmp"),isDone,priority, function(todo_id){
              row.setAttribute("id",todo_id);
            });
          }
          else{
            window.model.updateTodo(parseInt(row.getAttribute('id')), text, isDone, priority);
          }
        }
      }

      function strikeTodo() {
        var n_row = document.createElement('i');
        n_row.className = "fa fa-check done";
        var dones = this.parentElement.getElementsByClassName("done");
        if(dones.length==0){
          //add strike
          this.parentElement.getElementsByClassName("list-text")[0].style.color = "#c0c0c0";
          this.appendChild(n_row);
        }
        else{
          //remove strike
          this.parentElement.getElementsByClassName("list-text")[0].style.color = "#222222";
          this.removeChild(dones[0]);
        }
        //trigger focusout event to update the database
        this.parentElement.dispatchEvent(new Event('focusout'));
      }

      function setNotePriority(){
        var priority = this.parentElement.getElementsByClassName("relevant");
        if(priority.length==0){
          this.classList.add("fa-star");
          this.classList.add("relevant");
          this.classList.remove("fa-star-o");
          this.classList.remove("ordinary");        
        }
        else{
          this.classList.add("fa-star-o")
          this.classList.add("ordinary");
          this.classList.remove("fa-star")
          this.classList.remove("relevant");
        }
        //trigger focusout event to update the database
        this.parentElement.parentElement.parentElement.dispatchEvent(new Event('focusout'));
      }

      function focusonText(){
        this.getElementsByClassName("list-text")[0].focus();
        this.dispatchEvent(new Event('mouseover'));
      }

      function showTools(){
        this.getElementsByClassName("delete")[0].classList.add("show-tools");
        this.getElementsByClassName("delete")[0].classList.remove("hide-tools");
        if(this.getElementsByClassName("relevant").length===0){
          this.getElementsByClassName("priority")[0].classList.add("show-tools");
          this.getElementsByClassName("priority")[0].classList.remove("hide-tools");
        }
      }

      function hideTools(){
        this.getElementsByClassName("delete")[0].classList.add("hide-tools");
        this.getElementsByClassName("delete")[0].classList.remove("show-tools");
        if(this.getElementsByClassName("relevant").length===0){
          this.getElementsByClassName("priority")[0].classList.add("hide-tools");
          this.getElementsByClassName("priority")[0].classList.remove("show-tools");
        } 
      }

      function deleteTodo(){
        var toRemove = this.parentElement.parentElement.parentElement;
        var todo_id = toRemove.getAttribute('id');
        toRemove.style.opacity = '0';
        setTimeout(function(){toRemove.remove(toRemove);}, 250);

        if(todo_id!=null) window.model.deleteTodo(todo_id);
      }

      function newTodo(){
        if(getCurrentSection()==='this-week'){
          document.getElementById("float-menu").style.display = 'inline';
          document.getElementById("days").innerHTML = "";
          var startDate = new Date();
          var aryDates = utils.GetDates(startDate, 7);
          for(var i=0;i<7;i++){
            var day = utils.DayAsString(aryDates[i].getDay());
            var day_line =  `<li class="day" tmp=${Math.floor(aryDates[i].getTime()/1000)}>${day}</li>`
            document.getElementById("days").insertAdjacentHTML('beforeend',day_line);
            document.getElementsByClassName("day")[i].addEventListener('click',createWeekEvent, false);
            }
        }
        else{ createEvent(); }
      }

      function createEvent(tmp=0){
          var event_template;
          if(tmp!=0) {
            var date = new Date(tmp*1000).getDay();
            var day = utils.DayAsString(date).substring(0,3);
            var color = utils.getDayColor(date);
            event_template= `<li class="list-row" draggable="true" tmp=${tmp}><div class="day-label ${color}"><p>${day[0]}</p><p>${day[1]}</p><p>${day[2]}</p></div><div class="list-box"></div><p class="list-text" contenteditable="true" spellcheck="false"></p><div class="tools"><ul class="line"><i class="fa fa-star-o priority ordinary hide-tools"></i><i class="fa fa-trash delete hide-tools"></i></ul></div></li>`;
          }
            else event_template= `<li class="list-row" draggable="true"><div class="list-box"></div><p class="list-text" contenteditable="true" spellcheck="false"></p><div class="tools"><ul class="line"><i class="fa fa-star-o priority ordinary hide-tools"></i><i class="fa fa-trash delete hide-tools"></i></ul></div></li>`;
          document.getElementById("todos-container").insertAdjacentHTML('beforeend',event_template);
          var texts = document.getElementsByClassName('list-text');
          var last_i = document.getElementsByClassName("list-row").length-1;
          //add events
          updateEvents(last_i);
          //focus on todo-name
          texts[last_i].focus();
      }

      function createWeekEvent(){
        createEvent(tmp=this.getAttribute("tmp"));
      }

      function clearTodoView(){
        document.getElementById("todos-container").innerHTML = "";
      }


      function updateView(page_section, changing=false){
        //update todos counter
        sections.forEach((section) => {
          window.model.countTodos(section, function(num){
            num.forEach((n) => {
              var i=0;
              if(section==='this-week') i=1;
              if(section==='long-term') i=2;
              document.getElementsByClassName('counter-value')[i].innerText = Object.values(n)[0];
            })
          });
        })

        if(changing) clearTodoView();
        window.model.getTodos(page_section, function(todos){
          var i = 0;
          console.log(todos);
          todos.forEach((todo) => {
            var event_template;
            if(page_section==='this-week') {
              var date = new Date(todo.timestamp*1000).getDay();
              var day = utils.DayAsString(date).substring(0,3);
              var color = utils.getDayColor(date);
              event_template=`<li class="list-row" id=${todo.id} draggable="true" tmp=${todo.timestamp}><div class="day-label ${color}"><p>${day[0]}</p><p>${day[1]}</p><p>${day[2]}</p></div><div class="list-box"></div><p class="list-text" contenteditable="true" spellcheck="false">${todo.text}</p><div class="tools"><ul class="line"><i class="fa fa-star-o priority ordinary hide-tools"></i><i class="fa fa-trash delete hide-tools"></i></ul></div></li>`;
            } 
            else event_template=`<li class="list-row" id=${todo.id} draggable="true" tmp=${todo.timestamp}><div class="list-box"></div><p class="list-text" contenteditable="true" spellcheck="false">${todo.text}</p><div class="tools"><ul class="line"><i class="fa fa-star-o priority ordinary hide-tools"></i><i class="fa fa-trash delete hide-tools"></i></ul></div></li>`; 
            
            document.getElementById("todos-container").insertAdjacentHTML('beforeend',event_template);
            updateEvents(i);

            if(todo.isDone===1){
              var n_row = document.createElement('i');
              n_row.className = "fa fa-check done";
              document.getElementsByClassName("list-text")[i].style.color = "#c0c0c0";
              document.getElementsByClassName("list-box")[i].appendChild(n_row);
            }
            if(todo.priority===1){
              var pry = document.getElementsByClassName("priority")[i];
              pry.classList.add("fa-star");
              pry.classList.add("relevant");
              pry.classList.add("show-tools");
              pry.classList.remove("fa-star-o");
              pry.classList.remove("ordinary");
              pry.classList.add("hide-tools");
            }
            i=i+1;
          });
        })
      }

      function nextMonth(){
        var date = new Date(parseInt(document.getElementsByTagName('time')[0].getAttribute("datetime")));
        date.setMonth(date.getMonth()+1);
        setupCalendar(date);
      }

      function prevMonth(){
        var date = new Date(parseInt(document.getElementsByTagName('time')[0].getAttribute("datetime")));
        date.setMonth(date.getMonth()-1);
        setupCalendar(date);
      }

      function currentMonth(){ setupCalendar();}

      function setupCalendar(d=new Date()){
        document.getElementById("grid-days").innerHTML="";

        document.getElementById('month-name').innerHTML = `${utils.MonthAsString(d.getMonth())}<br><span>${d.getFullYear()}</span>`;
        var start = new Date(d.setDate(1));
        var day = start.getDay();
        while(start.getMonth()===d.getMonth()){
          var selected = "";
          if(utils.isToday(start)) selected="currentDay";
          else selected="";
          var cell = `<button class="day-cell ${selected}"><time datetime="${start.getTime()}">${start.getDate()}</time></button>`;
          document.getElementById("grid-days").insertAdjacentHTML('beforeend',cell);
          start.setDate(start.getDate()+1);
        }
        document.getElementById("grid-days").firstElementChild.style.setProperty('grid-column',day);
      }
    }
})(window, document, undefined);



