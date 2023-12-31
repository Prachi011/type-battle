const http = require("http");
const app = require("express")();
app.get("/", (req,res)=> res.sendFile(__dirname + "/multiplayer.html"))

app.listen(8001, ()=>console.log("Listening on http port 8001"))
const websocketServer = require("websocket").server
const httpServer = http.createServer();
httpServer.listen(8000, () => console.log("Listening.. on 8000"))

const clients={};
const games = {};


const wsServer = new websocketServer({
    "httpServer": httpServer
})

wsServer.on("request", request => {
    //connect
    const connection = request.accept(null, request.origin);
    connection.on("open", () => console.log("opened!"))
    connection.on("close", () => console.log("closed!"))
    connection.on("message", message => {
        const result = JSON.parse(message.utf8Data)
        if (result.method === "create") {
            const clientId = result.clientId;
            const gameId = guid();
            games[gameId] = {
                "id": gameId,
                "balls": 20,
                "clients": []
            }

            const payLoad = {
                "method": "create",
                "game" : games[gameId]
            }

            const con = clients[clientId].connection;
            con.send(JSON.stringify(payLoad));
        }

        if (result.method === "join") {

            const clientId = result.clientId;
            const gameId = result.gameId;
            const game = games[gameId];
            
            const payLoad = {
                "method": "join",
                "game": game
            }
            if (result.method === "join") {

                const clientId = result.clientId;
                const gameId = result.gameId;
                const game = games[gameId];
                if (game.clients.length >= 3) 
                {
                    //sorry max players reach
                    return;
                }
                const color =  {"0": "Red", "1": "Green", "2": "Blue"}[game.clients.length]
                game.clients.push({
                    "clientId": clientId,
                    "color": color
                })
                //start the game
                if (game.clients.length === 3) updateGameState();
    
                const payLoad = {
                    "method": "join",
                    "game": game
                }
                //loop through all clients and tell them that people has joined
                game.clients.forEach(c => {
                    clients[c.clientId].connection.send(JSON.stringify(payLoad))
                })
            }
        }

    })

    const clientId=guid();
    clients[clientId] = {
        "connection" : connection
    }

    const payLoad = {
        "method": "connect",
        "clientId": clientId
    }

    connection.send(JSON.stringify(payLoad))

})

function S4() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
}
 
// then to call it, plus stitch in '4' in the third group
const guid = () => (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
