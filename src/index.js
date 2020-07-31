var cluster = require("cluster");
const fetch = require("node-fetch");
const path = require("path");
const aut = require("./authentication");
const {
  env
} = require("process");
const tasks_dir = path.join(__dirname, "tasks");
const url_update_status_task =
  "https://192.168.1.130:3000/pgapi/task/update_status";
const url_get_tasks = "https://192.168.1.130:3000/pgapi/task/list";
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0; // Para que pase el certificado cuando no es válido

process.env["OMS_USER"] = 'aaaaaaaaaaaa';
process.env["OMS_PASSWORD"] = 'aaaaaaaaaaaaaaaaaa';

// Este bloque permite convertir un error a String con JSON.stringify
var config = {
  configurable: true,
  value: function () {
    var alt = {};
    var storeKey = function (key) {
      alt[key] = this[key];
    };
    Object.getOwnPropertyNames(this).forEach(storeKey, this);
    return alt;
  },
};
Object.defineProperty(Error.prototype, "toJSON", config);

//-- Open Monitoring System Task --//
// Este bloque inicial carga los archivos de tareas de forma automática
require("fs")
  .readdirSync(tasks_dir)
  .forEach(function (file) {
    console.log('Task-> ' + file);
    module.exports[path.basename(file, ".js")] = require(path.join(
      tasks_dir,
      file
    ));
  });

console.log("Open Monitoring System Task");

setInterval(async () => {
  // Consulta por las tareas que ya deben ejecutarse
  let tasks = await GetTasks();
  if (tasks && tasks.length > 0) {
    tasks.forEach((task) => {
      console.log(task.function_name);

      try {
        module.exports[task.function_name](
          task.idtask,
          task.task_parameters
        ).then(
          function (response) {
            // console.log("Success!", response);
            UpdateTaskStatus(task.idtask, 2, response);
          },
          function (error) {
            //   console.error("Failed!", error);
            UpdateTaskStatus(task.idtask, 3, error);
          }
        );
        UpdateTaskStatus(task.idtask, 1, "");
      } catch (err) {
        UpdateTaskStatus(task.idtask, 4, err);
        console.error(err);
      }
    });
  }

  //  console.log("Ya ", module.exports["fun_consulta_estado_documentos"]());
}, 3000);

async function UpdateTaskStatus(idtask, status, message) {
  let data = JSON.stringify({
    idtask: idtask,
    status: status,
    message: message,
  });
  //console.log(data);
  try {
    let result = await fetch(url_update_status_task, {
      method: "POST",
      body: data,
      headers: {
        "Content-Type": "application/json",
        "Authorization": aut()
      },
    });
    //console.log("Actualiza", data);
    if (result.status == "200") {
      return await result.json();
    } else {
      console.error(result);
      return await result.json();
    }
  } catch (err) {
    console.error(err);
    return [];
  }
}

async function GetTasks() {
  try {
    let result = await fetch(url_get_tasks, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": aut()
      },
    });
    if (result.status == "200") {
      return await result.json();
    } else {
      console.error(result);
      return await result.json();
    }
  } catch (err) {
    console.error(err);
    return [];
  }
}

// Listen for dying workers
cluster.on("exit", function (worker) {
  // Replace the dead worker,
  // we're not sentimental
  UpdateTaskStatus(task.idtask, 5, "Process exit");
  console.log("Worker %d died :(", worker.id);
  //  cluster.fork();
});