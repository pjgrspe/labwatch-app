// labwatch-app/components/dashboard/RoomSelectorDropdown.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  FlatList,
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  UIManager,
} from 'react-native';

import { Text as ThemedText, View as ThemedView } from '@/components/Themed';
import { Colors } from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { useThemeColor } from '@/hooks/useThemeColor';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface RoomSelectorDropdownProps {
  rooms: string[];
  selectedRoom: string;
  onSelectRoom: (room: string) => void;
  headerText?: string;
}

const RoomSelectorDropdown: React.FC<RoomSelectorDropdownProps> = ({
  rooms,
  selectedRoom,
  onSelectRoom,
  // headerText prop removed as per previous adjustment to directly show selectedRoom
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectorTextColor = useThemeColor({}, 'tint');
  const itemTextColor = useThemeColor({}, 'text');
  const itemBorderColor = useThemeColor({}, 'borderColor');
  const dropdownBackgroundColor = useThemeColor({}, 'cardBackground');
  const inputFieldBackgroundColor = useThemeColor({}, 'cardBackground');
  const inputFieldBorderColor = useThemeColor({}, 'borderColor');
  
  // Call useThemeColor for the pressed state unconditionally here
  const pressedItemBackgroundColor = useThemeColor({light: Colors.light.surfaceSecondary, dark: Colors.dark.surfaceSecondary}, 'surfaceSecondary');


  const toggleDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(!isOpen);
  };

  const handleSelectRoom = (room: string) => {
    onSelectRoom(room);
    toggleDropdown();
  };

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity
        style={[
          styles.selectorButton,
          { 
            backgroundColor: inputFieldBackgroundColor, 
            borderColor: inputFieldBorderColor,
          }
        ]}
        onPress={toggleDropdown}
        activeOpacity={0.7}
      >
        <ThemedText 
          style={[styles.selectorButtonText, { color: selectorTextColor }]}
          numberOfLines={1}
        >
          {selectedRoom || 'Select Room...'}
        </ThemedText>
        <Ionicons
          name={isOpen ? 'chevron-up-outline' : 'chevron-down-outline'}
          size={22}
          color={selectorTextColor}
        />
      </TouchableOpacity>

      {isOpen && (
        <ThemedView 
          style={[
            styles.dropdownList, 
            { 
              backgroundColor: dropdownBackgroundColor, 
              borderColor: itemBorderColor 
            }
          ]}
        >
          <FlatList
            data={rooms}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [
                  styles.dropdownItem,
                  { borderBottomColor: itemBorderColor },
                  // Now we use the unconditionally called Hook's result
                  pressed && { backgroundColor: pressedItemBackgroundColor } 
                ]}
                onPress={() => handleSelectRoom(item)}
              >
                <ThemedText style={{ color: itemTextColor, fontSize: Layout.fontSize.md }}>{item}</ThemedText>
              </Pressable>
            )}
            style={{ maxHeight: Layout.window.height * 0.3 }}
            nestedScrollEnabled={true}
          />
        </ThemedView>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: Platform.OS === 'android' ? 100 : 10,
  },
  selectorButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.md,
    borderRadius: Layout.borderRadius.sm,
    borderWidth: 1,
  },
  selectorButtonText: {
    fontSize: Layout.fontSize.lg,
    fontWeight: Layout.fontWeight.semibold,
    flex: 1,
  },
  dropdownList: {
    position: 'absolute',
    top: '100%', 
    left: 0,
    right: 0,
    borderWidth: 1, 
    borderRadius: Layout.borderRadius.sm,
    marginTop: Layout.spacing.xs, 
    overflow: 'hidden', 
    maxHeight: Layout.window.height * 0.3,
    elevation: 5, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    zIndex: 99, 
  },
  dropdownItem: {
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});

export default RoomSelectorDropdown;   