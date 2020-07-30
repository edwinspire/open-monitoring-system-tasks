const fetch = require("node-fetch");
const path = require("path");
const tasks_dir = path.join(__dirname, "tasks");
const url_update_status_task = "https://192.168.1.130:3000/pgapi/task/update_status";
const url_get_tasks = "https://192.168.1.130:3000/pgapi/task/list";
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0; // Para que pase el certificado cuando no es válido

//-- Open Monitoring System Task --//
// Este bloque inicial carga los archivos de tareas de forma automática
require("fs")
  .readdirSync(tasks_dir)
  .forEach(function (file) {
    console.log(file);
    module.exports[path.basename(file, ".js")] = require(path.join(
      tasks_dir,
      file
    ));
  });

console.log("Open Monitoring System Task");

setInterval(async () => {
  // Consulta por las tareas que ya deben ejecutarse
  let tasks = await GetTasks();
if(tasks && tasks.length > 0){
    tasks.forEach((task) => {
        console.log(task);
        try {
          module.exports[task.function_name](
            task.idtask,
            task.task_parameters,
            UpdateTaskStatus
          );
        } catch (err) {
          UpdateTaskStatus(task.idtask, -99);
          console.error(err);
        }
      });
}

  //  console.log("Ya ", module.exports["fun_consulta_estado_documentos"]());
}, 3000);

async function UpdateTaskStatus(idtask, status) {
  try {
    let result = await fetch(url_update_status_task, {
      method: "POST",
      body: JSON.stringify({ idtask: idtask, status: status }),
      headers: { "Content-Type": "application/json" },
    });
    console.log('Actualiza', idtask, status);
    return await result.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

async function GetTasks() {
  try {
    let result = await fetch(url_get_tasks, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return await result.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}
