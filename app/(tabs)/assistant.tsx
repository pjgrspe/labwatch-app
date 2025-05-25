// app/(tabs)/assistant.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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

// Dummy responses
const botResponses: { [key: string]: string } = {
  "fire": "In case of fire: 1. Activate the nearest fire alarm. 2. Evacuate immediately using the nearest exit. 3. Do not use elevators. 4. Assemble at the designated meeting point.",
  "spill": "For a chemical spill: 1. Alert personnel nearby. 2. If safe, contain the spill with appropriate spill kit materials. 3. Refer to MSDS for specific chemical procedures. 4. Report to safety manager.",
  "default": "I'm sorry, I can only provide information on pre-defined topics like 'fire' or 'spill'. For other queries, please consult the lab safety manual or your supervisor."
};

export default function AssistantScreen() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputText, setInputText] = useState('');

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

    setMessages(prevMessages => [...prevMessages, newUserMessage, newBotMessage]);
    setInputText('');
  };

  const renderMessageItem = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageBubble,
      item.sender === 'user' ? styles.userMessage : styles.botMessage
    ]}>
      <Text style={item.sender === 'user' ? styles.userMessageText : styles.botMessageText}>
        {item.text}
      </Text>
      <Text style={styles.timestamp}>
        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0} // Adjust as needed
    >
      <Text style={styles.headerTitle}>Lab Safety AI Assistant</Text>
      <FlatList
        data={messages}
        renderItem={renderMessageItem}
        keyExtractor={(item) => item.id}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
        inverted // To show latest messages at the bottom, but needs data reordering
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask about 'fire' or 'spill'..."
          placeholderTextColor="#999"
        />
        <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
          <Ionicons name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    padding: 16,
    paddingTop: Platform.OS === 'android' ? 20 : 10,
    backgroundColor: '#fff',
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 2,
  },
  botMessage: {
    backgroundColor: '#E5E5EA',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 2,
  },
  userMessageText: {
    color: '#fff',
    fontSize: 15,
  },
  botMessageText: {
    color: '#000',
    fontSize: 15,
  },
  timestamp: {
    fontSize: 10,
    color: '#999',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
    backgroundColor: '#fff'
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});