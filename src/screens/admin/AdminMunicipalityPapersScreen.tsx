import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS } from '../../config/theme';
import { subscribeMunicipalityPapers, addMunicipalityPaper, deleteMunicipalityPaper, updateMunicipalityPaper } from '../../services/firestoreService';
import { MunicipalityPaper } from '../../types';
import * as DocumentPicker from 'expo-document-picker';
import { uploadFile } from '../../services/storageService';
import { documentDirectory, downloadAsync, writeAsStringAsync, EncodingType } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as WebBrowser from 'expo-web-browser';
import * as IntentLauncher from 'expo-intent-launcher';
import { StorageAccessFramework, getContentUriAsync } from 'expo-file-system/legacy';
import { Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AdminMunicipalityPapersScreen: React.FC = () => {
  const [papers, setPapers] = useState<MunicipalityPaper[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedFileUri, setSelectedFileUri] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'pdf' | 'image' | 'document'>('pdf');
  const [isUploading, setIsUploading] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeMunicipalityPapers((data) => {
      setPapers(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setSelectedFileUri(file.uri);
        setSelectedFileName(file.name);
        
        if (file.mimeType?.includes('image')) setFileType('image');
        else if (file.mimeType?.includes('pdf')) setFileType('pdf');
        else setFileType('document');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('خطأ', 'حدث خطأ أثناء اختيار الملف');
    }
  };

  const handleAddPaper = async () => {
    if (!title.trim() || !selectedFileUri) {
      Alert.alert('تنبيه', 'يرجى إدخال اسم الورقة واختيار ملف');
      return;
    }

    setIsUploading(true);
    try {
      let uploadedUrl = selectedFileUri;
      if (selectedFileUri && !selectedFileUri.startsWith('http')) {
        const ext = selectedFileName?.split('.').pop() || 'pdf';
        uploadedUrl = await uploadFile(selectedFileUri, 'municipality_papers', `paper_${Date.now()}.${ext}`);
      }
      
      if (editingId) {
        const updates: Partial<MunicipalityPaper> = {
          title: title.trim(),
          notes: notes.trim(),
        };
        if (selectedFileUri && !selectedFileUri.startsWith('http')) {
          updates.fileUrl = uploadedUrl;
          updates.fileType = fileType;
        }
        await updateMunicipalityPaper(editingId, updates);
        Alert.alert('نجاح', 'تم تعديل الورقة بنجاح');
        setEditingId(null);
      } else {
        await addMunicipalityPaper({
          title: title.trim(),
          notes: notes.trim(),
          fileUrl: uploadedUrl!,
          fileType
        });
        Alert.alert('نجاح', 'تم إضافة الورقة بنجاح');
      }

      setTitle('');
      setNotes('');
      setSelectedFileUri(null);
      setSelectedFileName(null);
    } catch (error) {
      console.error(error);
      Alert.alert('خطأ', 'حدث خطأ أثناء رفع/تعديل الورقة');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditPress = (paper: MunicipalityPaper) => {
    setEditingId(paper.id);
    setTitle(paper.title);
    setNotes(paper.notes || '');
    setSelectedFileUri(paper.fileUrl); // just for validation purposes
    setSelectedFileName('ملف موجود سابقاً');
    setFileType(paper.fileType);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setNotes('');
    setSelectedFileUri(null);
    setSelectedFileName(null);
  };

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

  const handleDelete = (id: string) => {
    Alert.alert('حذف', 'هل أنت متأكد من حذف هذه الورقة؟', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: async () => {
        try {
          await deleteMunicipalityPaper(id);
        } catch (e) {
          Alert.alert('خطأ', 'تعذر الحذف');
        }
      }}
    ]);
  };

  const renderItem = ({ item }: { item: MunicipalityPaper }) => (
    <View style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: '#E0E7FF' }]}>
        <Ionicons name={item.fileType === 'pdf' ? 'document-text' : item.fileType === 'image' ? 'image' : 'document'} size={28} color="#6366F1" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString('ar-SA')}</Text>
        {item.notes ? <Text style={styles.notesText}>{item.notes}</Text> : null}
      </View>
      <View style={styles.cardActions}>
        <View style={styles.cardActionsLeft}>
          <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionBtn}>
            <Ionicons name="trash" size={24} color={COLORS.danger} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleEditPress(item)} style={styles.actionBtn}>
            <Ionicons name="pencil" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.cardActionsRight}>
          <TouchableOpacity onPress={() => viewFile(item.fileUrl, item.title)} style={styles.actionBtn}>
            <Ionicons name="eye-outline" size={24} color="#4F46E5" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.sectionTitle}>{editingId ? 'تعديل الورقة' : 'إضافة ورقة جديدة'}</Text>
        <TextInput
          style={styles.input}
          placeholder="اسم الورقة (مثال: طلب رخصة بناء)"
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="ملاحظات (اختياري)"
          value={notes}
          onChangeText={setNotes}
          multiline
        />
        
        <TouchableOpacity style={styles.pickBtn} onPress={handlePickFile}>
          <Ionicons name={selectedFileUri ? "checkmark-circle" : "document-attach"} size={24} color={COLORS.primary} />
          <Text style={styles.pickBtnText}>{selectedFileName ? selectedFileName : "اختيار ملف (PDF, صورة, مستند)"}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.submitBtn, (!title.trim() || !selectedFileUri || isUploading) && styles.submitBtnDisabled]} 
          onPress={handleAddPaper}
          disabled={!title.trim() || !selectedFileUri || isUploading}
        >
          {isUploading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>{editingId ? 'حفظ التعديلات' : 'إضافة وحفظ'}</Text>}
        </TouchableOpacity>

        {editingId && (
          <TouchableOpacity style={styles.cancelBtn} onPress={cancelEdit}>
            <Text style={styles.cancelBtnText}>إلغاء التعديل</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>الأوراق المضافة سابقاً</Text>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  formContainer: { padding: SPACING.lg, backgroundColor: COLORS.surface, ...SHADOWS.small, marginBottom: SPACING.md },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'right', marginBottom: 12 },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 14, fontSize: 16, textAlign: 'right', marginBottom: 12 },
  textArea: { height: 100 },
  pickBtn: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: '#F0FDF4', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#86EFAC', marginBottom: 16 },
  pickBtnText: { flex: 1, fontSize: 15, color: '#166534', marginRight: 12, textAlign: 'right' },
  submitBtn: { backgroundColor: COLORS.primary, padding: 16, borderRadius: 12, alignItems: 'center' },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },

  listContainer: { flex: 1, padding: SPACING.md },
  listContent: { paddingBottom: 40 },
  card: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: COLORS.surface, padding: 16, borderRadius: 12, marginBottom: 12, ...SHADOWS.small },
  iconContainer: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginLeft: 16 },
  textContainer: { flex: 1, alignItems: 'flex-end' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  date: { fontSize: 12, color: COLORS.textSecondary },
  notesText: { fontSize: 13, color: COLORS.textMuted, marginTop: 4, textAlign: 'right' },
  cardActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: COLORS.border },
  cardActionsLeft: { flexDirection: 'row-reverse' },
  cardActionsRight: { flexDirection: 'row-reverse' },
  actionBtn: { padding: 8, marginHorizontal: 4 },
  emptyText: { textAlign: 'center', marginTop: 20, color: COLORS.textSecondary, fontSize: 15 },
  cancelBtn: { marginTop: 12, padding: 12, alignItems: 'center' },
  cancelBtnText: { color: COLORS.danger, fontSize: 16, fontWeight: '700' },
});
