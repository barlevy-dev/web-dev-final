import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { User } from '../models/user.model';

export const initializePassport = () => {
  // Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL:
            process.env.GOOGLE_CALLBACK_URL ||
            'https://localhost:5000/api/auth/google/callback',
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            let user = await User.findOne({
              authProvider: 'google',
              providerId: profile.id,
            });

            if (!user) {
              const email = profile.emails?.[0]?.value;
              if (email) {
                user = await User.findOne({ email });
              }

              if (!user) {
                user = await User.create({
                  email: email || `${profile.id}@google.oauth`,
                  username: profile.displayName?.replace(/\s+/g, '_').toLowerCase() || `google_${profile.id}`,
                  authProvider: 'google',
                  providerId: profile.id,
                  profileImageUrl: profile.photos?.[0]?.value,
                });
              } else {
                user.authProvider = 'google';
                user.providerId = profile.id;
                if (profile.photos?.[0]?.value) {
                  user.profileImageUrl = profile.photos[0].value;
                }
                await user.save();
              }
            }

            // Pass user info matching Express.User interface
            done(null, {
              userId: String(user._id),
              email: user.email,
              username: user.username,
            } as Express.User);
          } catch (error) {
            done(error as Error, undefined);
          }
        }
      )
    );
  }

  // Facebook OAuth Strategy
  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(
      new FacebookStrategy(
        {
          clientID: process.env.FACEBOOK_APP_ID,
          clientSecret: process.env.FACEBOOK_APP_SECRET,
          callbackURL:
            process.env.FACEBOOK_CALLBACK_URL ||
            'https://localhost:5000/api/auth/facebook/callback',
          profileFields: ['id', 'emails', 'name', 'displayName', 'photos'],
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            let user = await User.findOne({
              authProvider: 'facebook',
              providerId: profile.id,
            });

            if (!user) {
              const email = profile.emails?.[0]?.value;
              if (email) {
                user = await User.findOne({ email });
              }

              if (!user) {
                user = await User.create({
                  email: email || `${profile.id}@facebook.oauth`,
                  username: profile.displayName?.replace(/\s+/g, '_').toLowerCase() || `fb_${profile.id}`,
                  authProvider: 'facebook',
                  providerId: profile.id,
                  profileImageUrl: profile.photos?.[0]?.value,
                });
              } else {
                user.authProvider = 'facebook';
                user.providerId = profile.id;
                if (profile.photos?.[0]?.value) {
                  user.profileImageUrl = profile.photos[0].value;
                }
                await user.save();
              }
            }

            done(null, {
              userId: String(user._id),
              email: user.email,
              username: user.username,
            } as Express.User);
          } catch (error) {
            done(error as Error, undefined);
          }
        }
      )
    );
  }
};
