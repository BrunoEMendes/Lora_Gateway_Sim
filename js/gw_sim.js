const jsonBuilder = require('packet-forwarder-json-builder')
const fs = require('fs')


const hexToArrayBuffer = require('hex-to-array-buffer')


var dgram = require("dgram")


var NwKey, AppKey, DevAdd, LFC, Server_IP, Server_Port, GW_MAC
var PUSH_DATA = '0'

main()



function main()
{
  load_settings()
  send_pkt()
}

function isByteArray(array) {
  if (array && array.byteLength !== undefined) return true;
  return false;
}

/**
UDP protocol V2 Structure

byte 0 		- protocol version (2)
byte 1-2 	- random token
byte 3		- PUSH_DATA identifier 0x00
byte 4-11	- MAC addr
byte 12-end	- JSON object
*/

function concat_package()
{
  let res = Buffer.alloc(0);
  var args = Array.prototype.slice.call(arguments);
  args.forEach((ar) => {
    if(isByteArray(ar))
      res = Buffer.concat([res, ar])
  })
  return res
}


function send_pkt()
{
  var client = dgram.createSocket('udp4')
  setInterval(() => {
    frame = build_udp_protocol()
    client.send(frame, 0, frame.length, Server_Port, Server_IP, (err, bytes) =>
    {
          if(err)throw err
        // client.close()
        console.log("pkg sent at "  + new Date().toString())
    })
  }, 5000)


  // console.log('sent')
}


function update_file()
{
  let content = JSON.parse(fs.readFileSync('settings.json', 'utf-8'))
  content.FrameCounter = LFC
  fs.writeFileSync('settings.json', JSON.stringify(content));
}




function generate_new_phy_payload()
{  
  var dict = {
    "temperature": Math.random() * 100,
    "humidity": Math.random() * 100
  }

  
  const payload = Buffer.from(JSON.stringify(dict))

    const scenario = {
    gateway: {},
    device: {
      seqno: LFC,
      addr: DevAdd,
      appSKey:  AppKey,
      nwkSKey: NwKey,
    },
  }
  LFC++;

  update_file()

  return jsonBuilder.uplink(payload, scenario)["rxpk"][0]["data"]  
}



function build_udp_protocol()
{

    var version = Buffer.from("02", 'hex')

    // make it random later
    var random_token = "154400"
    random_token = Buffer.from(random_token, 'hex');


    // push_data (uplink)
    var push_data = Buffer.from(PUSH_DATA, 'hex')
       
    // 
    let file_data = fs.readFileSync('../go/pkg_test.json')
    let parsed_json = JSON.parse(file_data)
    parsed_json["rxpk"][0]["time"] = new Date().toISOString()
    // console.log(parsed_json)
   
    
  

    // console.log()
    parsed_json["rxpk"][0]["data"] = generate_new_phy_payload()
    byte_mac = Buffer.from(GW_MAC, 'hex')

    let string_js = JSON.stringify(parsed_json)
    var pl = Buffer.from(string_js, 'utf-8')

    frame = concat_package(version, random_token, push_data, byte_mac, pl)
  
    return frame
}


/**
 * loads necessary info from the settings.json file
 */
function load_settings()
{
  let file_data = fs.readFileSync('settings.json')
  let settings = JSON.parse(file_data)
  NwKey = settings['NwKey'].replace(/\s/g, '')
  AppKey = settings['AppKey'].replace(/\s/g, '')
  DevAdd = settings['DevAdd'].replace(/\s/g, '')
  LFC = settings['FrameCounter']
  Server_IP = settings['Server_IP']
  Server_Port = settings['Server_Port']
  GW_MAC = settings['GW_MAC']
  // console.log(NwKey, AppKey, DevAdd, LFC, Server_IP, Server_Port, GW_MAC)
}


