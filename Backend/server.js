const http = require("http");
const app = require("./app");

app.set("port", process.env.PORT);

const server = http.createServer(app);

const address = server.address();
const bind = typeof address === "string" ? "pipe " + address : "port :" + process.env.PORT;

function errorHandler(error) {
    try {
        if (error.syscall !== "listen") {
            return console.log(error);
        }
        switch (error.code) {
            case "EACCES":
                console.error(bind + " requires elevated privileges.");
                process.exit(1); // exit with failure
                break;
            case "EADDRINUSE":
                console.error(bind + " is already in use.");
                process.exit(1);
                break;
            default:
                return console.log(error);
        }
    }
    catch(err) {
        console.error("error: " + err);
    }
}

server.on("error", errorHandler);
server.on("listening", () => {
    console.log("Listening on " + bind);
});
server.listen(process.env.PORT);
