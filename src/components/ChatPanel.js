import React, { useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { colors } from '../theme';

export default function ChatPanel({ chatHistory, input, setInput, onSend, sending, onInsert }) {
  const listRef = useRef(null);

  function renderBubble({ item }) {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAi]}>
        <Text style={styles.bubbleText}>{item.prose || item.content}</Text>
        {(item.blocks || []).filter((b) => b.lang).map((b, i) => (
          <View key={i} style={styles.chip}>
            <View style={styles.chipHead}>
              <Text style={styles.chipLabel}>{b.lang.toUpperCase()} code</Text>
              <TouchableOpacity onPress={() => onInsert(b.lang, b.code)} style={styles.chipBtn}>
                <Text style={styles.chipBtnText}>Insert \u2192 {b.lang.toUpperCase()}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={listRef}
        data={chatHistory}
        keyExtractor={(_, i) => String(i)}
        renderItem={renderBubble}
        contentContainerStyle={styles.list}
        onContentSizeChange={() => listRef.current && listRef.current.scrollToEnd({ animated: true })}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="e.g. Build me a simple to-do list app"
          placeholderTextColor={colors.textDim}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendBtn, sending && styles.sendBtnDisabled]}
          onPress={onSend}
          disabled={sending}
        >
          <Text style={styles.sendBtnText}>{sending ? '...' : 'Send'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  list: { padding: 14, gap: 10 },
  bubble: { maxWidth: '92%', padding: 10, borderRadius: 10, marginBottom: 10 },
  bubbleUser: { alignSelf: 'flex-end', backgroundColor: colors.userBubble, borderWidth: 1, borderColor: colors.border },
  bubbleAi: { alignSelf: 'flex-start', backgroundColor: colors.panel3, borderWidth: 1, borderColor: colors.border },
  bubbleText: { color: colors.text, fontSize: 14, lineHeight: 20 },
  chip: { marginTop: 8, borderWidth: 1, borderColor: colors.border, borderRadius: 8, overflow: 'hidden', backgroundColor: colors.canvas },
  chipHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 8 },
  chipLabel: { color: colors.cyan, fontSize: 11, fontWeight: '700' },
  chipBtn: { backgroundColor: colors.amber, paddingVertical: 4, paddingHorizontal: 9, borderRadius: 5 },
  chipBtnText: { color: '#2A1B03', fontSize: 11, fontWeight: '700' },
  inputRow: { flexDirection: 'row', gap: 8, padding: 10, borderTopWidth: 1, borderTopColor: colors.border, alignItems: 'flex-end' },
  input: {
    flex: 1, backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.border, borderRadius: 8,
    color: colors.text, paddingHorizontal: 11, paddingVertical: 9, fontSize: 14, maxHeight: 100,
  },
  sendBtn: { backgroundColor: colors.cyan, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 },
  sendBtnDisabled: { opacity: 0.5 },
  sendBtnText: { color: colors.panel2, fontWeight: '700' },
});
