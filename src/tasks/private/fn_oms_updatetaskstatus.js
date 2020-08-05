const fetch = require("node-fetch");
const aut = require("./fn_oms_authentication");
module.exports = async function UpdateTaskStatus(idtask, status, message) {
    let data = JSON.stringify({
      idtask: idtask,
      status: status,
      message: message,
    });
    //console.log(data);
    try {
      let result = await fetch(process.env.OMS_SERVER+'/pgapi/task/update_status', {
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