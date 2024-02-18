import dotenv from "dotenv"
import connectDB from "./db/index.js"
import { app } from "./app.js"

dotenv.config({ path: "./.env" })

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log("Server is running on port: " + process.env.PORT)
      console.log("Open the sever on https://localhost:" + process.env.PORT)
    })
  })
  .catch((err) => {
    console.log("MongoDB connection error: " + err)
  })