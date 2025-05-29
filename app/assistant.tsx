// labwatch-app/app/assistant.tsx
import Card from '@/components/Card';
import { Text as ThemedText, View as ThemedView } from '@/components/Themed';
import { Colors } from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { useCurrentTheme, useThemeColor } from '@/hooks/useThemeColor';
import { useChat } from '@/modules/assistant/hooks/useChat';
import { Message } from '@/types/assistant';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Linking,
  Platform,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity
} from 'react-native';
import Markdown from 'react-native-markdown-display';

export default function AssistantScreen() {
  const [inputText, setInputText] = useState('');
  const { messages, isLoading, error, sendMessage } = useChat();
  const flatListRef = useRef<FlatList>(null);
  const currentTheme = useCurrentTheme();

  // Theme colors following your app's pattern
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackgroundColor = useThemeColor({}, 'cardBackground');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const subtleTextColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'borderColor');
  const inputBackgroundColor = useThemeColor({
    light: Colors.light.surfaceSecondary, 
    dark: Colors.dark.surfaceSecondary 
  }, 'inputBackground');
  const errorColor = useThemeColor({}, 'errorText');
  const successColor = useThemeColor({}, 'successText');
  const userBubbleColor = tintColor;
  const assistantBubbleColor = cardBackgroundColor;
  const userTextColor = '#FFFFFF';
  const placeholderTextColor = useThemeColor({}, 'icon');

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim()) {
      sendMessage(inputText);
      setInputText('');
    }
  };

  // Enhanced Markdown styles following your app's typography
  const markdownStyles = StyleSheet.create({
    body: {
      fontSize: Layout.fontSize.md,
      fontFamily: 'Montserrat-Regular',
      color: textColor,
      lineHeight: Layout.fontSize.md * 1.5,
    },
    heading1: {
      fontSize: Layout.fontSize.xl,
      fontFamily: 'Montserrat-Bold',
      color: textColor,
      marginTop: Layout.spacing.md,
      marginBottom: Layout.spacing.sm,
      fontWeight: Layout.fontWeight.bold,
    },
    heading2: {
      fontSize: Layout.fontSize.lg,
      fontFamily: 'Montserrat-SemiBold',
      color: textColor,
      marginTop: Layout.spacing.sm,
      marginBottom: Layout.spacing.xs,
      fontWeight: Layout.fontWeight.semibold,
    },
    heading3: {
      fontSize: Layout.fontSize.md,
      fontFamily: 'Montserrat-Medium',
      color: textColor,
      marginTop: Layout.spacing.sm,
      marginBottom: Layout.spacing.xs,
      fontWeight: Layout.fontWeight.medium,
    },
    bullet_list_icon: {
      color: tintColor,
      fontSize: Layout.fontSize.sm,
    },
    ordered_list_icon: {
      color: tintColor,
      fontSize: Layout.fontSize.sm,
    },
    list_item: {
      marginVertical: Layout.spacing.xs / 2,
      fontSize: Layout.fontSize.md,
      fontFamily: 'Montserrat-Regular',
    },
    strong: {
      fontFamily: 'Montserrat-Bold',
      fontWeight: Layout.fontWeight.bold,
      color: textColor,
    },
    em: {
      fontFamily: 'Montserrat-Regular',
      fontStyle: 'italic',
      color: textColor,
    },
    link: {
      color: tintColor,
      textDecorationLine: 'underline',
      fontFamily: 'Montserrat-Medium',
    },
    code_inline: {
      backgroundColor: inputBackgroundColor,
      color: textColor,
      paddingHorizontal: Layout.spacing.xs,
      paddingVertical: 2,
      borderRadius: Layout.borderRadius.sm,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      fontSize: Layout.fontSize.sm,
    },
    preformatted: {
      backgroundColor: inputBackgroundColor,
      color: textColor,
      padding: Layout.spacing.md,
      borderRadius: Layout.borderRadius.md,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      fontSize: Layout.fontSize.sm,
      marginVertical: Layout.spacing.sm,
      borderWidth: 1,
      borderColor: borderColor,
    },
    blockquote: {
      backgroundColor: inputBackgroundColor,
      borderLeftWidth: 4,
      borderLeftColor: tintColor,
      paddingHorizontal: Layout.spacing.md,
      paddingVertical: Layout.spacing.sm,
      marginVertical: Layout.spacing.sm,
      borderRadius: Layout.borderRadius.md,
    },
  });

  const onLinkPress = (url: string) => {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.warn(`Don't know how to open URI: ${url}`);
      }
    });
    return false;
  };

  const renderMessageItem = ({ item }: { item: Message }) => (
    <ThemedView style={styles.messageContainer}>
      <Card
        style={[
          styles.messageBubble,
          item.sender === 'user' ? styles.userBubble : styles.assistantBubble,
          item.sender === 'user' && { backgroundColor: userBubbleColor },
          item.sender === 'assistant' && { 
            backgroundColor: assistantBubbleColor,
            borderColor: borderColor,
            borderWidth: 1,
          }
        ]}
        paddingSize="md"
      >
        <ThemedView style={styles.messageHeader}>
          <ThemedView style={styles.senderInfo}>
            <ThemedView style={[
              styles.senderIcon,
              { backgroundColor: item.sender === 'user' ? userBubbleColor : successColor + '20' }
            ]}>
              <Ionicons 
                name={item.sender === 'user' ? 'person' : 'chatbubble-ellipses'} 
                size={16} 
                color={item.sender === 'user' ? userTextColor : successColor} 
              />
            </ThemedView>
            <ThemedText style={[
              styles.senderLabel,
              { 
                color: item.sender === 'user' ? userTextColor : textColor,
                fontFamily: 'Montserrat-Medium'
              }
            ]}>
              {item.sender === 'user' ? 'You' : 'LabWatch Assistant'}
            </ThemedText>
          </ThemedView>
          <ThemedText style={[
            styles.timestamp, 
            { 
              color: item.sender === 'user' ? userTextColor + '80' : subtleTextColor,
              fontFamily: 'Montserrat-Regular'
            }
          ]}>
            {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.messageContent}>
          {item.isLoading ? (
            <ThemedView style={styles.loadingContainer}>
              <ActivityIndicator 
                size="small" 
                color={item.sender === 'user' ? userTextColor : tintColor} 
              />
              <ThemedText style={[
                styles.loadingText,
                { 
                  color: item.sender === 'user' ? userTextColor : textColor,
                  fontFamily: 'Montserrat-Regular'
                }
              ]}>
                Thinking...
              </ThemedText>
            </ThemedView>
          ) : item.sender === 'assistant' ? (
            <Markdown style={markdownStyles} onLinkPress={onLinkPress}>
              {item.text}
            </Markdown>
          ) : (
            <ThemedText style={[
              styles.userMessage,
              { 
                color: userTextColor,
                fontFamily: 'Montserrat-Regular'
              }
            ]}>
              {item.text}
            </ThemedText>
          )}
        </ThemedView>
      </Card>
    </ThemedView>
  );

  const renderEmptyState = () => (
    <ThemedView style={styles.emptyStateContainer}>
      <ThemedView style={[styles.emptyStateIcon, { backgroundColor: successColor + '20' }]}>
        <Ionicons name="chatbubble-ellipses-outline" size={48} color={successColor} />
      </ThemedView>
      <ThemedText style={[styles.emptyStateTitle, { color: textColor }]}>
        Welcome to LabWatch Assistant
      </ThemedText>
      <ThemedText style={[styles.emptyStateDescription, { color: subtleTextColor }]}>
        I'm here to help you with lab protocols, safety procedures, and answer questions about your lab environment.
      </ThemedText>
      <ThemedView style={styles.suggestionsContainer}>
        <ThemedText style={[styles.suggestionsTitle, { color: textColor }]}>
          Try asking about:
        </ThemedText>
        {[
          'Safety protocols for chemical handling',
          'Emergency evacuation procedures',
          'Equipment troubleshooting',
          'Lab room information'
        ].map((suggestion, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.suggestionChip, { borderColor: borderColor }]}
            onPress={() => setInputText(suggestion)}
          >
            <Ionicons name="bulb-outline" size={14} color={tintColor} />
            <ThemedText style={[
              styles.suggestionText, 
              { color: textColor, fontFamily: 'Montserrat-Regular' }
            ]}>
              {suggestion}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ThemedView>
    </ThemedView>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0} // Add offset for iOS tab bar
      >
        {error && (
          <Card style={styles.errorCard} paddingSize="md">
            <ThemedView style={styles.errorContent}>
              <Ionicons name="alert-circle" size={20} color={errorColor} />
              <ThemedText style={[
                styles.errorText, 
                { color: errorColor, fontFamily: 'Montserrat-Medium' }
              ]}>
                {error}
              </ThemedText>
            </ThemedView>
          </Card>
        )}
        
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={(item) => item.id}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled" // Add this for better interaction
        />
        
        <ThemedView style={[
          styles.inputContainer, 
          { 
            backgroundColor: cardBackgroundColor,
            borderTopColor: borderColor 
          }
        ]}>
          <ThemedView style={styles.inputRow}>
            <TextInput
              style={[
                styles.input,
                {
                  color: textColor,
                  backgroundColor: inputBackgroundColor,
                  borderColor: borderColor,
                  fontFamily: 'Montserrat-Regular'
                },
              ]}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask me anything about your lab..."
              placeholderTextColor={placeholderTextColor}
              multiline
              maxLength={1000}
              returnKeyType="send" // Add return key behavior
              onSubmitEditing={handleSend} // Allow sending with return key
            />
            <TouchableOpacity 
              onPress={handleSend} 
              style={[
                styles.sendButton, 
                { 
                  backgroundColor: inputText.trim() ? tintColor : borderColor,
                  opacity: inputText.trim() ? 1 : 0.5
                }
              ]} 
              disabled={!inputText.trim() || (isLoading && messages[messages.length -1]?.isLoading)}
            >
              {isLoading && messages[messages.length -1]?.sender === 'assistant' && messages[messages.length -1]?.isLoading ? (
                <ActivityIndicator size="small" color={userTextColor} />
              ) : (
                <Ionicons 
                  name="send" 
                  size={20} 
                  color={userTextColor} 
                />
              )}
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingTop: Layout.spacing.md,
    paddingBottom: Layout.spacing.lg,
    paddingHorizontal: Layout.spacing.md,
  },
  messageContainer: {
    marginBottom: Layout.spacing.sm,
    backgroundColor: 'transparent',
  },
  messageBubble: {
    maxWidth: '85%',
    minWidth: '20%',
  },
  userBubble: {
    alignSelf: 'flex-end',
  },
  assistantBubble: {
    alignSelf: 'flex-start',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
    backgroundColor: 'transparent',
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  senderIcon: {
    width: 24,
    height: 24,
    borderRadius: Layout.borderRadius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.xs,
  },
  senderLabel: {
    fontSize: Layout.fontSize.sm,
    fontWeight: Layout.fontWeight.medium,
  },
  timestamp: {
    fontSize: Layout.fontSize.xs,
    opacity: 0.8,
  },
  messageContent: {
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  loadingText: {
    marginLeft: Layout.spacing.xs,
    fontSize: Layout.fontSize.sm,
    fontStyle: 'italic',
  },
  userMessage: {
    fontSize: Layout.fontSize.md,
    lineHeight: Layout.fontSize.md * 1.5,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.xl,
    paddingVertical: Layout.spacing.xxl,
    backgroundColor: 'transparent',
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: Layout.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
  },
  emptyStateTitle: {
    fontSize: Layout.fontSize.xl,
    fontFamily: 'Montserrat-Bold',
    fontWeight: Layout.fontWeight.bold,
    textAlign: 'center',
    marginBottom: Layout.spacing.sm,
  },
  emptyStateDescription: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    lineHeight: Layout.fontSize.md * 1.5,
    marginBottom: Layout.spacing.xl,
  },
  suggestionsContainer: {
    width: '100%',
    backgroundColor: 'transparent',
  },
  suggestionsTitle: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Medium',
    fontWeight: Layout.fontWeight.medium,
    marginBottom: Layout.spacing.md,
    textAlign: 'center',
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    marginBottom: Layout.spacing.xs,
  },
  suggestionText: {
    fontSize: Layout.fontSize.sm,
    marginLeft: Layout.spacing.xs,
    flex: 1,
  },
  errorCard: {
    marginHorizontal: Layout.spacing.md,
    marginTop: Layout.spacing.sm,
  },
  errorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  errorText: {
    marginLeft: Layout.spacing.xs,
    fontSize: Layout.fontSize.md,
    flex: 1,
  },
  inputContainer: {
    paddingHorizontal: Layout.spacing.md,
    paddingTop: Layout.spacing.md,
    paddingBottom: Platform.OS === 'ios' ? Layout.spacing.xl : Layout.spacing.lg, // Increased bottom padding
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'transparent',
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderWidth: 1,
    borderRadius: Layout.borderRadius.lg,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm, // Consistent vertical padding
    marginRight: Layout.spacing.sm,
    fontSize: Layout.fontSize.md,
    textAlignVertical: 'top',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: Layout.borderRadius.pill,
    justifyContent: 'center',
    alignItems: 'center',
  },
});