const soap = require("soap");

module.exports = async function F(idtask, task_parameters, UpdateTaskStatus) {

    let s = await UpdateTaskStatus(idtask, 1); // Corriendo
    console.log(s);

  var url = "https://www.crcind.com/csp/samples/SOAP.Demo.cls?wsdl";
  var args = { Arg1: 12, Arg2: 1000 };
  soap.createClient(url, (err, client) => {
    client.AddInteger(args, (err, result) => {        
      console.log(result);
      UpdateTaskStatus(idtask, 2); // Finalizando
    });
  });

  //return "Function Test OK";
};
