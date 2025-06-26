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
import { salonService } from '../services/api';
import SalonCard from '../components/SalonCard';
import Header from '../components/Header';

const HomeScreen = ({ navigation }) => {
  const [salons, setSalons] = useState([]);
  const [filteredSalons, setFilteredSalons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  // Mock data pour le développement
  const mockSalons = [
    {
      id: '1',
      name: 'Coiffure Élégance',
      imageUrl: 'https://via.placeholder.com/150',
      rating: 4.5,
      numReviews: 120,
      address: '23 Avenue des Fleurs, Lyon',
      minPrice: 25,
      distance: 0.8,
    },
    {
      id: '2',
      name: 'Studio Coupe',
      imageUrl: 'https://via.placeholder.com/150',
      rating: 4.2,
      numReviews: 85,
      address: '45 Rue de la République, Lyon',
      minPrice: 30,
      distance: 1.2,
    },
    {
      id: '3',
      name: 'Hair Fashion',
      imageUrl: 'https://via.placeholder.com/150',
      rating: 4.8,
      numReviews: 210,
      address: '12 Place Bellecour, Lyon',
      minPrice: 35,
      distance: 1.5,
    },
    {
      id: '4',
      name: 'Coiffure Express',
      imageUrl: 'https://via.placeholder.com/150',
      rating: 3.9,
      numReviews: 56,
      address: '78 Rue Garibaldi, Lyon',
      minPrice: 18,
      distance: 2.3,
    },
    {
      id: '5',
      name: 'Le Salon Parfait',
      imageUrl: 'https://via.placeholder.com/150',
      rating: 4.6,
      numReviews: 175,
      address: '34 Avenue Jean Jaurès, Lyon',
      minPrice: 40,
      distance: 3.0,
    },
  ];

  useEffect(() => {
    fetchSalons();
  }, []);

  const fetchSalons = async () => {
    setIsLoading(true);
    try {
      // Dans un environnement réel, remplacer par l'appel API
      // const response = await salonService.getAllSalons();
      // setSalons(response);
      // setFilteredSalons(response);
      
      // Utilisation de mock data pour le développement
      setTimeout(() => {
        setSalons(mockSalons);
        setFilteredSalons(mockSalons);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Erreur lors de la récupération des salons:', error);
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
    
    if (text.trim() === '') {
      filterSalons(activeFilter);
      return;
    }
    
    const filtered = salons.filter((salon) => 
      salon.name.toLowerCase().includes(text.toLowerCase()) ||
      salon.address.toLowerCase().includes(text.toLowerCase())
    );
    
    setFilteredSalons(filtered);
  };

  const filterSalons = (filter) => {
    setActiveFilter(filter);
    let filtered = [...salons];
    
    switch (filter) {
      case 'nearest':
        filtered.sort((a, b) => a.distance - b.distance);
        break;
      case 'cheapest':
        filtered.sort((a, b) => a.minPrice - b.minPrice);
        break;
      case 'best_rated':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      default:
        // "all" - pas de tri spécifique
        break;
    }
    
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter((salon) => 
        salon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        salon.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
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
      
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {renderFilterButton('Tous', 'all', 'grid')}
          {renderFilterButton('Plus proche', 'nearest', 'location')}
          {renderFilterButton('Moins cher', 'cheapest', 'cash')}
          {renderFilterButton('Mieux noté', 'best_rated', 'star')}
        </ScrollView>
      </View>
      
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
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
          keyExtractor={(item) => item.id.toString()}
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
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  searchContainer: {
    padding: 15,
    backgroundColor: '#FFF',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  clearButton: {
    padding: 5,
  },
  filtersContainer: {
    marginVertical: 10,
    paddingHorizontal: 15,
  },
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
  filterButtonText: {
    marginLeft: 5,
    color: '#666',
    fontSize: 14,
  },
  filterButtonTextActive: {
    color: '#FFF',
  },
  listContainer: {
    paddingBottom: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default HomeScreen;