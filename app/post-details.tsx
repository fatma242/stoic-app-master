import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
  Easing,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

interface User {
  userId: number;
  username: string;
  email: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  author?: {
    userId: number;
    username: string;
    email?: string;
    password?: string;
    userRole?: string;
  };
  date: string;
  likes: Set<User>;
  isLikedByUser?: boolean;
}

interface Comment {
  id: number;
  content: string;
  date: string;
  author?: {
    userId: number;
    username: string;
  };
  post?: {
    postId: number;
  };
  report?: number;
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
  const [commentsLoading, setCommentsLoading] = useState(false);

  // Animation refs
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(-100)).current;
  const likeScaleAnim = useRef(new Animated.Value(1)).current;
  const commentScaleAnim = useRef(new Animated.Value(0.9)).current;
  const commentOpacityAnim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  const API_BASE_URL = "http://192.168.1.19:8100";

  useEffect(() => {
    loadUserData();
    if (postId) {
      fetchPostDetails();
      fetchComments();
    }

    // Start entrance animations
    Animated.parallel([
      Animated.timing(headerAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }),
    ]).start();
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
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch post");
      const data: Post = await response.json();
      setPost(data);
    } catch (error) {
      console.error("Error fetching post details:", error);
      Alert.alert("Error", "Could not load post details");
    }
  };

  const fetchComments = async () => {
    if (!postId) return;

    setCommentsLoading(true);
    try {
      // Updated endpoint to match your Spring Boot controller
      const response = await fetch(
        `${API_BASE_URL}/api/Comments/comments/${postId}`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 204 || response.status === 404) {
        setComments([]);
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch comments: ${response.status}`);
      }

      const data: Comment[] = await response.json();
      setComments(Array.isArray(data) ? data : []);

      // Animate comments in
      Animated.stagger(100, [
        Animated.timing(commentScaleAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.bezier(0.34, 1.56, 0.64, 1),
          useNativeDriver: true,
        }),
        Animated.timing(commentOpacityAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (error) {
      console.error("Error fetching comments:", error);
      // Don't show alert for comments fetch failure, just log it
      setComments([]);
    } finally {
      setCommentsLoading(false);
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!post || isLiking) return;

    // Like animation
    Animated.sequence([
      Animated.timing(likeScaleAnim, {
        toValue: 1.3,
        duration: 150,
        easing: Easing.bezier(0.34, 1.56, 0.64, 1),
        useNativeDriver: true,
      }),
      Animated.timing(likeScaleAnim, {
        toValue: 1,
        duration: 200,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }),
    ]).start();

    setIsLiking(true);
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to like post");

      setPost((prev) =>
        prev
          ? {
              ...prev,
              likes: (() => {
                if (!userId) return prev.likes;
                const newLikes = new Set(prev.likes);
                if (prev.isLikedByUser) {
                  newLikes.forEach((user) => {
                    if (user.userId === userId) newLikes.delete(user);
                  });
                } else {
                  newLikes.add({ userId, username: "You", email: "" });
                }
                return newLikes;
              })(),
              isLikedByUser: !prev.isLikedByUser,
            }
          : null
      );
    } catch (error) {
      console.error("Error liking post:", error);
      Alert.alert("Error", "Could not like post");
    } finally {
      setIsLiking(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || isCommenting || !postId) return;

    setIsCommenting(true);
    try {
      // Updated endpoint and payload to match your Spring Boot controller
      const response = await fetch(
        `${API_BASE_URL}/api/Comments/comments/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: newComment.trim(),
            postId: parseInt(postId as string),
          }),
          credentials: "include",
        }
      );

      if (response.status === 401) {
        Alert.alert("Error", "You must be logged in to comment");
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to add comment: ${errorText}`);
      }

      const newCommentData = await response.json();

      // Add the new comment to the local state
      setComments((prevComments) => [newCommentData, ...prevComments]);
      setNewComment("");

      // Optional: Re-fetch comments to ensure consistency
      // fetchComments();

      Alert.alert("Success", "Comment added successfully");
    } catch (error) {
      console.error("Error adding comment:", error);
      Alert.alert("Error", "Could not add comment. Please try again.");
    } finally {
      setIsCommenting(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Unknown date";
    }
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: "clamp",
  });

  const headerScale = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.95],
    extrapolate: "clamp",
  });

  if (loading) {
    return (
      <LinearGradient
        colors={["#0f172a", "#1e293b", "#334155"]}
        style={styles.center}
      >
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
        <View style={styles.loadingContainer}>
          <Animated.View
            style={[
              styles.loadingSpinner,
              { transform: [{ rotate: "360deg" }] },
            ]}
          >
            <ActivityIndicator size="large" color="#10b981" />
          </Animated.View>
          <Text style={styles.loadingText}>Loading your post...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (!post) {
    return (
      <LinearGradient colors={["#0f172a", "#1e293b"]} style={styles.center}>
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
        <Ionicons name="document-text-outline" size={64} color="#64748b" />
        <Text style={styles.errorText}>Post not found</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      {/* Animated Header */}
      <Animated.View
        style={[
          styles.header,
          {
            transform: [{ translateY: headerAnim }, { scale: headerScale }],
            opacity: headerOpacity,
          },
        ]}
      >
        <LinearGradient
          colors={["rgba(15, 23, 42, 0.95)", "rgba(30, 41, 59, 0.95)"]}
          style={styles.headerGradient}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#10b981" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Therapy Session</Text>
          <View style={styles.headerRight}>
            <Ionicons name="heart-outline" size={20} color="#10b981" />
          </View>
        </LinearGradient>
      </Animated.View>

      <Animated.ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollViewContent} // Add this line
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Post Details Card */}
        <Animated.View
          style={[
            styles.postCard,
            {
              transform: [{ translateY: slideAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          <LinearGradient
            colors={["#1e293b", "#334155"]}
            style={styles.cardGradient}
          >
            <View style={styles.postHeader}>
              <View style={styles.authorInfo}>
                <View style={styles.avatarContainer}>
                  <LinearGradient
                    colors={["#10b981", "#059669"]}
                    style={styles.avatar}
                  >
                    <Text style={styles.avatarText}>
                      {post.author?.username?.charAt(0).toUpperCase() || "U"}
                    </Text>
                  </LinearGradient>
                </View>
                <View>
                  <Text style={styles.postAuthor}>
                    {post.author?.username || "Anonymous"}
                  </Text>
                  <Text style={styles.postDate}>{formatDate(post.date)}</Text>
                </View>
              </View>
            </View>

            <Text style={styles.postTitle}>{post.title}</Text>
            <Text style={styles.postContent}>{post.content}</Text>

            {/* Like Button */}
            <Animated.View
              style={[
                styles.interactionBar,
                { transform: [{ scale: likeScaleAnim }] },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.likeButton,
                  post.isLikedByUser && styles.likeButtonActive,
                ]}
                onPress={handleLike}
                disabled={isLiking}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={
                    post.isLikedByUser
                      ? ["#ef4444", "#dc2626"]
                      : ["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"]
                  }
                  style={styles.likeButtonGradient}
                >
                  <Ionicons
                    name={post.isLikedByUser ? "heart" : "heart-outline"}
                    size={20}
                    color={post.isLikedByUser ? "#fff" : "#10b981"}
                  />
                  <Text
                    style={[
                      styles.likeCount,
                      post.isLikedByUser && styles.likeCountActive,
                    ]}
                  >
                    {post.likes?.size || 0}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.commentCount}>
                <Ionicons name="chatbubble-outline" size={16} color="#64748b" />
                <Text style={styles.commentCountText}>{comments.length}</Text>
              </View>
            </Animated.View>
          </LinearGradient>
        </Animated.View>

        {/* Comments Section */}
        <Animated.View
          style={[
            styles.commentsSection,
            {
              transform: [{ translateY: slideAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Supportive Comments ({comments.length})
            </Text>
            <Ionicons name="chatbubbles" size={24} color="#10b981" />
          </View>

          {/* Add Comment */}
          <View style={styles.addCommentContainer}>
            <LinearGradient
              colors={["#1e293b", "#334155"]}
              style={styles.commentInputContainer}
            >
              <TextInput
                style={styles.commentInput}
                placeholder="Share your thoughts..."
                placeholderTextColor="#64748b"
                value={newComment}
                onChangeText={setNewComment}
                multiline
                maxLength={500}
                editable={!isCommenting}
              />
              <TouchableOpacity
                style={[
                  styles.addCommentButton,
                  (!newComment.trim() || isCommenting) &&
                    styles.addCommentButtonDisabled,
                ]}
                onPress={handleAddComment}
                disabled={isCommenting || !newComment.trim()}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={
                    !newComment.trim() || isCommenting
                      ? ["#374151", "#4b5563"]
                      : ["#10b981", "#059669"]
                  }
                  style={styles.addCommentButtonGradient}
                >
                  {isCommenting ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Ionicons name="send" size={18} color="white" />
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          {/* Comments List */}
          {commentsLoading ? (
            <View style={styles.commentsLoadingContainer}>
              <ActivityIndicator size="small" color="#10b981" />
              <Text style={styles.commentsLoadingText}>
                Loading comments...
              </Text>
            </View>
          ) : (
            <Animated.View
              style={[
                styles.commentsList,
                {
                  transform: [{ scale: commentScaleAnim }],
                  opacity: commentOpacityAnim,
                },
              ]}
            >
              {comments.map((comment, index) => (
                <Animated.View
                  key={`comment-${comment.id}-${index}`}
                  style={[
                    styles.commentItem,
                    {
                      transform: [
                        {
                          translateY: slideAnim.interpolate({
                            inputRange: [0, 50],
                            outputRange: [0, 20 * (index + 1)],
                            extrapolate: "clamp",
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <LinearGradient
                    colors={["#1e293b", "#334155"]}
                    style={styles.commentGradient}
                  >
                    <View style={styles.commentHeader}>
                      <View style={styles.commentAvatar}>
                        <LinearGradient
                          colors={["#10b981", "#059669"]}
                          style={styles.commentAvatarGradient}
                        >
                          <Text style={styles.commentAvatarText}>
                            {comment.author?.username
                              ?.charAt(0)
                              .toUpperCase() || "A"}
                          </Text>
                        </LinearGradient>
                      </View>
                      <View style={styles.commentMeta}>
                        <Text style={styles.commentAuthor}>
                          {comment.author?.username || "Anonymous"}
                        </Text>
                        <Text style={styles.commentDate}>
                          {formatDate(comment.date)}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.commentContent}>{comment.content}</Text>
                  </LinearGradient>
                </Animated.View>
              ))}
            </Animated.View>
          )}

          {!commentsLoading && comments.length === 0 && (
            <View style={styles.emptyComments}>
              <Ionicons name="chatbubble-outline" size={48} color="#374151" />
              <Text style={styles.emptyCommentsText}>No comments yet</Text>
              <Text style={styles.emptyCommentsSubtext}>
                Be the first to share your thoughts
              </Text>
            </View>
          )}
        </Animated.View>
      </Animated.ScrollView>
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
  },
  loadingContainer: {
    alignItems: "center",
  },
  loadingSpinner: {
    marginBottom: 20,
  },
  loadingText: {
    color: "#64748b",
    fontSize: 16,
    fontWeight: "500",
  },
  commentsLoadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  commentsLoadingText: {
    color: "#64748b",
    fontSize: 14,
    marginLeft: 10,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 20,
  },
  headerRight: {
    width: 40,
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 120 : 100,
  },
  postCard: {
    margin: 20,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  cardGradient: {
    padding: 24,
  },
  postHeader: {
    marginBottom: 20,
  },
  authorInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  postTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 16,
    lineHeight: 32,
  },
  postContent: {
    fontSize: 16,
    color: "#e2e8f0",
    lineHeight: 26,
    marginBottom: 24,
  },
  postAuthor: {
    fontSize: 16,
    color: "#10b981",
    fontWeight: "600",
  },
  postDate: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
  },
  interactionBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(100, 116, 139, 0.2)",
  },
  likeButton: {
    borderRadius: 25,
    overflow: "hidden",
  },
  scrollViewContent: {
    flexGrow: 1, // This ensures content can grow beyond screen height
    paddingBottom: 50, // Extra padding at bottom
  },
  likeButtonActive: {
    elevation: 6,
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  likeButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  likeCount: {
    color: "#10b981",
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
  },
  likeCountActive: {
    color: "#fff",
  },
  commentCount: {
    flexDirection: "row",
    alignItems: "center",
  },
  commentCountText: {
    color: "#64748b",
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "500",
  },
  commentsSection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  addCommentContainer: {
    marginBottom: 24,
  },
  commentInputContainer: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  commentInput: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    maxHeight: 120,
    minHeight: 44,
    paddingVertical: 0,
  },
  addCommentButton: {
    marginLeft: 12,
    borderRadius: 22,
    overflow: "hidden",
  },
  addCommentButtonDisabled: {
    opacity: 0.5,
  },
  addCommentButtonGradient: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  commentsList: {
    gap: 16,
  },
  commentItem: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  commentGradient: {
    padding: 20,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  commentAvatar: {
    marginRight: 12,
  },
  commentAvatarGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  commentAvatarText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  commentMeta: {
    flex: 1,
  },
  commentAuthor: {
    fontSize: 15,
    fontWeight: "600",
    color: "#10b981",
  },
  commentContent: {
    fontSize: 15,
    color: "#e2e8f0",
    lineHeight: 22,
  },
  commentDate: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  emptyComments: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyCommentsText: {
    color: "#64748b",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  emptyCommentsSubtext: {
    color: "#4b5563",
    fontSize: 14,
    marginTop: 4,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#10b981",
    borderRadius: 25,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
