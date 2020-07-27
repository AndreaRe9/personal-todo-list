'use strict'

const path = require('path')
const SQL = require('sqlite3').verbose()

module.exports.initDb = function (appPath, callback) {
    let dbPath = path.join(appPath, 'todolist.db')
    let db = new SQL.Database(dbPath);
    db.run(`CREATE TABLE if not exists todos (id INTEGER PRIMARY KEY AUTOINCREMENT,
            text TEXT NOT NULL,
            section TEXT NOT NULL,
            timestamp INTEGER NOT NULL,
            isDone INTEGER DEFAULT 0,
            priority INTEGER DEFAULT 0)  
    `);
    //priority: 0=ordinary, 1=important

    if(typeof(callback)==='function') callback();
}

module.exports.insertTodo = function (text, section, timestamp, isDone, priority, callback){
    let db = new SQL.Database(window.model.db);
    if(db!=undefined){
        if(text.length>0){
            var qy;
            var par;
            if(section==='today' || section==='long-term'){
                qy = `INSERT INTO todos(text,section,timestamp,isDone,priority) VALUES(?,?,strftime('%s','now'),?,?);`
                par = [text,section,isDone,priority];
            }
            if(section==='this-week'){
                qy=  `INSERT INTO todos(text,section,timestamp,isDone,priority) VALUES(?,?,?,?,?);`
                par = [text,section,timestamp,isDone];
            }

            db.all(qy, par, function(err) {
                if (err) {
                  console.log(err.message);
                }
                db.all('SELECT id FROM todos ORDER BY id DESC LIMIT 1', [], function(err,rows){
                    rows.forEach((row) =>{
                        callback(row.id);
                    })
                });

            });
        } else console.log("text null");
    } else console.log("database undefined");
}

module.exports.deleteTodo = function (id){
    let db = new SQL.Database(window.model.db);
    if(db!=undefined){
        db.run('DELETE FROM todos WHERE id=?', [id], function(err){
            if(err){
                console.log(err.message);
            }
        })
    }
}

module.exports.updateTodo = function(id, text, isDone, priority){
    let db = new SQL.Database(window.model.db);
    if(db!=undefined){
        db.run('UPDATE todos SET text=?, isDone=?, priority=? WHERE id=?', [text,isDone,priority,id], function(err){
            if(err){ console.log(err.message); }
        })
    }
}

module.exports.getTodos = function(section, callback){
    var query;
    if(section==='today') query=`SELECT * FROM todos WHERE timestamp>=strftime('%s',date('now')) AND timestamp<strftime('%s',date('now','+1 days')) AND section!="long-term" ORDER BY priority DESC`;
    if(section==='this-week') query=`SELECT * FROM todos WHERE timestamp>=strftime('%s',date('now','+1 days')) AND timestamp<strftime('%s',date('now','+8 days')) AND section="this-week" ORDER BY priority DESC`;
    if(section==='long-term') query=`SELECT * FROM todos WHERE section="long-term" ORDER BY priority DESC`;

    let db = new SQL.Database(window.model.db);
    if(db!=undefined){
        db.all(query, [], (err, rows) => {
            if (err) {
              throw err;
            }
            callback(rows);
          });
    }
}

module.exports.countTodos = function(section, callback){
    var query;
    if(section==='today') query=`SELECT COUNT(*) FROM todos WHERE timestamp>=strftime('%s',date('now')) AND timestamp<strftime('%s',date('now','+1 days')) AND section!="long-term"`;
    if(section==='this-week') query=`SELECT COUNT(*) FROM todos WHERE timestamp>=strftime('%s',date('now','+1 days')) AND timestamp<strftime('%s',date('now','+8 days')) AND section="this-week"`;
    if(section==='long-term') query=`SELECT COUNT(*) FROM todos WHERE section="long-term"`;

    let db = new SQL.Database(window.model.db);
    if(db!=undefined){
        db.all(query, [], (err, rows) => {
            if (err) {
              throw err;
            }
            callback(rows);
          });
    }

}