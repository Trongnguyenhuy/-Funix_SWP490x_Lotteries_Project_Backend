const GoogleStrategy = require("passport-google-oauth2").Strategy;
const passport = require("passport");
const bcrypt = require("bcryptjs");
const User = require("../models/user.js");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_LOGIN_CLIENT_ID || null,
      clientSecret: process.env.GOOGLE_LOGIN_CLIENT_SECRET || null,
      callbackURL: process.env.GOOGLE_LOGIN_CALLBACK_URL || null,
      passReqToCallback: true,
    },
    async (request, accessToken, refreshToken, profile, done) => {
      try {
        const user = {
          email: profile.email.trim(),
          name: profile.displayName.trim(),
          googleId: profile.id,
          googleSignup: true
        };

        const userGoogleId = await User.find({
          googleId: user.googleId,
        });

        if (userGoogleId.length >= 1) {
          return done(null, userGoogleId[0]);
        } 

        const userGoogleEmail = await User.find({
          email: user.email,
        });

        if(userGoogleEmail.length >=1){

          userGoogleEmail[0].googleId = user.googleId;
          const result = await userGoogleEmail[0].save();

          return done(null, result);

        } else {
          return done(null, user);
        }
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});
