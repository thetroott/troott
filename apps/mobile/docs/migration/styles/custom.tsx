import { StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';

const customStyles = StyleSheet.create({
    // Welcome Screen
    welcomeScreenContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.grey[900],
    },
    welcomeScreenLogo: {
        width: 110,
        height: 50,
        resizeMode: 'contain',
        justifyContent: 'center',
        alignItems: 'center',
    },
    welcomeScreenText: {
        fontSize: 20,
        fontFamily: theme.typography.bold,
        color: theme.colors.white[50],
        textAlign: 'center',
    },
    welcomeScreenView: {
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Base
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.black[900],
    },
    logo: {
        width: 140,
        height: 140,
        resizeMode: 'contain',
        marginBottom: theme.sizes.spacing.base,
    },
    text: {
        fontSize: 20,
        fontFamily: theme.typography.light,
        color: theme.colors.white[50],
    },

    // Margins (mt = marginTop)
    mt5: { marginTop: 5 },
    mt10: { marginTop: 10 },
    mt15: { marginTop: 15 },
    mt20: { marginTop: 20 },
    mt25: { marginTop: 25 },
    mt30: { marginTop: 30 },
    mt40: { marginTop: 40 },
    mt50: { marginTop: 50 },
    mt60: { marginTop: 60 },
    mt80: { marginTop: 80 },
    mt100: { marginTop: 100 },
    mt120: { marginTop: 120 },

    // Gaps (g = gap)
    g0: { gap: 0 },
    g5: { gap: 5 },
    g10: { gap: 10 },
    g15: { gap: 15 },
    g20: { gap: 20 },
    g25: { gap: 25 },
    g30: { gap: 30 },
    g40: { gap: 40 },
    g50: { gap: 50 },
    g60: { gap: 60 },
    g80: { gap: 80 },
    g100: { gap: 100 },
    g120: { gap: 120 },
});

export default customStyles;
