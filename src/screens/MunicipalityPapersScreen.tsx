import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS } from '../config/theme';
import { subscribeMunicipalityPapers } from '../services/firestoreService';
import { MunicipalityPaper } from '../types';
import * as Sharing from 'expo-sharing';
import * as WebBrowser from 'expo-web-browser';
import * as IntentLauncher from 'expo-intent-launcher';
import { StorageAccessFramework, getContentUriAsync, documentDirectory, downloadAsync, writeAsStringAsync, EncodingType } from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const MunicipalityPapersScreen: React.FC = () => {
  const [papers, setPapers] = useState<MunicipalityPaper[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeMunicipalityPapers((data) => {
      setPapers(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const viewFile = async (url: string, title: string) => {
    if (!url) {
      Alert.alert('خطأ', 'الملف المرفق غير صالح للفتح.');
      return;
    }
    try {
      if (url.startsWith('data:')) {
        const mimeTypeMatch = url.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
        const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'application/pdf';
        const ext = mimeType.split('/')[1] || 'pdf';
        const base64Data = url.split(',')[1];
        const safeTitle = title.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_') || 'document';
        
        const fileUri = documentDirectory + `${safeTitle}_${Date.now()}.${ext}`;
        await writeAsStringAsync(fileUri, base64Data, { encoding: EncodingType.Base64 });
        
        const contentUri = await getContentUriAsync(fileUri);
        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
          data: contentUri,
          flags: 1,
          type: mimeType
        });
      } else {
         await WebBrowser.openBrowserAsync(url);
      }
    } catch (err) {
      Linking.openURL(url).catch(() => Alert.alert('خطأ', 'لا يمكن فتح هذا الملف'));
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'pdf': return 'document-text';
      case 'image': return 'image';
      default: return 'document';
    }
  };

  const renderItem = ({ item }: { item: MunicipalityPaper }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: '#E0E7FF' }]}>
          <Ionicons name={getIconForType(item.fileType)} size={28} color="#6366F1" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString('ar-SA')}</Text>
          {item.notes ? <Text style={styles.notesText}>{item.notes}</Text> : null}
        </View>
      </View>
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => viewFile(item.fileUrl, item.title)}>
          <Ionicons name="eye-outline" size={20} color="#4F46E5" />
          <Text style={styles.actionBtnText}>فتح المستند</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="document-text" size={48} color="#FFF" style={styles.headerIcon} />
        <Text style={styles.headerTitle}>أوراق البلدية</Text>
        <Text style={styles.headerSub}>تصفح وحمل المستندات والأوراق الرسمية</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={papers}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.emptyText}>لا توجد أوراق حالياً</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: '#6366F1', paddingTop: 60, paddingBottom: 30, paddingHorizontal: 20, alignItems: 'center' },
  headerIcon: { marginBottom: 12 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#FFF', marginBottom: 8 },
  headerSub: { fontSize: 15, color: '#E0E7FF' },
  listContent: { padding: SPACING.lg, paddingBottom: 100 },
  card: { backgroundColor: COLORS.surface, padding: 16, borderRadius: 12, marginBottom: 12, ...SHADOWS.small },
  cardHeader: { flexDirection: 'row-reverse', alignItems: 'center', marginBottom: 12 },
  iconContainer: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginLeft: 16 },
  textContainer: { flex: 1, alignItems: 'flex-end' },
  title: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  date: { fontSize: 12, color: COLORS.textSecondary },
  notesText: { fontSize: 13, color: COLORS.textMuted, marginTop: 4, textAlign: 'right' },
  actionsRow: { flexDirection: 'row-reverse', gap: 10, marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
  actionBtn: { flex: 1, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 8, backgroundColor: '#EEF2FF' },
  downloadBtn: { backgroundColor: COLORS.primary },
  actionBtnText: { fontSize: 14, fontWeight: '700', color: '#4F46E5', marginRight: 8 },
  emptyText: { textAlign: 'center', marginTop: 40, color: COLORS.textSecondary, fontSize: 16 },
});
