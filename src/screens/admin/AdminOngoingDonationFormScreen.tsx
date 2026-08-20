import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING } from '../../config/theme';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { addOngoingDonation, updateOngoingDonation } from '../../services/firestoreService';
import { uploadComplaintImages } from '../../services/storageService';
import { OngoingDonation } from '../../types';

export const AdminOngoingDonationFormScreen: React.FC<any> = ({ route, navigation }) => {
  const { donation } = route.params || {};
  const isEditing = !!donation;

  const [title, setTitle] = useState(donation?.title || '');
  const [description, setDescription] = useState(donation?.description || '');
  
  const [targetUSD, setTargetUSD] = useState(donation?.targetUSD || '');
  const [targetTRY, setTargetTRY] = useState(donation?.targetTRY || '');
  const [targetSYP, setTargetSYP] = useState(donation?.targetSYP || '');

  const [collectedUSD, setCollectedUSD] = useState(donation?.collectedUSD || '');
  const [collectedTRY, setCollectedTRY] = useState(donation?.collectedTRY || '');
  const [collectedSYP, setCollectedSYP] = useState(donation?.collectedSYP || '');
  
  const [displayCurrencies, setDisplayCurrencies] = useState<('USD' | 'TRY' | 'SYP')[]>(donation?.displayCurrencies || ['USD']);
  
  const [status, setStatus] = useState<'active' | 'completed'>(donation?.status || 'active');
  const [completedMessage, setCompletedMessage] = useState(donation?.completedMessage || 'جزاكم الله خيراً وتقبل منكم، وجعل ما قدمتموه في ميزان حسناتكم. شكراً لكل من ساهم في تفريج كربة هذه الحالة.');
  const [completedNote, setCompletedNote] = useState(donation?.completedNote || '');
  const [completedImage, setCompletedImage] = useState<string | null>(donation?.completedImage || null);

  const [images, setImages] = useState<string[]>(donation?.images || []);
  const [submitting, setSubmitting] = useState(false);

  const toggleDisplayCurrency = (cur: 'USD' | 'TRY' | 'SYP') => {
    setDisplayCurrencies(prev => {
      if (prev.includes(cur)) {
        return prev.filter(c => c !== cur);
      } else {
        return [...prev, cur];
      }
    });
  };

  const handlePickCompletedImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('تنبيه', 'التطبيق يحتاج إلى صلاحية الوصول للصور.');
      return;
    }
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 0.7,
    });
    if (!pickerResult.canceled && pickerResult.assets?.length > 0) {
      setCompletedImage(pickerResult.assets[0].uri);
    }
  };

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
    if (!title.trim() || !description.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال العنوان والتفاصيل.');
      return;
    }

    if (status === 'completed' && !completedMessage.trim()) {
      Alert.alert('خطأ', 'يرجى كتابة رسالة الشكر.');
      return;
    }

    setSubmitting(true);
    try {
      const existingImages = images.filter(uri => uri.startsWith('http'));
      const newImages = images.filter(uri => !uri.startsWith('http'));
      
      let uploadedUrls: string[] = [];
      if (newImages.length > 0) {
        uploadedUrls = await uploadComplaintImages(newImages, 'ongoing_donation_' + Date.now());
      }
      
      const allImages = [...existingImages, ...uploadedUrls];

      let uploadedCompletedUrl = completedImage;
      if (status === 'completed' && completedImage && !completedImage.startsWith('http')) {
        const urlArray = await uploadComplaintImages([completedImage], 'ongoing_donation_completed_' + Date.now());
        if (urlArray.length > 0) {
          uploadedCompletedUrl = urlArray[0];
        }
      }

      const data: Partial<OngoingDonation> = {
        title: title.trim(),
        description: description.trim(),
        targetUSD: targetUSD ? targetUSD : undefined,
        targetTRY: targetTRY ? targetTRY : undefined,
        targetSYP: targetSYP ? targetSYP : undefined,
        collectedUSD: collectedUSD ? collectedUSD : undefined,
        collectedTRY: collectedTRY ? collectedTRY : undefined,
        collectedSYP: collectedSYP ? collectedSYP : undefined,
        displayCurrencies: displayCurrencies.length > 0 ? displayCurrencies : ['USD'],
        images: allImages.length > 0 ? allImages : undefined,
        status,
        completedMessage: status === 'completed' ? completedMessage.trim() : undefined,
        completedNote: status === 'completed' && completedNote.trim() ? completedNote.trim() : undefined,
        completedImage: status === 'completed' && uploadedCompletedUrl ? uploadedCompletedUrl : undefined,
      };

      // Firestore doesn't accept undefined values, so we must clean the object
      Object.keys(data).forEach(key => data[key as keyof typeof data] === undefined && delete data[key as keyof typeof data]);

      if (isEditing) {
        await updateOngoingDonation(donation.id, data);
        Alert.alert('نجاح', 'تم تحديث التبرع الجاري بنجاح.');
      } else {
        await addOngoingDonation(data as Omit<OngoingDonation, 'id' | 'createdAt'>);
        Alert.alert('نجاح', 'تمت إضافة التبرع الجاري بنجاح.');
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
      <Text style={styles.headerText}>{isEditing ? 'تعديل التبرع الجاري' : 'إضافة تبرع جاري جديد'}</Text>
      
      <CustomInput
        label="عنوان التبرع الجاري *"
        placeholder="مثال: كفالة يتيم، حفر بئر..."
        value={title}
        onChangeText={setTitle}
      />
      
      <CustomInput
        label="تفاصيل وشرح عن الحالة *"
        placeholder="اكتب التفاصيل الكاملة هنا..."
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Text style={styles.sectionLabel}>حالة التبرع</Text>
      <View style={styles.statusRow}>
        <TouchableOpacity 
          style={[styles.statusBtn, status === 'active' && styles.statusBtnActive]} 
          onPress={() => setStatus('active')}
        >
          <Text style={[styles.statusBtnText, status === 'active' && styles.statusBtnTextActive]}>نشط (قيد الجمع)</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.statusBtn, status === 'completed' && styles.statusBtnActive]} 
          onPress={() => setStatus('completed')}
        >
          <Text style={[styles.statusBtnText, status === 'completed' && styles.statusBtnTextActive]}>مكتمل (تم الجمع)</Text>
        </TouchableOpacity>
      </View>

      {status === 'active' && (
        <>
          <Text style={styles.sectionLabel}>المبالغ المطلوبة (الأهداف - اختياري)</Text>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <CustomInput label="بالدولار ($)" placeholder="مثال: 5000" value={targetUSD} onChangeText={setTargetUSD} keyboardType="numeric" />
            </View>
            <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 12 }}>
              <Text style={{ fontWeight: '900', color: COLORS.textMuted }}>أو</Text>
            </View>
            <View style={{ flex: 1 }}>
              <CustomInput label="بالتركي (₺)" placeholder="مثال: 20000" value={targetTRY} onChangeText={setTargetTRY} keyboardType="numeric" />
            </View>
            <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 12 }}>
              <Text style={{ fontWeight: '900', color: COLORS.textMuted }}>أو</Text>
            </View>
            <View style={{ flex: 1 }}>
              <CustomInput label="بالسوري (ل.س)" placeholder="مثال: 100000" value={targetSYP} onChangeText={setTargetSYP} keyboardType="numeric" />
            </View>
          </View>
        </>
      )}

      {status === 'completed' && (
        <>
          <CustomInput
            label="رسالة الشكر (تظهر للمستخدمين عند اكتمال الحالة)"
            placeholder="جزاكم الله خيراً..."
            value={completedMessage}
            onChangeText={setCompletedMessage}
            multiline
          />
        </>
      )}

      <Text style={styles.sectionLabel}>{status === 'completed' ? 'المبالغ التي تم جمعها' : 'المبالغ التي تم جمعها حتى الآن'}</Text>
      
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <CustomInput label="بالدولار ($)" placeholder="مثال: 500" value={collectedUSD} onChangeText={setCollectedUSD} keyboardType="numeric" />
        </View>
        <View style={{ flex: 1 }}>
          <CustomInput label="بالتركي (₺)" placeholder="مثال: 1500" value={collectedTRY} onChangeText={setCollectedTRY} keyboardType="numeric" />
        </View>
        <View style={{ flex: 1 }}>
          <CustomInput label="بالسوري (ل.س)" placeholder="مثال: 50000" value={collectedSYP} onChangeText={setCollectedSYP} keyboardType="numeric" />
        </View>
      </View>

      {status === 'completed' && (
        <>
          <Text style={styles.sectionLabel}>العملات المراد عرضها للمستخدم</Text>
          <View style={styles.currencyContainer}>
            {(['USD', 'TRY', 'SYP'] as const).map(cur => {
              const isActive = displayCurrencies.includes(cur);
              return (
                <TouchableOpacity 
                  key={cur}
                  style={[styles.currencyBtn, isActive && styles.currencyBtnActive]}
                  onPress={() => toggleDisplayCurrency(cur)}
                >
                  <Text style={[styles.currencyText, isActive && styles.currencyTextActive]}>
                    {cur === 'USD' ? 'دولار ($)' : cur === 'TRY' ? 'ليرة تركية (₺)' : 'ليرة سورية (ل.س)'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <CustomInput
            label="ملاحظة (اختياري)"
            placeholder="أضف ملاحظة إضافية عن إغلاق الحالة..."
            value={completedNote}
            onChangeText={setCompletedNote}
            multiline
          />

          <Text style={styles.sectionLabel}>إرفاق صورة الإنجاز (اختياري)</Text>
          <TouchableOpacity style={styles.imagePickerBtn} onPress={handlePickCompletedImage}>
            <Ionicons name={completedImage ? "checkmark-circle" : "image-outline"} size={24} color={COLORS.primary} />
            <Text style={styles.imagePickerText}>{completedImage ? "تم اختيار الصورة (اضغط لتغييرها)" : "اضغط لاختيار صورة"}</Text>
          </TouchableOpacity>
          {completedImage && (
            <View style={{ marginTop: 12, alignItems: 'center' }}>
              <Image source={{ uri: completedImage }} style={{ width: 120, height: 120, borderRadius: 12 }} resizeMode="cover" />
              <TouchableOpacity style={styles.removeImageBtn} onPress={() => setCompletedImage(null)}>
                <Ionicons name="close-circle" size={24} color={COLORS.danger} />
              </TouchableOpacity>
            </View>
          )}
        </>
      )}

      {status === 'active' && (
        <>
          <Text style={styles.sectionLabel}>العملات المراد عرضها للمستخدم (أشرطة التقدم)</Text>
          <View style={styles.currencyContainer}>
            {(['USD', 'TRY', 'SYP'] as const).map(cur => {
              const isActive = displayCurrencies.includes(cur);
              return (
                <TouchableOpacity 
                  key={cur}
                  style={[styles.currencyBtn, isActive && styles.currencyBtnActive]}
                  onPress={() => toggleDisplayCurrency(cur)}
                >
                  <Text style={[styles.currencyText, isActive && styles.currencyTextActive]}>
                    {cur === 'USD' ? 'دولار ($)' : cur === 'TRY' ? 'ليرة تركية (₺)' : 'ليرة سورية (ل.س)'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      )}

      <Text style={styles.sectionLabel}>إرفاق صور للحالة (يمكنك إرفاق أكثر من صورة - اختياري)</Text>
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
  
  row: { flexDirection: 'row-reverse', gap: 12 },
  
  statusRow: { flexDirection: 'row-reverse', gap: 12, marginBottom: 16 },
  statusBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  statusBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  statusBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.textSecondary },
  statusBtnTextActive: { color: '#FFF' },

  collectedBox: { backgroundColor: '#F8FAFC', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, marginBottom: 16 },
  collectedTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'right', marginBottom: 12 },
  totalText: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary, textAlign: 'center', marginTop: 8, backgroundColor: '#E0F2FE', padding: 8, borderRadius: 8 },

  currencyContainer: { flexDirection: 'row-reverse', gap: 8, marginBottom: 16 },
  currencyBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  currencyBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  currencyText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
  currencyTextActive: { color: '#FFF' },

  sectionLabel: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'right', marginTop: 16, marginBottom: 12 },
  imagePickerBtn: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1F5F9', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed' },
  imagePickerText: { fontSize: 15, fontWeight: '700', color: COLORS.primary, marginRight: 8 },
  imagesScroll: { flexDirection: 'row-reverse', marginTop: 16 },
  imageWrapper: { position: 'relative', marginLeft: 12 },
  previewImage: { width: 100, height: 100, borderRadius: 12 },
  removeImageBtn: { position: 'absolute', top: -8, right: -8, backgroundColor: '#FFF', borderRadius: 12 }
});
