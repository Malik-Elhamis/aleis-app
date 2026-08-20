import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'إشعارات البلدية',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('فشل في الحصول على إذن الإشعارات!');
      return null;
    }

    try {
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: 'aleis-municipality-id' // Ideally from app.json expo.extra.eas.projectId
      })).data;
      console.log('Push Token Generated:', token);
    } catch (error) {
      console.error('Error generating push token:', error);
    }
  } else {
    console.log('يجب استخدام جهاز حقيقي لتلقي إشعارات Push (المحاكي لا يدعمها بالكامل).');
  }

  return token;
}
