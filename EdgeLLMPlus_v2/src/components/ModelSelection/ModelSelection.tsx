import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

type ModelFormat = {
  label: string;
};

type ModelSelectionProps = {
  modelFormats: ModelFormat[];
  selectedModelFormat: string;
  availableGGUFs: string[];
  downloadedModels: string[];
  isFetching: boolean;
  onFormatSelect: (format: string) => void;
  onGGUFSelect: (file: string) => void;
  onLoadModel: (file: string) => void;
};

export const ModelSelection: React.FC<ModelSelectionProps> = ({
  modelFormats,
  selectedModelFormat,
  availableGGUFs,
  downloadedModels,
  isFetching,
  onFormatSelect,
  onGGUFSelect,
  onLoadModel,
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.subtitle}>Choose a model format</Text>
      {modelFormats.map((format) => (
        <TouchableOpacity
          key={format.label}
          style={[
            styles.button,
            selectedModelFormat === format.label && styles.selectedButton,
          ]}
          onPress={() => onFormatSelect(format.label)}
        >
          <Text style={styles.buttonText}>{format.label}</Text>
        </TouchableOpacity>
      ))}
      {selectedModelFormat && (
        <View>
          <Text style={styles.subtitle}>Select a .gguf file</Text>
          {isFetching && <ActivityIndicator size="small" color="#2563EB" />}
          {availableGGUFs.map((file, index) => {
            const isDownloaded = downloadedModels.includes(file);
            return (
              <View key={index} style={styles.modelContainer}>
                <TouchableOpacity
                  style={[
                    styles.modelButton,
                    isDownloaded && styles.downloadedModelButton,
                  ]}
                  onPress={() =>
                    isDownloaded ? onLoadModel(file) : onGGUFSelect(file)
                  }
                >
                  <View style={styles.modelButtonContent}>
                    <View style={styles.modelStatusContainer}>
                      {isDownloaded ? (
                        <View style={styles.downloadedIndicator}>
                          <Text style={styles.downloadedIcon}>▼</Text>
                        </View>
                      ) : (
                        <View style={styles.notDownloadedIndicator}>
                          <Text style={styles.notDownloadedIcon}>▽</Text>
                        </View>
                      )}
                      <Text
                        style={[
                          styles.buttonTextGGUF,
                          isDownloaded && styles.downloadedText,
                        ]}
                      >
                        {file.split("-").pop()}
                      </Text>
                    </View>
                    {isDownloaded && (
                      <View style={styles.loadModelIndicator}>
                        <Text style={styles.loadModelText}>TAP TO LOAD →</Text>
                      </View>
                    )}
                    {!isDownloaded && (
                      <View style={styles.downloadIndicator}>
                        <Text style={styles.downloadText}>DOWNLOAD →</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
    marginTop: 16,
  },
  button: {
    backgroundColor: "#93C5FD",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginVertical: 6,
    shadowColor: "#93C5FD",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedButton: {
    backgroundColor: "#2563EB",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
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
});
