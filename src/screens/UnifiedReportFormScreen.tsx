import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  KeyboardAvoidingView, 
  Platform,
  Image,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { CustomInput } from '../components/CustomInput';
import { MapPickerModal } from '../components/MapPickerModal';
import { submitComplaintToFirestore, submitViolationToFirestore } from '../services/firestoreService';
import { uploadComplaintImages } from '../services/storageService';
import { COLORS, SPACING, SHADOWS } from '../config/theme';
import { ComplaintCategory, ViolationCategory, LocationCoords } from '../types';

interface Option {
  id: ComplaintCategory | ViolationCategory;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  type: 'complaint' | 'violation';
}

const ALL_OPTIONS: Option[] = [
  // Complaints
  { id: 'water', label: 'مياه', icon: 'water-outline', type: 'complaint' },
  { id: 'sanitation', label: 'نظافة', icon: 'trash-outline', type: 'complaint' },
  { id: 'roads', label: 'طرق', icon: 'car-outline', type: 'complaint' },
  { id: 'electricity', label: 'كهرباء', icon: 'flash-outline', type: 'complaint' },
  { id: 'sewage', label: 'صرف صحي', icon: 'funnel-outline', type: 'complaint' },
  // Violations
  { id: 'illegal_building', label: 'بناء عشوائي', icon: 'home-outline', type: 'violation' },
  { id: 'public_property', label: 'تعدي على الأملاك العامة', icon: 'business-outline', type: 'violation' },
  { id: 'littering', label: 'رمي نفايات', icon: 'leaf-outline', type: 'violation' },
  { id: 'vandalism', label: 'تخريب مرافق', icon: 'hammer-outline', type: 'violation' },
  { id: 'water_network', label: 'تعدي على شبكة المياه', icon: 'water', type: 'violation' },
  // Others
  { id: 'other', label: 'أخرى (غير ذلك)', icon: 'options-outline', type: 'complaint' },
];

