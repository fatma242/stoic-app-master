import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Community() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const [stories, setStories] = useState([]);
  const [groups, setGroups] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch community data
  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        // Replace with your API endpoints
        const storiesResponse = await fetch('https://your-api.com/stories');
        const groupsResponse = await fetch('https://your-api.com/groups');
        const discussionsResponse = await fetch('https://your-api.com/discussions');

        const storiesData = await storiesResponse.json();
        const groupsData = await groupsResponse.json();
        const discussionsData = await discussionsResponse.json();

        setStories(storiesData);
        setGroups(groupsData);
        setDiscussions(discussionsData);
      } catch (error) {
        console.error('Error fetching community data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunityData();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, isDarkMode && styles.darkContainer]}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, isDarkMode && styles.darkText]}>Community</Text>
        <View style={styles.headerIcons}>
          <Ionicons name="notifications-outline" size={24} color={isDarkMode ? 'white' : 'black'} />
          <Ionicons name="chatbubble-ellipses-outline" size={24} color={isDarkMode ? 'white' : 'black'} style={styles.iconSpacing} />
        </View>
      </View>

      {/* Stories Section */}
      <FlatList
        data={stories}
        horizontal
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.storyItem}>
            <Image source={{ uri: item.avatar }} style={styles.storyImage} />
            <Text style={[styles.storyText, isDarkMode && styles.darkText]}>{item.name}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.storyList}
        showsHorizontalScrollIndicator={false}
      />

      {/* Support Groups */}
      <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Support Groups</Text>
      <View style={styles.groupsContainer}>
        {groups.map((group) => (
          <TouchableOpacity key={group.id} style={styles.groupItem}>
            <Ionicons name={group.icon} size={20} color="#4CAF50" />
            <View>
              <Text style={[styles.groupTitle, isDarkMode && styles.darkText]}>{group.name}</Text>
              <Text style={styles.groupMembers}>{group.members} members</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Discussions */}
      <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Recent Discussions</Text>
      <FlatList
        data={discussions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.postItem, isDarkMode && styles.darkPost]}>
            <Text style={[styles.postUser, isDarkMode && styles.darkText]}>{item.user}</Text>
            <Text style={styles.postTime}>{item.time}</Text>
            <Text style={[styles.postText, isDarkMode && styles.darkText]}>{item.text}</Text>
            <View style={styles.postActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="heart-outline" size={16} color="#4CAF50" />
                <Text style={styles.actionText}>{item.likes}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="chatbubble-outline" size={16} color="#4CAF50" />
                <Text style={styles.actionText}>{item.comments}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="share-outline" size={16} color="#4CAF50" />
                <Text style={styles.actionText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  darkContainer: {
    backgroundColor: '#0f402c',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  darkText: {
    color: 'white',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconSpacing: {
    marginLeft: 10,
  },
  storyList: {
    paddingVertical: 10,
  },
  storyItem: {
    alignItems: 'center',
    marginRight: 15,
  },
  storyImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  storyText: {
    marginTop: 5,
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  groupsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  groupItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    marginBottom: 10,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  groupMembers: {
    fontSize: 12,
    color: '#777',
    marginLeft: 8,
  },
  postItem: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    marginBottom: 10,
  },
  darkPost: {
    backgroundColor: '#1b2d24',
  },
  postUser: {
    fontWeight: 'bold',
  },
  postTime: {
    fontSize: 12,
    color: '#777',
  },
  postText: {
    marginTop: 5,
    fontSize: 14,
  },
  postActions: {
    flexDirection: 'row',
    marginTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  actionText: {
    marginLeft: 5,
    fontSize: 12,
    color: '#4CAF50',
  },
});

  