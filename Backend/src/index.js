
import connectDB from "./db/index.js";
import { app } from "./app.js";
import "./jobs/slaChecker.js";
import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);
connectDB()
  .then(() => {
    app.on("error", (err) => console.error("App error:", err));
    app.listen(process.env.PORT || 4000, () =>
      console.log(`Server running on port ${process.env.PORT || 4000}`)
    );
  })
  .catch((err) => console.error("Startup failed:", err));