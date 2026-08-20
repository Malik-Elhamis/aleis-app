import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS } from '../../config/theme';
import { NewsArticle } from '../../types';
import { subscribeNews, deleteNewsArticle, updateNewsSettings } from '../../services/firestoreService';
import { uploadComplaintImages } from '../../services/storageService';
import * as ImagePicker from 'expo-image-picker';
import { Alert, ActivityIndicator } from 'react-native';

export const AdminNewsScreen: React.FC<any> = ({ navigation }) => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [updatingCover, setUpdatingCover] = useState(false);
  const [selectedCoverUri, setSelectedCoverUri] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeNews((items) => {
      setNews(items);
    });
    return () => unsub();
  }, []);

  const handleDelete = (id: string) => {
    Alert.alert('تأكيد החذف', 'هل أنت متأكد أنك تريد حذف هذا الخبر نهائياً؟', [
      { text: 'إلغاء', style: 'cancel' },
      { 
        text: 'حذف', 
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteNewsArticle(id);
          } catch (e) {
            Alert.alert('خطأ', 'لم يتم الحذف.');
          }
        }
      }
    ]);
  };

  const handleUpdateCover = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('تنبيه', 'التطبيق يحتاج إلى صلاحية الوصول للصور.');
      return;
    }
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.7,
    });
    if (!pickerResult.canceled && pickerResult.assets?.length > 0) {
      setSelectedCoverUri(pickerResult.assets[0].uri);
    }
  };

  const confirmCoverUpdate = async () => {
    if (!selectedCoverUri) return;
    setUpdatingCover(true);
    try {
      const uploaded = await uploadComplaintImages([selectedCoverUri], 'news_cover_' + Date.now());
      if (uploaded.length > 0) {
        await updateNewsSettings({ coverImage: uploaded[0] });
        Alert.alert('نجاح', 'تم تغيير غلاف الأخبار بنجاح!');
        setSelectedCoverUri(null);
      }
    } catch (err) {
      Alert.alert('خطأ', 'فشل تحديث الغلاف');
    } finally {
      setUpdatingCover(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Button for changing cover */}
      {selectedCoverUri ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: selectedCoverUri }} style={styles.previewImage} />
          {updatingCover ? (
            <View style={styles.previewActions}>
              <ActivityIndicator color={COLORS.primary} size="large" />
              <Text style={styles.confirmText}>جاري الرفع...</Text>
            </View>
          ) : (
            <View style={styles.previewActions}>
              <TouchableOpacity style={styles.confirmBtn} onPress={confirmCoverUpdate}>
                <Ionicons name="checkmark-circle" size={32} color={COLORS.success} />
                <Text style={styles.confirmText}>تأكيد الإضافة</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setSelectedCoverUri(null)}>
                <Ionicons name="close-circle" size={32} color={COLORS.danger} />
                <Text style={styles.cancelText}>إلغاء</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        <View style={{ padding: SPACING.md, backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: COLORS.border }}>
          <TouchableOpacity style={styles.coverBtn} onPress={handleUpdateCover} disabled={updatingCover}>
            <Ionicons name="image-outline" size={20} color={COLORS.primary} />
            <Text style={styles.coverBtnText}>تغيير غلاف صفحة الأخبار</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={news}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listPadding}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="newspaper-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>لا توجد أخبار مضافة حالياً</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.card, SHADOWS.small]}
            onPress={() => navigation.navigate('AdminNewsForm', { newsId: item.id, newsItem: item })}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <View style={styles.categoryTag}>
                <Text style={styles.categoryTagText}>{item.category === 'أخرى' && item.customCategory ? item.customCategory : item.category}</Text>
              </View>
              <Text style={styles.dateText}>{item.date}</Text>
            </View>
            
            <View style={styles.cardBody}>
              <Image source={{ uri: item.images?.[0] || 'https://via.placeholder.com/150' }} style={styles.newsImage} />
              <View style={styles.newsTextContainer}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>{item.content}</Text>
              </View>
            </View>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('AdminNewsForm', { newsId: item.id, newsItem: item })}>
                <Ionicons name="create-outline" size={20} color={COLORS.primary} />
                <Text style={styles.editBtnText}>تعديل</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(item.id)}>
                <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
                <Text style={styles.deleteBtnText}>حذف</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />
      
      <TouchableOpacity 
        style={[styles.fab, SHADOWS.medium]}
        onPress={() => navigation.navigate('AdminNewsForm')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={32} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  listPadding: { padding: SPACING.md, paddingBottom: 100 },
  card: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, marginBottom: 12, borderRightWidth: 4, borderRightColor: COLORS.primary },
  cardHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  dateText: { fontSize: 12, color: COLORS.textMuted, fontWeight: '600' },
  categoryTag: { backgroundColor: COLORS.primaryLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  categoryTagText: { fontSize: 11, fontWeight: '700', color: COLORS.primaryDark },
  
  cardBody: { flexDirection: 'row-reverse', alignItems: 'center' },
  newsImage: { width: 70, height: 70, borderRadius: 8, marginLeft: 12 },
  newsTextContainer: { flex: 1 },
  
  cardTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'right', marginBottom: 4 },
  cardDesc: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'right', lineHeight: 18 },
  
  actionButtons: { flexDirection: 'row-reverse', justifyContent: 'flex-end', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border, gap: 16 },
  iconBtn: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4 },
  editBtnText: { fontSize: 12, color: COLORS.primary, fontWeight: '700' },
  deleteBtnText: { fontSize: 12, color: COLORS.danger, fontWeight: '700' },

  emptyContainer: { paddingVertical: 80, alignItems: 'center', justifyContent: 'center' },
  emptyText: { marginTop: 16, fontSize: 16, color: COLORS.textMuted, fontWeight: '600' },
  
  fab: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverBtn: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primaryLight, padding: 12, borderRadius: 12, gap: 8 },
  coverBtnText: { color: COLORS.primaryDark, fontWeight: '700', fontSize: 15 },
  
  previewContainer: { padding: SPACING.md, backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  previewImage: { width: '100%', height: 180, borderRadius: 12, resizeMode: 'cover', marginBottom: 12 },
  previewActions: { flexDirection: 'row-reverse', gap: 20, justifyContent: 'center', alignItems: 'center' },
  confirmBtn: { alignItems: 'center' },
  cancelBtn: { alignItems: 'center' },
  confirmText: { fontSize: 12, fontWeight: '700', color: COLORS.success, marginTop: 4 },
  cancelText: { fontSize: 12, fontWeight: '700', color: COLORS.danger, marginTop: 4 }
});
