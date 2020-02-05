const express = require("express")
require("../db/mongoose")

const app = express();

const householdRouter = require("../routers/household");
const familyMemberRouter = require("../routers/familymember");

const port = 3000

app.use(express.json())
app.use(householdRouter)
app.use(familyMemberRouter)

app.listen(port, () => {
    console.log("server is up on port " + port)
})