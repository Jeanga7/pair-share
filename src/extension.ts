import * as vscode from "vscode";
import WebSocket from "ws";

// État de la connexion WebSocket
let ws: WebSocket | null = null;
let isConnected = false;

// Cette méthode est appelée quand l'extension est activée
export function activate(context: vscode.ExtensionContext) {
  vscode.window.showInformationMessage("PairShare Connected!");

  // Créer une nouvelle instance de WebSocket
  ws = new WebSocket("ws://localhost:8080");

  ws.on("open", () => {
    isConnected = true; // Connexion réussie
    vscode.window.showInformationMessage("✅ Connecté au serveur WebSocket");

    // Envoyer un message dès la connexion
    if (ws) {
      ws.send(
        JSON.stringify({
          type: "login",
          message: "Un utilisateur a rejoint le réseau",
        })
      );
    }
  });

  ws.on("message", (data) => {
    try {
      const message = JSON.parse(data.toString());
      vscode.window.showInformationMessage(
        `📩 Message reçu: ${message.message}`
      );
    } catch (error) {
      vscode.window.showErrorMessage(
        "Erreur lors de la réception du message : données invalides."
      );
    }
  });

  ws.on("close", () => {
    isConnected = false; // Déconnexion
    vscode.window.showInformationMessage("❌ Déconnecté du serveur WebSocket");
  });

  ws.on("error", (error) => {
    vscode.window.showErrorMessage(
      `Erreur WebSocket: ${
        error.message || "Une erreur inconnue s'est produite."
      }`
    );
  });

  // Ajouter une commande VSCode pour envoyer un message
  let disposable = vscode.commands.registerCommand(
    "pairshare.sendMessage",
    () => {
      if (isConnected && ws?.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({ type: "message", message: "Hello depuis VSCode!" })
        );
        vscode.window.showInformationMessage(
          "✉️ Message envoyé: Hello depuis VSCode!"
        );
      } else {
        vscode.window.showErrorMessage(
          "🚨 Le serveur WebSocket n'est pas connecté"
        );
      }
    }
  );

  context.subscriptions.push(disposable);
}

// Cette méthode est appelée quand l'extension est désactivée
export function deactivate() {
  if (ws) {
    ws.close();
  }
}
