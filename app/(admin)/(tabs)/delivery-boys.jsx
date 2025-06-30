import { Ionicons } from '@expo/vector-icons';
import firestore from '@react-native-firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CommunityService from '../../../src/services/community';

export default function DeliveryBoysScreen() {
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [communities, setCommunities] = useState([]);
  const [saving, setSaving] = useState(false);
  const [selectedCommunities, setSelectedCommunities] = useState([]);
  const [communityDropdownVisible, setCommunityDropdownVisible] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchDeliveryBoys();
    fetchCommunities();
  }, []);

  const fetchDeliveryBoys = async () => {
    setLoading(true);
    try {
      const snapshot = await firestore().collection('users').where('role', '==', 'delivery').get();
      const boys = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDeliveryBoys(boys);
    } catch (error) {
      Alert.alert('Error', 'Failed to load delivery boys.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCommunities = async () => {
    try {
      const comms = await CommunityService.getCommunities();
      setCommunities(comms);
    } catch (error) {
      setCommunities([]);
    }
  };

  const handleToggleCommunity = (id) => {
    setSelectedCommunities((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const resetForm = () => {
    setName('');
    setPhone('');
    setEmail('');
    setSelectedCommunities([]);
    setEditId(null);
  };

  const openEditModal = (boy) => {
    setEditId(boy.id);
    setName(boy.profile?.name || '');
    setPhone(boy.phoneNumber || '');
    setEmail(boy.profile?.email || '');
    if (Array.isArray(boy.profile?.communityIds)) {
      setSelectedCommunities(boy.profile.communityIds);
    } else if (boy.profile?.communityId) {
      setSelectedCommunities([boy.profile.communityId]);
    } else {
      setSelectedCommunities([]);
    }
    setModalVisible(true);
  };

  const handleDelete = (boy) => {
    Alert.alert(
      'Delete Delivery Boy',
      `Are you sure you want to delete ${boy.profile?.name || 'this delivery boy'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            try {
              await firestore().collection('users').doc(boy.id).delete();
              fetchDeliveryBoys();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete delivery boy.');
            }
          }
        }
      ]
    );
  };

  const handleAddOrEditDeliveryBoy = async () => {
    if (!name.trim() || !phone.trim() || selectedCommunities.length === 0) {
      Alert.alert('Validation', 'Please fill all fields and select at least one community.');
      return;
    }
    setSaving(true);
    try {
      const profile = {
        name: name.trim(),
        email: email.trim(),
        communityIds: selectedCommunities,
        isProfileComplete: true,
      };
      if (editId) {
        // Update existing delivery boy
        await firestore().collection('users').doc(editId).update({
          profile,
          phoneNumber: phone.trim(),
          updatedAt: new Date().toISOString(),
        });
      } else {
        // Add new delivery boy
        await firestore().collection('users').add({
          profile,
          phoneNumber: phone.trim(),
          role: 'delivery',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      setModalVisible(false);
      resetForm();
      fetchDeliveryBoys();
    } catch (error) {
      Alert.alert('Error', 'Failed to save delivery boy.');
    } finally {
      setSaving(false);
    }
  };

  const renderBoy = ({ item }) => {
    let communityNames = 'No Community';
    if (Array.isArray(item.profile?.communityIds) && item.profile.communityIds.length > 0) {
      communityNames = communities
        .filter(c => item.profile.communityIds.includes(c.id))
        .map(c => c.name)
        .join(', ');
    } else if (typeof item.profile?.communityId === 'string' && item.profile.communityId) {
      const comm = communities.find(c => c.id === item.profile.communityId);
      communityNames = comm ? comm.name : 'No Community';
    }
    return (
      <View style={styles.boyCard}>
        <Ionicons name="bicycle-outline" size={26} color="#2196F3" style={{ marginRight: 10 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.boyName}>{item.profile?.name || 'No Name'}</Text>
          <Text style={styles.boyPhone}>{item.phoneNumber}</Text>
          <Text style={styles.boyCommunity}>{communityNames}</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={() => openEditModal(item)}>
          <Ionicons name="pencil" size={20} color="#1976D2" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(item)}>
          <Ionicons name="trash" size={20} color="#F44336" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>
          Delivery Boys <Text style={styles.count}>({deliveryBoys.length})</Text>
        </Text>
        <TouchableOpacity style={styles.addButton} onPress={() => { resetForm(); setModalVisible(true); }}>
          <Ionicons name="add-circle" size={24} color="#1976D2" />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color="#1976D2" /></View>
      ) : deliveryBoys.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="bicycle-outline" size={54} color="#E0E0E0" style={{ marginBottom: 14 }} />
          <Text style={styles.emptyText}>No delivery boys found.</Text>
        </View>
      ) : (
        <FlatList
          data={deliveryBoys}
          keyExtractor={item => item.id}
          renderItem={renderBoy}
          contentContainerStyle={{ padding: 16 }}
        />
      )}
      {/* Add/Edit Delivery Boy Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => { setModalVisible(false); resetForm(); }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editId ? 'Edit Delivery Boy' : 'Add Delivery Boy'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <TextInput
              style={styles.input}
              placeholder="Email (optional)"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View style={styles.selectContainer}>
              <Text style={styles.selectLabel}>Communities</Text>
              <TouchableOpacity
                style={[styles.selectBox, { flexDirection: 'row', alignItems: 'center', height: 44, paddingHorizontal: 12 }]}
                onPress={() => setCommunityDropdownVisible(true)}
                activeOpacity={0.8}
              >
                <Text style={{ flex: 1, color: selectedCommunities.length ? '#222' : '#888', fontSize: 15 }}>
                  {selectedCommunities.length
                    ? communities.filter(c => selectedCommunities.includes(c.id)).map(c => c.name).join(', ')
                    : 'Select Communities'}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#888" />
              </TouchableOpacity>
              {/* Multi-select Dropdown Modal */}
              <Modal
                visible={communityDropdownVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setCommunityDropdownVisible(false)}
              >
                <TouchableOpacity style={styles.dropdownOverlay} activeOpacity={1} onPress={() => setCommunityDropdownVisible(false)}>
                  <View style={styles.dropdownModal}>
                    <FlatList
                      data={communities}
                      keyExtractor={item => item.id}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={[styles.dropdownItem, { flexDirection: 'row', alignItems: 'center' }]}
                          onPress={() => handleToggleCommunity(item.id)}
                        >
                          <Ionicons
                            name={selectedCommunities.includes(item.id) ? 'checkbox' : 'square-outline'}
                            size={20}
                            color={selectedCommunities.includes(item.id) ? '#1976D2' : '#888'}
                            style={{ marginRight: 10 }}
                          />
                          <Text style={{ fontSize: 16, color: '#222', flex: 1 }}>{item.name}</Text>
                        </TouchableOpacity>
                      )}
                    />
                    <TouchableOpacity
                      style={{ alignSelf: 'flex-end', marginTop: 10, paddingHorizontal: 16, paddingVertical: 8 }}
                      onPress={() => setCommunityDropdownVisible(false)}
                    >
                      <Text style={{ color: '#1976D2', fontWeight: '700', fontSize: 15 }}>Done</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </Modal>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => { setModalVisible(false); resetForm(); }} disabled={saving}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAddOrEditDeliveryBoy} disabled={saving}>
                {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveBtnText}>Save</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#1976D2' },
  addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E3F2FD', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  addButtonText: { color: '#1976D2', fontWeight: '700', fontSize: 16, marginLeft: 6 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 16, color: '#888', marginTop: 8 },
  boyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 14, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2 },
  boyName: { fontSize: 16, fontWeight: '700', color: '#222' },
  boyPhone: { fontSize: 14, color: '#666', marginTop: 2 },
  boyCommunity: { fontSize: 13, color: '#1976D2', marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: 340, maxWidth: '90%' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1976D2', marginBottom: 18 },
  input: { borderWidth: 1, borderColor: '#E3F2FD', borderRadius: 10, padding: 12, fontSize: 15, marginBottom: 12, backgroundColor: '#F5F6FB' },
  selectContainer: { marginBottom: 12 },
  selectLabel: { fontSize: 14, color: '#333', marginBottom: 4 },
  selectBox: { borderWidth: 1, borderColor: '#E3F2FD', borderRadius: 10, backgroundColor: '#F5F6FB' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 18 },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8, backgroundColor: '#eee', marginRight: 10 },
  cancelBtnText: { color: '#666', fontWeight: '600' },
  saveBtn: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8, backgroundColor: '#1976D2' },
  saveBtnText: { color: '#fff', fontWeight: '700' },
  dropdownOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' },
  dropdownModal: { backgroundColor: '#fff', borderRadius: 12, paddingVertical: 8, width: 300, maxHeight: 320, elevation: 4 },
  dropdownItem: { paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  count: { fontSize: 15, color: '#1976D2', fontWeight: '600' },
  iconBtn: { padding: 6, marginLeft: 2 },
}); 