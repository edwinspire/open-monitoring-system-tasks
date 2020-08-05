const fetch = require("node-fetch");
const aut = require("./fn_oms_authentication");
module.exports  = async function Fn() {
    //console.log('Expire events');
    try {
      let result = await fetch(process.env.OMS_SERVER+'/pgapi/events/fn_event_processing', {
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