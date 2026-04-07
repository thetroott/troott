import { theme } from "@/constants/theme";
import { StyleSheet } from "react-native";

const componentStyles = StyleSheet.create({
  // TextInput
  textInputContainer: {
    paddingHorizontal: theme.sizes.spacing.lg,
    paddingVertical: theme.sizes.spacing.sm,
    borderRadius: theme.sizes.spacing.sm,
    width: "95%",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  input: {
    width: "100%",
    color: theme.colors.white[50],
    fontFamily: theme.typography.light,
  },
  errorText: {
    color: theme.colors.red[500] || "red",
    fontSize: 12,
    marginTop: 4,
  },
  inputRoot: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  // Button styles
  button: {
    padding: theme.sizes.spacing.md,
    marginVertical: theme.sizes.spacing.sm,
    borderRadius: theme.sizes.spacing.xs,
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 130,
    paddingVertical: 18,
    backgroundColor: theme.colors.teal[500],
  },
  buttonText: {
    color: theme.colors.black[900],
    fontFamily: theme.typography.medium,
  },
  buttonPrimary: {
    backgroundColor: theme.colors.teal[500],
  },
  buttonSecondary: {
    backgroundColor: theme.colors.white[50],
    borderColor: theme.colors.blue[300],
    borderWidth: 1,
  },
  buttonSecondaryOutline: {
    backgroundColor: "transparent",
    borderColor: theme.colors.blue[300],
    borderWidth: 1,
  },

  // Auth
  backButton: {
    position: "absolute",
    left: 0,
    top: 10,
    padding: theme.sizes.spacing.sm,
  },
  title: {
    fontSize: 20,
    textAlign: "center",
    color: theme.colors.white[50],
    fontFamily: theme.typography.bold,
  },
  subText: {
    fontSize: 14,
    textAlign: "center",
    color: theme.colors.white[50],
    marginTop: 10,
    fontFamily: theme.typography.regular,
    lineHeight: 20,
  },
  link: {
    color: theme.colors.blue[300],
    textDecorationLine: "underline",
    marginTop: 15,
  },

  // Change data
  clink: {
    color: theme.colors.grey[200],
    fontFamily: theme.typography.bold,
  },
  dlink: {
    color: theme.colors.teal[700],
    fontFamily: theme.typography.medium,
    lineHeight: 20,
  },

  // Resend Code
  rlink: {
    color: theme.colors.teal[500],
    fontFamily: theme.typography.bold,
    marginTop: 5,
  },

  // Terms
  termsSubText: {
    fontSize: 14,
    textAlign: "left",
    color: theme.colors.white[50],
    marginTop: 10,
    fontFamily: theme.typography.regular,
    lineHeight: 20,
  },

  rSubText: {
    fontSize: 14,
    textAlign: "left",
    color: theme.colors.grey[400],
    fontFamily: theme.typography.regular,
  },

  reSubText: {
    fontSize: 14,
    textAlign: "center",
    color: theme.colors.grey[200],
    fontFamily: theme.typography.regular,
    lineHeight: 18,
  },

  // Divider
  OrCongtainer: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: theme.sizes.spacing.lg,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.grey[300],
    position: "relative",
  },
  orText: {
    fontSize: 16,
    fontFamily: theme.typography.bold,
    color: theme.colors.grey[300],
    position: "absolute",
    backgroundColor: theme.colors.grey[950],
    top: -13,
    left: 165.5,
    paddingHorizontal: 10,
    zIndex: 1,
  },

  urlText: {
    fontSize: 14,
    textAlign: "left",
    color: theme.colors.grey[400],
    marginBottom: 10,
    fontFamily: theme.typography.regular,
    lineHeight: 20,
    textDecorationLine: "underline",
  },

  // OAuth
  oAuthbuttonBase: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: theme.sizes.spacing.sm,
  },
  oAuthtext: {
    fontFamily: theme.typography.light,
    fontSize: 16,
  },
  oAuthrow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  icon: {
    marginRight: 8,
    width: 18,
    height: 18,
  },

  // TextInput
  twrapper: {
    width: "100%",
  },
  tlabel: {
    fontSize: 14,
    fontFamily: theme.typography.regular,
    color: theme.colors.white[50],
    marginBottom: 8,
  },
  tcontainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    height: 55,
    borderWidth: 1,
    borderColor: theme.colors.grey[400],
    borderRadius: 4,
    fontFamily: theme.typography.regular,
    backgroundColor: theme.colors.grey[700],
    color: theme.colors.white[50],
  },
  toutline: {
    borderWidth: 1,
    borderColor: theme.colors.white[400],
  },
  tinput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.white[50],
    paddingVertical: 10,
  },
  tdisabledInput: {
    color: theme.colors.grey[900],
  },
  ticon: {
    marginHorizontal: -50,
    width: 20,
    height: 20,
  },

  // OTP
  otpcontainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignSelf: "stretch",
  },
  otpBox: {
    width: 50,
    height: 60,
    borderWidth: 1,
    borderColor: theme.colors.grey[400],
    textAlign: "center",
    fontSize: 20,
    borderRadius: 4,
    backgroundColor: theme.colors.grey[700],
    color: theme.colors.white[50],
  },

  // Register
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  rowInput: {
    flex: 1,
    marginHorizontal: 5,
  },

  // Error Boundary
  econtainer: {
    backgroundColor: theme.colors.white[100],
    flex: 1,
    justifyContent: "center",
  },
  econtent: {
    marginHorizontal: 16,
  },
  etitle: {
    fontSize: 48,
    fontWeight: "300",
    paddingBottom: 16,
    color: "#000",
  },
  esubtitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#000",
  },
  eerror: {
    paddingVertical: 16,
  },
  ebutton: {
    backgroundColor: "#2196f3",
    borderRadius: 50,
    padding: 16,
  },
  ebuttonText: {
    color: theme.colors.white[100],
    fontWeight: "600",
    textAlign: "center",
  },
});

export default componentStyles;
