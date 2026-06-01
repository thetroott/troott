import { Router } from 'express';
import {
    activateUserAccount,
    changePassword,
    forgotPassword,
    getAuthUser,
    loginUser,
    logoutUser,
    refreshToken,
    registerUser,
    resendOTP,
    resetPassword,
    socialAuthCallback,
    verifyOTP,
} from '@/controllers/auth.controller';
import Protect from '@/middlewares/checkAuth.mdw';
import passport from 'passport';

const authRouter = Router({ mergeParams: true });

authRouter.post('/register', registerUser);
authRouter.post('/login', loginUser);
authRouter.post('/verify-otp', verifyOTP);
authRouter.post('/resend-otp', resendOTP);
authRouter.post('/activate', activateUserAccount);
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/reset-password', resetPassword);
authRouter.post('/change-password', Protect, changePassword);
authRouter.post('/token', Protect, refreshToken);
authRouter.post('/logout', Protect, logoutUser);
authRouter.get('/user', Protect, getAuthUser);

authRouter.get('/google', passport.authenticate('google'));
authRouter.get('/github', passport.authenticate('github'));
authRouter.post('/apple', passport.authenticate('apple'));

authRouter.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    socialAuthCallback,
);

authRouter.get(
    '/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    socialAuthCallback,
);

authRouter.post(
    '/apple/callback',
    passport.authenticate('apple', { failureRedirect: '/login' }),
    socialAuthCallback,
);

export default authRouter;