export const UnifiedReportFormScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  
  const [step, setStep] = useState(1);
  const totalSteps = 6;

  // Form State
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [otherCategory, setOtherCategory] = useState('');
  
  const [description, setDescription] = useState('');
  
  // Location
  const [address, setAddress] = useState('');
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [locationCoords, setLocationCoords] = useState<LocationCoords>({
    latitude: 35.9944,
    longitude: 36.9986,
    address: '',
  });
  
  const [images, setImages] = useState<string[]>([]);
  
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [citizenName, setCitizenName] = useState(user?.fullName || '');
  const [citizenPhone, setCitizenPhone] = useState(user?.phoneNumber || '');

  const [submitting, setSubmitting] = useState(false);

  const nextStep = () => {
    // Validations
    if (step === 1 && !selectedOption) {
      Alert.alert('تنبيه', 'يرجى تحديد نوع الشكوى أو المخالفة أولاً');
      return;
    }
    if (step === 1 && selectedOption?.id === 'other' && !otherCategory.trim()) {
      Alert.alert('تنبيه', 'يرجى كتابة نوع البلاغ الآخر');
      return;
    }
    if (step === 2 && !description.trim()) {
      Alert.alert('تنبيه', 'يرجى ملء تفاصيل الشكوى/المخالفة بالكامل');
      return;
    }
    if (step === 3 && !address.trim() && !locationCoords.latitude) {
      Alert.alert('تنبيه', 'يرجى تحديد الموقع أو كتابة العنوان');
      return;
    }
    
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleAddImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('صلاحية مطلوبة', 'التطبيق يحتاج إلى صلاحية الوصول للصور.');
      return;
    }
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.7,
      allowsMultipleSelection: true,
    });
    if (!pickerResult.canceled && pickerResult.assets?.length > 0) {
      const newUris = pickerResult.assets.map(asset => asset.uri);
      setImages([...images, ...newUris]);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleConfirmLocation = (loc: LocationCoords) => {
    setLocationCoords(loc);
    if (!address.trim()) {
      setAddress(loc.address || '');
    }
  };

  const handleSubmit = async () => {
    if (!selectedOption) return;

    setSubmitting(true);
    try {
      const isComplaint = selectedOption.type === 'complaint';
      const finalCategoryLabel = selectedOption.id === 'other' ? otherCategory.trim() : selectedOption.label;
      const finalName = isAnonymous ? 'فاعل خير (مجهول)' : (citizenName.trim() || 'فاعل خير');
      const finalPhone = isAnonymous ? '' : citizenPhone.trim();

      const finalLocationCoords: LocationCoords = {
        latitude: locationCoords.latitude,
        longitude: locationCoords.longitude,
        address: address.trim(),
      };

      const reportId = `${isComplaint ? 'cmp_' : 'vio_'}${Date.now()}`;
      
      let uploadedImageUrls: string[] = [];
      if (images.length > 0) {
        uploadedImageUrls = await uploadComplaintImages(images, reportId);
      }

      const generatedTitle = description.split('\n')[0].substring(0, 40) + '...';

      const payload = {
        category: selectedOption.id as any,
        categoryLabel: finalCategoryLabel,
        title: generatedTitle,
        description: description.trim(),
        location: finalLocationCoords,
        images: uploadedImageUrls,
        citizenName: finalName,
        citizenPhone: finalPhone,
        isGuestSubmission: isAnonymous,
      };

      if (isComplaint) {
        await submitComplaintToFirestore(payload as any);
      } else {
        await submitViolationToFirestore(payload as any);
      }

      Alert.alert(
        'تم تسجيل البلاغ بنجاح 🎉',
        `شكراً لك. سيتم التعامل مع بلاغك بأسرع وقت ممكن.`,
        [{ text: 'حسناً', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      console.error(err);
      Alert.alert('خطأ', 'تعذر إرسال البلاغ، يرجى المحاولة مرة أخرى.');
    } finally {
      setSubmitting(false);
    }
  };

  // --- Step Components ---

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitleCentered}>الخطوة 1: حدد النوع</Text>
      <Text style={styles.stepSubCentered}>هل تود تقديم شكوى خدمية أم التبليغ عن مخالفة وتعدي؟</Text>
      
      {/* Confidentiality Alert */}
      <View style={styles.confidentialAlert}>
        <View style={{ flex: 1 }}>
          <Text style={styles.confidentialAlertTitle}>معلوماتك في سرية تامة و بأمان!</Text>
          <Text style={styles.confidentialAlertText}>
            يمكنك إرسال البلاغ بشكل علني، أو تفعيل خيار "فاعل خير" في الخطوة قبل الأخيرة لإخفاء جميع بياناتك تماماً عن الجهات المعنية.
          </Text>
        </View>
      </View>

      <View style={styles.optionsGrid}>
        {ALL_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.id}
            style={[
              styles.optionCard, 
              selectedOption?.id === opt.id && styles.optionCardSelected,
              SHADOWS.small
            ]}
            onPress={() => setSelectedOption(opt)}
            activeOpacity={0.8}
          >
            <Ionicons 
              name={opt.icon} 
              size={32} 
              color={selectedOption?.id === opt.id ? '#FFF' : COLORS.primary} 
              style={{ marginBottom: 8 }}
            />
            <Text style={[styles.optionLabel, selectedOption?.id === opt.id && { color: '#FFF' }]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {selectedOption?.id === 'other' && (
        <View style={{ marginTop: 16 }}>
          <CustomInput
            label="تفاصيل النوع (أخرى) *"
            placeholder="اكتب نوع الشكوى / المخالفة هنا..."
            value={otherCategory}
            onChangeText={setOtherCategory}
            iconName="options-outline"
          />
        </View>
      )}
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitleCentered}>الخطوة 2: تفاصيل المشكلة</Text>
      <Text style={styles.stepSubCentered}>صف المشكلة بشكل واضح لمساعدتنا في فهمها وحلها.</Text>
      
      <Text style={styles.inputLabel}>وصف وتفاصيل المشكلة *</Text>
      <View style={styles.textAreaContainer}>
        <TextInput
          style={styles.textArea}
          placeholder="اكتب كل التفاصيل التي تراها مهمة هنا..."
          value={description}
          onChangeText={setDescription}
          multiline
          textAlign="right"
          textAlignVertical="top"
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitleCentered}>الخطوة 3: الموقع الجغرافي</Text>
      <Text style={styles.stepSubCentered}>أين يقع مكان الشكوى أو المخالفة؟</Text>
      
      <TouchableOpacity style={styles.mapButton} onPress={() => setMapModalVisible(true)} activeOpacity={0.8}>
        <Ionicons name="map-outline" size={24} color="#FFF" style={{ marginLeft: 8 }} />
        <Text style={styles.mapButtonText}>تحديد الموقع الدقيق على الخريطة</Text>
      </TouchableOpacity>

      <View style={{ flexDirection: 'row-reverse', alignItems: 'center', marginVertical: 20 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: COLORS.border }} />
        <View style={{ backgroundColor: COLORS.primaryLight, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginHorizontal: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '900', color: COLORS.primaryDark }}>أو</Text>
        </View>
        <View style={{ flex: 1, height: 1, backgroundColor: COLORS.border }} />
      </View>

      <Text style={styles.inputLabel}>اكتب العنوان بالتفصيل *</Text>
      <View style={styles.textAreaContainer}>
        <TextInput
          style={[styles.textArea, { height: 80 }]}
          placeholder="مثال: الحي الشرقي، بجانب مدرسة..."
          value={address}
          onChangeText={setAddress}
          multiline
          textAlign="right"
          textAlignVertical="top"
        />
      </View>
      
      <MapPickerModal
        visible={mapModalVisible}
        initialCoords={locationCoords}
        onConfirm={handleConfirmLocation}
        onClose={() => setMapModalVisible(false)}
      />
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitleCentered}>الخطوة 4: إرفاق الصور (اختياري)</Text>
      <Text style={styles.stepSubCentered}>يمكنك إرفاق أكثر من صورة لتوثيق المشكلة.</Text>
      
      <View style={styles.imagesGrid}>
        <TouchableOpacity style={styles.addImageBtn} onPress={handleAddImage} activeOpacity={0.8}>
          <Ionicons name="camera-outline" size={32} color={COLORS.primary} />
          <Text style={styles.addImageText}>التقط أو اختر صور</Text>
        </TouchableOpacity>
        
        {images.map((uri, idx) => (
          <View key={idx} style={styles.imageThumbnailWrapper}>
            <Image source={{ uri }} style={styles.imageThumbnail} />
            <TouchableOpacity style={styles.removeImageBtn} onPress={() => handleRemoveImage(idx)}>
              <Ionicons name="close-circle" size={20} color={COLORS.danger} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );

  const renderStep5 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitleCentered}>الخطوة 5: معلومات التواصل</Text>
      <Text style={styles.stepSubCentered}>يمكنك تقديم البلاغ كمجهول أو إرفاق معلوماتك.</Text>

      <View style={styles.anonToggleContainer}>
        <View style={{ flex: 1 }}>
          <Text style={styles.anonToggleTitle}>تقديم البلاغ كمجهول (فاعل خير)</Text>
          <Text style={styles.anonToggleSub}>لن يتم مشاركة اسمك أو رقمك نهائياً.</Text>
        </View>
        <TouchableOpacity 
          style={[styles.toggleSwitch, isAnonymous && styles.toggleSwitchActive]}
          onPress={() => setIsAnonymous(!isAnonymous)}
        >
          <View style={[styles.toggleThumb, isAnonymous && styles.toggleThumbActive]} />
        </TouchableOpacity>
      </View>

      {!isAnonymous && (
        <View style={styles.identityForm}>
          <CustomInput
            label="اسمك الكامل"
            placeholder="أدخل اسمك"
            value={citizenName}
            onChangeText={setCitizenName}
            iconName="person-outline"
          />
          <CustomInput
            label="رقم الهاتف"
            placeholder="07xxxxxxxx"
            value={citizenPhone}
            onChangeText={setCitizenPhone}
            iconName="call-outline"
            keyboardType="phone-pad"
          />
        </View>
      )}
    </View>
  );

  const renderStep6 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitleCentered}>الخطوة 6: ملخص البلاغ وتأكيد الإرسال</Text>
      <Text style={styles.stepSubCentered}>يرجى مراجعة بيانات بلاغك بعناية قبل الإرسال النهائي.</Text>

      <View style={styles.summaryBox}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>النوع:</Text>
          <Text style={styles.summaryValue}>{selectedOption?.label}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>المُبلغ:</Text>
          <Text style={styles.summaryValue}>{isAnonymous ? 'فاعل خير (مجهول)' : citizenName}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>الموقع:</Text>
          <Text style={styles.summaryValue}>{address || 'تم تحديد الموقع'}</Text>
        </View>
        
        <View style={styles.summaryDivider} />
        
        <Text style={styles.summaryLabelTop}>الوصف والتفاصيل:</Text>
        <Text style={styles.summaryDescText}>{description}</Text>

        {images.length > 0 && (
          <>
            <View style={styles.summaryDivider} />
            <Text style={styles.summaryLabelTop}>المرفقات والصور ({images.length}):</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.summaryImagesScroll}>
              {images.map((uri, idx) => (
                <Image key={idx} source={{ uri }} style={styles.summaryImageLarge} />
              ))}
            </ScrollView>
          </>
        )}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Progress Bar */}
        <View style={styles.progressHeader}>
          <Text style={styles.progressText}>الخطوة {step} من {totalSteps}</Text>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${(step / totalSteps) * 100}%` }]} />
          </View>
        </View>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderStep5()}
        {step === 6 && renderStep6()}

        {/* Bottom Navigation Buttons */}
        <View style={styles.bottomNav}>
          {step > 1 ? (
            <TouchableOpacity style={styles.backBtn} onPress={prevStep} disabled={submitting}>
              <Ionicons name="arrow-forward" size={20} color={COLORS.primary} style={{ marginLeft: 4 }} />
              <Text style={styles.backBtnText}>رجوع</Text>
            </TouchableOpacity>
          ) : <View style={{ flex: 1 }} />}

          {step < totalSteps ? (
            <TouchableOpacity style={styles.nextBtn} onPress={nextStep}>
              <Text style={styles.nextBtnText}>التالي</Text>
              <Ionicons name="arrow-back" size={20} color="#FFF" style={{ marginRight: 4 }} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
              {submitting ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Text style={styles.nextBtnText}>تقديم الشكوى / المخالفة</Text>
                  <Ionicons name="checkmark-circle-outline" size={22} color="#FFF" style={{ marginRight: 6 }} />
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: SPACING.md, paddingBottom: 60 },
  
  progressHeader: { marginBottom: 24, paddingHorizontal: 8 },
  progressText: { fontSize: 13, fontWeight: '700', color: COLORS.primaryDark, textAlign: 'left', marginBottom: 8 },
  progressBarTrack: { height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 4 },

  stepContainer: { flex: 1, backgroundColor: COLORS.surface, padding: SPACING.lg, borderRadius: 16, ...SHADOWS.medium },
  
  stepTitleCentered: { fontSize: 20, fontWeight: '800', color: COLORS.primaryDark, textAlign: 'center', marginBottom: 8 },
  stepSubCentered: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 24, lineHeight: 20 },

  confidentialAlert: { flexDirection: 'row', backgroundColor: COLORS.successLight, padding: 16, borderRadius: 12, marginBottom: 20, alignItems: 'flex-start', borderWidth: 1, borderColor: COLORS.success },
  confidentialAlertTitle: { fontSize: 14, fontWeight: '800', color: COLORS.primaryDark, textAlign: 'left', marginBottom: 4 },
  confidentialAlertText: { fontSize: 12, color: COLORS.textSecondary, textAlign: 'left', lineHeight: 18 },

  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  optionCard: { width: '48%', backgroundColor: '#F8FAFC', padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#E2E8F0' },
  optionCardSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primaryDark },
  optionLabel: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'center' },

  inputLabel: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'left', marginBottom: 8, marginTop: 16 },
  textAreaContainer: { backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, padding: 12 },
  textArea: { height: 160, fontSize: 14, color: COLORS.textPrimary },

  mapButton: { flexDirection: 'row', backgroundColor: COLORS.primary, padding: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 10, marginBottom: 16, ...SHADOWS.small },
  mapButtonText: { color: '#FFF', fontSize: 14, fontWeight: '700' },

  imagesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  addImageBtn: { width: 100, height: 100, borderRadius: 12, borderWidth: 1, borderColor: COLORS.primary, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.primaryLight },
  addImageText: { fontSize: 11, color: COLORS.primary, marginTop: 8, fontWeight: '700', textAlign: 'center', paddingHorizontal: 4 },
  imageThumbnailWrapper: { width: 100, height: 100, borderRadius: 12, overflow: 'hidden', position: 'relative' },
  imageThumbnail: { width: '100%', height: '100%', resizeMode: 'cover' },
  removeImageBtn: { position: 'absolute', top: 4, left: 4, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 12, padding: 2 },

  anonToggleContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.accentLight, padding: 16, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: COLORS.accent },
  anonToggleTitle: { fontSize: 15, fontWeight: '800', color: '#B45309', textAlign: 'left' },
  anonToggleSub: { fontSize: 12, color: '#D97706', textAlign: 'left', marginTop: 4 },
  toggleSwitch: { width: 50, height: 28, borderRadius: 14, backgroundColor: '#FDE68A', justifyContent: 'center', padding: 2 },
  toggleSwitchActive: { backgroundColor: COLORS.accent },
  toggleThumb: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFF' },
  toggleThumbActive: { transform: [{ translateX: -22 }] },

  identityForm: { marginTop: 12 },
  
  summaryBox: { backgroundColor: '#F8FAFC', padding: 20, borderRadius: 16, marginTop: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  summaryLabel: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary, width: '25%', textAlign: 'left' },
  summaryValue: { fontSize: 14, fontWeight: '700', color: COLORS.primaryDark, width: '70%', textAlign: 'left' },
  summaryDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: 16 },
  summaryLabelTop: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary, textAlign: 'left', marginBottom: 8 },
  summaryDescText: { fontSize: 14, color: COLORS.textPrimary, textAlign: 'left', lineHeight: 22 },
  summaryImagesScroll: { marginTop: 12, flexDirection: 'row' },
  summaryImageLarge: { width: 120, height: 120, borderRadius: 12, marginLeft: 12, resizeMode: 'cover' },

  bottomNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, paddingHorizontal: 4 },
  backBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#F1F5F9', borderRadius: 12, flex: 1, justifyContent: 'center', marginLeft: 12 },
  backBtnText: { fontSize: 16, fontWeight: '700', color: COLORS.primary },
  nextBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 24, backgroundColor: COLORS.primary, borderRadius: 12, flex: 2, justifyContent: 'center', ...SHADOWS.medium },
  nextBtnText: { fontSize: 16, fontWeight: '800', color: '#FFF' },
  submitBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 24, backgroundColor: COLORS.success, borderRadius: 12, flex: 2, justifyContent: 'center', ...SHADOWS.medium },
});
