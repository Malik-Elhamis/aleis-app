import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView 
} from 'react-native';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { LocationCoords } from '../types';
import { CustomButton } from './CustomButton';
import { COLORS, SPACING, SHADOWS } from '../config/theme';

interface MapPickerModalProps {
  visible: boolean;
  initialCoords?: LocationCoords;
  onConfirm: (location: LocationCoords) => void;
  onClose: () => void;
}

export const MapPickerModal: React.FC<MapPickerModalProps> = ({
  visible,
  initialCoords,
  onConfirm,
  onClose,
}) => {
  // Default coordinates centered on Al-Eis municipality region (Aleppo)
  const [selectedCoords, setSelectedCoords] = useState<LocationCoords>(
    initialCoords || {
      latitude: 35.9944,
      longitude: 36.9986,
      address: 'العيس - حلب',
    }
  );

  const handleMapPress = (e: MapPressEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setSelectedCoords({
      latitude,
      longitude,
      address: `موقع محدد (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
    });
  };

  const handleConfirm = () => {
    onConfirm(selectedCoords);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>تحديد موقع البلاغ على الخريطة</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: selectedCoords.latitude,
              longitude: selectedCoords.longitude,
              latitudeDelta: 0.015,
              longitudeDelta: 0.015,
            }}
            onPress={handleMapPress}
          >
            <Marker
              coordinate={{
                latitude: selectedCoords.latitude,
                longitude: selectedCoords.longitude,
              }}
              title="موقع البلاغ المحدد"
              description="اضغط في أي مكان لتغيير المكان"
              draggable
              onDragEnd={(e) => {
                const { latitude, longitude } = e.nativeEvent.coordinate;
                setSelectedCoords({ latitude, longitude, address: selectedCoords.address });
              }}
            />
          </MapView>

          <View style={[styles.infoFloatingCard, SHADOWS.medium]}>
            <View style={styles.infoRow}>
              <Ionicons name="location-sharp" size={24} color={COLORS.primary} style={{ marginLeft: 8 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoTitle}>الموقع المختار:</Text>
                <Text style={styles.infoCoords}>
                  خط العرض: {selectedCoords.latitude.toFixed(5)} | خط الطول: {selectedCoords.longitude.toFixed(5)}
                </Text>
              </View>
            </View>
            <Text style={styles.hintText}>* انقر على الخريطة أو اسحب العلامة لتغيير المكان المظبوط</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <CustomButton
            title="تأكيد موقع البلاغ 📍"
            onPress={handleConfirm}
            variant="primary"
            size="large"
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  closeBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  infoFloatingCard: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    borderRightWidth: 4,
    borderRightColor: COLORS.primary,
  },
  infoRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'right',
  },
  infoCoords: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginTop: 2,
  },
  hintText: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'right',
    marginTop: 6,
  },
  footer: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});
