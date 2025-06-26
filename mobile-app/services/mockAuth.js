// mockAuth.js

const users = [];

export function register(email, password) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const exists = users.find(user => user.email === email);
      if (exists) {
        reject('Utilisateur déjà enregistré');
      } else {
        const newUser = { email, password };
        users.push(newUser);
        resolve('Inscription réussie');
      }
    }, 500); // simule un délai réseau
  });
}

export function login(email, password) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
        resolve('Connexion réussie');
      } else {
        reject('Email ou mot de passe incorrect');
      }
    }, 500);
  });
}
