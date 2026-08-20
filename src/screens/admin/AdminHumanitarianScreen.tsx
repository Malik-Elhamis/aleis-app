import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING, SHADOWS } from '../../config/theme';
import { subscribeHumanitarian, addHumanitarianCase, updateHumanitarianCase, deleteHumanitarianCase } from '../../services/firestoreService';
import { uploadComplaintImages } from '../../services/storageService';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';

export const AdminHumanitarianScreen: React.FC = () => {
  const [cases, setCases] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [collectedAmount, setCollectedAmount] = useState('');
  const [currency, setCurrency] = useState<'USD' | 'SYP' | 'TRY'>('SYP');
  const [isUrgent, setIsUrgent] = useState(false);
  const [status, setStatus] = useState<'active' | 'completed'>('active');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Donation Methods
  const [donationImages, setDonationImages] = useState<string[]>([]);
  const [bankAccountDetails, setBankAccountDetails] = useState('');
  const [donationExplanation, setDonationExplanation] = useState('');
  const [viaMunicipality, setViaMunicipality] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const unsub = subscribeHumanitarian((items) => {
      setCases(items);
    });
    return () => unsub();
  }, []);

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('تنبيه', 'التطبيق يحتاج إلى صلاحية الوصول للصور.');
      return;
    }
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!pickerResult.canceled && pickerResult.assets?.length > 0) {
      setImageUri(pickerResult.assets[0].uri);
    }
  };

  const handlePickDonationImages = async () => {
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
      setDonationImages(prev => [...prev, ...uris]);
    }
  };

  const handleAdd = async () => {
    if (!title.trim()) {
      Alert.alert('تنبيه', 'يرجى إدخال عنوان الحالة.');
      return;
    }
    setSubmitting(true);
    try {
      let uploadedUrl = '';
      if (imageUri) {
        const uploaded = await uploadComplaintImages([imageUri], 'humanitarian_' + Date.now());
        if (uploaded.length > 0) uploadedUrl = uploaded[0];
      }

      let uploadedDonationUrls: string[] = [];
      if (donationImages.length > 0) {
        // Only upload the ones that are local file URIs
        const localUris = donationImages.filter(uri => !uri.startsWith('http'));
        const remoteUris = donationImages.filter(uri => uri.startsWith('http'));
        if (localUris.length > 0) {
          const uploaded = await uploadComplaintImages(localUris, 'donation_' + Date.now());
          uploadedDonationUrls = [...remoteUris, ...uploaded];
        } else {
          uploadedDonationUrls = remoteUris;
        }
      }

      const caseData: any = {
        title: title.trim(),
        description: description.trim(),
        isUrgent,
        status,
        currency,
        ...(uploadedUrl ? { images: [uploadedUrl] } : {}),
        donationMethods: {
          donationImages: uploadedDonationUrls,
          bankAccountDetails: bankAccountDetails.trim(),
          donationExplanation: donationExplanation.trim(),
          viaMunicipality
        }
      };

      if (targetAmount.trim()) caseData.targetAmount = targetAmount.trim();
      if (collectedAmount.trim()) caseData.collectedAmount = collectedAmount.trim();

      if (editingId) {
        await updateHumanitarianCase(editingId, caseData);
      } else {
        await addHumanitarianCase({ ...caseData, images: uploadedUrl ? [uploadedUrl] : [] });
      }

      setModalVisible(false);
      resetForm();
      Alert.alert('نجاح', 'تم إضافة الحالة بنجاح.');
    } catch (e) {
      Alert.alert('خطأ', 'فشلت عملية الإضافة.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setTargetAmount('');
    setCollectedAmount('');
    setCurrency('SYP');
    setIsUrgent(false);
    setStatus('active');
    setImageUri(null);
    setDonationImages([]);
    setBankAccountDetails('');
    setDonationExplanation('');
    setViaMunicipality(false);
    setEditingId(null);
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description || '');
    setTargetAmount(item.targetAmount || '');
    setCollectedAmount(item.collectedAmount || '');
    setCurrency(item.currency || 'SYP');
    setIsUrgent(item.isUrgent || false);
    setStatus(item.status || 'active');
    
    setDonationImages(item.donationMethods?.donationImages || []);
    setBankAccountDetails(item.donationMethods?.bankAccountDetails || '');
    setDonationExplanation(item.donationMethods?.donationExplanation || '');
    setViaMunicipality(item.donationMethods?.viaMunicipality || false);

    setImageUri(null);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert('تأكيد الحذف', 'هل أنت متأكد أنك تريد حذف هذه الحالة؟', [
      { text: 'إلغاء', style: 'cancel' },
      { 
        text: 'حذف', 
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteHumanitarianCase(id);
          } catch (e) {
            Alert.alert('خطأ', 'لم يتم الحذف.');
          }
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={cases}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listPadding}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>لا توجد حالات إنسانية مضافة</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, SHADOWS.small]}>
            <Image source={{ uri: item.images?.[0] || 'https://via.placeholder.com/100' }} style={styles.cardImg} />
            <View style={styles.cardInfo}>
              <Text style={styles.titleText}>{item.title}</Text>
              <Text style={styles.amountText}>المطلوب: {item.targetAmount}</Text>
              <Text style={styles.statusText}>{item.status === 'completed' ? 'اكتملت ✅' : 'نشطة'}</Text>
            </View>
            <View style={{ flexDirection: 'row-reverse', alignItems: 'center', marginRight: 12, gap: 8 }}>
              <TouchableOpacity 
                style={styles.editBtn}
                onPress={() => handleEdit(item)}
              >
                <Ionicons name="pencil-outline" size={20} color={COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.deleteBtn}
                onPress={() => handleDelete(item.id)}
              >
                <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <TouchableOpacity 
        style={[styles.fab, SHADOWS.medium]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={32} color="#FFF" />
      </TouchableOpacity>

      {/* Add Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingId ? 'تعديل حالة إنسانية' : 'إضافة حالة إنسانية'}</Text>
              <TouchableOpacity onPress={() => { setModalVisible(false); resetForm(); }}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: SPACING.md }}>
              
              <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
                {imageUri ? (
                  <Image source={{ uri: imageUri }} style={styles.previewImage} />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="image-outline" size={32} color={COLORS.primary} />
                    <Text style={styles.imagePlaceholderText}>صورة الحالة (اختياري)</Text>
                  </View>
                )}
              </TouchableOpacity>

              <CustomInput
                label="عنوان الحالة *"
                placeholder="مثال: مساعدة أسرة محتاجة"
                value={title}
                onChangeText={setTitle}
              />
              <CustomInput
                label="التفاصيل"
                placeholder="وصف مختصر للحالة..."
                value={description}
                onChangeText={setDescription}
              />
              
              <Text style={styles.sectionTitle}>العملة</Text>
              <View style={styles.currencySelector}>
                <TouchableOpacity style={[styles.currencyBtn, currency === 'SYP' && styles.currencyBtnActive]} onPress={() => setCurrency('SYP')}>
                  <Text style={[styles.currencyText, currency === 'SYP' && styles.currencyTextActive]}>ل.س</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.currencyBtn, currency === 'USD' && styles.currencyBtnActive]} onPress={() => setCurrency('USD')}>
                  <Text style={[styles.currencyText, currency === 'USD' && styles.currencyTextActive]}>$</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.currencyBtn, currency === 'TRY' && styles.currencyBtnActive]} onPress={() => setCurrency('TRY')}>
                  <Text style={[styles.currencyText, currency === 'TRY' && styles.currencyTextActive]}>ل.ت</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.row}>
                <View style={{flex:1}}>
                  <CustomInput
                    label="تم جمعه"
                    placeholder="مثال: 500"
                    value={collectedAmount}
                    onChangeText={setCollectedAmount}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{width: 12}} />
                <View style={{flex:1}}>
                  <CustomInput
                    label="المبلغ المطلوب (اختياري)"
                    placeholder="مثال: 2000"
                    value={targetAmount}
                    onChangeText={setTargetAmount}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.sectionDivider} />
              <Text style={styles.sectionTitle}>طرق التبرع (اختياري)</Text>
              
              <TouchableOpacity style={styles.donationImagePicker} onPress={handlePickDonationImages}>
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="images-outline" size={24} color={COLORS.primary} />
                  <Text style={styles.imagePlaceholderText}>إضافة صور لطرق الدفع (شام كاش وغيرها)</Text>
                </View>
              </TouchableOpacity>
              
              {donationImages.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.donationImagesScroll}>
                  {donationImages.map((uri, index) => (
                    <View key={index} style={styles.donationImageWrapper}>
                      <Image source={{ uri }} style={styles.donationPreviewImage} />
                      <TouchableOpacity 
                        style={styles.removeDonationImage}
                        onPress={() => setDonationImages(prev => prev.filter((_, i) => i !== index))}
                      >
                        <Ionicons name="close-circle" size={24} color={COLORS.danger} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}

              <CustomInput
                label="تفاصيل الحساب البنكي / تحويل رصيد"
                placeholder="اكتب رقم الحساب أو الرقم المراد التحويل إليه..."
                value={bankAccountDetails}
                onChangeText={setBankAccountDetails}
                multiline
              />

              <CustomInput
                label="شرح طريقة التبرع (اختياري)"
                placeholder="اكتب شرحاً لطريقة التبرع لمساعدة المستخدمين..."
                value={donationExplanation}
                onChangeText={setDonationExplanation}
                multiline
              />

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>التبرع عن طريق البلدية (صندوق التبرعات)؟</Text>
                <Switch value={viaMunicipality} onValueChange={setViaMunicipality} />
              </View>
              
              <View style={styles.sectionDivider} />

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>حالة عاجلة؟</Text>
                <Switch value={isUrgent} onValueChange={setIsUrgent} />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>مكتملة (تم جمع المبلغ)؟</Text>
                <Switch 
                  value={status === 'completed'} 
                  onValueChange={(val) => setStatus(val ? 'completed' : 'active')} 
                />
              </View>

              <CustomButton
                title={submitting ? "جاري الإضافة..." : "حفظ الحالة"}
                onPress={handleAdd}
                variant="primary"
                disabled={submitting}
                style={{ marginTop: 24, backgroundColor: '#DB2777' }}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  listPadding: { padding: SPACING.md, paddingBottom: 100 },
  card: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, marginBottom: 12, flexDirection: 'row-reverse', alignItems: 'center' },
  cardImg: { width: 70, height: 70, borderRadius: 8, marginLeft: 12 },
  cardInfo: { flex: 1 },
  titleText: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'right', marginBottom: 4 },
  amountText: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'right' },
  statusText: { fontSize: 12, color: COLORS.primary, textAlign: 'right', fontWeight: '700', marginTop: 4 },
  deleteBtn: { padding: 8, backgroundColor: '#FEE2E2', borderRadius: 8 },
  editBtn: { padding: 8, backgroundColor: COLORS.primaryLight, borderRadius: 8 },
  
  fab: { position: 'absolute', bottom: 30, left: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: '#DB2777', justifyContent: 'center', alignItems: 'center' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },
  
  imagePicker: { alignSelf: 'center', marginVertical: 16 },
  previewImage: { width: 120, height: 80, borderRadius: 8 },
  imagePlaceholder: { width: 120, height: 80, borderRadius: 8, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.primary, borderStyle: 'dashed' },
  imagePlaceholderText: { fontSize: 12, color: COLORS.primary, marginTop: 4, fontWeight: '600' },

  row: { flexDirection: 'row-reverse' },
  switchRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  switchLabel: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },

  emptyContainer: { paddingVertical: 80, alignItems: 'center', justifyContent: 'center' },
  emptyText: { marginTop: 16, fontSize: 16, color: COLORS.textMuted, fontWeight: '600' },
  
  sectionDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 12, textAlign: 'right' },
  
  donationImagePicker: { marginBottom: 12 },
  donationImagesScroll: { marginBottom: 16, flexDirection: 'row-reverse' },
  donationImageWrapper: { position: 'relative', marginLeft: 8 },
  donationPreviewImage: { width: 80, height: 80, borderRadius: 8 },
  removeDonationImage: { position: 'absolute', top: -8, right: -8, backgroundColor: '#FFF', borderRadius: 12 },
  
  currencySelector: { flexDirection: 'row-reverse', gap: 8, marginBottom: 16 },
  currencyBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface, alignItems: 'center' },
  currencyBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  currencyText: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  currencyTextActive: { color: '#FFF' }
});
