import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme';

const TABS = [
  { key: 'html', label: 'HTML' },
  { key: 'css', label: 'CSS' },
  { key: 'js', label: 'JS' },
];

export default function CodeEditorPanel({ code, setCode, activeLang, setActiveLang }) {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.tabs}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.key}
            onPress={() => setActiveLang(t.key)}
            style={[styles.tab, activeLang === t.key && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeLang === t.key && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TextInput
        style={styles.editor}
        value={code[activeLang]}
        onChangeText={(text) => setCode({ ...code, [activeLang]: text })}
        multiline
        autoCapitalize="none"
        autoCorrect={false}
        textAlignVertical="top"
        placeholder={'Write ' + activeLang.toUpperCase() + ' here...'}
        placeholderTextColor={colors.textDim}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', gap: 4, padding: 8, backgroundColor: colors.panel, borderBottomWidth: 1, borderBottomColor: colors.border },
  tab: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 6 },
  tabActive: { backgroundColor: colors.cyan },
  tabText: { color: colors.textDim, fontWeight: '600', fontSize: 12.5 },
  tabTextActive: { color: colors.panel2 },
  editor: {
    flex: 1,
    backgroundColor: colors.panel2,
    color: colors.text,
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: 19,
    padding: 14,
  },
});
