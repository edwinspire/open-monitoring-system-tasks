const soap = require("soap");

module.exports = async function F(idtask, task_parameters) {
  return new Promise(function (resolve, reject) {
    
setTimeout(()=>{
  resolve(true);
}, 5000);

//reject(err1); Es importante usar reject en caso de errores

  });
};
