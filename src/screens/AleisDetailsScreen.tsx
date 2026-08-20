import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  Dimensions 
} from 'react-native';
import { COLORS, SPACING, SHADOWS } from '../config/theme';

const { width } = Dimensions.get('window');

export const AleisDetailsScreen: React.FC<any> = ({ route }) => {
  const { article } = route.params;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {article.images && article.images.length > 0 && (
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.slider}>
          {article.images.map((img: string, index: number) => (
            <Image key={index} source={{ uri: img }} style={styles.sliderImage} resizeMode="cover" />
          ))}
        </ScrollView>
      )}
      
      <View style={styles.content}>
        <Text style={styles.title}>{article.title}</Text>
        <View style={styles.divider} />
        <Text style={styles.description}>
          {article.description}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },
  slider: {
    width: width,
    height: width * 0.75,
  },
  sliderImage: {
    width: width,
    height: width * 0.75,
  },
  content: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    ...SHADOWS.medium,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primaryDark,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  divider: {
    width: 60,
    height: 4,
    backgroundColor: COLORS.accent,
    alignSelf: 'center',
    borderRadius: 2,
    marginBottom: SPACING.lg,
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 28,
    textAlign: 'right',
  },
});
