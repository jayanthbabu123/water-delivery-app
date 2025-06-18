import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Keyboard,
  Platform,
} from "react-native";

export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  keyboardType = "default",
  maxLength,
  style,
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
          isFocused && styles.inputFocused,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999"
        keyboardType={keyboardType}
        maxLength={maxLength}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          if (Platform.OS === "ios") {
            setTimeout(() => Keyboard.dismiss(), 100);
          }
        }}
        {...props}
      />
      <View style={styles.errorContainer}>
        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <Text style={styles.hiddenText}>_</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    height: Platform.OS === "ios" ? 100 : 90,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1a1a1a",
    backgroundColor: "#fff",
    height: 48,
  },
  inputError: {
    borderColor: "#ff3b30",
  },
  inputFocused: {
    borderColor: "#007AFF",
    borderWidth: 2,
  },
  errorContainer: {
    height: 20,
    marginTop: 4,
  },
  errorText: {
    color: "#ff3b30",
    fontSize: 12,
  },
  hiddenText: {
    color: "transparent",
    fontSize: 12,
  },
});
