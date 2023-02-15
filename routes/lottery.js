const express = require("express");
const lotteryController = require("../controllers/lottery");
const isAuth = require("../middlewares/is-Auth");
const { check } = require("express-validator");

const router = express.Router();

router.get("/banner", lotteryController.getBanner);

router.post(
	"/checkticket",
	[
		check("ticket")
			.isLength({ min: 5, max: 6 })
			.withMessage(
				"LÀM ƠN NHẬP 5 SỐ ĐỐI VỚI MIỀN BẮC VÀ 6 SỐ ĐỐI VỚI CÁC ĐÀI CÒN LẠI"
			),
	],
	lotteryController.checkTicket
);

router.post(
	"/checkticketforuser",
	[
		check("ticket")
			.isLength({ min: 5, max: 6 })
			.withMessage(
				"LÀM ƠN NHẬP 5 SỐ ĐỐI VỚI MIỀN BẮC VÀ 6 SỐ ĐỐI VỚI CÁC ĐÀI CÒN LẠI"
			),
	],
	lotteryController.checkTicketForUser
);

router.get("/lottery", lotteryController.getLottery);

router.get("/lottery/zone", lotteryController.getLotteryByZone);

router.get("/lottery/station", lotteryController.getLotteryByStationName);

router.get("/lottery/:id", lotteryController.getLotteryDetail);

router.get("/staticlottery", lotteryController.getStaticLottery);

router.post("/addnewlottery", isAuth, lotteryController.postAddNewLottery);

router.post("/addnewlotteryAuto", isAuth, lotteryController.postAddNewLotteryAuto);

router.put("/updatelottery/:id", isAuth, lotteryController.putUpdateLottery);

router.delete("/deletelottery/:id", isAuth, lotteryController.deleteLottery);

router.post("/deletelotteries", isAuth, lotteryController.deleteLotteries);

router.delete("/deleteticket/:id", isAuth, lotteryController.deleteTicket);

module.exports = router;
