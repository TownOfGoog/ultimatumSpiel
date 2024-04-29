import { startExpress } from "./server.js";

startExpress().listen(8080, () => {
    console.log("Server hat gestartet")
})