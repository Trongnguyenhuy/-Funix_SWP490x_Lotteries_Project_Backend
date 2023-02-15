const express = require("express");
const stationController = require("../controllers/station");
const isAuth = require("../middlewares/is-Auth");

const router = express.Router();

router.get("/stations", stationController.getStations);

router.get("/station/:id", stationController.getStation);

router.post("/addnewstation", isAuth, stationController.addNewStation);

router.put("/updatestation/:id", isAuth, stationController.putUpdateStation);

router.delete("/deletestation/:id", isAuth, stationController.deleteStation);

router.post("/deletestations/", isAuth, stationController.deleteStations);

module.exports = router;
