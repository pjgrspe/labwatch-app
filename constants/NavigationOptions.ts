// labwatch-app/constants/NavigationOptions.ts
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { Colors, ColorScheme } from './Colors';
import Layout from './Layout';

export const getCommonHeaderOptions = (colorScheme: ColorScheme): NativeStackNavigationOptions => {
  const options: NativeStackNavigationOptions = {
    headerStyle: {
      backgroundColor: Colors[colorScheme].headerBackground,
    },
    headerTintColor: Colors[colorScheme].headerTint, // This colors the back button arrow and title (if shown)
    headerTitleStyle: {
      fontWeight: Layout.fontWeight.bold as any,
      fontSize: Layout.fontSize.header,
      fontFamily: 'Montserrat-Bold',
    },
    // headerBackTitleVisible: false, // This was for @react-navigation/stack
    headerBackVisible: true, // Ensures the back button (arrow) is visible. Set to false to hide it entirely.
                               // By default, it's usually true if navigation.canGoBack() is true.
                               // Explicitly setting to true can sometimes help if defaults are overridden.
                               // Note: To hide the "title" of the back button (e.g., "Back" or previous screen's title on iOS),
                               // you might use headerBackTitle: ' ' (a space) or an empty string,
                               // but native-stack often just shows the arrow by default without a title.
                               // For maximum control over the back button's label, headerBackTitle is the prop.
                               // To just hide the text label of the back button on iOS (keeping the chevron):
    headerBackTitle: ' ', // Using a space effectively hides the title on iOS.
    headerShadowVisible: false,
    headerLargeTitle: false,
  };
  return options;
};