import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS } from '../config/theme';

const { width } = Dimensions.get('window');

export const CouncilMemberDetailsScreen: React.FC<any> = ({ route, navigation }) => {
  const { member } = route.params;
  const [viewerVisible, setViewerVisible] = useState(false);

  return (
    <View style={styles.container}>
      {/* Header Image */}
      <View style={styles.imageContainer}>
        <TouchableOpacity activeOpacity={0.9} onPress={() => setViewerVisible(true)} style={{ width: '100%', height: '100%' }}>
          <Image 
            source={{ uri: member.image || 'https://via.placeholder.com/400' }} 
            style={styles.headerImage} 
            resizeMode="cover" 
          />
          <View style={styles.headerOverlay} pointerEvents="none" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Name and Role - Redesigned to be right-aligned and professional */}
        <View style={styles.headerInfo}>
          <Text style={styles.nameText}>{member.name}</Text>
          <Text style={styles.roleText}>{member.role}</Text>
        </View>

        {/* Biography */}
        {member.bio ? (
          <View style={styles.bioSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>نبذة تعريفية</Text>
              <Ionicons name="document-text-outline" size={22} color={COLORS.primary} />
            </View>
            <Text style={styles.bioText}>{member.bio}</Text>
          </View>
        ) : null}
      </ScrollView>

      {/* Image Viewer Modal */}
      <Modal visible={viewerVisible} transparent={true} animationType="fade" onRequestClose={() => setViewerVisible(false)}>
        <View style={styles.viewerContainer}>
          <TouchableOpacity style={styles.viewerClose} onPress={() => setViewerVisible(false)}>
            <Ionicons name="close" size={32} color="#FFF" />
          </TouchableOpacity>
          <View style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
            <Image 
              source={{ uri: member.image || 'https://via.placeholder.com/400' }} 
              style={{ width: '100%', height: '100%' }} 
              resizeMode="contain" 
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
  imageContainer: {
    width: '100%',
    height: 400, // Taller image to capture more of the person
    position: 'relative',
    backgroundColor: '#000', // Black background so contained image looks good
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)', // Very light overlay just for text readability if needed
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  headerInfo: {
    marginBottom: SPACING.xl,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    alignItems: 'flex-end',
  },
  nameText: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.textPrimary,
    textAlign: 'right',
    marginBottom: 8,
  },
  roleText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '700',
    textAlign: 'right',
  },
  bioSection: {
    // Removed the floating card look, making it a clean native section
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  bioText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'right',
    lineHeight: 28, // Improved readability
  },

  viewerContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)' },
  viewerClose: { position: 'absolute', top: 50, right: 20, zIndex: 10, padding: 8 },
});
