import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions,
  Animated
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { CurvedFlagHeader } from '../components/CurvedFlagHeader';
import { getUrgentAlerts } from '../services/firestoreService';
import { UrgentAlert } from '../types';

const { width, height } = Dimensions.get('window');

const HERO_HEIGHT = height * 0.32; 
const LOGO_SIZE = 100;

// --- Design Tokens (Modern Civic Soft UI) ---
const TOKENS = {
  PrimaryGreen: '#0F7A5A',
  PrimarySoft: '#EAF7F1',
  SecondaryGreen: '#36A77B',
  WarmBackground: '#FAF8F3',
  CardBackground: '#FFFFFF',
  AccentRed: '#E34A4A',
  Charcoal: '#273036',
  CharcoalLight: '#343E44',
  
  // Section Backgrounds for Subtle Flag Representation
  BgGreenSection: '#F4FBF7',
  BgStarSection: '#FFF9F9',
  BgDarkSection: '#F3F4F5',
};

const ALL_SERVICES = [
  // --- Group 1: Green (1 to 6) ---
  { id: '1', title: 'أخبار البلدية', icon: 'newspaper-outline', route: 'NewsHub' },
  { id: '2', title: 'خدمات إلكترونية', icon: 'desktop-outline', route: 'Services' },
  { id: '3', title: 'خدمات المياه', icon: 'water-outline', route: 'WaterHub' },
  { id: '4', title: 'الكهرباء', icon: 'flash-outline', route: 'ElectricityHub' },
  { id: '5', title: 'المشاريع', icon: 'construct-outline', route: 'Projects' },
  { id: '6', title: 'النظافة', icon: 'leaf-outline', route: 'CleanlinessHub' },

  // --- Group 2: Red Stars (7 to 9) ---
  { id: '7', title: 'شكاوى ومخالفات', icon: 'warning-outline', route: 'ComplaintsViolationsHub' },
  { id: '8', title: 'اقتراحات', icon: 'bulb-outline', route: 'SuggestionsHub' },
  { id: '9', title: 'دليل العيس', icon: 'location-outline', route: 'Aleis' },

  // --- Group 3: Dark/Black (10 to 15) ---
  { id: '10', title: 'حالات إنسانية', icon: 'people-outline', route: 'Humanitarian' },
  { id: 'dn', title: 'تبرعات', icon: 'heart-outline', route: 'Donations' },
  { id: '11', title: 'وفيات', icon: 'moon-outline', route: 'Obituaries' },
  { id: '12', title: 'مجلس البلدية', icon: 'business-outline', route: 'Council' },
  { id: '14', title: 'اسأل البلدية', icon: 'chatbubbles-outline', route: 'AskMunicipalityHub' },
  { id: '15', title: 'طوارئ', icon: 'call-outline', route: 'Emergency' },
];

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const ServiceCard = ({ item, themeGroup, onPress }: { item: any, themeGroup: 'green'|'star'|'dark', onPress: (route: string) => void }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(scaleAnim, { toValue: 0.97, duration: 120, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true }).start();
  };

  let isDark = themeGroup === 'dark';
  let isStar = themeGroup === 'star';
  
  let iconColor = isDark ? '#FFFFFF' : (isStar ? TOKENS.Charcoal : TOKENS.PrimaryGreen);
  let textColor = isDark ? '#FFFFFF' : TOKENS.Charcoal;
  let iconBgColor = isDark ? 'rgba(255,255,255,0.08)' : (isStar ? 'transparent' : TOKENS.PrimarySoft);

  const CardContent = () => (
    <View style={styles.cardContentWrapper}>
      {isDark ? null : <View style={styles.lightInnerHighlight} />}
      <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
        {isStar && (
          <Ionicons 
            name="star" 
            size={60} 
            color={TOKENS.AccentRed} 
            style={styles.starBg} 
          />
        )}
        <Ionicons name={item.icon as any} size={28} color={iconColor} />
      </View>
      <Text style={[styles.cardTitle, { color: textColor }]} numberOfLines={2}>
        {item.title}
      </Text>
    </View>
  );

  return (
    <AnimatedTouchableOpacity
      activeOpacity={0.9}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={() => onPress(item.route)}
      style={[styles.cardBase, { transform: [{ scale: scaleAnim }] }]}
    >
      {isDark ? (
        <LinearGradient
          colors={[TOKENS.Charcoal, TOKENS.CharcoalLight]}
          style={styles.gradientCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <View style={styles.innerHighlight} />
          <CardContent />
        </LinearGradient>
      ) : (
        <View style={styles.lightCard}>
          <CardContent />
        </View>
      )}
    </AnimatedTouchableOpacity>
  );
};

