import { Router } from 'express';
import {
    activateUserAccount,
    changePassword,
    forgotPassword,
    loginUser,
    logoutUser,
    refreshToken,
    registerUser,
    resendOTP,
    resetPassword,
    verifyOTP,
} from './auth.controller';
import Protect from '../../../middlewares/checkAuth.mdw';

const authRoutes: Router = Router({ mergeParams: true });

authRoutes.post('/register', registerUser);
authRoutes.post('/login', loginUser);
authRoutes.post('/verify-otp', verifyOTP);
authRoutes.post('/resend-otp', resendOTP);
authRoutes.post('/activate', activateUserAccount);
authRoutes.post('/forgot-password', forgotPassword);
authRoutes.post('/reset-password', resetPassword);
authRoutes.post('/change-password', Protect, changePassword);
authRoutes.post('/token', Protect, refreshToken);
authRoutes.post('/logout', Protect, logoutUser);

export default authRoutes;
