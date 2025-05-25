// app/more/knowledge-base.tsx
import Card from '@/components/Card';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const dummyKBArticles = [
  { id: 'sop001', title: 'Standard Operating Procedure for PCR', category: 'SOP', keywords: ['pcr', 'molecular biology', 'dna'] },
  { id: 'msds001', title: 'MSDS: Ethanol (70%)', category: 'MSDS', keywords: ['ethanol', 'alcohol', 'safety data sheet'] },
  { id: 'guide001', title: 'Guide to Using the Autoclave', category: 'Guides', keywords: ['autoclave', 'sterilization', 'equipment'] },
  { id: 'sop002', title: 'SOP: Cell Culture Contamination Check', category: 'SOP', keywords: ['cell culture', 'aseptic', 'contamination'] },
];

export default function KnowledgeBaseScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredArticles = dummyKBArticles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.keywords.some(keyword => keyword.includes(searchTerm.toLowerCase()))
  );

  const renderArticleItem = ({ item }: { item: typeof dummyKBArticles[0] }) => (
    <TouchableOpacity onPress={() => {/* Navigate to article details if implemented */}}>
      <Card style={styles.articleCard}>
        <Text style={styles.articleTitle}>{item.title}</Text>
        <Text style={styles.articleCategory}>Category: {item.category}</Text>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search SOPs, MSDS, Guides..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>
      <FlatList
        data={filteredArticles}
        renderItem={renderArticleItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    margin: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  articleCard: {
    marginBottom: 12,
  },
  articleTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  articleCategory: {
    fontSize: 13,
    color: '#777',
  },
});