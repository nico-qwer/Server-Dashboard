const exp = require("constants");
const express = require("express")
const app = express()
app.set("view engine", "ejs")

require("dotenv").config()

const os = require("os");


app.use(express.static(__dirname + '/public'))


app.get("/", async (req, res) => {

    let numberPlayers
    let version

    await GetMCServerStatus()
        .then(apiRes => apiRes.json())
        .then(data => {
            numberPlayers = data.players.online.toString() + " / " + data.players.max.toString()
            version = data.version.name_clean
        })


    let ramPercent = Math.round((os.totalmem() - os.freemem()) / os.totalmem() * 10000) / 100
    let ramUsed = Math.round((os.totalmem() - os.freemem()) / (1024 * 1024 * 1024) * 100) / 100

    res.render("index", {
        ramPercent: ramPercent, ramUsed: ramUsed, uptime: os.uptime().toString().toDDHH(),
        numberPlayers: numberPlayers, version: version
    })
})

app.get("/minecraft", async (req, res) => {

    let numberPlayers
    let version
    let playersArray
    let serverIp

    await GetMCServerStatus()
        .then(apiRes => apiRes.json())
        .then(data => {
            numberPlayers = data.players.online.toString() + " / " + data.players.max.toString()
            version = data.version.name_clean
            playersArray = data.players.list
            serverIp = data.host + ":" + data.port.toString()
        })

    let playersStr = ""
    for (let i = 0; i < playersArray.length; i++) { playersStr += "<p>" + playersArray[i] + "</p>\n" }
    if (playersStr === "") { playersStr = "<p>There are no players online.</p>" }

    res.render("mcPage", {
        numberPlayers: numberPlayers, version: version, IP: serverIp, players: playersStr
    })
})



let port
if (process.env.STATUS === "prod") { port = process.env.PROD_PORT }
else if (process.env.STATUS === "dev") { port = process.env.DEV_PORT }

app.listen(port)
console.log("Server running on http://localhost:" + port)

function GetMCServerStatus() {
    return fetch("https://api.mcstatus.io/v2/status/java/" + process.env.MCSERVERIP)
}

String.prototype.toDDHH = function () {

    let hours = Math.round(this / 3600)
    let days = Math.floor(hours / 24)

    hours -= days * 24

    return days + "d " + hours + "h"
}