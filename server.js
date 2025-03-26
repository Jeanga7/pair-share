const WebSocket = require("ws");

const server = new WebSocket.Server({ port: 8080 });

let users = new Map();

server.on("connection", (ws) => {
  console.log("Nouvelle connexion");

  const userId = `User-${Math.floor(Math.random() * 10000)}`;
  users.set(userId, ws);

  // Envoyer la liste complète des utilisateurs connectés au nouvel utilisateur
  ws.send(
    JSON.stringify({
      type: "user_list",
      users: Array.from(users.keys()),
    })
  );

  // Informer tout le monde d'une nouvelle connexion
  broadcast({ type: "new_user", username: userId }, ws);

  // Gestion des messages reçus
  ws.on("message", (data) => {
    const message = JSON.parse(data);

    if (message.command === "sendCode") {
      const recipient = users.get(message.to);
      if (recipient) {
        recipient.send(
          JSON.stringify({ type: "code", username: userId, code: message.code })
        );
      }
    }
  });

  // Gestion de la déconnexion
  ws.on("close", () => {
    users.delete(userId);
    broadcast({ type: "user_disconnected", username: userId });
  });
});

// Fonction pour envoyer un message à tous les clients sauf un (optionnel)
function broadcast(data, excludeWs = null) {
  users.forEach((client, userId) => {
      if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
      }
  });
}

console.log("Serveur WebSocket en écoute sur ws://localhost:8080");
