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
import { ElectricityScheduleItem } from '../types';
import { subscribeElectricitySchedule } from '../services/firestoreService';
import { registerForPushNotificationsAsync } from '../services/notificationService';
import { StatusBadge } from '../components/StatusBadge';
import { CustomInput } from '../components/CustomInput';
import { COLORS, SPACING, SHADOWS } from '../config/theme';

export const ElectricitySchedulesScreen: React.FC = () => {
  const [scheduleItems, setScheduleItems] = useState<ElectricityScheduleItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [pushToken, setPushToken] = useState<string | null>(null);

  useEffect(() => {
    const unsubSchedule = subscribeElectricitySchedule((items) => {
      setScheduleItems(items);
    });

    return () => {
      unsubSchedule();
    };
  }, []);

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        setPushToken(token);
        setNotificationsEnabled(true);
        Alert.alert('تم تفعيل التنبيهات 🔔', 'ستتلقى إشعاراً حول جداول الانقطاع في حيك.');
      } else {
        Alert.alert('تنبيه', 'يرجى إعطاء صلاحية الإشعارات من إعدادات الهاتف لتفعيل هذه الميزة.');
      }
    } else {
      setNotificationsEnabled(false);
      Alert.alert('تم إيقاف التنبيهات', 'لن تتلقى إشعارات حول جداول الكهرباء بعد الآن.');
    }
  };

  const filteredSchedule = scheduleItems.filter(item => 
    item.neighborhood.toLowerCase().includes(searchQuery.toLowerCase())
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
            <Text style={styles.headerTitle}>جداول انقطاع الكهرباء ⚡</Text>
            <Text style={styles.headerSub}>مواعيد القطع والتوصيل المبرمجة للأحياء</Text>
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
      <FlatList
        data={filteredSchedule}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listPadding}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={[styles.card, SHADOWS.medium]}>
            <View style={styles.cardHeader}>
              <StatusBadge type="electricity" status={item.status} customText={item.statusText} />
              <Text style={styles.neighborhoodName}>{item.neighborhood}</Text>
            </View>

            <View style={styles.timeGridVertical}>
              <View style={styles.timeRow}>
                <Text style={styles.timeLabel}>اليوم والتاريخ:</Text>
                <Text style={styles.timeValHighlight}>
                  {item.expectedDay || 'مجدول'}
                  {item.expectedDate ? ` (${item.expectedDate})` : ''}
                </Text>
              </View>
              <View style={styles.timeDivider} />
              <View style={styles.timeRow}>
                <Text style={styles.timeLabel}>ساعات القطع:</Text>
                <Text style={styles.timeVal}>{item.cutoffTime} - {item.expectedReturnTime}</Text>
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
    color: '#F59E0B', // Orange/Yellowish for electricity
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
  listPadding: {
    padding: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderRightWidth: 4,
    borderRightColor: '#F59E0B',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  neighborhoodName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'left',
  },
  timeGridVertical: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  timeRow: {
    flexDirection: 'row',
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
    textAlign: 'left',
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
    flexDirection: 'row',
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
    textAlign: 'left',
    marginLeft: 6,
    width: 65,
  },
  notesText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'left',
    flex: 1,
  },
});
