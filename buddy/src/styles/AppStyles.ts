import { StyleSheet, Dimensions, Platform } from "react-native";
import { COLORS } from "../config/colors";

const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1E293B",
    marginVertical: 24,
    textAlign: "center",
  },
  card: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 500,
    alignItems: "center",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 16,
  },
  subtitle2: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 8,
  },
  bottomContainer: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4F46E5",
    padding: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#FFFFFF",
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
  },
  modelContainer: {
    marginVertical: 6,
    borderRadius: 12,
    overflow: "hidden",
  },
  modelButton: {
    backgroundColor: "#EFF6FF",
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    shadowColor: "#3B82F6",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  downloadedModelButton: {
    backgroundColor: "#EFF6FF",
    borderColor: "#3B82F6",
    borderWidth: 1,
  },
  modelButtonContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modelStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  downloadedIndicator: {
    backgroundColor: "#DBEAFE",
    padding: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  notDownloadedIndicator: {
    backgroundColor: "#F1F5F9",
    padding: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  downloadedIcon: {
    color: "#3B82F6",
    fontSize: 14,
    fontWeight: "bold",
  },
  notDownloadedIcon: {
    color: "#94A3B8",
    fontSize: 14,
    fontWeight: "bold",
  },
  downloadedText: {
    color: "#1E40AF",
  },
  loadModelIndicator: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  buttonTextGGUF: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "500",
  },
  selectedButtonText: {
    color: "#1E40AF",
    fontWeight: "600",
  },
  loadModelText: {
    color: "#2563EB",
    fontSize: 12,
    fontWeight: "500",
  },
  downloadIndicator: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  downloadText: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "500",
  },
  selectedButton: {
    backgroundColor: "#EFF6FF",
    borderColor: "#3B82F6",
    borderWidth: 1,
  },
  buttonText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "500",
  },
  contentContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 60 : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.text.primary,
    textAlign: "center",
    marginBottom: 40,
  },
  assistantTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text.primary,
    textAlign: "center",
  },
  waveformContainer: {
    width: width * 0.6,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 120,
  },
  voiceContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  micButton: {
    backgroundColor: COLORS.background.secondary,
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  micButtonActive: {
    backgroundColor: COLORS.primary,
  },
  micButtonDisabled: {
    backgroundColor: COLORS.background.accent,
    opacity: 0.7,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
    width: "100%",
  },
  messageWrapper: {
    marginBottom: 16,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 12,
    maxWidth: "80%",
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#3B82F6",
  },
  llamaBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  messageText: {
    fontSize: 16,
    color: "#334155",
  },
  userMessageText: {
    color: "#FFFFFF",
  },
  thoughtContainer: {
    marginTop: 8,
    padding: 10,
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#94A3B8",
  },
  thoughtTitle: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  thoughtText: {
    color: "#475569",
    fontSize: 12,
    fontStyle: "italic",
    lineHeight: 16,
  },
  toggleButton: {
    marginTop: 8,
    paddingVertical: 4,
  },
  toggleText: {
    color: "#3B82F6",
    fontSize: 12,
    fontWeight: "500",
  },
  // Welcome Screen Styles
  welcomeCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 24,
    width: "90%",
    maxWidth: 400,
    alignItems: "center",
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: COLORS.text.primary,
    marginBottom: 16,
    textAlign: "center",
  },
  welcomeIcon: {
    width: 120,
    height: 120,
    marginBottom: 24,
    borderRadius: 60,
    backgroundColor: COLORS.background.primary,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: "center",
    marginBottom: 32,
  },
  welcomeFeatures: {
    width: "85%",
    marginBottom: 80,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 32,
  },
  featureItem: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 8,
  },
  featureIcon: {
    marginBottom: 16,
  },
  featureText: {
    fontSize: 16,
    color: COLORS.text.primary,
    textAlign: "center",
    lineHeight: 20,
  },
  getStartedButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
  },
  getStartedButtonText: {
    color: COLORS.text.light,
    fontSize: 18,
    fontWeight: "600",
  },

  // Download Screen Styles
  downloadCard: {
    backgroundColor: "white",
    marginHorizontal: 32,
  },
  downloadTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text.primary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
    marginHorizontal: 64,
  },
  downloadSubtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: "center",
    marginBottom: 32,
    marginHorizontal: 64,
  },
  progressContainer: {
    width: "100%",
    alignItems: "center",
  },
  progressText: {
    marginTop: 8,
    fontSize: 16,
    color: COLORS.text.primary,
    fontWeight: "600",
  },
  settingsButton: {
    position: "absolute",
    top: 48,
    right: 24,
    padding: 12,
    borderRadius: 24,
    backgroundColor: COLORS.background.secondary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingsButtonDisabled: {
    opacity: 0.7,
  },
  modelList: {
    marginTop: 20,
    width: "100%",
  },
  modelButtonText: {
    color: "#1E40AF",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
});
