import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, SafeAreaView, Alert } from 'react-native';
import ChatPanel from './src/components/ChatPanel';
import CodeEditorPanel from './src/components/CodeEditorPanel';
import PreviewPanel from './src/components/PreviewPanel';
import SettingsModal from './src/components/SettingsModal';
import { colors } from './src/theme';
import { loadCode, saveCode, loadChat, saveChat, loadApiKey, saveApiKey } from './src/storage';
import { askMentor, buildSystemPrompt, parseReply } from './src/api/aiClient';

const TABS = [
  { key: 'chat', label: '\uD83D\uDCAC Mentor' },
  { key: 'code', label: '{ } Code' },
  { key: 'preview', label: '\u25B6 Preview' },
];

export default function App() {
  const [view, setView] = useState('chat');
  const [code, setCode] = useState({ html: '', css: '', js: '' });
  const [activeLang, setActiveLang] = useState('html');
  const [chatHistory, setChatHistory] = useState([]); // {role, content, prose, blocks}
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const [c, h, k] = await Promise.all([loadCode(), loadChat(), loadApiKey()]);
      setCode(c);
      setChatHistory(
        h.length
          ? h
          : [
              {
                role: 'assistant',
                content: "Hi, I'm FirstAI \u2014 your coding mentor. Tell me what you'd like to build and I'll write the code for you.",
                prose: "Hi, I'm FirstAI \u2014 your coding mentor. Tell me what you'd like to build and I'll write the code for you.",
                blocks: [],
              },
            ]
      );
      setApiKey(k);
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (ready) saveCode(code);
  }, [code, ready]);

  useEffect(() => {
    if (ready) saveChat(chatHistory);
  }, [chatHistory, ready]);

  const handleInsert = useCallback(
    (lang, snippet) => {
      setCode((prev) => ({ ...prev, [lang]: snippet }));
    },
    [setCode]
  );

  async function handleSend() {
    const msg = input.trim();
    if (!msg || sending) return;
    if (!apiKey) {
      Alert.alert('API key needed', 'Add your free Groq API key in Settings first.', [
        { text: 'Open Settings', onPress: () => setSettingsOpen(true) },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }

    const userTurn = { role: 'user', content: msg, prose: msg, blocks: [] };
    const nextHistory = [...chatHistory, userTurn];
    setChatHistory(nextHistory);
    setInput('');
    setSending(true);

    try {
      const messages = [
        { role: 'system', content: buildSystemPrompt(code) },
        ...nextHistory.map((m) => ({ role: m.role, content: m.content })),
      ];
      const replyText = await askMentor(apiKey, messages);
      const { prose, blocks } = parseReply(replyText);

      // auto-insert any code the mentor produced
      let updatedCode = code;
      blocks.forEach((b) => {
        if (b.lang) updatedCode = { ...updatedCode, [b.lang]: b.code };
      });
      if (updatedCode !== code) setCode(updatedCode);

      setChatHistory((h) => [...h, { role: 'assistant', content: replyText, prose, blocks }]);
    } catch (err) {
      setChatHistory((h) => [
        ...h,
        { role: 'assistant', content: 'Error: ' + err.message, prose: 'Error: ' + err.message, blocks: [] },
      ]);
    } finally {
      setSending(false);
    }
  }

  if (!ready) return <SafeAreaView style={styles.safe} />;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.panel} />
      <View style={styles.header}>
        <View style={styles.brand}>
          <Text style={styles.brandIcon}>\uD83D\uDCD0</Text>
          <View>
            <Text style={styles.brandName}>FirstAI</Text>
            <Text style={styles.brandTag}>AI CODING MENTOR</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => setSettingsOpen(true)} style={styles.settingsBtn}>
          <Text style={styles.settingsBtnText}>\u2699 Settings</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }}>
        {view === 'chat' && (
          <ChatPanel
            chatHistory={chatHistory}
            input={input}
            setInput={setInput}
            onSend={handleSend}
            sending={sending}
            onInsert={handleInsert}
          />
        )}
        {view === 'code' && (
          <CodeEditorPanel code={code} setCode={setCode} activeLang={activeLang} setActiveLang={setActiveLang} />
        )}
        {view === 'preview' && <PreviewPanel code={code} />}
      </View>

      <View style={styles.nav}>
        {TABS.map((t) => (
          <TouchableOpacity key={t.key} style={[styles.navBtn, view === t.key && styles.navBtnActive]} onPress={() => setView(t.key)}>
            <Text style={[styles.navBtnText, view === t.key && styles.navBtnTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <SettingsModal
        visible={settingsOpen}
        apiKey={apiKey}
        onSave={(k) => {
          setApiKey(k);
          saveApiKey(k);
        }}
        onClose={() => setSettingsOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.panel,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandIcon: { fontSize: 18, marginRight: 6 },
  brandName: { color: colors.text, fontWeight: '700', fontSize: 16 },
  brandTag: { color: colors.textDim, fontSize: 9.5, letterSpacing: 0.5 },
  settingsBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10 },
  settingsBtnText: { color: colors.textDim, fontSize: 12.5, fontWeight: '600' },
  nav: { flexDirection: 'row', backgroundColor: colors.panel, borderTopWidth: 1, borderTopColor: colors.border },
  navBtn: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  navBtnActive: { borderTopWidth: 2, borderTopColor: colors.cyan },
  navBtnText: { color: colors.textDim, fontSize: 12.5, fontWeight: '600' },
  navBtnTextActive: { color: colors.cyan },
});
