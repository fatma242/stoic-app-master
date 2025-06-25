import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Update the interfaces to make author optional:
interface Post {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  author?: {
    userId: number;
    username: string;
  };
  likes: number;
  isLikedByUser: boolean;
}

interface Comment {
  id: number;
  content: string;
  date: string;
  author?: {
    userId: number;
    username: string;
  };
}

export default function PostDetailsScreen() {
  const router = useRouter();
  const { postId, roomId } = useLocalSearchParams();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [newComment, setNewComment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const API_BASE_URL = "http://192.168.1.2:8100";

  useEffect(() => {
    loadUserData();
    if (postId) {
      fetchPostDetails();
      fetchComments();
    }
  }, [postId]);

  const loadUserData = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem("userId");
      if (storedUserId) {
        setUserId(parseInt(storedUserId));
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const fetchPostDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch post");
      const data: Post = await response.json();
      setPost(data);
    } catch (error) {
      Alert.alert("Error", "Could not load post details");
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/comments/post/${postId}`, {
        credentials: "include",
      });
      if (response.status === 204) {
        setComments([]);
        return;
      }
      if (!response.ok) throw new Error("Failed to fetch comments");
      const data: Comment[] = await response.json();
      setComments(data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!post || isLiking) return;
    
    setIsLiking(true);
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
        method: "POST",
        credentials: "include",
      });
      
      if (!response.ok) throw new Error("Failed to like post");
      
      // Update post like status
      setPost(prev => prev ? {
        ...prev,
        likes: prev.isLikedByUser ? prev.likes - 1 : prev.likes + 1,
        isLikedByUser: !prev.isLikedByUser
      } : null);
    } catch (error) {
      Alert.alert("Error", "Could not like post");
    } finally {
      setIsLiking(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || isCommenting) return;
    
    setIsCommenting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newComment,
          postId: parseInt(postId as string),
        }),
        credentials: "include",
      });
      
      if (!response.ok) throw new Error("Failed to add comment");
      
      setNewComment("");
      fetchComments(); // Refresh comments
    } catch (error) {
      Alert.alert("Error", "Could not add comment");
    } finally {
      setIsCommenting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#16A34A" />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Post not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post Details</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Post Details */}
        <View style={styles.postCard}>
          <Text style={styles.postTitle}>{post.title}</Text>
          <Text style={styles.postContent}>{post.content}</Text>
          <Text style={styles.postAuthor}>By: {post.author?.username || 'Unknown Author'}</Text>
          <Text style={styles.postDate}>
            {new Date(post.createdAt).toLocaleDateString()}
          </Text>
          
          {/* Like Button */}
          <TouchableOpacity 
            style={styles.likeButton} 
            onPress={handleLike}
            disabled={isLiking}
          >
            <Ionicons 
              name={post.isLikedByUser ? "heart" : "heart-outline"} 
              size={24} 
              color={post.isLikedByUser ? "#ef4444" : "#666"} 
            />
            <Text style={styles.likeCount}>{post.likes}</Text>
          </TouchableOpacity>
        </View>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <Text style={styles.sectionTitle}>Comments ({comments.length})</Text>
          
          {/* Add Comment */}
          <View style={styles.addCommentContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment..."
              placeholderTextColor="#888"
              value={newComment}
              onChangeText={setNewComment}
              multiline
            />
            <TouchableOpacity 
              style={styles.addCommentButton} 
              onPress={handleAddComment}
              disabled={isCommenting || !newComment.trim()}
            >
              {isCommenting ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Ionicons name="send" size={20} color="white" />
              )}
            </TouchableOpacity>
          </View>

          {/* Comments List */}
          {comments.map((comment, index) => (
            <View key={`comment-${comment.id}-${index}`} style={styles.commentItem}>
              <Text style={styles.commentAuthor}>{comment.author?.username || 'Unknown User'}</Text>
              <Text style={styles.commentContent}>{comment.content}</Text>
              <Text style={styles.commentDate}>
                {new Date(comment.date).toLocaleDateString()}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f172a",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingTop: 50,
    backgroundColor: "#1e293b",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 20,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  postCard: {
    backgroundColor: "#1e293b",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  postTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  postContent: {
    fontSize: 16,
    color: "#e2e8f0",
    lineHeight: 24,
    marginBottom: 15,
  },
  postAuthor: {
    fontSize: 14,
    color: "#94a3b8",
    marginBottom: 5,
  },
  postDate: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 15,
  },
  likeButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  likeCount: {
    color: "#fff",
    marginLeft: 8,
    fontSize: 16,
  },
  commentsSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 15,
  },
  addCommentContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  commentInput: {
    flex: 1,
    backgroundColor: "#1e293b",
    color: "#fff",
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
    maxHeight: 100,
  },
  addCommentButton: {
    backgroundColor: "#16A34A",
    padding: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  commentItem: {
    backgroundColor: "#1e293b",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#16A34A",
    marginBottom: 5,
  },
  commentContent: {
    fontSize: 14,
    color: "#e2e8f0",
    marginBottom: 8,
  },
  commentDate: {
    fontSize: 12,
    color: "#64748b",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 16,
  },
});