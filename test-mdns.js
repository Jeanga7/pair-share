const bonjour = require('bonjour')();

const username = `User-${Math.floor(Math.random() * 10000)}`; // Nom unique

// Publier un service unique
bonjour.publish({ name: username, type: 'codeshare', port: 5000 });

console.log(`Service publié : ${username}`);

// Rechercher les autres services
bonjour.find({ type: 'codeshare' }, (service) => {
    console.log("Service trouvé :", service.name);
    if (service.referer) {
        console.log("Adresse détectée :", service.referer.address);
    } else {
        console.log("Aucune adresse trouvée pour", service.name);
    }
});

// Arrêter après 10 secondes
setTimeout(() => {
    bonjour.destroy();
    console.log("Service arrêté.");
}, 10000);
