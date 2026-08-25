import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainTabParamList } from './types';
import { HomeScreen } from '../screens/HomeScreen';
import { NewsScreen } from '../screens/NewsScreen';
import { EventsScreen } from '../screens/EventsScreen';
import { PublicNotificationsScreen } from '../screens/PublicNotificationsScreen';
import { AboutUsScreen } from '../screens/AboutUsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { COLORS } from '../config/theme';
import { LinearGradient } from 'expo-linear-gradient';

const Tab = createBottomTabNavigator<MainTabParamList>();

import { Image } from 'react-native';

// Custom Center Button (Decorative Only)
const CustomTabBarButton = ({ children }: any) => (
  <View style={styles.customButtonContainer}>
    <View style={styles.customButton}>
      <Image 
        source={require('../../assets/bottom_icon.png')} 
        style={{ width: 54, height: 54, borderRadius: 27 }} 
      />
    </View>
  </View>
);

export const BottomTabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#0B8A43', // Matched to main green
        tabBarInactiveTintColor: '#8B9DAA', // Softer, neutral slate
        tabBarShowLabel: true,
        tabBarStyle: {
          position: 'absolute',
          bottom: Math.max(insets.bottom, 16),
          left: 16,
          right: 16,
          backgroundColor: '#FFFFFF', // Clean white
          borderWidth: 1,
          borderColor: '#0B8A43', // Matched to the central icon's border
          borderTopWidth: 1, // Needed because RN sometimes ignores borderWidth if borderTopWidth is 0
          borderRadius: 30,
          height: 76,
          elevation: 10,
          shadowColor: '#000000', // Clean neutral shadow instead of green tint
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.08,
          shadowRadius: 16,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: -2,
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';

          if (route.name === 'HomeTab') {
            iconName = focused ? 'menu' : 'menu-outline';
          } else if (route.name === 'AboutUsTab') {
            iconName = focused ? 'information-circle' : 'information-circle-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = 'person';
          } else if (route.name === 'EventsTab') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'NotificationsTab') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          }

          if (route.name === 'ProfileTab') {
             return null; // Handled by CustomTabBarButton image
          }

          return (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={iconName} size={24} color={color} />
              {focused && (
                <View style={{
                  width: 4, 
                  height: 4, 
                  borderRadius: 2, 
                  backgroundColor: '#0B8A43', // Matched to main green
                  position: 'absolute',
                  bottom: -10
                }} />
              )}
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ tabBarLabel: 'الرئيسية' }}
      />
      <Tab.Screen
        name="NotificationsTab"
        component={PublicNotificationsScreen}
        options={{ tabBarLabel: 'الإشعارات' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ 
          tabBarLabel: '',
          tabBarButton: (props) => <CustomTabBarButton {...props} />
        }}
      />
      <Tab.Screen
        name="EventsTab"
        component={EventsScreen}
        options={{ tabBarLabel: 'الفعاليات' }}
      />
      <Tab.Screen
        name="AboutUsTab"
        component={AboutUsScreen as any}
        options={{ tabBarLabel: 'من نحن' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  customButtonContainer: {
    top: -16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#0B8A43',
    elevation: 8,
    shadowColor: '#15966E', // Green glow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  }
});
