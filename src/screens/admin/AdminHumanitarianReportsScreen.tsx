import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Modal, Alert, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS } from '../../config/theme';
import { subscribeHumanitarianReports, updateHumanitarianReport, deleteHumanitarianReport } from '../../services/firestoreService';
import { HumanitarianReport } from '../../types';

export const AdminHumanitarianReportsScreen: React.FC<any> = ({ navigation }) => {
  const [reports, setReports] = useState<HumanitarianReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<HumanitarianReport | null>(null);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    const unsub = subscribeHumanitarianReports(setReports);
    return () => unsub();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string, reason?: string) => {
    try {
      const dataToUpdate: any = { status: newStatus };
      if (reason !== undefined) {
        dataToUpdate.rejectionReason = reason;
      }
      await updateHumanitarianReport(id, dataToUpdate);
      setRejecting(false);
      setRejectionReason('');
      setSelectedReport(null);
    } catch (error) {
      console.error(error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تحديث الحالة.');
    }
  };

  const handleDelete = async (reportId: string) => {
    Alert.alert('تأكيد الحذف', 'هل أنت متأكد من حذف هذا البلاغ؟', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: async () => {
        try {
          await deleteHumanitarianReport(reportId);
          setSelectedReport(null);
        } catch (error) {
          Alert.alert('خطأ', 'فشل الحذف.');
        }
      }}
    ]);
  };

  const renderStatus = (status: string) => {
    switch (status) {
      case 'pending': return <Text style={[styles.badge, { backgroundColor: '#FEF3C7', color: '#B45309' }]}>قيد الانتظار</Text>;
      case 'reviewed': return <Text style={[styles.badge, { backgroundColor: '#E0E7FF', color: '#4338CA' }]}>قيد المراجعة والتحقق</Text>;
      case 'approved': return <Text style={[styles.badge, { backgroundColor: '#D1FAE5', color: '#047857' }]}>مقبول</Text>;
      case 'rejected': return <Text style={[styles.badge, { backgroundColor: '#FEE2E2', color: '#B91C1C' }]}>مرفوض</Text>;
      default: return null;
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={reports}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: SPACING.md, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.card, SHADOWS.small]} onPress={() => setSelectedReport(item)}>
            <View style={styles.cardHeader}>
              <Text style={styles.title}>{item.title}</Text>
              {renderStatus(item.status)}
            </View>
            <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
            <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString('ar-EG')}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Details Modal */}
      <Modal visible={!!selectedReport} animationType="slide" transparent={true}>
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedReport(null)}>
                <Ionicons name="close" size={28} color={COLORS.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>تفاصيل البلاغ</Text>
            </View>

            {selectedReport && (
              <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                {selectedReport.reporterName && (
                  <>
                    <Text style={styles.detailLabel}>اسم المُبلِّغ:</Text>
                    <Text style={styles.detailText}>{selectedReport.reporterName}</Text>
                  </>
                )}

                {selectedReport.contactInfo && (
                  <>
                    <Text style={styles.detailLabel}>رقم هاتف / كيفية التواصل مع الحالة:</Text>
                    <Text style={styles.detailText}>{selectedReport.contactInfo}</Text>
                  </>
                )}

                <Text style={styles.detailLabel}>عنوان البلاغ:</Text>
                <Text style={styles.detailText}>{selectedReport.title}</Text>

                <Text style={styles.detailLabel}>التفاصيل:</Text>
                <Text style={styles.detailText}>{selectedReport.description}</Text>

                <Text style={styles.detailLabel}>الاحتياجات:</Text>
                <Text style={styles.detailText}>{selectedReport.needs}</Text>

                {selectedReport.images && selectedReport.images.length > 0 && (
                  <>
                    <Text style={styles.detailLabel}>المرفقات (صور):</Text>
                    <FlatList
                      data={selectedReport.images}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      keyExtractor={(i, idx) => idx.toString()}
                      renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => setFullScreenImage(item)}>
                          <Image source={{ uri: item }} style={styles.reportImage} resizeMode="cover" />
                        </TouchableOpacity>
                      )}
                    />
                  </>
                )}

                {selectedReport.status === 'rejected' && selectedReport.rejectionReason && (
                  <>
                    <Text style={styles.detailLabel}>سبب الرفض:</Text>
                    <Text style={[styles.detailText, { color: COLORS.danger }]}>{selectedReport.rejectionReason}</Text>
                  </>
                )}

                <View style={styles.actionsContainer}>
                  <Text style={styles.detailLabel}>تغيير الحالة:</Text>
                  
                  {rejecting ? (
                    <View style={styles.rejectionContainer}>
                      <TextInput
                        style={styles.rejectionInput}
                        placeholder="اكتب سبب الرفض هنا..."
                        value={rejectionReason}
                        onChangeText={setRejectionReason}
                        multiline
                      />
                      <View style={styles.statusRow}>
                        <TouchableOpacity style={[styles.statusBtn, { backgroundColor: COLORS.danger }]} onPress={() => handleStatusChange(selectedReport.id, 'rejected', rejectionReason)}>
                          <Text style={styles.statusBtnText}>تأكيد الرفض</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.statusBtn, { backgroundColor: COLORS.border }]} onPress={() => setRejecting(false)}>
                          <Text style={[styles.statusBtnText, { color: COLORS.textPrimary }]}>إلغاء</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.statusRow}>
                      <TouchableOpacity style={styles.statusBtn} onPress={() => handleStatusChange(selectedReport.id, 'reviewed')}>
                        <Text style={styles.statusBtnText}>قيد المراجعة والتحقق</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.statusBtn, { backgroundColor: COLORS.success }]} onPress={() => handleStatusChange(selectedReport.id, 'approved')}>
                        <Text style={styles.statusBtnText}>مقبول</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.statusBtn, { backgroundColor: COLORS.danger }]} onPress={() => setRejecting(true)}>
                        <Text style={styles.statusBtnText}>مرفوض</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  
                  {!rejecting && (
                    <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(selectedReport.id)}>
                      <Ionicons name="trash-outline" size={20} color="#FFF" />
                      <Text style={styles.deleteBtnText}>حذف البلاغ نهائياً</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Full Screen Image Modal */}
      <Modal visible={!!fullScreenImage} transparent={true} animationType="fade" onRequestClose={() => setFullScreenImage(null)}>
        <View style={styles.fullScreenModalBg}>
          <TouchableOpacity style={styles.closeModalBtn} onPress={() => setFullScreenImage(null)}>
            <Ionicons name="close-circle" size={40} color="#FFF" />
          </TouchableOpacity>
          {fullScreenImage && (
            <Image source={{ uri: fullScreenImage }} style={styles.fullScreenImg} resizeMode="contain" />
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  card: { backgroundColor: '#FFF', padding: 16, borderRadius: 12, marginBottom: 12 },
  cardHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, flex: 1, textAlign: 'right', marginLeft: 8 },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, fontSize: 12, fontWeight: '700', overflow: 'hidden' },
  desc: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'right', marginBottom: 8 },
  date: { fontSize: 12, color: COLORS.textMuted, textAlign: 'right' },

  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', height: '85%', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  modalHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },
  
  detailLabel: { fontSize: 14, color: COLORS.textMuted, textAlign: 'right', marginBottom: 4, marginTop: 12 },
  detailText: { fontSize: 16, color: COLORS.textPrimary, textAlign: 'right', fontWeight: '500' },
  
  reportImage: { width: 100, height: 100, borderRadius: 8, marginLeft: 12, marginTop: 8, backgroundColor: '#F1F5F9' },
  
  actionsContainer: { marginTop: 24, borderTopWidth: 1, borderColor: COLORS.border, paddingTop: 16 },
  statusRow: { flexDirection: 'row-reverse', gap: 12, marginBottom: 16 },
  statusBtn: { flex: 1, backgroundColor: COLORS.primary, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  statusBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13, textAlign: 'center' },
  deleteBtn: { flexDirection: 'row-reverse', backgroundColor: COLORS.danger, paddingVertical: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center', gap: 8 },
  deleteBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },

  rejectionContainer: { marginTop: 8 },
  rejectionInput: { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12, textAlign: 'right', fontSize: 14, minHeight: 80, marginBottom: 12, textAlignVertical: 'top' },

  fullScreenModalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center', paddingBottom: 60 },
  closeModalBtn: { position: 'absolute', top: 50, right: 20, zIndex: 10, padding: 8 },
  fullScreenImg: { width: '90%', height: '60%', borderRadius: 16 }
});
