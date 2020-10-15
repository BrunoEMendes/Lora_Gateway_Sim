const jsonBuilder = require('packet-forwarder-json-builder')
const fs = require('fs')
const payload = Buffer.from('test')


const hexToArrayBuffer = require('hex-to-array-buffer')


var dgram = require("dgram")


var NwKey, AppKey, DevAdd, LFC, Server_IP, Server_Port, GW_MAC
var PUSH_DATA = '0'

main()



function main()
{
  load_settings()
  frame = build_udp_protocol();
  send_pkt(frame)
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


function send_pkt(frame)
{
  var client = dgram.createSocket('udp4')
  setInterval(() => {
    client.send(frame, 0, frame.length, Server_Port, Server_IP, (err, bytes) =>
    {
          if(err)throw err
        // client.close()
        console.log(new Date().toString())
    })
  }, 5000)


  // console.log('sent')
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
    let string_js = JSON.stringify(parsed_json)
   
    var payload = Buffer.from(string_js, 'utf-8')

    // 


    byte_mac = Buffer.from(GW_MAC, 'hex')

    frame = concat_package(version, random_token, push_data, byte_mac,  payload)


    
    console.log(frame)
    // frame = temp
    // while(true)
    // {
    // console.log(frame)
  
    return frame
    
    // }
    // client.close()

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


