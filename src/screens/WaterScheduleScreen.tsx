import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WaterScheduleItem, WaterFault } from '../types';
import { subscribeWaterSchedule, subscribeWaterFaults } from '../services/firestoreService';
import { registerForPushNotificationsAsync } from '../services/notificationService';
import { StatusBadge } from '../components/StatusBadge';
import { CustomInput } from '../components/CustomInput';
import { COLORS, SPACING, SHADOWS } from '../config/theme';

export const WaterScheduleScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'faults'>('schedule');
  const [scheduleItems, setScheduleItems] = useState<WaterScheduleItem[]>([]);
  const [faults, setFaults] = useState<WaterFault[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [pushToken, setPushToken] = useState<string | null>(null);

  useEffect(() => {
    // 1. Subscribe to schedules
    const unsubSchedule = subscribeWaterSchedule((items) => {
      setScheduleItems(items);
    });
    
    // 2. Subscribe to faults
    const unsubFaults = subscribeWaterFaults((items) => {
      setFaults(items);
    });

    return () => {
      unsubSchedule();
      unsubFaults();
    };
  }, []);

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      // Trying to enable
      const token = await registerForPushNotificationsAsync();
      if (token) {
        setPushToken(token);
        setNotificationsEnabled(true);
        Alert.alert('تم تفعيل التنبيهات 🔔', 'ستتلقى إشعاراً فور بدء ضخ المياه أو حدوث أي طارئ.');
      } else {
        Alert.alert('تنبيه', 'يرجى إعطاء صلاحية الإشعارات من إعدادات الهاتف لتفعيل هذه الميزة.');
      }
    } else {
      // Disabling
      setNotificationsEnabled(false);
      Alert.alert('تم إيقاف التنبيهات', 'لن تتلقى إشعارات حول أدوار المياه بعد الآن.');
    }
  };

  const filteredSchedule = scheduleItems.filter(item => 
    item.neighborhood.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderScheduleTab = () => (
    <FlatList
      data={filteredSchedule}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listPadding}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <View style={[styles.card, SHADOWS.medium]}>
          <View style={styles.cardHeader}>
            <StatusBadge type="water" status={item.status} customText={item.statusText} />
            <Text style={styles.neighborhoodName}>{item.neighborhood}</Text>
          </View>

          <View style={styles.timeGridVertical}>
            <View style={styles.timeRow}>
              <Text style={styles.timeLabel}>اليوم والتاريخ:</Text>
              <Text style={styles.timeValHighlight}>
                {item.expectedPumpingDay || 'مجدول'}
                {item.expectedDate ? ` (${item.expectedDate})` : ''}
              </Text>
            </View>
            <View style={styles.timeDivider} />
            <View style={styles.timeRow}>
              <Text style={styles.timeLabel}>ساعات الضخ:</Text>
              <Text style={styles.timeVal}>{item.startTime} - {item.endTime}</Text>
            </View>
            <View style={styles.timeDivider} />
            <View style={styles.timeRow}>
              <Text style={styles.timeLabel}>الحالة:</Text>
              <Text style={[styles.timeVal, { color: item.status === 'active' ? '#059669' : COLORS.textPrimary }]}>
                {item.statusText}
              </Text>
            </View>
          </View>

          {item.notes && (
            <View style={styles.notesBox}>
              <Text style={styles.notesLabel}>ملاحظات:</Text>
              <Text style={styles.notesText}>{item.notes}</Text>
            </View>
          )}
        </View>
      )}
    />
  );

  const renderFaultsTab = () => (
    <FlatList
      data={faults}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listPadding}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <View style={[styles.faultCard, SHADOWS.medium]}>
          <View style={styles.faultHeader}>
            <View style={[styles.faultStatus, { backgroundColor: item.status === 'resolved' ? '#D1FAE5' : '#FFE4E6' }]}>
              <Text style={[styles.faultStatusText, { color: item.status === 'resolved' ? '#059669' : '#E11D48' }]}>
                {item.status === 'resolved' ? 'تم الإصلاح' : 'جاري الإصلاح'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row-reverse', alignItems: 'center' }}>
              <Ionicons name="warning-outline" size={18} color="#E11D48" style={{ marginLeft: 6 }} />
              <Text style={styles.faultTitle}>{item.title}</Text>
            </View>
          </View>

          <Text style={styles.faultDesc}>{item.description}</Text>
          
          <View style={styles.reasonBox}>
            <View style={styles.faultDetailRow}>
              <Text style={styles.reasonLabel}>مكان العطل:</Text>
              <Text style={styles.reasonText}>{item.location}</Text>
            </View>
            <View style={styles.faultDetailRow}>
              <Text style={styles.reasonLabel}>تاريخ العطل:</Text>
              <Text style={styles.reasonText}>{item.date}</Text>
            </View>
            <View style={styles.faultDetailRow}>
              <Text style={styles.reasonLabel}>سبب العطل:</Text>
              <Text style={styles.reasonText}>{item.reason}</Text>
            </View>
            {item.notes && (
              <View style={styles.faultDetailRow}>
                <Text style={styles.reasonLabel}>ملاحظات:</Text>
                <Text style={styles.reasonText}>{item.notes}</Text>
              </View>
            )}
          </View>
        </View>
      )}
    />
  );

  return (
    <View style={styles.container}>
      {/* Header Banner */}
      <View style={styles.topHeader}>
        <View style={styles.headerTitleRow}>
          <TouchableOpacity 
            style={[
              styles.notifyBtn, 
              notificationsEnabled && styles.notifyBtnActive
            ]}
            onPress={toggleNotifications}
          >
            <Ionicons 
              name={notificationsEnabled ? "notifications" : "notifications-off-outline"} 
              size={18} 
              color={notificationsEnabled ? "#FFFFFF" : COLORS.primary} 
            />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>جدول توزيع المياه 💧</Text>
            <Text style={styles.headerSub}>مواعيد وأيام ضخ المياه للأحياء</Text>
          </View>
        </View>
      </View>

      {/* Search */}
      <View style={{ paddingHorizontal: SPACING.md }}>
        <CustomInput
          placeholder="ابحث عن اسم حيك..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          iconName="search-outline"
          containerStyle={{ marginBottom: 0, marginTop: 12 }}
        />
      </View>

      {/* Content */}
      {renderScheduleTab()}
      
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
  headerTitleRow: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.primaryDark,
    textAlign: 'center',
  },
  headerSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  notifyBtn: {
    position: 'absolute',
    left: SPACING.md,
    top: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifyBtnActive: {
    backgroundColor: COLORS.primary,
  },
  tabsContainer: {
    flexDirection: 'row-reverse',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 10,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    position: 'relative',
  },
  tabBtnActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  redDot: {
    position: 'absolute',
    top: 6,
    left: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E11D48',
  },
  listPadding: {
    padding: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderRightWidth: 4,
    borderRightColor: COLORS.primary,
  },
  cardHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  neighborhoodName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'right',
  },
  timeGridVertical: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  timeRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 4,
  },
  timeDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 6,
  },
  timeLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'right',
    marginLeft: 6,
  },
  timeVal: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  timeValHighlight: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  notesBox: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    marginTop: 4,
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textAlign: 'right',
    marginLeft: 6,
    width: 65,
  },
  notesText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'right',
    flex: 1,
  },
  faultCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderRightWidth: 4,
    borderRightColor: '#E11D48',
  },
  faultHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  faultTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'right',
  },
  faultStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  faultStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  faultDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginBottom: 12,
    lineHeight: 18,
  },
  reasonBox: {
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  faultDetailRow: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
  },
  reasonLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textAlign: 'right',
    marginLeft: 6,
    width: 75,
  },
  reasonText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    textAlign: 'right',
    flex: 1,
  },
  faultDate: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'left',
    marginTop: 8,
  }
});
