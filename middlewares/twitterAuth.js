const TwitterStrategy = require("passport-twitter").Strategy;
const passport = require("passport");
const bcrypt = require("bcryptjs");
const User = require("../models/user.js");

passport.use(
	new TwitterStrategy(
		{
			consumerKey: process.env.TWITTER_LOGIN_CLIENT_ID || null,
			consumerSecret: process.env.TWITTER_LOGIN_CLIENT_SECRET || null,
			callbackURL: process.env.TWITTER_LOGIN_CALLBACK_URL || null,
		},
		async (token, tokenSecret, profile, done) => {
			try {
				let result = await User.find({ twitterId: profile.id });

				if (result.length < 1) {
					const password = "123456789";
					const hashedPw = await bcrypt.hash(password, 12);
					const user = new User({
						password: hashedPw,
						name: profile.displayName,
						imgUrl: "https://picsum.photos/200",
						isAdmin: false,
						twitterId: profile.id,
					});

					await user.save();
					return done(null, user);
				} else {
					return done(null, result[0]);
				}
			} catch (err) {
				return done(err, null);
			}
		}
	)
);

passport.serializeUser((user, done) => {
	done(null, user);
});

passport.deserializeUser((user, done) => {
	done(null, user);
});
