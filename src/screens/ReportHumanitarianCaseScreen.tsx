import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING } from '../config/theme';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { addHumanitarianReport } from '../services/firestoreService';
import { uploadComplaintImages } from '../services/storageService';

export const ReportHumanitarianCaseScreen: React.FC<any> = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [needs, setNeeds] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [images, setImages] = useState<string[]>([]);
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
    if (!title.trim() || !description.trim() || !needs.trim()) {
      Alert.alert('تنبيه', 'يرجى تعبئة جميع الحقول المطلوبة.');
      return;
    }

    setSubmitting(true);
    try {
      let uploadedUrls: string[] = [];
      if (images.length > 0) {
        uploadedUrls = await uploadComplaintImages(images, 'humanitarian_report_' + Date.now());
      }

      await addHumanitarianReport({
        title: title.trim(),
        description: description.trim(),
        needs: needs.trim(),
        reporterName: reporterName.trim(),
        contactInfo: contactInfo.trim(),
        images: uploadedUrls
      });

      Alert.alert('شكراً لك', 'تم إرسال البلاغ بنجاح، سيقوم الفريق المختص بمراجعته قريباً.', [
        { text: 'حسناً', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('خطأ', 'حدث خطأ أثناء إرسال البلاغ.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Ionicons name="information-circle" size={48} color={COLORS.primary} style={{marginBottom: 12}} />
        <Text style={styles.title}>الإبلاغ عن حالة إنسانية</Text>
        <Text style={styles.subtitle}>إذا كنت تعرف عائلة محتاجة أو حالة طارئة، يرجى تزويدنا بالتفاصيل ليتم التحقق منها ومساعدتها.</Text>
      </View>

      <CustomInput
        label="عنوان الحالة (مثال: عائلة أيتام بلا مأوى) *"
        placeholder="اكتب عنواناً يصف الحالة..."
        value={title}
        onChangeText={setTitle}
      />

      <CustomInput
        label="اسم المُبلِّغ (اختياري)"
        placeholder="الاسم لتسهيل التواصل..."
        value={reporterName}
        onChangeText={setReporterName}
      />

      <CustomInput
        label="رقم هاتف الحالة أو كيفية التواصل معها (اختياري)"
        placeholder="مثال: رقم هاتف، عنوان مفصل، حساب فيسبوك..."
        value={contactInfo}
        onChangeText={setContactInfo}
      />

      <CustomInput
        label="تفاصيل الحالة *"
        placeholder="اكتب تفاصيل الحالة، وأين تتواجد، وكيف يمكن الوصول إليها..."
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <CustomInput
        label="ماذا تحتاج الحالة؟ *"
        placeholder="مثال: مواد غذائية، مبلغ مالي لعملية جراحية، ألبسة..."
        value={needs}
        onChangeText={setNeeds}
        multiline
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
        title={submitting ? "جاري الإرسال..." : "إرسال البلاغ"}
        onPress={handleSubmit}
        variant="primary"
        style={{ marginTop: 20 }}
        disabled={submitting}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg, paddingBottom: 60 },
  
  header: { alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
  
  sectionLabel: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'right', marginTop: 16, marginBottom: 12 },
  
  imagePickerBtn: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1F5F9', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed' },
  imagePickerText: { fontSize: 15, fontWeight: '700', color: COLORS.primary, marginRight: 8 },
  
  imagesScroll: { flexDirection: 'row-reverse', marginTop: 16 },
  imageWrapper: { position: 'relative', marginLeft: 12 },
  previewImage: { width: 100, height: 100, borderRadius: 12 },
  removeImageBtn: { position: 'absolute', top: -8, right: -8, backgroundColor: '#FFF', borderRadius: 12 }
});
