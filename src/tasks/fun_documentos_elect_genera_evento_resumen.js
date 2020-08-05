const fetch = require("node-fetch");
const aut = require("./private/fn_oms_authentication");
module.exports  = async function Fn() {
    //console.log('Expire events');
    try {
      let result = await fetch(process.env.OMS_SERVER+'/pgapi/etarm/genera_eventos_resumen_fact_electronica', {
        method: "POST",
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