const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const format = require("date-fns/format");
//console.log(date);
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server running on http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertTodoResponse = (obj) => {
  return {
    id: obj.id,
    todo: obj.todo,
    priority: obj.priority,
    status: obj.status,
    category: obj.category,
    dueDate: obj.due_date,
  };
};

const validity = (request, response, next) => {
  const { status, priority, category, search_q, dueDate } = request.query;
  if (status !== undefined) {
    if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
      next();
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else if (priority !== undefined) {
    if (priority === "HIGH" || priority === "LOW" || priority === "MEDIUM") {
      next();
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  } else if (category !== undefined) {
    if (category === "WORK" || category === "HOME" || category === "LEARNING") {
      next();
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  } else if (search_q !== undefined) {
    next();
  }
  /*if(dueDate!==undefined){
      next()
  }else{
      response.status(400);
      response.send("Invalid Due Date");
  }*/
  /*else if (dueDate === undefined) {
    if (category === "WORK" || category === "HOME" || category === "LEARNING") {
      next();
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  }*/
  /* if (category === undefined) {
    response.status(400);
    response.send("Invalid Todo Category");
  } else {
    next();
  }
  if (dueDate === undefined) {
    response.status(400);
    response.send("Invalid Due Date");
  } else {
    next();
  }*/
};

const bodyValidity = (request, response, next) => {
  const { status, priority, category, search_q, dueDate } = request.body;
  if (status !== undefined) {
    if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
      next();
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else if (priority !== undefined) {
    if (priority === "HIGH" || priority === "LOW" || priority === "MEDIUM") {
      next();
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  } else if (category !== undefined) {
    if (category === "WORK" || category === "HOME" || category === "LEARNING") {
      next();
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  } else if (search_q !== undefined) {
    next();
  }
  /*if (dueDate !== undefined) {
    next();
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }*/
  /*else if (dueDate === undefined) {
    if (category === "WORK" || category === "HOME" || category === "LEARNING") {
      next();
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  }*/
  /* if (category === undefined) {
    response.status(400);
    response.send("Invalid Todo Category");
  } else {
    next();
  }
  if (dueDate === undefined) {
    response.status(400);
    response.send("Invalid Due Date");
  } else {
    next();
  }*/
};

const dateValidity = (request, response, next) => {
  const { date } = request.query;
  if (date !== undefined) {
    const final = format(new Date(d[0], d[1] - 1, d[2]), "yyyy-MM-dd");
    if (date === final) {
      response.status(400);
      response.send("Invalid Due Date");
    } else {
      next();
    }
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
};
//API 1
app.get("/todos/", validity, async (request, response) => {
  const {
    status = "",
    priority = "",
    category = "",
    search_q = "",
  } = request.query;
  //console.log(search_q);
  const query = `
    select * from todo where status like '%${status}%'
    and priority like '%${priority}%' and
    todo like '%${search_q}%' and
    category like '%${category}%';`;
  const dbResponse = await db.all(query);
  //console.log(dbResponse);
  response.send(dbResponse.map((each) => convertTodoResponse(each)));
});

//API 2

app.get("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const query = `
    select * from todo where id=${todoId};`;
  const dbResponse = await db.get(query);
  response.send(convertTodoResponse(dbResponse));
});

//API 3
app.get("/agenda/", dateValidity, async (request, response) => {
  const { date } = request.query;
  //console.log(date);
  const d = date.split("-");
  //console.log(parseInt(d[2]));
  const final = format(new Date(d[0], d[1] - 1, d[2]), "yyyy-MM-dd");

  const query = `select * from todo where
  due_date='${final}'`;
  const dbResponse = await db.all(query);
  response.send(dbResponse.map((each) => convertTodoResponse(each)));
});

//API 4
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, due_date } = request.body;
  console.log(status);
  const query = `insert into todo
    values(${id},'${todo}','${priority}','${status}','${category}',
    '${dueDate}');`;
  await db.run(query);
  response.send("Todo Successfully Added");
});

//API 5
app.put("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const { status, priority, todo, category, dueDate } = request.body;
  if (status !== undefined) {
    const query = `update todo 
        set status='${status}' where id=${todoId};`;
    await db.run(query);
    response.send("Status Updated");
  } else if (priority !== undefined) {
    const query = `update todo 
        set priority='${priority}' where id=${todoId};`;
    await db.run(query);
    response.send("Priority Updated");
  } else if (todo !== undefined) {
    const query = `update todo
        set todo='${todo}' where id=${todoId};`;
    await db.run(query);
    response.send("Todo Updated");
  } else if (category !== undefined) {
    const query = `update todo 
        set category='${category}' 
        where id=${todoId}`;
    await db.run(query);
    response.send("Category Updated");
  } else if (dueDate !== undefined) {
    const query = `update todo 
        set due_date='${dueDate}' 
        where id=${todoId}`;
    await db.run(query);
    response.send("Due Date Updated");
  }
});

//API 6
app.delete("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const query = `delete from todo where
    id=${todoId};`;
  await db.run(query);
  response.send("Todo Deleted");
});

module.exports = app;
