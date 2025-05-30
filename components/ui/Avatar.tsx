// labwatch-app/components/ui/Avatar.tsx
import { useThemeColor } from '@/hooks';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, View, ViewProps } from 'react-native';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarVariant = 'circle' | 'rounded' | 'square';

interface AvatarProps extends ViewProps {
  source?: { uri: string } | number;
  size?: AvatarSize;
  variant?: AvatarVariant;
  fallback?: string; // Initials or single letter
  icon?: keyof typeof Ionicons.glyphMap;
  backgroundColor?: string;
}

export default function Avatar({
  source,
  size = 'md',
  variant = 'circle',
  fallback,
  icon,
  backgroundColor,
  style,
  ...props
}: AvatarProps) {
  const defaultBgColor = useThemeColor({}, 'tint');
  const bgColor = backgroundColor || defaultBgColor;

  // Calculate size in pixels
  const getSize = () => {
    switch (size) {
      case 'xs': return 24;
      case 'sm': return 32;
      case 'md': return 40;
      case 'lg': return 56;
      case 'xl': return 72;
      default: return 40;
    }
  };

  // Calculate border radius based on variant and size
  const getBorderRadius = () => {
    const avatarSize = getSize();
    
    switch (variant) {
      case 'circle': return avatarSize / 2;
      case 'rounded': return avatarSize / 4;
      case 'square': return 0;
      default: return avatarSize / 2;
    }
  };

  // Get font size for fallback text
  const getFallbackFontSize = () => {
    switch (size) {
      case 'xs': return 10;
      case 'sm': return 12;
      case 'md': return 16;
      case 'lg': return 20;
      case 'xl': return 26;
      default: return 16;
    }
  };

  // Get icon size
  const getIconSize = () => {
    switch (size) {
      case 'xs': return 14;
      case 'sm': return 16;
      case 'md': return 20;
      case 'lg': return 28;
      case 'xl': return 36;
      default: return 20;
    }
  };

  const avatarSize = getSize();
  const borderRadius = getBorderRadius();
  const fallbackFontSize = getFallbackFontSize();
  const iconSize = getIconSize();

  const renderContent = () => {
    if (source) {
      return (
        <Image
          source={source}
          style={[
            styles.image,
            { width: avatarSize, height: avatarSize, borderRadius }
          ]}
          resizeMode="cover"
        />
      );
    } else if (icon) {
      return (
        <Ionicons name={icon} size={iconSize} color="#FFFFFF" />
      );
    } else if (fallback) {
      // Extract initials (up to 2 characters) or use the first character
      const displayText = fallback.trim().length > 2 
        ? fallback.trim().split(/\s+/).map(word => word[0]).slice(0, 2).join('').toUpperCase()
        : fallback.trim().substring(0, 2).toUpperCase();
        
      return (
        <Text style={[styles.fallbackText, { fontSize: fallbackFontSize }]}>
          {displayText}
        </Text>
      );
    }
    
    // Default icon if nothing is provided
    return <Ionicons name="person" size={iconSize} color="#FFFFFF" />;
  };

  return (
    <View
      style={[
        styles.container,
        {
          width: avatarSize,
          height: avatarSize,
          borderRadius,
          backgroundColor: bgColor,
        },
        style,
      ]}
      {...props}
    >
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallbackText: {
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Medium',
    textAlign: 'center',
  },
});
