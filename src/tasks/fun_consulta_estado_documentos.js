const soap = require("soap");

module.exports = async function F(idtask, task_parameters) {
  return new Promise(function (resolve, reject) {
    var url = "https://www.crcind.com/csp/samples/SOAP.Demo.cls?wsdl";
    var args = { Arg1: 12, Arg2: 1000 };
    try {
      soap.createClient(url, (err1, client) => {
        if (err1) {
          reject(err1);
          return;
        }

        client.AddInteger(args, (err2, result) => {
          if (err2) {
            reject(err2);
            return;
          }
          resolve(true);
        });
      });
    } catch (err3) {
      reject(err3);
    }
  });
};
