import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors } from '../theme';

export default function PreviewPanel({ code }) {
  const html = useMemo(() => {
    return (
      "<!DOCTYPE html><html><head><meta charset='utf-8'>" +
      "<meta name='viewport' content='width=device-width, initial-scale=1'>" +
      '<style>' + code.css + '</style></head><body>' +
      code.html +
      '<script>try{\n' + code.js + '\n}catch(e){document.body.innerHTML += "<pre style=\'color:red\'>"+e+"</pre>";}</' + 'script>' +
      '</body></html>'
    );
  }, [code]);

  return (
    <View style={styles.wrap}>
      <WebView originWhitelist={['*']} source={{ html }} style={styles.webview} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.canvas },
  webview: { flex: 1, backgroundColor: '#fff' },
});
