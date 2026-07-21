import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../modules/auth/user.model";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(new Error("No email found in Google profile"));
        }

        // Check if a user already exists with this Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // No Google-linked user yet — check if the email is already used locally
          const existingLocalUser = await User.findOne({ email });

          if (existingLocalUser) {
            // Link the Google account using updateOne to avoid Mongoose validation errors
            // caused by the password field having `select: false`
            await User.updateOne(
              { _id: existingLocalUser._id },
              { $set: { googleId: profile.id, isVerified: true } }
            );
            existingLocalUser.googleId = profile.id;
            existingLocalUser.isVerified = true;
            return done(null, existingLocalUser);
          }
          // Create a brand new Google user
          user = await User.create({
            email,
            googleId: profile.id,
            authProvider: "google",
            isVerified: true, // Google already verified their email
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err as Error);
      }
    }
  )
);

export default passport;