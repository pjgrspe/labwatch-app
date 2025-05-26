import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const PUSH_NOTIFICATIONS_KEY = '@push_notifications_enabled';
const EMAIL_NOTIFICATIONS_KEY = '@email_notifications_enabled';

export function useNotificationSettings() {
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(true);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const pushStatus = await AsyncStorage.getItem(PUSH_NOTIFICATIONS_KEY);
        if (pushStatus !== null) {
          setPushNotificationsEnabled(JSON.parse(pushStatus));
        }
        const emailStatus = await AsyncStorage.getItem(EMAIL_NOTIFICATIONS_KEY);
        if (emailStatus !== null) {
          setEmailNotificationsEnabled(JSON.parse(emailStatus));
        }
      } catch (e) {
        console.error('Failed to load notification settings.', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const togglePushNotifications = async (value: boolean) => {
    setPushNotificationsEnabled(value);
    try {
      await AsyncStorage.setItem(PUSH_NOTIFICATIONS_KEY, JSON.stringify(value));
      // Here you would also call your actual push notification registration/unregistration logic
      console.log('Push notifications toggled:', value);
    } catch (e) {
      console.error('Failed to save push notification setting.', e);
    }
  };

  const toggleEmailNotifications = async (value: boolean) => {
    setEmailNotificationsEnabled(value);
    try {
      await AsyncStorage.setItem(EMAIL_NOTIFICATIONS_KEY, JSON.stringify(value));
      // Placeholder for actual email notification preference update with backend
      console.log('Email notifications preference:', value ? 'Subscribed' : 'Unsubscribed');
      if (value) {
        // Simulate backend call for subscription
        // await subscribeToEmailNotificationsAPI();
        console.log('Placeholder: Subscribed to email notifications.');
      } else {
        // Simulate backend call for unsubscription
        // await unsubscribeFromEmailNotificationsAPI();
        console.log('Placeholder: Unsubscribed from email notifications.');
      }
    } catch (e) {
      console.error('Failed to save email notification setting.', e);
    }
  };

  return {
    pushNotificationsEnabled,
    emailNotificationsEnabled,
    togglePushNotifications,
    toggleEmailNotifications,
    isLoadingNotificationSettings: isLoading,
  };
}