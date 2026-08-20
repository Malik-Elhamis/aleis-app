import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainTabParamList } from './types';
import { HomeScreen } from '../screens/HomeScreen';
import { NewsScreen } from '../screens/NewsScreen';
import { UnifiedReportsListScreen } from '../screens/UnifiedReportsListScreen';
import { AboutUsScreen } from '../screens/AboutUsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { COLORS } from '../config/theme';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Custom Center Button for Profile
const CustomTabBarButton = ({ children, onPress }: any) => (
  <TouchableOpacity
    style={styles.customButtonContainer}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={styles.customButton}>
      {children}
    </View>
  </TouchableOpacity>
);

export const BottomTabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
          height: 65 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 5,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: -4,
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
             return <Ionicons name={iconName} size={30} color="#FFFFFF" />;
          }

          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ tabBarLabel: 'المزيد' }}
      />
      <Tab.Screen
        name="AboutUsTab"
        component={AboutUsScreen as any}
        options={{ tabBarLabel: 'من نحن' }}
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
        component={NewsScreen}
        options={{ tabBarLabel: 'الفعاليات' }}
      />
      <Tab.Screen
        name="NotificationsTab"
        component={UnifiedReportsListScreen}
        options={{ tabBarLabel: 'الإشعارات' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  customButtonContainer: {
    top: -24, // Lifted center button slightly higher
    justifyContent: 'center',
    alignItems: 'center',
  },
  customButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0B4F3A', // Deep green exactly like the mock-up
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF', // White border around it to cut into the tab bar
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  }
});
