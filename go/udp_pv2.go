package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"math/rand"
	"os"
	"strconv"
	"strings"
	"time"

	// "encoding/binary"
	"encoding/hex"
	"net"
	// "bufio"
)

/**
UDP protocol V2 Structure

byte 0 		- protocol version (2)
byte 1-2 	- random token
byte 3		- PUSH_DATA identifier 0x00
byte 4-11	- MAC addr
byte 12-end	- JSON object
*/

// TODO
// this might be incorrect, gotta try to import from a file

// GLOBAL VARS

// GATEWAY SERVER
var IP string = "10.35.0.26"
var PORT int = 1700

// UDP
var PROTOCOL int = 2
var MAC string = "3a85e3714916f24d"
var PUSH_DATA byte = 0

func generate_random_token(len int) []byte {
	rand.Seed(time.Now().UnixNano())
	token := make([]byte, 2)
	rand.Read(token)
	return token
}

// prolly fix later cba rn
// TODO
func framebuild(protocol int, PUSH_DATA byte, MAC string, payload string) []byte {

	var udp_pv2 []byte

	s := "02154400" + MAC
	data, _ := hex.DecodeString(s)

	udp_pv2 = append(data, []byte(payload)...)

	return udp_pv2

}

func send_pkg(pkg []byte) {

	conn, err := net.Dial("udp", IP+":"+strconv.Itoa(PORT))
	if err != nil {
		fmt.Printf("some error %v\n", err)
		return
	}
	_, err = conn.Write(pkg)
}

func get_json_string(filename string) string {

	jsonFile, err := os.Open(filename)
	if err != nil {
		log.Fatal(err)
	}

	byteValue, err := ioutil.ReadAll(jsonFile)
	if err != nil {
		log.Fatal(err)
	}
	return string(byteValue)
}

func validate_file() {
	// checks if there in the args
	if len(os.Args) <= 1 {
		log.Fatal("no filename in the args")
	}

	filename := os.Args[1]

	if !strings.Contains(filename, ".json") {
		log.Fatal("please use a .json file")
	}
}

func main() {

	// fmt.Println(Proprietary.MarshalText)


	// checks if file is valid
	validate_file()

	// gets file and converts it to string
	filename := os.Args[1]
	var msg string = get_json_string(filename)

	// creates a frame
	pkg := framebuild(PROTOCOL, PUSH_DATA, MAC, msg)
	// prints the frame in b64
	fmt.Printf("%x\n", pkg)
	fmt.Println(pkg)

	// infinte loop to send the frame
	for {
		send_pkg(pkg)
		fmt.Println("Package sent at", time.Now().String())
		time.Sleep(3 * time.Second)
	}


}
