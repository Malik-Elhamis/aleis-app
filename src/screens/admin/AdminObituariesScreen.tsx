import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS } from '../../config/theme';
import { subscribeObituaries, addObituary, updateObituary, deleteObituary } from '../../services/firestoreService';
import { uploadComplaintImages } from '../../services/storageService';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';

export const AdminObituariesScreen: React.FC = () => {
  const [obituaries, setObituaries] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [details, setDetails] = useState('');
  const [condolencesDetails, setCondolencesDetails] = useState('');
  const [image, setImage] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const unsub = subscribeObituaries((items) => {
      setObituaries(items);
    });
    return () => unsub();
  }, []);

  const openModal = (obituary?: any) => {
    if (obituary) {
      setEditingId(obituary.id);
      setName(obituary.name || '');
      setDate(obituary.date || '');
      setDetails(obituary.details || '');
      setCondolencesDetails(obituary.condolencesDetails || '');
      setImage(obituary.image || '');
      setGender(obituary.gender || 'male');
    } else {
      setEditingId(null);
      setName('');
      setDate('');
      setDetails('');
      setCondolencesDetails('');
      setImage('');
      setGender('male');
    }
    setModalVisible(true);
  };

  const handlePickImage = async () => {
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
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('خطأ', 'حدث مشكلة أثناء فتح الاستوديو');
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !date.trim()) {
      Alert.alert('تنبيه', 'يرجى إدخال اسم المتوفى وتاريخ الوفاة على الأقل.');
      return;
    }
    setSubmitting(true);
    try {
      let finalImage = image;
      // Upload image if it is a local file
      if (image && !image.startsWith('http')) {
        const uploaded = await uploadComplaintImages([image], 'obituary_' + Date.now());
        if (uploaded.length > 0) {
          finalImage = uploaded[0];
        }
      }

      const data = {
        name: name.trim(),
        date: date.trim(),
        details: details.trim(),
        condolencesDetails: condolencesDetails.trim(),
        image: finalImage.trim(),
        gender
      };

      if (editingId) {
        await updateObituary(editingId, data);
        Alert.alert('نجاح', 'تم تعديل إعلان الوفاة بنجاح.');
      } else {
        await addObituary(data);
        Alert.alert('نجاح', 'تم إضافة إعلان الوفاة بنجاح.');
      }
      setModalVisible(false);
    } catch (e) {
      Alert.alert('خطأ', 'فشلت العملية.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('تأكيد الحذف', 'هل أنت متأكد أنك تريد حذف هذا الإعلان؟', [
      { text: 'إلغاء', style: 'cancel' },
      { 
        text: 'حذف', 
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteObituary(id);
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
        data={obituaries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listPadding}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="moon-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>لا يوجد إعلانات وفيات</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, SHADOWS.small]}>
            <View style={styles.cardInfo}>
              <Text style={styles.nameText}>{item.name}</Text>
              <Text style={styles.dateText}>{item.date}</Text>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity 
                style={[styles.actionBtn, { backgroundColor: '#FEF3C7' }]}
                onPress={() => openModal(item)}
              >
                <Ionicons name="pencil" size={20} color="#D97706" />
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
        onPress={() => openModal()}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={32} color="#FFF" />
      </TouchableOpacity>

      {/* Add Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingId ? 'تعديل الإعلان' : 'إضافة إعلان وفاة'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: SPACING.md }}>
              <CustomInput
                label="اسم المتوفى *"
                placeholder="الاسم الكامل"
                value={name}
                onChangeText={setName}
              />
              <CustomInput
                label="تاريخ الوفاة *"
                placeholder="مثال: 12 أكتوبر 2026"
                value={date}
                onChangeText={setDate}
              />
              
              <Text style={styles.inputLabel}>جنس المتوفى (لضبط صيغة الدعاء)</Text>
              <View style={styles.genderRow}>
                <TouchableOpacity 
                  style={[styles.genderBtn, gender === 'male' && styles.genderBtnActive]}
                  onPress={() => setGender('male')}
                >
                  <Text style={[styles.genderText, gender === 'male' && styles.genderTextActive]}>ذكر</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.genderBtn, gender === 'female' && styles.genderBtnActive]}
                  onPress={() => setGender('female')}
                >
                  <Text style={[styles.genderText, gender === 'female' && styles.genderTextActive]}>أنثى</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>صورة المتوفى (اختياري)</Text>
              <View style={styles.imageUploadContainer}>
                {image ? (
                  <View style={styles.uploadedImageWrapper}>
                    <Image source={{ uri: image }} style={styles.uploadedImage} />
                    <View style={styles.checkBadge}>
                      <Ionicons name="checkmark-circle" size={28} color={COLORS.success} />
                    </View>
                    <TouchableOpacity style={styles.removeImageBtn} onPress={() => setImage('')}>
                      <Ionicons name="close-circle" size={24} color={COLORS.danger} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.uploadBtn} onPress={handlePickImage} disabled={submitting}>
                    <Ionicons name="image-outline" size={32} color={COLORS.primary} />
                    <Text style={styles.uploadBtnText}>اضغط هنا لاختيار صورة من الاستوديو</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              <Text style={styles.inputLabel}>مكان الصلاة والدفن (اختياري)</Text>
              <View style={styles.textAreaContainer}>
                <TextInput
                  style={styles.textArea}
                  placeholder="مثال: الصلاة في مسجد النور والدفن في المقبرة العامة..."
                  value={details}
                  onChangeText={setDetails}
                  multiline
                  textAlign="right"
                />
              </View>

              <Text style={styles.inputLabel}>تفاصيل العزاء (اختياري)</Text>
              <View style={styles.textAreaContainer}>
                <TextInput
                  style={styles.textArea}
                  placeholder="مكان ووقت استقبال التعازي..."
                  value={condolencesDetails}
                  onChangeText={setCondolencesDetails}
                  multiline
                  textAlign="right"
                />
              </View>

              <CustomButton
                title={submitting ? "جاري الحفظ..." : "حفظ"}
                onPress={handleSave}
                variant="primary"
                disabled={submitting || uploadingImage}
                style={{ marginTop: 24 }}
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
  card: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: 'row-reverse', alignItems: 'center' },
  cardInfo: { flex: 1 },
  nameText: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'right', marginBottom: 4 },
  dateText: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'right' },
  cardActions: { flexDirection: 'row-reverse', gap: 8, marginRight: 12 },
  actionBtn: { padding: 8, borderRadius: 8 },
  deleteBtn: { padding: 8, backgroundColor: '#FEE2E2', borderRadius: 8 },
  
  fab: { position: 'absolute', bottom: 30, left: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },
  
  inputLabel: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'right', marginBottom: 8, marginTop: 12 },
  textAreaContainer: { backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, padding: 12 },
  textArea: { height: 80, fontSize: 14, color: COLORS.textPrimary, textAlignVertical: 'top' },

  genderRow: { flexDirection: 'row-reverse', gap: 12, marginBottom: 12 },
  genderBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', backgroundColor: '#FFF' },
  genderBtnActive: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  genderText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
  genderTextActive: { color: COLORS.primary, fontWeight: '800' },

  imageUploadContainer: { marginBottom: 12 },
  uploadBtn: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed', borderRadius: 12, padding: 24, alignItems: 'center', gap: 8 },
  uploadBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },
  uploadedImageWrapper: { position: 'relative', alignSelf: 'center', marginVertical: 12 },
  uploadedImage: { width: 120, height: 120, borderRadius: 12, borderWidth: 3, borderColor: COLORS.primaryLight },
  checkBadge: { position: 'absolute', bottom: -5, right: -5, backgroundColor: '#FFF', borderRadius: 14 },
  removeImageBtn: { position: 'absolute', top: -5, left: -5, backgroundColor: '#FFF', borderRadius: 12, padding: 2 },

  emptyContainer: { paddingVertical: 80, alignItems: 'center', justifyContent: 'center' },
  emptyText: { marginTop: 16, fontSize: 16, color: COLORS.textMuted, fontWeight: '600' },
});
