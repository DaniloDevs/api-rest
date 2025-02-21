import { app } from ".";
import { env } from "./env"


// Server
app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log("Server Running!!");
  });
