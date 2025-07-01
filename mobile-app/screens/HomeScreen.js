import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import salonService from '../services/salonService';
import SalonCard from '../components/SalonCard';
import Header from '../components/Header';

const HomeScreen = ({ navigation }) => {
  const [salons, setSalons] = useState([]);
  const [filteredSalons, setFilteredSalons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeCategory, setActiveCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSalons();
  }, []);

  const fetchSalons = async () => {
    setIsLoading(true);
    try {
      const response = await salonService.getAllSalons();

      // Traitement des données selon le modèle MongoDB
      const processedSalons = response.map((salon, index) => {
        // Calculer la note moyenne
        const avgRating = salon.commentaires && salon.commentaires.length > 0
          ? salon.commentaires.reduce((sum, comment) => sum + comment.note, 0) / salon.commentaires.length
          : 0;

        return {
          _id: salon._id || `salon-${index}`,
          name: salon.name || 'Salon sans nom',
          address: salon.address || 'Adresse non disponible',
          ville: salon.ville || '',
          categorie: salon.categorie || 'mixte',
          description: salon.description || '',
          prixMinimum: salon.prixMinimum || 0,
          horaires: salon.horaires || [],
          commentaires: salon.commentaires || [],
          owner: salon.owner || null,
          createdAt: salon.createdAt || null,
          updatedAt: salon.updatedAt || null,
          // Données calculées
          rating: avgRating,
          numReviews: salon.commentaires ? salon.commentaires.length : 0,
          // Distance fictive (à remplacer par calcul réel)
          distance: Math.random() * 10 + 1, // 1-11 km
          ...salon,
        };
      });

      setSalons(processedSalons);
      setFilteredSalons(processedSalons);
    } catch (error) {
      console.error('Erreur lors de la récupération des salons:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSalons();
    setRefreshing(false);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    applyFilters(text, activeFilter, activeCategory);
  };

  const filterSalons = (filter) => {
    setActiveFilter(filter);
    applyFilters(searchQuery, filter, activeCategory);
  };

  const filterByCategory = (category) => {
    setActiveCategory(category);
    applyFilters(searchQuery, activeFilter, category);
  };

  const applyFilters = (searchText, sortFilter, categoryFilter) => {
    let filtered = [...salons];

    // Filtrage par catégorie
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(salon => salon.categorie === categoryFilter);
    }

    // Filtrage par recherche
    if (searchText.trim() !== '') {
      filtered = filtered.filter((salon) => {
        const name = salon.name || '';
        const address = salon.address || '';
        const ville = salon.ville || '';
        const description = salon.description || '';
        
        const searchLower = searchText.toLowerCase();
        return (
          name.toLowerCase().includes(searchLower) ||
          address.toLowerCase().includes(searchLower) ||
          ville.toLowerCase().includes(searchLower) ||
          description.toLowerCase().includes(searchLower)
        );
      });
    }

    // Tri selon le filtre actif
    switch (sortFilter) {
      case 'nearest':
        filtered.sort((a, b) => (a.distance || 999) - (b.distance || 999));
        break;
      case 'cheapest':
        filtered.sort((a, b) => (a.prixMinimum || 0) - (b.prixMinimum || 0));
        break;
      case 'best_rated':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'most_reviewed':
        filtered.sort((a, b) => (b.numReviews || 0) - (a.numReviews || 0));
        break;
      default:
        // Tri par défaut : les plus récents
        filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
    }

    setFilteredSalons(filtered);
  };

  const renderFilterButton = (title, value, icon) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        activeFilter === value && styles.filterButtonActive,
      ]}
      onPress={() => filterSalons(value)}
    >
      <Ionicons
        name={icon}
        size={16}
        color={activeFilter === value ? '#FFF' : '#666'}
      />
      <Text
        style={[
          styles.filterButtonText,
          activeFilter === value && styles.filterButtonTextActive,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderCategoryButton = (title, value, icon, color) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        activeCategory === value && { backgroundColor: color, borderColor: color },
      ]}
      onPress={() => filterByCategory(value)}
    >
      <Ionicons
        name={icon}
        size={16}
        color={activeCategory === value ? '#FFF' : color}
      />
      <Text
        style={[
          styles.categoryButtonText,
          activeCategory === value && styles.categoryButtonTextActive,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="HairStyle Finder" />

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un salon..."
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => handleSearch('')}
            >
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filtres par catégorie */}
      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {renderCategoryButton('Tous', 'all', 'grid', '#FF6B6B')}
          {renderCategoryButton('Homme', 'homme', 'man', '#4A90E2')}
          {renderCategoryButton('Femme', 'femme', 'woman', '#E24A90')}
          {renderCategoryButton('Mixte', 'mixte', 'people', '#FF6B6B')}
        </ScrollView>
      </View>

      {/* Filtres de tri */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {renderFilterButton('Récents', 'all', 'time')}
          {renderFilterButton('Plus proche', 'nearest', 'location')}
          {renderFilterButton('Moins cher', 'cheapest', 'cash')}
          {renderFilterButton('Mieux noté', 'best_rated', 'star')}
          {renderFilterButton('Plus d\'avis', 'most_reviewed', 'chatbubbles')}
        </ScrollView>
      </View>

      {/* Résultats */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          {filteredSalons.length} salon{filteredSalons.length > 1 ? 's' : ''} trouvé{filteredSalons.length > 1 ? 's' : ''}
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={styles.loadingText}>Chargement des salons...</Text>
        </View>
      ) : filteredSalons.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search" size={60} color="#DDD" />
          <Text style={styles.emptyText}>Aucun salon trouvé</Text>
          <Text style={styles.emptySubtext}>
            Essayez de modifier vos critères de recherche
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredSalons}
          renderItem={({ item }) => <SalonCard salon={item} />}
          keyExtractor={(item, index) =>
            item._id ? item._id.toString() : `salon-${index}`
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  searchContainer: { padding: 15, backgroundColor: '#FFF' },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: 40, fontSize: 16 },
  clearButton: { padding: 5 },
  
  categoriesContainer: { 
    marginVertical: 10, 
    paddingHorizontal: 15,
    backgroundColor: '#FFF',
    paddingVertical: 10,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    backgroundColor: '#FFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryButtonText: { marginLeft: 5, color: '#666', fontSize: 14, fontWeight: '600' },
  categoryButtonTextActive: { color: '#FFF' },
  
  filtersContainer: { marginBottom: 10, paddingHorizontal: 15 },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    backgroundColor: '#FFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterButtonActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  filterButtonText: { marginLeft: 5, color: '#666', fontSize: 14 },
  filterButtonTextActive: { color: '#FFF' },
  
  resultsHeader: {
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  resultsText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  
  listContainer: { paddingBottom: 20 },
  loaderContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#333', 
    marginTop: 20 
  },
  emptySubtext: { 
    fontSize: 14, 
    color: '#666', 
    textAlign: 'center', 
    marginTop: 10 
  },
});

export default HomeScreen;