import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { colors } from '../theme';

export default function SettingsModal({ visible, apiKey, onSave, onClose }) {
  const [value, setValue] = useState(apiKey);

  useEffect(() => {
    setValue(apiKey);
  }, [apiKey, visible]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.label}>Groq API key (free)</Text>
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={setValue}
            placeholder="gsk_..."
            placeholderTextColor={colors.textDim}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
          />
          <TouchableOpacity onPress={() => Linking.openURL('https://console.groq.com/keys')}>
            <Text style={styles.link}>Get a free key at console.groq.com \u2192</Text>
          </TouchableOpacity>
          <View style={styles.row}>
            <TouchableOpacity style={styles.btnGhost} onPress={onClose}>
              <Text style={styles.btnGhostText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={() => {
                onSave(value.trim());
                onClose();
              }}
            >
              <Text style={styles.btnPrimaryText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.panel, padding: 20, borderTopLeftRadius: 16, borderTopRightRadius: 16, borderWidth: 1, borderColor: colors.border },
  title: { color: colors.text, fontSize: 17, fontWeight: '700', marginBottom: 12 },
  label: { color: colors.textDim, fontSize: 12, marginBottom: 6 },
  input: {
    backgroundColor: colors.panel2, borderWidth: 1, borderColor: colors.border, borderRadius: 8,
    color: colors.text, padding: 10, fontSize: 14, marginBottom: 10,
  },
  link: { color: colors.cyan, fontSize: 12.5, marginBottom: 18 },
  row: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  btnGhost: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
  btnGhostText: { color: colors.textDim, fontWeight: '600' },
  btnPrimary: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, backgroundColor: colors.cyan },
  btnPrimaryText: { color: colors.panel2, fontWeight: '700' },
});
