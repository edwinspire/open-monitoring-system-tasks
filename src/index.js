process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0; // Para que pase el certificado cuando no es válido
process.env["OMS_SERVER"] = "https://192.168.1.130:3000";
process.env["OMS_USER"] = "oms_tasks";
process.env["OMS_PASSWORD"] = "oms_tasks";

var cluster = require("cluster");
const path = require("path");
const GetTasks = require("./tasks/private/fn_oms_gettask");
const EventProcessing = require("./tasks/private/fn_oms_event_processing");
const UpdateTaskStatus = require("./tasks/private/fn_oms_updatetaskstatus");
const { env } = require("process");
const tasks_dir = path.join(__dirname, "tasks");

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
    if (file !== "private") {
      console.log("Load Task -> " + file);
      module.exports[path.basename(file, ".js")] = require(path.join(
        tasks_dir,
        file
      ));
    }
  });

console.log("Open Monitoring System Task");

setInterval(() => {
  EventProcessing().then((ret) => {
    console.log("EventProcessing", ret);
  });
}, 5 * 1000);

setInterval(async () => {
  // Consulta por las tareas que ya deben ejecutarse
  try {
    let tasks = await GetTasks();
    if (tasks && Array.isArray(tasks) && tasks.length > 0) {
      tasks.forEach((task) => {
        console.log(new Date(), task.function_name);

        try {
          module.exports[task.function_name](
            task.idtask,
            task.task_parameters
          ).then(
            /*  */
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
  } catch (error) {
    console.error(error);
  }
}, 2000);

// Listen for dying workers
cluster.on("exit", function (worker) {
  // Replace the dead worker,
  // we're not sentimental
  UpdateTaskStatus(task.idtask, 5, "Process exit");
  console.log("Worker %d died :(", worker.id);
  //  cluster.fork();
});
