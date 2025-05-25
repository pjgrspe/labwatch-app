// app/(tabs)/assistant.tsx
import { Text as ThemedText, View as ThemedView } from '@/components/Themed';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const initialMessages: Message[] = [
  { id: '1', text: 'Hello! How can I help you with lab safety today?', sender: 'bot', timestamp: new Date() },
  { id: '2', text: 'Ask about SOPs, chemical hazards, or emergency procedures.', sender: 'bot', timestamp: new Date(Date.now() + 1000) },
];

const botResponses: { [key: string]: string } = {
  "fire": "In case of fire: 1. Activate the nearest fire alarm. 2. Evacuate immediately using the nearest exit. 3. Do not use elevators. 4. Assemble at the designated meeting point.",
  "spill": "For a chemical spill: 1. Alert personnel nearby. 2. If safe, contain the spill with appropriate spill kit materials. 3. Refer to MSDS for specific chemical procedures. 4. Report to safety manager.",
  "default": "I'm sorry, I can only provide information on pre-defined topics like 'fire' or 'spill'. For other queries, please consult the lab safety manual or your supervisor."
};

export default function AssistantScreen() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputText, setInputText] = useState('');

  const containerBackgroundColor = useThemeColor({}, 'background');
  const inputContainerBackgroundColor = useThemeColor({}, 'cardBackground'); // Or specific color
  const inputBackgroundColor = useThemeColor({light: '#fff', dark: '#2C2C2E'}, 'background'); // Example, using a valid ColorName as fallback
  const inputTextColor = useThemeColor({}, 'text');
  const inputBorderColor = useThemeColor({}, 'borderColor');
  const placeholderTextColor = useThemeColor({}, 'icon');
  const sendButtonColor = useThemeColor({}, 'tint');
  const userMessageBackgroundColor = useThemeColor({}, 'tint');
  const userMessageTextColor = useThemeColor({light: '#FFFFFF', dark: '#FFFFFF'}, 'text'); // Usually contrasts with tint
  const botMessageBackgroundColor = useThemeColor({ light: '#E5E5EA', dark: '#2C2C2E' }, 'cardBackground'); // Example
  const botMessageTextColor = useThemeColor({}, 'text');
  const timestampColor = useThemeColor({}, 'icon');


  const handleSend = () => {
    if (inputText.trim().length === 0) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    const botReplyText = botResponses[inputText.trim().toLowerCase()] || botResponses.default;
    const newBotMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: botReplyText,
      sender: 'bot',
      timestamp: new Date(Date.now() + 1000),
    };

    setMessages(prevMessages => [newBotMessage, newUserMessage, ...prevMessages]); // Prepend for inverted list
    setInputText('');
  };

  const renderMessageItem = ({ item }: { item: Message }) => (
    <ThemedView style={[
      styles.messageBubble,
      item.sender === 'user' ? styles.userMessage : styles.botMessage,
      item.sender === 'user' ? { backgroundColor: userMessageBackgroundColor } : { backgroundColor: botMessageBackgroundColor }
    ]}>
      <ThemedText style={item.sender === 'user' ? [styles.userMessageText, {color: userMessageTextColor}] : [styles.botMessageText, {color: botMessageTextColor}]}>
        {item.text}
      </ThemedText>
      <ThemedText style={[styles.timestamp, { color: timestampColor }]}>
        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </ThemedText>
    </ThemedView>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: containerBackgroundColor }]}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0} 
    >
      <FlatList
        data={messages}
        renderItem={renderMessageItem}
        keyExtractor={(item) => item.id}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
        inverted 
      />
      <ThemedView style={[styles.inputContainer, { backgroundColor: inputContainerBackgroundColor, borderTopColor: inputBorderColor }]}>
        <TextInput
          style={[styles.input, { backgroundColor: inputBackgroundColor, color: inputTextColor, borderColor: inputBorderColor }]}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask about 'fire' or 'spill'..."
          placeholderTextColor={placeholderTextColor}
        />
        <TouchableOpacity onPress={handleSend} style={[styles.sendButton, { backgroundColor: sendButtonColor }]}>
          <Ionicons name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messageList: {
    flex: 1,
    paddingHorizontal: 10,
  },
  messageListContent: {
    paddingVertical: 10,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
  },
  userMessage: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 2,
  },
  botMessage: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 2,
  },
  userMessageText: {
    fontSize: 15,
  },
  botMessageText: {
    fontSize: 15,
  },
  timestamp: {
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  sendButton: {
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});