import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING } from '../../config/theme';
import { MunicipalProject } from '../../types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { addAdminProject, updateAdminProject, deleteAdminProject } from '../../services/firestoreService';

export const AdminProjectFormScreen: React.FC<any> = ({ route, navigation }) => {
  const projectId = route.params?.projectId; // if undefined, we are creating a new project
  
  const [loading, setLoading] = useState(!!projectId);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [budget, setBudget] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<'planned' | 'in_progress' | 'completed' | 'suggested'>('planned');
  const [progress, setProgress] = useState('0'); // stored as number, but text input uses string
  const [isApproved, setIsApproved] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) return;
      try {
        const docSnap = await getDoc(doc(db, 'projects', projectId));
        if (docSnap.exists()) {
          const data = docSnap.data() as MunicipalProject;
          setTitle(data.title || '');
          setDescription(data.description || '');
          setCategory(data.category || '');
          setBudget(data.budget || '');
          setStartDate(data.startDate || '');
          setEndDate(data.endDate || '');
          setStatus(data.status || 'planned');
          setProgress(String(data.progressPercentage || 0));
          setIsApproved(data.isApproved || false);
          setImages(data.images || []);
        }
      } catch (e) {
        Alert.alert('خطأ', 'تعذر جلب تفاصيل المشروع');
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [projectId]);

  const handleAddImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('صلاحية مطلوبة', 'التطبيق يحتاج إلى صلاحية الوصول للصور لإضافة مرفقات.');
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

  const handleSave = async () => {
    if (!title.trim() || !category.trim()) {
      Alert.alert('خطأ', 'الرجاء إدخال اسم وتصنيف المشروع');
      return;
    }

    setSaving(true);
    const progressNum = Math.min(Math.max(parseInt(progress) || 0, 0), 100);
    
    // Status text generator
    const getStatusText = (st: string) => {
      if (st === 'completed') return 'اكتمل المشروع';
      if (st === 'in_progress') return 'العمل جارٍ';
      if (st === 'planned') return 'قيد التخطيط';
      return 'مقترح';
    };

    const projectData = {
      title,
      description,
      category,
      budget,
      startDate: startDate || new Date().toLocaleDateString('ar-EG'),
      endDate,
      status,
      statusText: getStatusText(status),
      progressPercentage: status === 'completed' ? 100 : progressNum,
      isApproved,
      images
    };

    try {
      if (projectId) {
        await updateAdminProject(projectId, projectData);
        Alert.alert('نجاح', 'تم تحديث المشروع بنجاح');
      } else {
        await addAdminProject(projectData);
        Alert.alert('نجاح', 'تم إضافة المشروع بنجاح');
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert('خطأ', 'حدث خطأ أثناء حفظ المشروع');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('تأكيد الحذف', 'هل أنت متأكد من حذف هذا المشروع نهائياً؟', [
      { text: 'إلغاء', style: 'cancel' },
      { 
        text: 'حذف', 
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await deleteAdminProject(projectId!);
            Alert.alert('نجاح', 'تم الحذف بنجاح');
            navigation.goBack();
          } catch (e) {
            Alert.alert('خطأ', 'حدث خطأ أثناء الحذف');
          } finally {
            setDeleting(false);
          }
        }
      }
    ]);
  };

  const StatusOption = ({ value, label }: { value: string, label: string }) => (
    <TouchableOpacity 
      style={[styles.statusOption, status === value && styles.statusOptionActive]}
      onPress={() => setStatus(value as any)}
    >
      <Text style={[styles.statusOptionText, status === value && styles.statusOptionTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {status === 'suggested' && (
          <View style={styles.suggestionAlert}>
            <Ionicons name="information-circle" size={24} color="#9333EA" />
            <Text style={styles.suggestionAlertText}>هذا مقترح من مواطن. يمكنك دراسته، وتعديل بياناته، ثم الضغط على الزر أدناه لنشره كـ "مقترح معتمد" ليراه الناس في التطبيق.</Text>
          </View>
        )}

        <Text style={styles.label}>اسم المشروع</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="أدخل اسم المشروع"
          textAlign="right"
        />

        <Text style={styles.label}>التصنيف / القسم</Text>
        <TextInput
          style={styles.input}
          value={category}
          onChangeText={setCategory}
          placeholder="مثال: البنية التحتية، المرافق، التشجير"
          textAlign="right"
        />

        <Text style={styles.label}>التفاصيل والوصف</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="اشرح تفاصيل المشروع..."
          textAlign="right"
          multiline
        />

        <Text style={styles.label}>صور المشروع</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imagesRow}>
          <TouchableOpacity style={styles.addImageBtn} onPress={handleAddImage}>
            <Ionicons name="camera-outline" size={28} color={COLORS.primary} />
            <Text style={styles.addImageText}>إضافة</Text>
          </TouchableOpacity>
          {images.map((uri, idx) => (
            <View key={idx} style={styles.imageThumbnailWrapper}>
              <Image source={{ uri }} style={styles.imageThumbnail} />
              <TouchableOpacity style={styles.removeImageBtn} onPress={() => handleRemoveImage(idx)}>
                <Ionicons name="close-circle" size={20} color={COLORS.danger} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        <View style={styles.row}>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.label}>تاريخ البدء</Text>
            <TextInput
              style={styles.input}
              value={startDate}
              onChangeText={setStartDate}
              placeholder="مثال: 2026/08/10"
              textAlign="right"
            />
          </View>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>تاريخ الانتهاء</Text>
            <TextInput
              style={styles.input}
              value={endDate}
              onChangeText={setEndDate}
              placeholder="مثال: 2027/01/01"
              textAlign="right"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>الميزانية (اختياري)</Text>
            <TextInput
              style={styles.input}
              value={budget}
              onChangeText={setBudget}
              placeholder="مثال: 50,000"
              textAlign="right"
            />
          </View>
        </View>

        <Text style={styles.label}>حالة المشروع</Text>
        <View style={styles.statusGrid}>
          {status === 'suggested' && <StatusOption value="suggested" label="مقترح للدراسة" />}
          <StatusOption value="planned" label="مخطط له" />
          <StatusOption value="in_progress" label="قيد التنفيذ" />
          <StatusOption value="completed" label="مكتمل" />
        </View>

        {status === 'in_progress' && (
          <View>
            <Text style={styles.label}>نسبة الإنجاز (%)</Text>
            <TextInput
              style={styles.input}
              value={progress}
              onChangeText={setProgress}
              keyboardType="numeric"
              maxLength={3}
              textAlign="right"
            />
          </View>
        )}

        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.saveBtn, saving && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={saving || deleting}
          >
            {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>حفظ المشروع</Text>}
          </TouchableOpacity>

          {status === 'suggested' && !isApproved && (
             <TouchableOpacity 
               style={[styles.approveBtn, saving && { opacity: 0.7 }]}
               onPress={() => {
                 setIsApproved(true);
                 // handleSave will be called after state updates, so let's just alert the user to click save
                 Alert.alert('تنبيه', 'تم تمييز المقترح كـ "مقبول"، اضغط "حفظ المشروع" لتأكيد النشر.');
               }}
               disabled={saving || deleting}
             >
               <Ionicons name="checkmark-circle-outline" size={24} color="#FFF" />
             </TouchableOpacity>
          )}

          {projectId && (
            <TouchableOpacity 
              style={[styles.deleteBtn, deleting && { opacity: 0.7 }]}
              onPress={handleDelete}
              disabled={saving || deleting}
            >
              <Ionicons name="trash-outline" size={24} color={COLORS.danger} />
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: SPACING.lg, paddingBottom: 60 },

  suggestionAlert: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: '#F3E8FF', padding: 12, borderRadius: 12, marginBottom: 16 },
  suggestionAlertText: { flex: 1, fontSize: 12, color: '#9333EA', textAlign: 'right', marginRight: 8, lineHeight: 18 },

  label: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'right', marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 14, fontSize: 14, color: COLORS.textPrimary },
  textArea: { height: 100, textAlignVertical: 'top' },
  row: { flexDirection: 'row-reverse' },
  
  imagesRow: { flexDirection: 'row-reverse', gap: 10, paddingVertical: 8 },
  addImageBtn: { width: 80, height: 80, borderRadius: 12, borderWidth: 1, borderColor: COLORS.primary, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F9FF' },
  addImageText: { fontSize: 11, color: COLORS.primary, marginTop: 4, fontWeight: '700' },
  imageThumbnailWrapper: { width: 80, height: 80, borderRadius: 12, overflow: 'hidden', position: 'relative' },
  imageThumbnail: { width: '100%', height: '100%', resizeMode: 'cover' },
  removeImageBtn: { position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 10 },

  statusGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 },
  statusOption: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, backgroundColor: '#FFF' },
  statusOptionActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  statusOptionText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  statusOptionTextActive: { color: '#FFF' },

  actionsContainer: { flexDirection: 'row-reverse', alignItems: 'center', marginTop: 32, gap: 12 },
  saveBtn: { flex: 1, backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  approveBtn: { backgroundColor: '#10B981', width: 56, height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  deleteBtn: { backgroundColor: '#FEE2E2', width: 56, height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }
});
