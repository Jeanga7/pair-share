const vscode = acquireVsCodeApi();
let selectedUser = null;

window.addEventListener("message", (event) => {
  const message = event.data;

  if (message.command === "addUser") {
    const userList = document.getElementById("userList");
    const userItem = document.createElement("li");
    userItem.textContent = message.username;
    userItem.onclick = () => {
      selectedUser = message.username;
      alert(`Vous avez sélectionné ${selectedUser} pour envoyer du code.`);
    };
    userList.appendChild(userItem);
  }

  if (message.command === "removeUser") {
    const userList = document.getElementById("userList");
    [...userList.children].forEach((item) => {
      if (item.textContent === message.username) {
        userList.removeChild(item);
      }
    });
  }

  if (message.command === "receiveCode") {
    const messages = document.getElementById("messages");
    const msg = document.createElement("p");
    msg.innerHTML = `<strong>${message.username}:</strong> <pre>${message.code}</pre>`;
    messages.appendChild(msg);
  }
});

document.getElementById("sendCodeBtn").addEventListener("click", () => {
  if (!selectedUser) {
    alert("Sélectionnez un utilisateur avant d'envoyer du code.");
    return;
  }
  const code = document.getElementById("codeInput").value;
  vscode.postMessage({ command: "sendCode", to: selectedUser, code });
});
