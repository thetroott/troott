import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github'; // Import the GitHub Strategy
import { Strategy as AppleStrategy } from 'passport-apple';
import userRepository from '@/repository/user.repository';

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

// --- 1. Serialize and Deserialize User (Session Management) ---

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
        // Signals a technical error during user retrieval
        done(err, null);
    }
});

// --- 2. Google OAuth 2.0 Strategy ---

passport.use(
    new GoogleStrategy(
        {
            clientID: GOOGLE_CLIENT_ID!,
            clientSecret: GOOGLE_CLIENT_SECRET!,
            callbackURL: GOOGLE_REDIRECT_URI,
            scope: ['profile', 'email'],
            passReqToCallback: true,
        },
        // Verify Callback function: Pass profile data to controller
        (req, accessToken, refreshToken, profile, done) => {
            // In a real app, you would look up/create the user here based on profile.id or profile.emails[0].value
            // For simplicity, we pass the profile object for the controller to handle.
            done(null, profile);
        },
    ),
);

// --- 3. GitHub Strategy ---

passport.use(
    new GitHubStrategy(
        {
            clientID: GITHUB_CLIENT_ID!,
            clientSecret: GITHUB_CLIENT_SECRET!,
            // Ensure this matches your GitHub OAuth Application setting
            callbackURL: GITHUB_REDIRECT_URI,
            scope: ['user:email'], // Requesting email access
            passReqToCallback: true,
        },
        // Verify Callback function
        (req, accessToken, refreshToken, profile, done) => {
            // Pass the GitHub profile object to the controller
            done(null, profile);
        },
    ),
);

// --- 4. Apple Sign-In Strategy (Note: Requires complex JWT setup) ---

passport.use(
    new AppleStrategy(
        {
            clientID: APPLE_CLIENT_ID!,
            teamID: APPLE_TEAM_ID!,
            keyIdentifier: APPLE_KEY_ID!,
            privateKeyPath: APPLE_KEY_FILE!,
            callbackURL: APPLE_REDIRECT_URI,
            scope: ['email', 'name', ''],
            passReqToCallback: true,
        },
        // Verify Callback function
        (
            req: Request,
            accessToken: any,
            refreshToken: any,
            profile: any,
            done: any,
        ) => {
            // Pass the Apple profile object to the controller
            done(null, profile);
        },
    ),
);

export default passport;
