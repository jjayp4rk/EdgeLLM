import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
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
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    margin: 16,
    shadowColor: "#475569",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    padding: 12,
    borderRadius: 12,
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
  button: {
    backgroundColor: "#EFF6FF",
    padding: 12,
    borderRadius: 12,
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
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
  },
  waveformContainer: {
    width: width * 0.8,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  micButton: {
    position: "absolute",
    bottom: 60,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  micButtonActive: {
    backgroundColor: "#4F46E5",
    transform: [{ scale: 1.1 }],
  },
  micButtonDisabled: {
    backgroundColor: "#E4E4E7",
    transform: [{ scale: 1 }],
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
});
