import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING, SHADOWS } from '../../config/theme';
import { subscribeEmergencyContacts, addEmergencyContact, updateEmergencyContact, deleteEmergencyContact } from '../../services/firestoreService';
import { uploadComplaintImages } from '../../services/storageService';
import { EmergencyContact } from '../../types';

export const AdminEmergencyScreen: React.FC = () => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [icon, setIcon] = useState('call-outline'); // keeping for fallback
  const [badgeColor, setBadgeColor] = useState(COLORS.primary);
  const [image, setImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeEmergencyContacts((data) => {
      setContacts(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const resetForm = () => {
    setIsEditing(false);
    setCurrentId(null);
    setTitle('');
    setSubtitle('');
    setPhoneNumber('');
    setIcon('call-outline');
    setBadgeColor(COLORS.primary);
    setImage(null);
  };

  const handleEdit = (contact: EmergencyContact) => {
    setIsEditing(true);
    setCurrentId(contact.id!);
    setTitle(contact.title);
    setSubtitle(contact.subtitle);
    setPhoneNumber(contact.phoneNumber);
    setIcon(contact.icon);
    setBadgeColor(contact.badgeColor);
    setImage(contact.image || null);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('تأكيد الحذف', 'هل أنت متأكد من حذف رقم الطوارئ هذا؟', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: async () => {
        try {
          await deleteEmergencyContact(id);
          Alert.alert('نجاح', 'تم الحذف بنجاح');
        } catch (error) {
          Alert.alert('خطأ', 'فشل الحذف');
        }
      }}
    ]);
  };

  const handleSave = async () => {
    if (!title.trim() || !phoneNumber.trim()) {
      Alert.alert('خطأ', 'الرجاء إدخال الاسم ورقم الهاتف');
      return;
    }

    setSaving(true);
    try {
      let finalImageUrl = image;
      // If image is a local URI, upload it
      if (image && !image.startsWith('http') && !image.startsWith('data:')) {
        const uploadedUrls = await uploadComplaintImages([image], 'emergency_' + Date.now());
        if (uploadedUrls.length > 0) {
          finalImageUrl = uploadedUrls[0];
        }
      }

      const contactData: any = {
        title: title.trim(),
        subtitle: subtitle.trim(),
        phoneNumber: phoneNumber.trim(),
        icon,
        badgeColor,
        image: finalImageUrl || null,
      };

      if (currentId && !currentId.startsWith('em_')) {
        await updateEmergencyContact(currentId, contactData);
        Alert.alert('نجاح', 'تم التحديث بنجاح');
      } else {
        await addEmergencyContact(contactData);
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
        <Text style={styles.headerTitle}>{isEditing ? 'تعديل جهة طوارئ' : 'إضافة جهة طوارئ'}</Text>
        
        <Text style={styles.label}>شعار الجهة (اختياري)</Text>
        <View style={styles.imageUploadRow}>
          <TouchableOpacity style={styles.addImageBtn} onPress={pickImage}>
            {image ? (
              <Image source={{ uri: image }} style={styles.imagePreview} />
            ) : (
              <Ionicons name="image-outline" size={32} color={COLORS.primary} />
            )}
          </TouchableOpacity>
          <View style={styles.imageUploadInfo}>
            <Text style={styles.imageUploadText}>
              {image ? 'اضغط لتغيير الشعار' : 'اضغط لإضافة شعار (Logo) لهذه الجهة'}
            </Text>
            {image && (
              <TouchableOpacity onPress={() => setImage(null)}>
                <Text style={styles.removeImageText}>إزالة الشعار</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Text style={styles.label}>الجهة / الاسم</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="مثال: الدفاع المدني"
          textAlign="right"
        />

        <Text style={styles.label}>الوصف (اختياري)</Text>
        <TextInput
          style={styles.input}
          value={subtitle}
          onChangeText={setSubtitle}
          placeholder="مثال: طوارئ الحرائق والإنقاذ"
          textAlign="right"
        />

        <Text style={styles.label}>رقم الهاتف</Text>
        <TextInput
          style={styles.input}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="مثال: 125"
          keyboardType="phone-pad"
          textAlign="right"
        />

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
        <Text style={styles.listTitle}>جهات الطوارئ الحالية</Text>
      </View>

      {contacts.map((item) => (
        <View key={item.id} style={styles.itemCard}>
          {item.image ? (
            <View style={styles.logoWrapper}>
              <Image source={{ uri: item.image }} style={styles.logoImage} />
            </View>
          ) : (
            <View style={[styles.badgeIcon, { backgroundColor: item.badgeColor }]}>
              <Ionicons name={item.icon as any} size={28} color="#FFFFFF" />
            </View>
          )}
          
          <View style={styles.itemContent}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemDesc} numberOfLines={1}>{item.phoneNumber}</Text>
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
  imageUploadRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  addImageBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageUploadInfo: {
    marginRight: SPACING.md,
    alignItems: 'flex-end',
  },
  imageUploadText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  removeImageText: {
    fontSize: 14,
    color: COLORS.danger,
    fontWeight: 'bold',
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
    alignItems: 'center',
    padding: SPACING.sm,
  },
  badgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  logoWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    marginLeft: 12,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  logoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  itemContent: {
    flex: 1,
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'right',
  },
  itemDesc: {
    fontSize: 14,
    color: COLORS.primary,
    textAlign: 'right',
    fontWeight: '700',
    marginTop: 4,
  },
  itemActions: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    padding: 4,
  }
});
