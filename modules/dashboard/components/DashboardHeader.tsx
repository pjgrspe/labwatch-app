// labwatch-app/modules/dashboard/components/DashboardHeader.tsx
import { Card, ThemedView } from '@/components';
import Typography from '@/components/Typography';
import { Badge } from '@/components/ui';
import { Layout } from '@/constants';
import { useThemeColor } from '@/hooks';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  icon: keyof typeof Ionicons.glyphMap;
}

export const DashboardHeader: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 24,
    condition: 'Partly Cloudy',
    humidity: 65,
    icon: 'partly-sunny-outline'
  });  const iconColor = useThemeColor({}, 'icon');
  const mutedColor = useThemeColor({}, 'icon');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Mock weather data based on time
  useEffect(() => {
    const hour = currentTime.getHours();
    let mockWeather: WeatherData;

    if (hour >= 6 && hour < 12) {
      mockWeather = {
        temperature: 22,
        condition: 'Sunny',
        humidity: 60,
        icon: 'sunny-outline'
      };
    } else if (hour >= 12 && hour < 18) {
      mockWeather = {
        temperature: 28,
        condition: 'Partly Cloudy',
        humidity: 55,
        icon: 'partly-sunny-outline'
      };
    } else {
      mockWeather = {
        temperature: 20,
        condition: 'Clear',
        humidity: 70,
        icon: 'moon-outline'
      };
    }

    setWeather(mockWeather);
  }, [currentTime]);
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };
  return (
    <ThemedView style={styles.container}>
      {/* Main Header Card */}
      <Card style={styles.headerCard}>
        <ThemedView style={styles.headerContent}>
          {/* Left Section - Greeting and Time */}
          <ThemedView style={styles.leftSection}>            <Typography variant="h3" style={styles.greeting}>
              {getGreeting()}, Patrick! 👋
            </Typography>
            <ThemedView style={styles.timeContainer}>
              <Ionicons name="time-outline" size={16} color={iconColor} />              <Typography variant="body2" style={[styles.timeText, { color: mutedColor }]}>
                {formatTime(currentTime)}
              </Typography>
              <Typography variant="body2" style={[styles.dateText, { color: mutedColor }]}>
                • {formatDate(currentTime)}
              </Typography>
            </ThemedView>
          </ThemedView>

          {/* Right Section - Status Indicators */}
          <ThemedView style={styles.rightSection}>
            <ThemedView style={styles.statusContainer}>              <Badge
                label="Online"
                variant="success"
                size="sm"
                icon="checkmark-circle"
              />
              <ThemedView style={styles.weatherContainer}>
                <Ionicons name={weather.icon} size={20} color={iconColor} />                <Typography variant="body2" style={[styles.weatherText, { color: mutedColor }]}>
                  {weather.temperature}°C
                </Typography>
              </ThemedView>
            </ThemedView>          </ThemedView>
        </ThemedView>
      </Card>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Layout.spacing.md,
    paddingTop: Layout.spacing.lg,
    paddingBottom: Layout.spacing.md,
  },
  
  // Main Header Card
  headerCard: {
    marginBottom: Layout.spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  
  // Left Section
  leftSection: {
    flex: 1,
    marginRight: Layout.spacing.md,
  },
  greeting: {
    marginBottom: Layout.spacing.xs,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  timeText: {
    marginLeft: Layout.spacing.xs,
    fontFamily: 'Montserrat-SemiBold',
  },
  dateText: {
    marginLeft: Layout.spacing.xs,
    fontFamily: 'Montserrat-Regular',
    fontSize: Layout.fontSize.sm,
  },
  
  // Right Section
  rightSection: {
    alignItems: 'flex-end',
  },
  statusContainer: {
    alignItems: 'flex-end',
    gap: Layout.spacing.sm,
  },
  weatherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.xs,
  },  weatherText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: Layout.fontSize.sm,
  },});

export default DashboardHeader;