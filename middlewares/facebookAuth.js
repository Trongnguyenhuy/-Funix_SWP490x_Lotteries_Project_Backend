const FacebookStrategy = require("passport-facebook").Strategy;
const passport = require("passport");
const bcrypt = require("bcryptjs");
const User = require("../models/user.js");

passport.use(
	new FacebookStrategy(
		{
			clientID: process.env.FACEBOOK_LOGIN_CLIENT_ID || null,
			clientSecret: process.env.FACEBOOK_LOGIN_CLIENT_SECRET || null,
			callbackURL: process.env.FACEBOOK_LOGIN_CALLBACK_URL || null,
		},
		// Facebook sẽ gửi lại chuối token và thông tin profile của user
		(token, refreshToken, profile, done) => {
			console.log(profile);
			return done(null, profile);
			// try {
			// 	let result = await User.find({ facebookId: profile.id });

			// 	if (result.length < 1) {
			// 		const password = "123456789";
			// 		const hashedPw = await bcrypt.hash(password, 12);
			// 		const user = new User({
			// 			password: hashedPw,
			// 			name: profile.displayName,
			// 			imgUrl: "https://picsum.photos/200",
			// 			isAdmin: false,
			// 			facebookId: profile.id
			// 		});

			// 		await user.save();
			// 		return done(null, user);
			// 	} else {
			// 		return done(null, result[0]);
			// 	}
			// } catch (err) {
			// 	return done(err, null);
			// }
		}
	)
);

// used to serialize the user for the session
passport.serializeUser((user, done) => {
	done(null, user);
});
// used to deserialize the user
passport.deserializeUser((user, done) => {
	done(null, user);
});
