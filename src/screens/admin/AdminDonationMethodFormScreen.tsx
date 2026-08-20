import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING } from '../../config/theme';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { addDonationMethod, updateDonationMethod } from '../../services/firestoreService';
import { uploadComplaintImages } from '../../services/storageService'; // We can reuse this for images
import { DonationMethod } from '../../types';

export const AdminDonationMethodFormScreen: React.FC<any> = ({ route, navigation }) => {
  const { method } = route.params || {};
  const isEditing = !!method;

  const [title, setTitle] = useState(method?.title || '');
  const [description, setDescription] = useState(method?.description || '');
  const [bankAccountDetails, setBankAccountDetails] = useState(method?.bankAccountDetails || '');
  const [phoneNumber, setPhoneNumber] = useState(method?.phoneNumber || '');
  const [contactPerson, setContactPerson] = useState(method?.contactPerson || '');
  const [images, setImages] = useState<string[]>(method?.images || []);
  const [submitting, setSubmitting] = useState(false);

  const handlePickImages = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('تنبيه', 'التطبيق يحتاج إلى صلاحية الوصول للصور.');
      return;
    }
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
    });
    if (!pickerResult.canceled && pickerResult.assets?.length > 0) {
      const uris = pickerResult.assets.map(asset => asset.uri);
      setImages(prev => [...prev, ...uris]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال عنوان طريقة التبرع على الأقل.');
      return;
    }

    setSubmitting(true);
    try {
      // Find new images (local URIs) vs existing ones (http URLs)
      const existingImages = images.filter(uri => uri.startsWith('http'));
      const newImages = images.filter(uri => !uri.startsWith('http'));
      
      let uploadedUrls: string[] = [];
      if (newImages.length > 0) {
        uploadedUrls = await uploadComplaintImages(newImages, 'donation_method_' + Date.now());
      }
      
      const allImages = [...existingImages, ...uploadedUrls];

      const data: Partial<DonationMethod> = {
        title: title.trim(),
        description: description.trim(),
        bankAccountDetails: bankAccountDetails.trim(),
        phoneNumber: phoneNumber.trim(),
        contactPerson: contactPerson.trim(),
        images: allImages.length > 0 ? allImages : undefined,
      };

      if (isEditing) {
        await updateDonationMethod(method.id, data);
        Alert.alert('نجاح', 'تم تحديث طريقة التبرع بنجاح.');
      } else {
        await addDonationMethod(data as Omit<DonationMethod, 'id' | 'createdAt'>);
        Alert.alert('نجاح', 'تمت إضافة طريقة التبرع بنجاح.');
      }
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('خطأ', 'حدث خطأ أثناء حفظ البيانات.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerText}>{isEditing ? 'تعديل طريقة التبرع' : 'إضافة طريقة تبرع جديدة'}</Text>
      
      <CustomInput
        label="عنوان طريقة التبرع *"
        placeholder="مثال: التبرع عن طريق البنك، شام كاش..."
        value={title}
        onChangeText={setTitle}
      />
      <CustomInput
        label="تفاصيل إضافية (اختياري)"
        placeholder="اكتب شرحاً إضافياً حول طريقة التبرع..."
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <CustomInput
        label="رقم الحساب البنكي / الآيبان (اختياري)"
        placeholder="مثال: TR00 0000..."
        value={bankAccountDetails}
        onChangeText={setBankAccountDetails}
      />
      <CustomInput
        label="رقم الهاتف (اختياري)"
        placeholder="مثال: +90 555 555 5555"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
      />
      <CustomInput
        label="اسم الشخص المسؤول للتواصل (اختياري)"
        placeholder="اسم الشخص..."
        value={contactPerson}
        onChangeText={setContactPerson}
      />

      <Text style={styles.sectionLabel}>إرفاق صور (يمكنك إرفاق أكثر من صورة - اختياري)</Text>
      <TouchableOpacity style={styles.imagePickerBtn} onPress={handlePickImages}>
        <Ionicons name="images-outline" size={24} color={COLORS.primary} />
        <Text style={styles.imagePickerText}>اضغط هنا لاختيار الصور</Text>
      </TouchableOpacity>

      {images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesScroll}>
          {images.map((uri, idx) => (
            <View key={idx} style={styles.imageWrapper}>
              <Image source={{ uri }} style={styles.previewImage} resizeMode="cover" />
              <TouchableOpacity style={styles.removeImageBtn} onPress={() => removeImage(idx)}>
                <Ionicons name="close-circle" size={24} color={COLORS.danger} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      <CustomButton
        title={submitting ? "جاري الحفظ..." : "حفظ التغييرات"}
        onPress={handleSubmit}
        variant="primary"
        style={{ marginTop: 24 }}
        disabled={submitting}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg, paddingBottom: 60 },
  headerText: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'center', marginBottom: 24 },
  
  sectionLabel: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'right', marginTop: 16, marginBottom: 12 },
  imagePickerBtn: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1F5F9', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed' },
  imagePickerText: { fontSize: 15, fontWeight: '700', color: COLORS.primary, marginRight: 8 },
  imagesScroll: { flexDirection: 'row-reverse', marginTop: 16 },
  imageWrapper: { position: 'relative', marginLeft: 12 },
  previewImage: { width: 100, height: 100, borderRadius: 12 },
  removeImageBtn: { position: 'absolute', top: -8, right: -8, backgroundColor: '#FFF', borderRadius: 12 }
});
