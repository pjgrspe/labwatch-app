// app/more/knowledge-base.tsx
import Card from '@/components/Card';
import { Text as ThemedText, View as ThemedView } from '@/components/Themed';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

const dummyKBArticles = [
  { id: 'sop001', title: 'Standard Operating Procedure for PCR', category: 'SOP', keywords: ['pcr', 'molecular biology', 'dna'] },
  { id: 'msds001', title: 'MSDS: Ethanol (70%)', category: 'MSDS', keywords: ['ethanol', 'alcohol', 'safety data sheet'] },
  { id: 'guide001', title: 'Guide to Using the Autoclave', category: 'Guides', keywords: ['autoclave', 'sterilization', 'equipment'] },
  { id: 'sop002', title: 'SOP: Cell Culture Contamination Check', category: 'SOP', keywords: ['cell culture', 'aseptic', 'contamination'] },
];

export default function KnowledgeBaseScreen() {
  const [searchTerm, setSearchTerm] = useState('');

  const containerBackgroundColor = useThemeColor({}, 'background');
  const searchContainerBackgroundColor = useThemeColor({}, 'cardBackground');
  const searchIconColor = useThemeColor({}, 'icon');
  const searchInputColor = useThemeColor({}, 'text');
  const placeholderTextColor = useThemeColor({}, 'icon');
  const articleTitleColor = useThemeColor({}, 'text');
  const articleCategoryColor = useThemeColor({}, 'icon');


  const filteredArticles = dummyKBArticles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.keywords.some(keyword => keyword.includes(searchTerm.toLowerCase()))
  );

  const renderArticleItem = ({ item }: { item: typeof dummyKBArticles[0] }) => (
    <TouchableOpacity onPress={() => {/* Navigate to article details if implemented */}}>
      <Card style={styles.articleCard}>
        <ThemedText style={[styles.articleTitle, { color: articleTitleColor }]}>{item.title}</ThemedText>
        <ThemedText style={[styles.articleCategory, { color: articleCategoryColor }]}>Category: {item.category}</ThemedText>
      </Card>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor: containerBackgroundColor }]}>
      <ThemedView style={[styles.searchContainer, { backgroundColor: searchContainerBackgroundColor }]}>
        <Ionicons name="search-outline" size={20} color={searchIconColor} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, {color: searchInputColor}]}
          placeholder="Search SOPs, MSDS, Guides..."
          placeholderTextColor={placeholderTextColor}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </ThemedView>
      <FlatList
        data={filteredArticles}
        renderItem={renderArticleItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    margin: 16,
    borderRadius: 8,
    elevation: 2, // Keep for Android
    shadowColor: '#000', // Keep for iOS
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
    marginBottom: 4,
  },
  articleCategory: {
    fontSize: 13,
  },
});