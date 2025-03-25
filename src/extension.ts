import * as vscode from "vscode";
import WebSocket from "ws";

export function activate(context: vscode.ExtensionContext) {
  let ws: WebSocket | null = null;

  // Créer un bouton pour afficher la liste des utilisateurs
  let disposable = vscode.commands.registerCommand(
    "extension.showUsers",
    () => {
      const panel = vscode.window.createWebviewPanel(
        "usersView", // Identifiant de la vue
        "Utilisateurs Connectés", // Titre du panneau
        vscode.ViewColumn.One, // Où afficher (panneau de droite)
        {
          enableScripts: true, // Permet d'exécuter du JS dans le webview
        }
      );

      // Ajouter un message de gestion du code
      panel.webview.onDidReceiveMessage(
        (message) => {
          switch (message.command) {
            case "sendCode":
              if (ws) {
                ws.send(JSON.stringify({ type: "code", code: message.code }));
              }
              break;
          }
        },
        undefined,
        context.subscriptions
      );

      // Remplir le panneau avec du HTML
      panel.webview.html = getWebviewContent();

      // Mettre à jour les utilisateurs dans le panneau lorsque WebSocket reçoit des messages
      if (ws) {
        ws.on("message", (data) => {
          const message = JSON.parse(data.toString());
          if (message.type === "new_user") {
            panel.webview.postMessage({
              command: "addUser",
              username: message.message,
            });
          } else if (message.type === "code") {
            panel.webview.postMessage({
              command: "receiveCode",
              code: message.code,
            });
          }
        });
      }
    }
  );

  // Connexion au serveur WebSocket
  ws = new WebSocket("ws://localhost:8080");
  ws.on("open", () => {
    vscode.window.showInformationMessage("✅ Connecté au serveur WebSocket");
  });

  // Gérer la déconnexion du serveur WebSocket
  ws.on("close", () => {
    vscode.window.showInformationMessage("🚨 Déconnecté du serveur WebSocket");
  });

  // Gérer les erreurs WebSocket
  ws.on("error", (err) => {
    vscode.window.showErrorMessage(`Erreur WebSocket: ${err.message}`);
  });

  context.subscriptions.push(disposable);

  context.subscriptions.push({
    dispose: () => {
      if (ws) {
        ws.close();
      }
    },
  });
}

export function deactivate() {}

// Fonction HTML pour le Webview
function getWebviewContent() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Utilisateurs Connectés</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 10px; }
            ul { list-style-type: none; padding: 0; }
            li { margin: 5px 0; }
        </style>
    </head>
    <body>
        <h1>Utilisateurs Connectés</h1>
        <ul id="userList">
            <!-- Liste des utilisateurs -->
        </ul>

        <!-- Ajout d'un champ pour envoyer du code -->
        <textarea id="codeInput" placeholder="Écrire du code ici..." rows="6" style="width: 100%;"></textarea>
        <button id="sendCodeBtn">Envoyer le code</button>

        <script>
            const vscode = acquireVsCodeApi();

            // Fonction pour ajouter un utilisateur à la liste
            window.addEventListener('message', (event) => {
                const message = event.data;
                if (message.command === 'addUser') {
                    const listItem = document.createElement('li');
                    listItem.textContent = message.username;
                    document.getElementById('userList').appendChild(listItem);
                } else if (message.command === 'receiveCode') {
                    const codeBlock = document.createElement('pre');
                    codeBlock.textContent = message.code;
                    document.body.appendChild(codeBlock);
                }
            });

            // Gérer l'envoi de code
            document.getElementById('sendCodeBtn').addEventListener('click', () => {
                const code = document.getElementById('codeInput').value;
                vscode.postMessage({ command: 'sendCode', code: code });
            });
        </script>
    </body>
    </html>
  `;
}
