//confi.js

const isLocal = ["localhost", "127.0.0.1"].includes(window.location.hostname);

const apiUrl = isLocal
  ? "http://localhost:8080"
  : "https://project-remake.onrender.com";
