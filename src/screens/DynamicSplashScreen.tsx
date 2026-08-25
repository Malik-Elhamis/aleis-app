import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { subscribeAppSettings } from '../services/firestoreService';
import { COLORS } from '../config/theme';

const { width, height } = Dimensions.get('window');

export const DynamicSplashScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [splashUrl, setSplashUrl] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 1. Fetch splash screen URL from Firestore
    const unsub = subscribeAppSettings((data) => {
      if (data.splashScreenUrl) {
        setSplashUrl(data.splashScreenUrl);
      }
      setIsReady(true);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (isReady) {
      if (splashUrl) {
        // If there is a custom splash screen, wait 3 seconds
        const timer = setTimeout(() => {
          navigation.replace('Home');
        }, 3000);
        return () => clearTimeout(timer);
      } else {
        // If no custom splash screen is set, skip immediately
        navigation.replace('Home');
      }
    }
  }, [isReady, splashUrl, navigation]);

  if (!isReady || !splashUrl) {
    return <View style={styles.container} />; // Empty background while loading or if no splash
  }

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: splashUrl }}
        style={styles.image}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width,
    height: height,
  },
});
