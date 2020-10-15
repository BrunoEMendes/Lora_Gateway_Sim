var lora_packet = require("lora-packet");

var NwKey = "e6 96 59 b8 c4 b3 ce 2c 5a 18 8b ad 5e 15 e6 10".replace(/\s/g, '')
var AppKey = "59 8f c5 49 e7 0d 3e 9f 2b b7 7b ee be 28 24 4b".replace(/\s/g, '')
var DevAdd = "00 37 35 14".replace(/\s/g, '')


const constructedPacket = lora_packet.fromFields(
    {
      MType: "Unconfirmed Data Up", // (default)
      DevEUI: Buffer.from("0018b20000000a74", "hex"),
    //   DevAddr: Buffer.from(DevAdd, "hex"), // big-endian
      FCtrl: {
        ADR: false, // default = false
        ACK: true, // default = false
        ADRACKReq: false, // default = false
        FPending: false, // default = false
      },
      FCnt: Buffer.from("0003", "hex"), // can supply a buffer or a number
      payload: "test",
    },
    Buffer.from(AppKey, "hex"), // AppSKey
    Buffer.from(NwKey, "hex") // NwkSKey
  );

// var constructructedPacket = lora_packet.fromFields(
//     {
//         MType: "Unconfirmed Data Up",

//     }
// )


console.log("constructedPacket.toString()=\n" + constructedPacket);
const wireFormatPacket = constructedPacket.getPHYPayload();
console.log("wireFormatPacket.toString()=\n" + wireFormatPacket.toString("hex"));
console.log(Buffer.from(wireFormatPacket, 'hex').toString('base64'));


const packet = lora_packet.fromWire(Buffer.from(wireFormatPacket, "hex"));
 
// debug: prints out contents
// - contents depend on packet type
// - contents are named based on LoRa spec
console.log("packet.toString()=\n" + packet);
 
// e.g. retrieve payload elements
console.log("packet MIC=" + packet.MIC.toString("hex"));
console.log("FRMPayload=" + packet.FRMPayload.toString("hex"));
 
// check MIC
const NwkSKey = Buffer.from(NwKey, "hex");
console.log("MIC check=" + (lora_packet.verifyMIC(packet, NwkSKey) ? "OK" : "fail"));
 
// calculate MIC based on contents
console.log("calculated MIC=" + lora_packet.calculateMIC(packet, NwkSKey).toString("hex"));
 
// decrypt payload
const AppSKey = Buffer.from(AppKey, "hex");
console.log("Decrypted (ASCII)='" + lora_packet.decrypt(packet, AppSKey, NwkSKey).toString() + "'");
console.log("Decrypted (hex)='0x" + lora_packet.decrypt(packet, AppSKey, NwkSKey).toString("hex") + "'");
 