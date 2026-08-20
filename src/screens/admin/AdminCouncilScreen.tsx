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
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING, SHADOWS } from '../../config/theme';
import { subscribeCouncil, addCouncilMember, deleteCouncilMember, updateCouncilMember } from '../../services/firestoreService';
import { uploadComplaintImages } from '../../services/storageService';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';

export const AdminCouncilScreen: React.FC = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [bio, setBio] = useState('');
  const [order, setOrder] = useState('10');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const unsub = subscribeCouncil((items) => {
      setMembers(items);
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

  const handleAddOrEdit = async () => {
    if (!name.trim() || !role.trim()) {
      Alert.alert('تنبيه', 'يرجى إدخال اسم العضو والمنصب.');
      return;
    }
    setSubmitting(true);
    try {
      let uploadedUrl = existingImageUrl || '';
      // Only upload if imageUri exists and it's a new local file (not a remote URL from existingImageUrl)
      if (imageUri && !imageUri.startsWith('http')) {
        const uploaded = await uploadComplaintImages([imageUri], 'council_' + Date.now());
        if (uploaded.length > 0) uploadedUrl = uploaded[0];
      }

      if (editingId) {
        await updateCouncilMember(editingId, {
          name: name.trim(),
          role: role.trim(),
          bio: bio.trim(),
          order: parseInt(order) || 10,
          image: uploadedUrl
        });
        Alert.alert('نجاح', 'تم تحديث بيانات العضو بنجاح.');
      } else {
        await addCouncilMember({
          name: name.trim(),
          role: role.trim(),
          bio: bio.trim(),
          order: parseInt(order) || 10,
          image: uploadedUrl
        });
        Alert.alert('نجاح', 'تم إضافة العضو بنجاح.');
      }

      setModalVisible(false);
      resetForm();
    } catch (e) {
      Alert.alert('خطأ', 'فشلت العملية.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setRole('');
    setBio('');
    setOrder('10');
    setImageUri(null);
    setExistingImageUrl(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (member: any) => {
    setEditingId(member.id);
    setName(member.name);
    setRole(member.role);
    setBio(member.bio || '');
    setOrder(member.order?.toString() || '10');
    setExistingImageUrl(member.image || null);
    setImageUri(member.image || null);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert('تأكيد الحذف', 'هل أنت متأكد أنك تريد حذف هذا العضو؟', [
      { text: 'إلغاء', style: 'cancel' },
      { 
        text: 'حذف', 
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteCouncilMember(id);
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
        data={members}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listPadding}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>لا يوجد أعضاء مضافين</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, SHADOWS.small]}>
            <Image source={{ uri: item.image || 'https://via.placeholder.com/100' }} style={styles.cardImg} />
            <View style={styles.cardInfo}>
              <Text style={styles.roleText}>{item.role}</Text>
              <Text style={styles.nameText}>{item.name}</Text>
            </View>
            <View style={styles.actionsRow}>
              <TouchableOpacity 
                style={styles.editBtn}
                onPress={() => openEditModal(item)}
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
        onPress={openAddModal}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={32} color="#FFF" />
      </TouchableOpacity>

      {/* Add Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingId ? 'تعديل بيانات العضو' : 'إضافة عضو مجلس'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: SPACING.md }}>
              
              <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
                {imageUri ? (
                  <Image source={{ uri: imageUri }} style={styles.previewImage} />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="camera-outline" size={32} color={COLORS.primary} />
                    <Text style={styles.imagePlaceholderText}>إضافة صورة العضو</Text>
                  </View>
                )}
              </TouchableOpacity>

              <CustomInput
                label="اسم العضو *"
                placeholder="الاسم الكامل"
                value={name}
                onChangeText={setName}
              />
              <CustomInput
                label="المنصب *"
                placeholder="مثال: رئيس البلدية، نائب الرئيس، عضو..."
                value={role}
                onChangeText={setRole}
              />
              <CustomInput
                label="نبذة تعريفية (اختياري)"
                placeholder="أعماله أو مؤهلاته..."
                value={bio}
                onChangeText={setBio}
              />
              <CustomInput
                label="الترتيب (رقم)"
                placeholder="1 لرئيس البلدية، 2 للنائب، إلخ لتنظيم الظهور"
                value={order}
                onChangeText={setOrder}
                keyboardType="numeric"
              />

              <CustomButton
                title={submitting ? "جاري الحفظ..." : "حفظ"}
                onPress={handleAddOrEdit}
                variant="primary"
                disabled={submitting}
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
  card: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, marginBottom: 12, flexDirection: 'row-reverse', alignItems: 'center' },
  cardImg: { width: 50, height: 50, borderRadius: 25, marginLeft: 12 },
  cardInfo: { flex: 1 },
  roleText: { fontSize: 12, color: COLORS.primary, textAlign: 'right', fontWeight: '700' },
  nameText: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'right' },
  actionsRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginRight: 12 },
  editBtn: { padding: 8, backgroundColor: COLORS.primaryLight, borderRadius: 8 },
  deleteBtn: { padding: 8, backgroundColor: '#FEE2E2', borderRadius: 8 },
  
  fab: { position: 'absolute', bottom: 30, left: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },
  
  imagePicker: { alignSelf: 'center', marginVertical: 16 },
  previewImage: { width: 100, height: 100, borderRadius: 50 },
  imagePlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.primary, borderStyle: 'dashed' },
  imagePlaceholderText: { fontSize: 12, color: COLORS.primary, marginTop: 4, fontWeight: '600' },

  emptyContainer: { paddingVertical: 80, alignItems: 'center', justifyContent: 'center' },
  emptyText: { marginTop: 16, fontSize: 16, color: COLORS.textMuted, fontWeight: '600' },
});
