import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert, 
  Modal 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { INITIAL_SERVICES } from '../services/firestoreService';
import { MunicipalService } from '../types';
import { CustomButton } from '../components/CustomButton';
import { CustomInput } from '../components/CustomInput';
import { COLORS, SPACING, SHADOWS } from '../config/theme';

export const MunicipalServicesScreen: React.FC = () => {
  const [selectedService, setSelectedService] = useState<MunicipalService | null>(null);
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  
  const [citizenNotes, setCitizenNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOpenRequest = (service: MunicipalService) => {
    setSelectedService(service);
    setRequestModalVisible(true);
  };

  const handleDownloadForm = (service: MunicipalService) => {
    Alert.alert(
      'تحميل الاستمارة',
      `تم تنزيل ${service.formName} بنجاح على جهازك. يمكنك طباعتها وتعبئتها.`
    );
  };

  const handleSubmitRequest = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setRequestModalVisible(false);
      setCitizenNotes('');
      Alert.alert(
        'تم تقديم الطلب بنجاح ✅',
        `تم تسجيل طلبك الخاص بـ (${selectedService?.title}). سيتم التواصل معك من قبل قسم قلم النفوس والخدمات.`
      );
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        <Text style={styles.headerTitle}>الخدمات والمعاملات البلدية 📄</Text>
        <Text style={styles.headerSub}>تقديم المعاملات وتصديق العقود والإفادات إلكترونياً</Text>
      </View>

      <FlatList
        data={INITIAL_SERVICES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listPadding}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={[styles.serviceCard, SHADOWS.medium]}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.iconCircle}>
                <Ionicons name={item.iconName as any} size={24} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.serviceTitle}>{item.title}</Text>
                <Text style={styles.serviceDesc}>{item.description}</Text>
              </View>
            </View>

            <View style={styles.docBox}>
              <Text style={styles.docBoxTitle}>📋 المستندات المطلوبة للمعاملة:</Text>
              {item.requiredDocuments.map((doc, idx) => (
                <View key={idx} style={styles.docItem}>
                  <Ionicons name="checkmark-circle-outline" size={14} color={COLORS.primary} style={{ marginLeft: 4 }} />
                  <Text style={styles.docText}>{doc}</Text>
                </View>
              ))}
            </View>

            <View style={styles.cardActions}>
              <CustomButton
                title="تنزيل الاستمارة 📥"
                onPress={() => handleDownloadForm(item)}
                variant="outline"
                size="small"
                style={{ flex: 1, marginLeft: 8 }}
              />
              <CustomButton
                title="تقديم طلب رقمي 🚀"
                onPress={() => handleOpenRequest(item)}
                variant="primary"
                size="small"
                style={{ flex: 1 }}
              />
            </View>
          </View>
        )}
      />

      {/* Request Digital Submission Modal */}
      <Modal visible={requestModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, SHADOWS.large]}>
            <TouchableOpacity 
              style={styles.closeBtn} 
              onPress={() => setRequestModalVisible(false)}
            >
              <Ionicons name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>تقديم طلب: {selectedService?.title}</Text>
            <Text style={styles.modalSub}>
              يرجى كتابة ملاحظات إضافية وتجهيز الصور الضوئية للمستندات المطلوبة.
            </Text>

            <CustomInput
              label="ملاحظات وتفاصيل الطلب"
              placeholder="اكتب ملاحظاتك لرئيس قسم المعاملات..."
              value={citizenNotes}
              onChangeText={setCitizenNotes}
              multiline
              numberOfLines={3}
              style={{ height: 80, textAlignVertical: 'top' }}
            />

            <CustomButton
              title="إرسال المعاملة إلى البلدية 📤"
              onPress={handleSubmitRequest}
              loading={loading}
              variant="primary"
              size="large"
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topHeader: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primaryDark,
    textAlign: 'right',
  },
  headerSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginTop: 2,
  },
  listPadding: {
    padding: SPACING.md,
  },
  serviceCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderRightWidth: 4,
    borderRightColor: COLORS.primary,
  },
  cardHeaderRow: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'right',
  },
  serviceDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginTop: 2,
  },
  docBox: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    padding: 10,
    marginVertical: 10,
  },
  docBoxTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
    textAlign: 'right',
    marginBottom: 6,
  },
  docItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 2,
  },
  docText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    textAlign: 'right',
  },
  cardActions: {
    flexDirection: 'row-reverse',
    marginTop: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    padding: SPACING.md,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.lg,
  },
  closeBtn: {
    alignSelf: 'flex-start',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'right',
    marginBottom: 4,
  },
  modalSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginBottom: SPACING.md,
  },
});
