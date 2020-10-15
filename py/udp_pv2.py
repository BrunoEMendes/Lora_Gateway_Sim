import socket
import time
import json
import binascii

import base64
import sys

UDP_IP_ADDRESS = "10.35.0.26"
UDP_PORT_NO = 1700

# PAYLOAD = base64.b64encode(bytes('{"rxpk":[{"time":"2013-03-31T16:21:17.532038Z","tmst":3316387610,"chan":0,"rfch":0,"freq":863.00981,"stat":1,"modu":"LORA","datr":"SF10BW125","codr":"4/7","rssi":-38,"lsnr":5.5,"size":32,"data":"ysgRl452xNLep9S1NTIg2lomKDxUgn3DJ7DE+b00Ass"}]}', 'utf-8'))
# msg = {"stat":{"time":"2014-01-12 08:59:28 GMT","lati":46.24000,"long":3.25230,"alti":145,"rxnb":2,"rxok":2,"rxfw":2,"ackr":100.0,"dwnb":2,"txnb":2, "data":"eyJ0ZW1wZXJhdHVyZSI6IjEifQ=="}}
msg = {
	"stat":
	{
		"time":"2014-01-12 08:59:28 GMT",
		"lati":20.24000,
		"long":3.25230,
		"alti":145,
		"rxnb":2,
		"rxok":2,
		"rxfw":2,
		"ackr":100.0,
		"dwnb":2,
		"t$xnb":2, 
		"objectJSON": "{\"temperatureSensor\":25,\"humiditySensor\":32}",
	}
}


#msg = {"device_info":{"stat":{"time":"2014-01-12 08:59:28 GMT","lati":46.24000,"long":3.25230,"alti":145,"rxnb":2,"rxok":2,"rxfw":2,"ackr":100.0,"dwnb":2,"txnb":2},"content":{"temperature":20}}}
#msg = { "object": {"temperatureSensor": {"1": 25},"humiditySensor": {"1": 32}}}
#msg = {"test_topic":{"test_content_int":2}}

# msg = {"rxpk":[
# 	{
# 		"time":"2013-03-31T16:21:17.528002Z",
# 		"tmst":3512348611,
# 		"chan":2,
# 		"rfch":0,
# 		"freq":866.349812,
# 		"stat":1,
# 		"modu":"LORA",
# 		"datr":"SF7BW125",
# 		"codr":"4/6",
# 		"rssi":-35,
# 		"lsnr":5.1,
# 		"size":32,
# 		"data":"-DS4CGaDCdG+48eJNM3Vai-zDpsR71Pn9CPA9uCON84"
# 	},{
# 		"time":"2013-03-31T16:21:17.530974Z",
# 		"tmst":3512348514,
# 		"chan":9,
# 		"rfch":1,
# 		"freq":869.1,
# 		"stat":1,
# 		"modu":"FSK",
# 		"datr":50000,
# 		"rssi":-75,
# 		"size":16,
# 		"data":"VEVTVF9QQUNLRVRfMTIzNA=="
# 	},{
# 		"time":"2013-03-31T16:21:17.532038Z",
# 		"tmst":3316387610,
# 		"chan":0,
# 		"rfch":0,
# 		"freq":863.00981,
# 		"stat":1,
# 		"modu":"LORA",
# 		"datr":"SF10BW125",
# 		"codr":"4/7",
# 		"rssi":-38,
# 		"lsnr":5.5,
# 		"size":32,
# 		"data":"ysgRl452xNLep9S1NTIg2lomKDxUgn3DJ7DE+b00Ass"
# 	}
# ]}

#msg = {"hi":[{"data": {"hello":"hi"}} ]}
str = json.dumps(msg).encode("ISO-8859-1")
# print(base64.b64encode(str))
#str = hex(str(msg))
#binary = ' '.join(format(ord(letter), 'b') for letter in str)
PAYLOAD = str
#import binascii

#PAYLOAD = bytes.fromhex('{"try":{"this":"that"}}'.encode('utf-8').hex())
#print(type(json.dumps(msg).encode('ascii')))
#print(type(PAYLOAD))

MAC = "ABCDEF1010101010"
# MAC =  "3a85e3714916f24d"
hex_mac = bytes.fromhex(MAC)

frame =  b'\2'       # 0 for protocole version
frame += b'\7'      # byte 1 random token
frame += b'\5'      # byte 2 random token
frame += b'\0'      # push data identifier
frame += b'\3'      # push data identifier
frame += b'\00'      # push data identifier
frame += b'\00'      # push data identifier
frame += b'\0c'      # push data identifier
frame += b'\ef'      # push data identifier
frame += b'\af'      # push data identifier
frame += b'\d0'      # push data identifier
frame += b'\78'      # push data identifier
frame += b'\42'      # push data identifier
# frame += hex_mac
frame += PAYLOAD
frame += b'\7d'
import os
print(len(frame))
print(frame)
#token = os.urandom(2)

#packet = binascii.unhexlify('02') + token + binascii.unhexlify('00') + binascii.unhexlify(MAC) + bytes('{1:2}', 'utf-8')

#frame = packet
#print(len(frame))
#print(frame)

while True:	    
    clientSock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    clientSock.sendto(frame, (UDP_IP_ADDRESS, UDP_PORT_NO))
    time.sleep(5)

