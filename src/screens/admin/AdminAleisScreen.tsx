import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS } from '../../config/theme';
import { subscribeAleisArticles, addAleisArticle, updateAleisArticle, deleteAleisArticle } from '../../services/firestoreService';
import { uploadComplaintImages } from '../../services/storageService';
import * as ImagePicker from 'expo-image-picker';
import { AleisArticle } from '../../types';

export const AdminAleisScreen: React.FC = () => {
  const [articles, setArticles] = useState<AleisArticle[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeAleisArticles((data) => {
      setArticles(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      allowsEditing: false,
      quality: 0.3,
    });

    if (!result.canceled && result.assets) {
      const newUris = result.assets.map(a => a.uri);
      setImages(prev => [...prev, ...newUris]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentId(null);
    setTitle('');
    setDescription('');
    setImages([]);
  };

  const handleEdit = (article: AleisArticle) => {
    setIsEditing(true);
    setCurrentId(article.id!);
    setTitle(article.title);
    setDescription(article.description);
    setImages(article.images || []);
  };

  const handleDelete = (id: string) => {
    Alert.alert('تأكيد الحذف', 'هل أنت متأكد من حذف هذا القسم؟', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: async () => {
        try {
          await deleteAleisArticle(id);
          Alert.alert('نجاح', 'تم الحذف بنجاح');
        } catch (error) {
          Alert.alert('خطأ', 'فشل الحذف');
        }
      }}
    ]);
  };

  const handleSave = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('خطأ', 'الرجاء إدخال العنوان والتفاصيل');
      return;
    }

    setSaving(true);
    try {
      const localImages = images.filter(img => !img.startsWith('http') && !img.startsWith('data:'));
      const existingImages = images.filter(img => img.startsWith('http') || img.startsWith('data:'));

      let uploadedUrls: string[] = [];
      if (localImages.length > 0) {
        uploadedUrls = await uploadComplaintImages(localImages, 'aleis_' + Date.now());
      }

      const allImages = [...existingImages, ...uploadedUrls];

      if (currentId) {
        await updateAleisArticle(currentId, {
          title: title.trim(),
          description: description.trim(),
          images: allImages,
        });
        Alert.alert('نجاح', 'تم تحديث القسم بنجاح');
      } else {
        await addAleisArticle({
          title: title.trim(),
          description: description.trim(),
          images: allImages,
        });
        Alert.alert('نجاح', 'تمت الإضافة بنجاح');
      }
      resetForm();
    } catch (error) {
      console.error(error);
      Alert.alert('خطأ', 'حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1 }} />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 100 }}>
      <View style={styles.formContainer}>
        <Text style={styles.headerTitle}>{isEditing ? 'تعديل قسم' : 'إضافة قسم جديد'}</Text>
        
        <Text style={styles.label}>العنوان</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="مثال: نبع العيس القديم"
          textAlign="right"
        />

        <Text style={styles.label}>التفاصيل</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="التفاصيل والمعلومات..."
          multiline
          numberOfLines={4}
          textAlign="right"
          textAlignVertical="top"
        />

        <Text style={styles.label}>الصور</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imagesContainer} style={{ marginBottom: SPACING.lg }}>
          <TouchableOpacity style={styles.addImageBtn} onPress={pickImage}>
            <Ionicons name="camera" size={32} color={COLORS.primary} />
            <Text style={styles.addImageText}>إضافة</Text>
          </TouchableOpacity>
          {images.map((uri, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image source={{ uri }} style={styles.imagePreview} />
              <TouchableOpacity style={styles.removeImageBtn} onPress={() => removeImage(index)}>
                <Ionicons name="close-circle" size={24} color={COLORS.danger} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={[styles.saveBtn, saving && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>حفظ</Text>}
          </TouchableOpacity>

          {isEditing && (
            <TouchableOpacity style={styles.cancelBtn} onPress={resetForm} disabled={saving}>
              <Text style={styles.cancelBtnText}>إلغاء</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.divider} />
        <Text style={styles.listTitle}>الأقسام الحالية</Text>
      </View>

      {articles.map((item) => (
        <View key={item.id} style={styles.itemCard}>
          {item.images && item.images.length > 0 && (
             <Image source={{ uri: item.images[0] }} style={styles.itemImage} />
          )}
          <View style={styles.itemContent}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemDesc} numberOfLines={2}>{item.description}</Text>
          </View>
          <View style={styles.itemActions}>
            <TouchableOpacity onPress={() => handleEdit(item)} style={styles.iconBtn}>
              <Ionicons name="create" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item.id!)} style={styles.iconBtn}>
              <Ionicons name="trash" size={24} color={COLORS.danger} />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  formContainer: {
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'right',
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  textArea: {
    height: 100,
  },
  imagesContainer: {
    flexDirection: 'row',
  },
  addImageBtn: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  addImageText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
  imageWrapper: {
    width: 80,
    height: 80,
    marginLeft: SPACING.sm,
    borderRadius: 8,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  actionRow: {
    flexDirection: 'row-reverse',
    gap: SPACING.md,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: COLORS.textMuted,
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.xl,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'right',
    marginBottom: SPACING.md,
  },
  itemCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    ...SHADOWS.small,
    flexDirection: 'row-reverse',
  },
  itemImage: {
    width: 80,
    height: 80,
  },
  itemContent: {
    flex: 1,
    padding: SPACING.sm,
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'right',
  },
  itemDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
  itemActions: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.sm,
    gap: 12,
  },
  iconBtn: {
    padding: 4,
  }
});
