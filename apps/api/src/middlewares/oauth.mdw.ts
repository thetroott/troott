import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github';
import { Strategy as AppleStrategy } from 'passport-apple';
import userRepository from '../modules/users/user/user.repository';
import userService from '../modules/users/user/user.service';
import { OAuthProvider } from '../modules/authentication/auth/auth.enums';

const {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI,
    GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET,
    GITHUB_REDIRECT_URI,
    APPLE_CLIENT_ID,
    APPLE_TEAM_ID,
    APPLE_KEY_ID,
    APPLE_KEY_FILE,
    APPLE_REDIRECT_URI,
} = process.env;

passport.serializeUser((user: any, done) => {
    // Stores only the user ID in the session
    done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
    try {
        // Retrieves the full user object from the database using the ID from the session
        const user = await userRepository.findUser(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

passport.use(
    new GoogleStrategy(
        {
            clientID: GOOGLE_CLIENT_ID!,
            clientSecret: GOOGLE_CLIENT_SECRET!,
            callbackURL: GOOGLE_REDIRECT_URI,
            scope: ['profile', 'email'],
            passReqToCallback: true,
        },
        // UPDATED: Verify Callback function
        async (req: any, accessToken, refreshToken, profile, done) => {
            try {
                // Core logic delegated to userService
                const user = await userService.findOrCreateSocialUser(
                    profile as any, // Cast to any to fit Passport profile structure
                    OAuthProvider.GOOGLE,
                    req,
                );
                if (user) {
                    return done(null, user);
                } else {
                    // Handle case where user creation/lookup failed
                    return done(new Error('Social login failed.'), {});
                }
            } catch (error) {
                done(error, {});
            }
        },
    ),
);

// --- 3. GitHub Strategy ---

passport.use(
    new GitHubStrategy(
        {
            clientID: GITHUB_CLIENT_ID!,
            clientSecret: GITHUB_CLIENT_SECRET!,
            callbackURL: GITHUB_REDIRECT_URI,
            scope: ['user:email'],
            passReqToCallback: true,
        },
        // UPDATED: Verify Callback function
        async (req, accessToken, refreshToken, profile, done) => {
            try {
                // Core logic delegated to userService
                const user = await userService.findOrCreateSocialUser(
                    profile as any,
                    OAuthProvider.GITHUB,
                    req,
                );
                if (user) {
                    return done(null, user);
                } else {
                    return done(new Error('Social login failed.'), {});
                }
            } catch (error) {
                done(error, {});
            }
        },
    ),
);

// --- 4. Apple Sign-In Strategy ---

passport.use(
    new AppleStrategy(
        {
            clientID: APPLE_CLIENT_ID!,
            teamID: APPLE_TEAM_ID!,
            keyIdentifier: APPLE_KEY_ID!,
            privateKeyPath: APPLE_KEY_FILE!,
            callbackURL: APPLE_REDIRECT_URI,
            scope: ['email', 'name'],
            passReqToCallback: true,
        },
        // UPDATED: Verify Callback function
        async (req: any, profile: any, done: any) => {
            try {
                // Core logic delegated to userService
                const user = await userService.findOrCreateSocialUser(
                    profile as any,
                    OAuthProvider.APPLE,
                    req,
                );
                if (user) {
                    return done(null, user);
                } else {
                    return done(new Error('Social login failed.'), null);
                }
            } catch (error) {
                done(error, null);
            }
        },
    ),
);

// Helper function to initialize passport
export default passport; //
