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
  ActivityIndicator
} from 'react-native';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { createElectricityAlert, updateElectricityAlert } from '../../services/firestoreService';
import { COLORS, SPACING } from '../../config/theme';

export const AdminElectricityAlertFormScreen: React.FC<any> = ({ route, navigation }) => {
  const alertItem = route.params?.alert;
  
  const [area, setArea] = useState(alertItem?.area || '');
  const [estimatedTime, setEstimatedTime] = useState(alertItem?.estimatedTime || '');
  const [notes, setNotes] = useState(alertItem?.notes || '');
  const [status, setStatus] = useState<'investigating' | 'working' | 'resolved'>(alertItem?.status || 'investigating');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!area.trim() || !estimatedTime.trim()) {
      Alert.alert('تنبيه', 'يرجى تعبئة المنطقة والمدة المتوقعة');
      return;
    }
    
    setSaving(true);
    try {
      const data = { area: area.trim(), estimatedTime: estimatedTime.trim(), notes: notes.trim(), status };
      if (alertItem?.id) {
        await updateElectricityAlert(alertItem.id, data);
        Alert.alert('نجاح', 'تم تحديث التنبيه بنجاح');
      } else {
        await createElectricityAlert(data);
        Alert.alert('نجاح', 'تمت إضافة التنبيه بنجاح');
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert('خطأ', 'حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const StatusOption = ({ value, label }: { value: any, label: string }) => (
    <TouchableOpacity 
      style={[styles.statusBtn, status === value && styles.statusBtnActive]}
      onPress={() => setStatus(value)}
    >
      <Text style={[styles.statusBtnText, status === value && styles.statusBtnTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        
        <Text style={styles.title}>{alertItem ? 'تعديل التنبيه' : 'تنبيه عطل جديد'}</Text>
        
        <CustomInput
          label="المنطقة المتأثرة *"
          placeholder="مثال: الحي الشرقي، حارة كذا..."
          value={area}
          onChangeText={setArea}
        />

        <Text style={styles.label}>حالة العطل *</Text>
        <View style={styles.statusRow}>
          <StatusOption value="investigating" label="جاري الفحص" />
          <StatusOption value="working" label="جاري العمل عليها" />
          <StatusOption value="resolved" label="تم الإصلاح" />
        </View>

        <CustomInput
          label="المدة المتوقعة لحل العطل *"
          placeholder="مثال: ساعتين، بنهاية اليوم..."
          value={estimatedTime}
          onChangeText={setEstimatedTime}
        />

        <CustomInput
          label="ملاحظات وتفاصيل إضافية"
          placeholder="اكتب أي ملاحظات تود إعلام المواطنين بها..."
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        <CustomButton
          title={saving ? "جاري الحفظ..." : "حفظ ونشر التنبيه"}
          onPress={handleSave}
          disabled={saving}
          style={styles.saveBtn}
        />
        
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'right', marginBottom: 24 },
  
  label: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'right', marginBottom: 12 },
  statusRow: { flexDirection: 'row-reverse', gap: 8, marginBottom: 20 },
  statusBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface, alignItems: 'center' },
  statusBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  statusBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },
  statusBtnTextActive: { color: '#FFF' },

  saveBtn: { marginTop: 24 }
});
