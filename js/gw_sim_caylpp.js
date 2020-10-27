const jsonBuilder = require('packet-forwarder-json-builder')
const fs = require('fs')
const { encoder } = require('cayenne-lpp')

// const crypto = require('crypto')


var dgram = require("dgram")

var NwKey, AppKey, DevAdd, LFC, Server_IP, Server_Port, GW_MAC
var PUSH_DATA = '0'



main()

/**
 * 
 */
function main()
{
  load_settings()
  send_pkt()
}


/**
 * 
 * @param {*} array is byte array type
 * @returns bool
 */
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

/**
 * concats any ammount of byte arrays
 * @returns new byte array
 */
function concat_package(...arguments)
{
  if(arguments.length == 0)
    throw err
  let res = Buffer.alloc(0);
  var args = Array.prototype.slice.call(arguments);
  args.forEach((ar) => {
    if(isByteArray(ar))
      res = Buffer.concat([res, ar])
  })
  return res
}


/**
 * sends udp_pkt
 */
function send_pkt()
{
  var client = dgram.createSocket('udp4')

  setInterval(() => {
    frame = build_udp_protocol()
    client.send(frame, 0, frame.length, Server_Port, Server_IP, (err, bytes) =>
    {
          if(err)throw err
        console.log("pkt sent at "  + new Date().toString())
    })
  }, 5000)
}


/**
 * updates settings file so I will know in which pkt number I ended last time
 */
function update_file()
{
  let content = JSON.parse(fs.readFileSync('settings.json', 'utf-8'))
  content.FrameCounter = LFC
  fs.writeFileSync('settings.json', JSON.stringify(content));
}


/**
 * generates a new physical payload (LORA FRAME)
 */
function generate_new_phy_payload()
{  
//   var dict = {
//     "temperature": Math.random() * 100,
//     "humidity": Math.random() * 100,
//     "light": Math.random() * 100
//   }

//   const payload = Buffer.from(JSON.stringify(dict))

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

  const data = Buffer.concat([
    encoder.encodeTemperature(1, Math.random() * 100),
    encoder.encodeGps(1, {
        latitude: 42.3519,
        longitude: -87.9094,
        altitude: 10.0
    })

  ]);
  payload = data
//   console.log(gps.toString('hex'))
  return jsonBuilder.uplink(payload, scenario)["rxpk"][0]["data"]  
}

/**
 * Generates a new UDP v2 Payload
 */
function generate_upd_payload()
{

  var msg = generate_new_phy_payload()
  
  var udp_pkt = {
    rxpk:[{
    time: new Date().toISOString(),
    tmst:3512348611,
    chan:2,
    rfch:0,
    freq:867.100000,
    stat:1,
    modu:"LORA",
    datr:"SF7BW125",
    codr:"4/6",
    rssi:-35,
    lsnr:5.1,
    size: msg.length,
    confirmed: false,
    fPort: 10,
    data: msg
  }]}

  return Buffer.from(JSON.stringify(udp_pkt, 'utf-8'))
}


/**
 * builds the udp protocol basis
 */
function build_udp_protocol()
{

    var version = Buffer.from("02", 'hex')

    // make it random later
    var random_token = "154400"
    random_token = Buffer.from(random_token, 'hex');
    // console.log(random_token)

    var push_data = Buffer.from(PUSH_DATA, 'hex')
       
    byte_mac = Buffer.from(GW_MAC, 'hex')

    payload = generate_upd_payload()

    frame = concat_package(version, random_token, push_data, byte_mac, payload)
  
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
  console.log("Sending Lora pkts to:\nNetwork Server: " + Server_IP + ":" + Server_Port)
  // console.log(NwKey, AppKey, DevAdd, LFC, Server_IP, Server_Port, GW_MAC)
}


