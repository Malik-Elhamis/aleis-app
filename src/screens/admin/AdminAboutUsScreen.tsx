import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Alert,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  Image
} from 'react-native';
import { COLORS, SPACING, SHADOWS } from '../../config/theme';
import { subscribeAboutUsSettings, updateAboutUsSettings } from '../../services/firestoreService';
import { uploadComplaintImages } from '../../services/storageService';
import { CustomButton } from '../../components/CustomButton';
import { CustomInput } from '../../components/CustomInput';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export const AdminAboutUsScreen: React.FC = () => {
  const [programmerName, setProgrammerName] = useState('');
  const [programmerImage, setProgrammerImage] = useState('');
  const [programmerText, setProgrammerText] = useState('');
  
  const [managementName, setManagementName] = useState('');
  const [managementImage, setManagementImage] = useState('');
  const [managementText, setManagementText] = useState('');
  
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeAboutUsSettings((data) => {
      setProgrammerName(data?.programmerName || '');
      setProgrammerImage(data?.programmerImage || '');
      setProgrammerText(data?.programmerText || '');
      setManagementName(data?.managementName || '');
      setManagementImage(data?.managementImage || '');
      setManagementText(data?.managementText || '');
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handlePickImage = async (type: 'programmer' | 'management') => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('تنبيه', 'التطبيق يحتاج إلى صلاحية الوصول للصور.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.5,
        allowsEditing: true,
        aspect: [1, 1],
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        if (type === 'programmer') setProgrammerImage(result.assets[0].uri);
        else setManagementImage(result.assets[0].uri);
      }
    } catch (e) {
      Alert.alert('خطأ', 'حدث مشكلة أثناء فتح الاستوديو');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let finalProgImage = programmerImage;
      if (programmerImage && !programmerImage.startsWith('http')) {
        const uploaded = await uploadComplaintImages([programmerImage], 'aboutus_' + Date.now());
        if (uploaded.length > 0) finalProgImage = uploaded[0];
      }

      let finalMgmtImage = managementImage;
      if (managementImage && !managementImage.startsWith('http')) {
        const uploaded = await uploadComplaintImages([managementImage], 'aboutus_' + Date.now());
        if (uploaded.length > 0) finalMgmtImage = uploaded[0];
      }

      await updateAboutUsSettings({
        programmerName: programmerName.trim(),
        programmerImage: finalProgImage.trim(),
        programmerText: programmerText.trim(),
        managementName: managementName.trim(),
        managementImage: finalMgmtImage.trim(),
        managementText: managementText.trim()
      });
      Alert.alert('نجاح', 'تم تحديث معلومات صفحة "من نحن" بنجاح!');
    } catch (error) {
      Alert.alert('خطأ', 'فشل حفظ التعديلات.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={styles.headerBox}>
          <Ionicons name="information-circle-outline" size={48} color={COLORS.primary} />
          <Text style={styles.headerTitle}>إدارة معلومات "من نحن"</Text>
          <Text style={styles.headerSub}>قم بتعديل النصوص التي تظهر للمستخدمين في قسم من نحن</Text>
        </View>

        <View style={[styles.card, SHADOWS.small]}>
          <View style={styles.cardHeader}>
            <Ionicons name="code-slash" size={24} color={COLORS.primary} />
            <Text style={styles.cardTitle}>قسم المطور والمبرمج</Text>
          </View>
          <CustomInput
            label="اسم المبرمج / جهة التطوير"
            placeholder="مثال: مالك الجهني"
            value={programmerName}
            onChangeText={setProgrammerName}
          />
          <Text style={styles.inputLabel}>صورة المبرمج</Text>
          <View style={styles.imageUploadContainer}>
            {programmerImage ? (
              <View style={styles.uploadedImageWrapper}>
                <Image source={{ uri: programmerImage }} style={styles.uploadedImage} />
                <TouchableOpacity style={styles.removeImageBtn} onPress={() => setProgrammerImage('')}>
                  <Ionicons name="close-circle" size={24} color={COLORS.danger} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.uploadBtn} onPress={() => handlePickImage('programmer')}>
                <Ionicons name="image-outline" size={32} color={COLORS.primary} />
                <Text style={styles.uploadBtnText}>اختر صورة المبرمج</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.inputLabel}>نبذة عن المبرمج أو التقنيات</Text>
          <View style={styles.textAreaContainer}>
            <TextInput
              style={styles.textArea}
              placeholder="اكتب معلومات المبرمج هنا..."
              value={programmerText}
              onChangeText={setProgrammerText}
              multiline
              textAlign="right"
            />
          </View>
        </View>

        <View style={[styles.card, SHADOWS.small]}>
          <View style={styles.cardHeader}>
            <Ionicons name="settings" size={24} color={COLORS.primary} />
            <Text style={styles.cardTitle}>قسم إدارة التطبيق</Text>
          </View>
          <CustomInput
            label="اسم الإدارة"
            placeholder="مثال: بلدية العيس"
            value={managementName}
            onChangeText={setManagementName}
          />
          <Text style={styles.inputLabel}>صورة الإدارة أو الشعار</Text>
          <View style={styles.imageUploadContainer}>
            {managementImage ? (
              <View style={styles.uploadedImageWrapper}>
                <Image source={{ uri: managementImage }} style={styles.uploadedImage} />
                <TouchableOpacity style={styles.removeImageBtn} onPress={() => setManagementImage('')}>
                  <Ionicons name="close-circle" size={24} color={COLORS.danger} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.uploadBtn} onPress={() => handlePickImage('management')}>
                <Ionicons name="image-outline" size={32} color={COLORS.primary} />
                <Text style={styles.uploadBtnText}>اختر صورة الإدارة</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.inputLabel}>معلومات إدارة التطبيق والهدف منه</Text>
          <View style={styles.textAreaContainer}>
            <TextInput
              style={styles.textArea}
              placeholder="اكتب معلومات الإدارة هنا..."
              value={managementText}
              onChangeText={setManagementText}
              multiline
              textAlign="right"
            />
          </View>
        </View>

        <CustomButton
          title={saving ? "جاري الحفظ..." : "حفظ التعديلات"}
          onPress={handleSave}
          variant="primary"
          disabled={saving}
          style={{ marginTop: 24, marginBottom: 40 }}
        />

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg },
  
  headerBox: { alignItems: 'center', marginBottom: 24 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary, marginTop: 12 },
  headerSub: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginTop: 8 },

  card: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 20, marginBottom: 16 },
  cardHeader: { flexDirection: 'row-reverse', alignItems: 'center', marginBottom: 16, gap: 8 },
  cardTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'right' },
  
  imageUploadContainer: { marginBottom: 16 },
  uploadBtn: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed', borderRadius: 12, padding: 20, alignItems: 'center', gap: 8 },
  uploadBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },
  uploadedImageWrapper: { position: 'relative', alignSelf: 'center', marginVertical: 8 },
  uploadedImage: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: COLORS.primaryLight },
  removeImageBtn: { position: 'absolute', top: -5, left: -5, backgroundColor: '#FFF', borderRadius: 12, padding: 2 },

  inputLabel: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'right', marginBottom: 8, marginTop: 8, fontWeight: '600' },
  textAreaContainer: { backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, padding: 12, marginBottom: 8 },
  textArea: { height: 100, fontSize: 14, color: COLORS.textPrimary, textAlignVertical: 'top' }
});
