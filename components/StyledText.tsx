// labwatch-app/components/StyledText.tsx
import { Text, TextProps } from './Themed'; // Corrected import

export function MonoText(props: TextProps) {
  return <Text {...props} style={[props.style, { fontFamily: 'SpaceMono' }]} />;
}