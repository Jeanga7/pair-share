const { type } = require("os");
const WebSocket = require("ws");

const server = new WebSocket.Server({ port: 8080 });

let clients = [];

server.on("connection", (ws) => {
  console.log("Nouvelle connexion");

  //   ajout du client à la liste des clients
  clients.push(ws);

  //   informer tout les clients de la connexion
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          type: "new_user",
          message: "Un nouvel utilisateur connecté",
        })
      );
    }
  });

  //   gestion des messages reçus
  ws.on("message", (message) => {
    console.log("Message reçu : ", message.toString());

    // transmission du message à tout les clients
    clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  //   gestion de la déconnexion
  ws.on("close", () => {
    console.log("Déconnexion d'un utilisateur");

    // suppression du client de la liste des clients
    clients = clients.filter((client) => client !== ws);
  });
});


console.log('Serveur WebSocket en écoute sur ws://localhost:8080');