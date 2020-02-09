const express = require("express")
require("../db/mongoose")

const app = express();
const apiRouter = require("../routers/router");

const port = 3000

app.use(express.json())
app.use(apiRouter)

app.listen(port, () => {
    console.log("server is up on port " + port)
})