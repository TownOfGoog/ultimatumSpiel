import { startExpress } from "./server.js";
const PORT = process.env.PORT || 8080;
startExpress().listen(PORT, () => {
    console.log("Server hat gestartet")
})