export const HomeScreen: React.FC<any> = ({ navigation }) => {
  const [alerts, setAlerts] = useState<UrgentAlert[]>([]);
  const [sliderImages, setSliderImages] = useState<string[]>([]);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadAlerts();
    let unsubs: Function[] = [];
    import('../services/firestoreService').then(({ subscribeHomeSliderSettings, subscribeAppSettings }) => {
      const unsubSlider = subscribeHomeSliderSettings((data) => {
        if (data.images && data.images.length > 0) {
          setSliderImages(data.images);
        } else {
          setSliderImages([
            'https://images.unsplash.com/photo-1542104470-36a536b04a08?q=80&w=600&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1610313010775-523e66bbd011?q=80&w=600&auto=format&fit=crop',
          ]);
        }
      });
      const unsubApp = subscribeAppSettings((data) => {
        if (data.logoUrl) {
          setLogoUrl(data.logoUrl);
        }
      });
      unsubs.push(unsubSlider, unsubApp);
    });
    return () => unsubs.forEach(u => u());
  }, []);

  const loadAlerts = async () => {
    const data = await getUrgentAlerts();
    setAlerts(data);
  };

  const handlePress = (route: string | null) => {
    if (route) navigation.navigate(route);
  };

  return (
    <View style={styles.mainWrapper}>
      <Animated.ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false} 
        bounces={true}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
      >
        <CurvedFlagHeader 
          heroImages={sliderImages} 
          logoUrl={logoUrl} 
          heroHeight={HERO_HEIGHT} 
        />

        {/* --- Civic Soft UI Flag Sections --- */}
        <View style={styles.sectionsContainer}>
          
          {/* Green Section */}
          <View style={[styles.sectionBlock, { backgroundColor: TOKENS.BgGreenSection, paddingTop: (LOGO_SIZE / 2) + 16 }]}>
            <View style={styles.gridRow}>
              {ALL_SERVICES.slice(0, 6).map((item) => (
                <ServiceCard key={item.id} item={item} themeGroup="green" onPress={handlePress} />
              ))}
            </View>
          </View>

          {/* White/Star Section */}
          <View style={[styles.sectionBlock, { backgroundColor: TOKENS.BgStarSection }]}>
            <View style={styles.gridRow}>
              {ALL_SERVICES.slice(6, 9).map((item) => (
                <ServiceCard key={item.id} item={item} themeGroup="star" onPress={handlePress} />
              ))}
            </View>
          </View>

          {/* Dark Section */}
          <View style={[styles.sectionBlock, { backgroundColor: TOKENS.BgDarkSection, paddingBottom: 60 }]}>
            <View style={styles.gridRow}>
              {ALL_SERVICES.slice(9, 15).map((item) => (
                <ServiceCard key={item.id} item={item} themeGroup="dark" onPress={handlePress} />
              ))}
            </View>
          </View>

        </View>
      </Animated.ScrollView>
    </View>
  );
};

// Layout calculations
const PAGE_PADDING = 20;
const HORIZONTAL_GAP = 14;
const CARD_WIDTH = (width - (PAGE_PADDING * 2) - (HORIZONTAL_GAP * 2)) / 3;

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    backgroundColor: TOKENS.WarmBackground,
  },
  container: {
    flex: 1,
  },
  sectionsContainer: {
    // We bring the sections up to slide cleanly under the curved header
    marginTop: -40,
    zIndex: -1, 
  },
  sectionBlock: {
    paddingHorizontal: PAGE_PADDING,
    paddingVertical: 18,
  },
  gridRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },
  
  // Card Styles
  cardBase: {
    width: CARD_WIDTH,
    height: 135,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    backgroundColor: 'transparent',
  },
  lightCard: {
    flex: 1,
    backgroundColor: TOKENS.CardBackground,
    borderRadius: 20,
    overflow: 'hidden',
  },
  gradientCard: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardContentWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  starBg: {
    position: 'absolute',
    opacity: 0.15,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 4,
  },
  
  // Lighting and Depth
  innerHighlight: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    zIndex: 10,
  },
  lightInnerHighlight: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.8)',
    zIndex: 10,
  }
});
