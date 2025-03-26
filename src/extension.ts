import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import WebSocket from "ws";

export function activate(context: vscode.ExtensionContext) {
  let ws: WebSocket | null = null;

  // Commande pour afficher la liste des utilisateurs connectés
  let disposable = vscode.commands.registerCommand(
    "extension.showUsers",
    () => {
      const panel = vscode.window.createWebviewPanel(
        "usersView",
        "Utilisateurs Connectés",
        vscode.ViewColumn.One,
        { enableScripts: true }
      );

      panel.webview.html = getWebviewContent(context);

      panel.webview.onDidReceiveMessage((message) => {
        if (message.command === "sendCode" && ws) {
          ws.send(
            JSON.stringify({
              command: "sendCode",
              to: message.to,
              code: message.code,
            })
          );
        }
      });

      if (ws) {
        ws.on("message", (data) => {
          const message = JSON.parse(data.toString());

          if (message.type === "new_user") {
            panel.webview.postMessage({
              command: "addUser",
              username: message.username,
            });
          } else if (message.type === "code") {
            panel.webview.postMessage({
              command: "receiveCode",
              username: message.username,
              code: message.code,
            });
          } else if (message.type === "user_disconnected") {
            panel.webview.postMessage({
              command: "removeUser",
              username: message.username,
            });
          }
        });
      }
    }
  );

  // Connexion au serveur WebSocket
  ws = new WebSocket("ws://localhost:8080");

  ws.on("open", () =>
    vscode.window.showInformationMessage("✅ Connecté au serveur WebSocket")
  );
  ws.on("close", () =>
    vscode.window.showInformationMessage("🚨 Déconnecté du serveur WebSocket")
  );
  ws.on("error", (err) =>
    vscode.window.showErrorMessage(`Erreur WebSocket: ${err.message}`)
  );

  context.subscriptions.push(disposable);

  context.subscriptions.push({
    dispose: () => ws?.close(),
  });
}

export function deactivate() {}

function getWebviewContent(context: vscode.ExtensionContext): string {
  const htmlPath = path.join(context.extensionPath, "media", "webview.html");
  return fs.readFileSync(htmlPath, "utf8");
}
