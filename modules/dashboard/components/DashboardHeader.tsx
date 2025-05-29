// labwatch-app/modules/dashboard/components/DashboardHeader.tsx
import { Text as ThemedText, View as ThemedView } from '@/components/Themed';
import { Colors, ColorScheme } from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

interface DashboardHeaderProps {
  currentTheme: ColorScheme;
}

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  icon: keyof typeof Ionicons.glyphMap;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ currentTheme }) => {
  const themeColors = Colors[currentTheme];
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 24,
    condition: 'Partly Cloudy',
    humidity: 65,
    icon: 'partly-sunny-outline'
  });

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Mock weather data
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
    } else if (hour >= 18 && hour < 22) {
      mockWeather = {
        temperature: 25,
        condition: 'Clear',
        humidity: 70,
        icon: 'moon-outline'
      };
    } else {
      mockWeather = {
        temperature: 19,
        condition: 'Clear Night',
        humidity: 75,
        icon: 'moon-outline'
      };
    }

    setWeather(mockWeather);
  }, [currentTime]);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getFormattedDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return currentTime.toLocaleDateString('en-US', options);
  };

  const getFormattedTime = () => {
    return currentTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getUserName = () => {
    return 'Dr. Smith';
  };

  return (
    <LinearGradient
      colors={currentTheme === 'light' 
        ? [themeColors.tint, themeColors.accent] 
        : [themeColors.headerBackground, themeColors.surfaceSecondary]
      }
      style={styles.headerGradient}
    >
      <ThemedView style={styles.headerContent}>
        {/* Main Greeting */}
        <ThemedView style={styles.greetingSection}>
          <ThemedText style={styles.greeting}>
            {getGreeting()}, {getUserName()}
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Welcome back to LabWatch
          </ThemedText>
        </ThemedView>

        {/* Date and Time Info */}
        <ThemedView style={styles.infoSection}>
          <ThemedView style={styles.dateTimeContainer}>
            <ThemedView style={styles.dateTimeItem}>
              <Ionicons name="calendar-outline" size={16} color="#FFFFFF" style={styles.infoIcon} />
              <ThemedText style={styles.dateText}>{getFormattedDate()}</ThemedText>
            </ThemedView>
            <ThemedView style={styles.dateTimeItem}>
              <Ionicons name="time-outline" size={16} color="#FFFFFF" style={styles.infoIcon} />
              <ThemedText style={styles.timeText}>{getFormattedTime()}</ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Weather Info */}
          <ThemedView style={styles.weatherContainer}>
            <ThemedView style={styles.weatherMain}>
              <Ionicons name={weather.icon} size={24} color="#FFFFFF" style={styles.weatherIcon} />
              <ThemedView style={styles.weatherText}>
                <ThemedText style={styles.temperature}>{weather.temperature}°C</ThemedText>
                <ThemedText style={styles.weatherCondition}>{weather.condition}</ThemedText>
              </ThemedView>
            </ThemedView>
            <ThemedView style={styles.weatherDetail}>
              <Ionicons name="water-outline" size={14} color="#FFFFFF" style={styles.weatherDetailIcon} />
              <ThemedText style={styles.humidity}>{weather.humidity}%</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Status Indicator */}
        <ThemedView style={styles.statusBar}>
          <ThemedView style={styles.statusItem}>
            <ThemedView style={[styles.statusDot, {backgroundColor: themeColors.successText }]} />
            <ThemedText style={styles.statusText}>System Online</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statusDivider} />
          <ThemedView style={styles.statusItem}>
            <Ionicons name="shield-checkmark" size={14} color={themeColors.successText} style={styles.statusIcon} />
            <ThemedText style={styles.statusText}>Monitoring Active</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  headerGradient: {
    paddingTop: Layout.spacing.xl, // Keep more top padding for visual hierarchy
    paddingBottom: Layout.spacing.lg,
    paddingHorizontal: Layout.spacing.md, // Changed from lg to md for consistency
    // marginBottom: Layout.spacing.md, // Add margin to separate from content below if needed
  },
  headerContent: {
    backgroundColor: 'transparent',
  },
  greetingSection: {
    marginBottom: Layout.spacing.lg,
    backgroundColor: 'transparent',
  },
  greeting: {
    fontSize: Layout.fontSize.xxl,
    fontFamily: 'Montserrat-Bold',
    color: '#FFFFFF',
    marginBottom: Layout.spacing.xs / 2,
  },
  subtitle: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Medium',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.md,
    backgroundColor: 'transparent',
  },
  dateTimeContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  dateTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.xs,
    backgroundColor: 'transparent',
  },
  infoIcon: {
    marginRight: Layout.spacing.xs,
  },
  dateText: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Medium',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  timeText: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-SemiBold',
    color: '#FFFFFF',
  },
  weatherContainer: {
    alignItems: 'flex-end',
    backgroundColor: 'transparent',
  },
  weatherMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.xs / 2,
    backgroundColor: 'transparent',
  },
  weatherIcon: {
    marginRight: Layout.spacing.xs,
  },
  weatherText: {
    alignItems: 'flex-end',
    backgroundColor: 'transparent',
  },
  temperature: {
    fontSize: Layout.fontSize.lg,
    fontFamily: 'Montserrat-Bold',
    color: '#FFFFFF',
    lineHeight: Layout.fontSize.lg,
  },
  weatherCondition: {
    fontSize: Layout.fontSize.xs,
    fontFamily: 'Montserrat-Medium',
    color: '#FFFFFF',
    opacity: 0.8,
  },
  weatherDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  weatherDetailIcon: {
    marginRight: Layout.spacing.xs / 2,
  },
  humidity: {
    fontSize: Layout.fontSize.xs,
    fontFamily: 'Montserrat-Medium',
    color: '#FFFFFF',
    opacity: 0.8,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // This might need theme-specific adjustment
                                                // For dark theme, a darker translucent bg might be better
                                                // e.g., currentTheme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.15)'
    borderRadius: Layout.borderRadius.md,
    paddingVertical: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.md,
    marginTop: Layout.spacing.sm, // Added margin top for better spacing
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, // Distribute space
    justifyContent: 'center', // Center items within their flex area
    backgroundColor: 'transparent',
  },
  statusDot: { // Dynamic color based on theme.successText
    width: 8,
    height: 8,
    borderRadius: 4,
    // backgroundColor will be set dynamically
    marginRight: Layout.spacing.xs,
  },
  statusIcon: { // Dynamic color based on theme.successText
    marginRight: Layout.spacing.xs,
  },
  statusText: {
    fontSize: Layout.fontSize.xs,
    fontFamily: 'Montserrat-SemiBold',
    color: '#FFFFFF', // White text on the translucent status bar
    opacity: 0.9,
  },
  statusDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // Similar to statusBar bg, this might need theme adjustment
    marginHorizontal: Layout.spacing.sm, // Reduced from md for a tighter look
  },
});

export default DashboardHeader;