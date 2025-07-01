import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import salonService from '../services/salonService';

const SalonDetails = ({ route, navigation }) => {
  const { salonId } = route.params;
  const [salon, setSalon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);

  useEffect(() => {
    fetchSalonDetails();
  }, [salonId]);

  const fetchSalonDetails = async () => {
    try {
      const data = await salonService.getSalonById(salonId);
      setSalon(data);
    } catch (error) {
      console.error('Erreur chargement détails salon', error);
      Alert.alert('Erreur', 'Impossible de charger les détails du salon');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un commentaire');
      return;
    }

    try {
      await salonService.addComment(salonId, newRating, newComment);
      setCommentModalVisible(false);
      setNewComment('');
      setNewRating(5);
      fetchSalonDetails(); // Recharger les données
      Alert.alert('Succès', 'Votre avis a été ajouté !');
    } catch (error) {
      console.error('Erreur ajout commentaire', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter votre avis');
    }
  };

  const renderStars = (rating, size = 16, onPress = null) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity 
          key={i} 
          onPress={onPress ? () => onPress(i) : null}
          disabled={!onPress}
        >
          <Ionicons
            name={i <= rating ? "star" : "star-outline"}
            size={size}
            color="#FFD700"
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getDefaultImage = (categorie) => {
    switch(categorie) {
      case 'homme':
        return 'https://via.placeholder.com/400x200/4A90E2/FFFFFF?text=Salon+Homme';
      case 'femme':
        return 'https://via.placeholder.com/400x200/E24A90/FFFFFF?text=Salon+Femme';
      case 'mixte':
      default:
        return 'https://via.placeholder.com/400x200/FF6B6B/FFFFFF?text=Salon+Mixte';
    }
  };

  const getCategorieColor = (categorie) => {
    switch(categorie) {
      case 'homme': return '#4A90E2';
      case 'femme': return '#E24A90';
      case 'mixte': return '#FF6B6B';
      default: return '#666';
    }
  };

  const formatHoraires = (horaires) => {
    if (!horaires || horaires.length === 0) {
      return 'Horaires non disponibles';
    }
    
    const joursOrdre = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
    const horairesOrdonnes = horaires.sort((a, b) => 
      joursOrdre.indexOf(a.jour.toLowerCase()) - joursOrdre.indexOf(b.jour.toLowerCase())
    );

    return horairesOrdonnes.map(h => 
      `${h.jour}: ${h.ouverture} - ${h.fermeture}`
    ).join('\n');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!salon) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Ionicons name="warning" size={60} color="#FF6B6B" />
          <Text style={styles.errorText}>Salon non trouvé</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Calculer la note moyenne
  const avgRating = salon.commentaires && salon.commentaires.length > 0
    ? salon.commentaires.reduce((sum, comment) => sum + comment.note, 0) / salon.commentaires.length
    : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Image du salon */}
        <Image
          source={{ uri: salon.imageUrl || getDefaultImage(salon.categorie) }}
          style={styles.image}
        />

        {/* Informations principales */}
        <View style={styles.mainInfo}>
          <View style={styles.headerRow}>
            <Text style={styles.name}>{salon.name}</Text>
            <View style={[styles.categorieTag, { backgroundColor: getCategorieColor(salon.categorie) }]}>
              <Text style={styles.categorieTagText}>{salon.categorie}</Text>
            </View>
          </View>

          <View style={styles.ratingContainer}>
            <View style={styles.stars}>
              {renderStars(Math.round(avgRating), 20)}
            </View>
            <Text style={styles.ratingText}>
              {avgRating > 0 ? avgRating.toFixed(1) : 'Nouveau'} 
              ({salon.commentaires?.length || 0} avis)
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="location" size={20} color="#666" />
            <Text style={styles.infoText}>
              {salon.address}{salon.ville ? `, ${salon.ville}` : ''}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="cash" size={20} color="#666" />
            <Text style={styles.infoText}>À partir de {salon.prixMinimum}€</Text>
          </View>
        </View>

        {/* Description */}
        {salon.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{salon.description}</Text>
          </View>
        )}

        {/* Horaires */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Horaires d'ouverture</Text>
          <View style={styles.horairesContainer}>
            <Ionicons name="time" size={20} color="#666" style={styles.horairesIcon} />
            <Text style={styles.horaires}>{formatHoraires(salon.horaires)}</Text>
          </View>
        </View>

        {/* Avis et commentaires */}
        <View style={styles.section}>
          <View style={styles.commentsHeader}>
            <Text style={styles.sectionTitle}>
              Avis ({salon.commentaires?.length || 0})
            </Text>
            <TouchableOpacity
              style={styles.addCommentButton}
              onPress={() => setCommentModalVisible(true)}
            >
              <Ionicons name="add" size={20} color="#FFF" />
              <Text style={styles.addCommentText}>Laisser un avis</Text>
            </TouchableOpacity>
          </View>

          {salon.commentaires && salon.commentaires.length > 0 ? (
            salon.commentaires.map((comment, index) => (
              <View key={index} style={styles.commentCard}>
                <View style={styles.commentHeader}>
                  <View style={styles.commentStars}>
                    {renderStars(comment.note, 14)}
                  </View>
                  <Text style={styles.commentDate}>
                    {formatDate(comment.date)}
                  </Text>
                </View>
                <Text style={styles.commentText}>{comment.commentaire}</Text>
              </View>
            ))
          ) : (
            <View style={styles.noComments}>
              <Ionicons name="chatbubble-outline" size={40} color="#DDD" />
              <Text style={styles.noCommentsText}>Aucun avis pour le moment</Text>
              <Text style={styles.noCommentsSubtext}>Soyez le premier à laisser un avis !</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal pour ajouter un commentaire */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={commentModalVisible}
        onRequestClose={() => setCommentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Laisser un avis</Text>
              <TouchableOpacity
                onPress={() => setCommentModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.ratingLabel}>Note :</Text>
            <View style={styles.ratingSelector}>
              {renderStars(newRating, 30, setNewRating)}
            </View>

            <Text style={styles.commentLabel}>Commentaire :</Text>
            <TextInput
              style={styles.commentInput}
              multiline
              numberOfLines={4}
              placeholder="Partagez votre expérience..."
              value={newComment}
              onChangeText={setNewComment}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setCommentModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleAddComment}
              >
                <Text style={styles.submitButtonText}>Publier</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 18,
    color: '#333',
    marginTop: 10,
  },
  backButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  image: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  mainInfo: {
    backgroundColor: '#FFF',
    padding: 20,
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  categorieTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  categorieTagText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  stars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  section: {
    backgroundColor: '#FFF',
    marginHorizontal: 15,
    marginTop: 15,
    padding: 20,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  horairesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  horairesIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  horaires: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    flex: 1,
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  addCommentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addCommentText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  commentCard: {
    backgroundColor: '#F8F8F8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentStars: {
    flexDirection: 'row',
  },
  commentDate: {
    fontSize: 12,
    color: '#999',
  },
  commentText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  noComments: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  noCommentsText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  noCommentsSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  ratingSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  commentLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginRight: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    marginLeft: 10,
  },
  submitButtonText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
  },
});

export default SalonDetails;