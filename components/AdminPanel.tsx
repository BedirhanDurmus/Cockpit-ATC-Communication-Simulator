import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface AdminPanelProps {
  onLogout: () => void;
  onBack: () => void;
}

const { width } = Dimensions.get('window');

export default function AdminPanel({ onLogout, onBack }: AdminPanelProps) {
  const [selectedTab, setSelectedTab] = useState('dashboard');

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Admin panelinden çıkış yapmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Çıkış Yap', onPress: onLogout },
      ]
    );
  };

  const renderDashboard = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Dashboard</Text>
      
      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <LinearGradient
            colors={['#FFD700', '#B8860B']}
            style={styles.statCardGradient}
          >
            <Ionicons name="people" size={32} color="#000" />
            <Text style={styles.statNumber}>1,247</Text>
            <Text style={styles.statLabel}>Toplam Kullanıcı</Text>
          </LinearGradient>
        </View>

        <View style={styles.statCard}>
          <LinearGradient
            colors={['#00D4AA', '#00A86B']}
            style={styles.statCardGradient}
          >
            <Ionicons name="airplane" size={32} color="#000" />
            <Text style={styles.statNumber}>89</Text>
            <Text style={styles.statLabel}>Aktif Uçuş</Text>
          </LinearGradient>
        </View>

        <View style={styles.statCard}>
          <LinearGradient
            colors={['#FF6B6B', '#FF4757']}
            style={styles.statCardGradient}
          >
            <Ionicons name="trending-up" size={32} color="#000" />
            <Text style={styles.statNumber}>94.2%</Text>
            <Text style={styles.statLabel}>Başarı Oranı</Text>
          </LinearGradient>
        </View>

        <View style={styles.statCard}>
          <LinearGradient
            colors={['#FFA500', '#FF8C00']}
            style={styles.statCardGradient}
          >
            <Ionicons name="time" size={32} color="#000" />
            <Text style={styles.statNumber}>2.3s</Text>
            <Text style={styles.statLabel}>Ortalama Yanıt</Text>
          </LinearGradient>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Son Aktiviteler</Text>
        <View style={styles.activityList}>
          {[
            { action: 'Yeni kullanıcı kaydı', time: '2 dakika önce', type: 'user' },
            { action: 'ATC komut güncellendi', time: '15 dakika önce', type: 'update' },
            { action: 'Sistem yedeklemesi', time: '1 saat önce', type: 'system' },
            { action: 'Yeni eğitim modülü', time: '3 saat önce', type: 'module' },
          ].map((activity, index) => (
            <View key={index} style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: getActivityColor(activity.type) }]}>
                <Ionicons name={getActivityIcon(activity.type)} size={16} color="#FFF" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>{activity.action}</Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderUsers = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Kullanıcı Yönetimi</Text>
      
      <View style={styles.searchContainer}>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={20} color="#FFD700" />
          <Text style={styles.searchButtonText}>Kullanıcı Ara</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.addUserButton}>
          <Ionicons name="add" size={20} color="#FFF" />
          <Text style={styles.addUserButtonText}>Yeni Kullanıcı</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.userList}>
        {[
          { name: 'Ahmet Yılmaz', email: 'ahmet@example.com', role: 'Pilot', status: 'active' },
          { name: 'Fatma Demir', email: 'fatma@example.com', role: 'ATC', status: 'active' },
          { name: 'Mehmet Kaya', email: 'mehmet@example.com', role: 'Öğrenci', status: 'inactive' },
          { name: 'Ayşe Özkan', email: 'ayse@example.com', role: 'Eğitmen', status: 'active' },
        ].map((user, index) => (
          <View key={index} style={styles.userCard}>
            <View style={styles.userInfo}>
              <View style={[styles.userAvatar, { backgroundColor: getStatusColor(user.status) }]}>
                <Text style={styles.userInitial}>{user.name.charAt(0)}</Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
                <Text style={styles.userRole}>{user.role}</Text>
              </View>
            </View>
            <View style={styles.userActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="create" size={16} color="#FFD700" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="trash" size={16} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderSettings = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Sistem Ayarları</Text>
      
      <View style={styles.settingsList}>
        {[
          { title: 'Genel Ayarlar', icon: 'settings', description: 'Sistem genel ayarları' },
          { title: 'Güvenlik', icon: 'shield-checkmark', description: 'Güvenlik ve yetkilendirme' },
          { title: 'Yedekleme', icon: 'cloud-upload', description: 'Veri yedekleme ayarları' },
          { title: 'Bildirimler', icon: 'notifications', description: 'Bildirim tercihleri' },
          { title: 'Entegrasyonlar', icon: 'link', description: 'API ve entegrasyon ayarları' },
          { title: 'Güncellemeler', icon: 'refresh', description: 'Sistem güncellemeleri' },
        ].map((setting, index) => (
          <TouchableOpacity key={index} style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Ionicons name={setting.icon as any} size={24} color="#FFD700" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>{setting.title}</Text>
              <Text style={styles.settingDescription}>{setting.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user': return '#00D4AA';
      case 'update': return '#FFD700';
      case 'system': return '#FFA500';
      case 'module': return '#FF6B6B';
      default: return '#666';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user': return 'person-add';
      case 'update': return 'refresh';
      case 'system': return 'settings';
      case 'module': return 'library';
      default: return 'information-circle';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? '#00D4AA' : '#FF6B6B';
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a1a', '#2d2d2d', '#1a1a1a']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color="#FFD700" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Admin Panel</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out" size={24} color="#FF6B6B" />
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabNavigation}>
          {[
            { id: 'dashboard', title: 'Dashboard', icon: 'grid' },
            { id: 'users', title: 'Kullanıcılar', icon: 'people' },
            { id: 'settings', title: 'Ayarlar', icon: 'settings' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tabButton,
                selectedTab === tab.id && styles.tabButtonActive,
              ]}
              onPress={() => setSelectedTab(tab.id)}
            >
              <Ionicons
                name={tab.icon as any}
                size={20}
                color={selectedTab === tab.id ? '#000' : '#FFD700'}
              />
              <Text
                style={[
                  styles.tabButtonText,
                  selectedTab === tab.id && styles.tabButtonTextActive,
                ]}
              >
                {tab.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {selectedTab === 'dashboard' && renderDashboard()}
          {selectedTab === 'users' && renderUsers()}
          {selectedTab === 'settings' && renderSettings()}
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 215, 0, 0.3)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  logoutButton: {
    padding: 8,
  },
  tabNavigation: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 215, 0, 0.3)',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  tabButtonActive: {
    backgroundColor: '#FFD700',
  },
  tabButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFD700',
  },
  tabButtonTextActive: {
    color: '#000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  tabContent: {
    paddingVertical: 20,
  },
  tabTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 20,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    width: (width - 60) / 2,
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
  },
  statCardGradient: {
    padding: 20,
    alignItems: 'center',
    borderRadius: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#000',
    textAlign: 'center',
    fontWeight: '600',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 15,
  },
  activityList: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 15,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  activityTime: {
    color: '#999',
    fontSize: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  searchButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  searchButtonText: {
    color: '#FFD700',
    marginLeft: 8,
    fontWeight: '600',
  },
  addUserButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00D4AA',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  addUserButtonText: {
    color: '#FFF',
    marginLeft: 8,
    fontWeight: '600',
  },
  userList: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 15,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  userInitial: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    color: '#999',
    fontSize: 12,
    marginBottom: 2,
  },
  userRole: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '500',
  },
  userActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  settingsList: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 15,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    color: '#999',
    fontSize: 12,
  },
});
