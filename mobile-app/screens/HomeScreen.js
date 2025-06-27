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
import salonService from '../services/salonService'; // correction import salonService par défaut
import SalonCard from '../components/SalonCard';
import Header from '../components/Header';

const HomeScreen = ({ navigation }) => {
  const [salons, setSalons] = useState([]);
  const [filteredSalons, setFilteredSalons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSalons();
  }, []);

  const fetchSalons = async () => {
    setIsLoading(true);
    try {
      const response = await salonService.getAllSalons();

      // sécuriser les données reçues, valeurs par défaut
      const safeSalons = response.map((salon, index) => ({
        id: salon.id || salon._id || `salon-${index}`,
        name: salon.name || salon.nom || 'Salon sans nom',
        address: salon.address || salon.adresse || 'Adresse non disponible',
        rating: salon.rating || salon.note || 0,
        numReviews: salon.numReviews || salon.nombreAvis || 0,
        minPrice: salon.minPrice || salon.prixMin || 0,
        distance: salon.distance || null,
        imageUrl: salon.imageUrl || salon.image || null,
        ...salon,
      }));

      setSalons(safeSalons);
      setFilteredSalons(safeSalons);
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

    if (text.trim() === '') {
      filterSalons(activeFilter);
      return;
    }

    const filtered = salons.filter((salon) => {
      const name = salon.name || '';
      const address = salon.address || '';
      return (
        name.toLowerCase().includes(text.toLowerCase()) ||
        address.toLowerCase().includes(text.toLowerCase())
      );
    });

    setFilteredSalons(filtered);
  };

  const filterSalons = (filter) => {
    setActiveFilter(filter);
    let filtered = [...salons];

    switch (filter) {
      case 'nearest':
        filtered.sort((a, b) => (a.distance || 999) - (b.distance || 999));
        break;
      case 'cheapest':
        filtered.sort((a, b) => (a.minPrice || 0) - (b.minPrice || 0));
        break;
      case 'best_rated':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        break;
    }

    if (searchQuery.trim() !== '') {
      filtered = filtered.filter((salon) => {
        const name = salon.name || '';
        const address = salon.address || '';
        return (
          name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          address.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
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
          renderItem={({ item }) => <SalonCard salon={item} navigation={navigation} />}
          keyExtractor={(item, index) =>
            item.id ? item.id.toString() : `salon-${index}`
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
  filtersContainer: { marginVertical: 10, paddingHorizontal: 15 },
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
  listContainer: { paddingBottom: 20 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 20 },
  emptySubtext: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 10 },
});

export default HomeScreen;
