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
import i18n from "../constants/i18n";
import BackgroundVideo from "@/components/BackgroundVideo";
import { HeaderWithNotifications } from "../components/HeaderWithNotifications";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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
  likes?: User[];
  isLikedByUser?: boolean;
}

export default function PostDetailsScreen() {
  const router = useRouter();
  const { postId, roomId } = useLocalSearchParams();

  const isRTL = i18n.locale.startsWith("ar");
  const textStyle = {
    textAlign: isRTL ? "right" as "right" : "left" as "left",
  };
  const flexDirection = isRTL ? "row-reverse" : "row";

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [newComment, setNewComment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [likingPostIds, setLikingPostIds] = useState<Set<number>>(new Set());
  const [reportingCommentIds, setReportingCommentIds] = useState<Set<number>>(
      new Set()
  );
  const [reportedComments, setReportedComments] = useState<Set<number>>(
      new Set()
  );
  const [refreshCount, setRefreshCount] = useState(0);

  // Animation refs
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(-100)).current;
  const likeScaleAnim = useRef(new Animated.Value(1)).current;
  const commentScaleAnim = useRef(new Animated.Value(0.9)).current;
  const commentOpacityAnim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const reportScaleAnim = useRef(new Animated.Value(1)).current;

  const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (!postId || userId === null) return;

    fetchPostDetails();
    fetchComments();

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
  }, [postId, userId, refreshCount]);

  const loadUserData = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem("userId");
      if (storedUserId) {
        setUserId(parseInt(storedUserId));
      }
    } catch (error) {
      console.error(i18n.t("postDetails.loadUserError"), error);
    }
  };

  const handleLikeComment = async (commentId: number) => {
    if (userId === null) return;

    try {
      const response = await fetch(
          `${API_BASE_URL}/api/Comments/likes/${commentId}`,
          {
            method: "PUT",
            credentials: "include",
          }
      );
      if (!response.ok) throw new Error(i18n.t("postDetails.likeCommentError"));

      setRefreshCount((prev) => prev + 1);
    } catch (error) {
      Alert.alert(
          i18n.t("postDetails.error"),
          i18n.t("postDetails.likeCommentError")
      );
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
      if (!response.ok) throw new Error(i18n.t("postDetails.fetchPostError"));

      const data: any = await response.json();

      const likesArray = Array.isArray(data.likes)
          ? (data.likes as User[])
          : [];
      const likedByMe =
          userId !== null && likesArray.some((u: User) => u.userId === userId);

      const processedPost: Post = {
        ...data,
        likes: new Set(likesArray),
        isLikedByUser: likedByMe,
      };

      setPost(processedPost);
    } catch (error) {
      console.error(i18n.t("postDetails.fetchPostError"), error);
      Alert.alert(
          i18n.t("postDetails.error"),
          i18n.t("postDetails.loadPostError")
      );
    }
  };

  const fetchComments = async () => {
    if (!postId) return;

    setCommentsLoading(true);
    try {
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
        throw new Error(i18n.t("postDetails.fetchCommentsError"));
      }

      const data: Comment[] = await response.json();
      const processedComments = data.map((comment) => ({
        ...comment,
        isLikedByUser:
            userId !== null && Array.isArray(comment.likes)
                ? comment.likes.some((u: User) => u.userId === userId)
                : false,
      }));
      setComments(processedComments);

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
      console.error(i18n.t("postDetails.fetchCommentsError"), error);
      setComments([]);
    } finally {
      setCommentsLoading(false);
      setLoading(false);
    }
  };

  const handleLike = async (postId: number) => {
    if (likingPostIds.has(postId) || userId === null) return;

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

    setLikingPostIds((prev) => new Set(prev).add(postId));

    try {
      const response = await fetch(`${API_BASE_URL}/rooms/likes/${postId}`, {
        method: "PUT",
        credentials: "include",
      });
      if (!response.ok) throw new Error(i18n.t("postDetails.likeError"));

      setRefreshCount((prev) => prev + 1);
    } catch (error) {
      Alert.alert(
          i18n.t("postDetails.error"),
          error instanceof Error
              ? error.message
              : i18n.t("postDetails.likeError")
      );
    } finally {
      setLikingPostIds((prev) => {
        const copy = new Set(prev);
        copy.delete(postId);
        return copy;
      });
    }
  };

  const handleReportComment = async (commentId: number) => {
    if (reportingCommentIds.has(commentId) || reportedComments.has(commentId))
      return;

    Alert.alert(
        i18n.t("postDetails.reportComment"),
        i18n.t("postDetails.reportConfirm"),
        [
          {
            text: i18n.t("postDetails.cancel"),
            style: "cancel",
          },
          {
            text: i18n.t("postDetails.report"),
            style: "destructive",
            onPress: async () => {
              Animated.sequence([
                Animated.timing(reportScaleAnim, {
                  toValue: 0.8,
                  duration: 100,
                  easing: Easing.bezier(0.34, 1.56, 0.64, 1),
                  useNativeDriver: true,
                }),
                Animated.timing(reportScaleAnim, {
                  toValue: 1,
                  duration: 150,
                  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
                  useNativeDriver: true,
                }),
              ]).start();

              setReportingCommentIds((prev) => new Set(prev).add(commentId));

              try {
                const response = await fetch(
                    `${API_BASE_URL}/api/Comments/Report`,
                    {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        commentID: commentId,
                      }),
                      credentials: "include",
                    }
                );

                if (!response.ok) {
                  throw new Error(i18n.t("postDetails.reportError"));
                }

                const responseText = await response.text();

                setReportedComments((prev) => new Set(prev).add(commentId));

                if (responseText.includes("deleted")) {
                
                  fetchComments();
                } else {
                  
                }
              } catch (error) {
                console.error(i18n.t("postDetails.reportError"), error);
                Alert.alert(
                    i18n.t("postDetails.error"),
                    i18n.t("postDetails.reportError")
                );
              } finally {
                setReportingCommentIds((prev) => {
                  const copy = new Set(prev);
                  copy.delete(commentId);
                  return copy;
                });
              }
            },
          },
        ]
    );
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || isCommenting || !postId) return;

    setIsCommenting(true);
    try {
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
        Alert.alert(
            i18n.t("postDetails.error"),
            i18n.t("postDetails.mustLogin")
        );
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${i18n.t("postDetails.commentError")}: ${errorText}`);
      }

      const newCommentData = await response.json();

      setComments((prevComments) => [newCommentData, ...prevComments]);
      setNewComment("");

      
    } catch (error) {
      console.error(i18n.t("postDetails.commentError"), error);
      Alert.alert(
          i18n.t("postDetails.error"),
          i18n.t("postDetails.commentError")
      );
    } finally {
      setIsCommenting(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(i18n.locale, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return i18n.t("postDetails.unknownDate");
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

  useEffect(() => {
    if (userId !== null) {
      fetchPostDetails();
    }
  }, [userId, refreshCount]);

  if (loading) {
    return (
        <View style={styles.container}>
          <BackgroundVideo />
          <LinearGradient
              colors={["rgba(0,0,0,0.9)", "rgba(0,0,0,0.7)"]}
              style={styles.gradient}
          />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={[styles.loadingText, textStyle]}>
              {i18n.t("postDetails.loadingPost")}
            </Text>
          </View>
        </View>
    );
  }

  if (!post) {
    return (
        <View style={styles.container}>
          <BackgroundVideo />
          <LinearGradient
              colors={["rgba(0,0,0,0.9)", "rgba(0,0,0,0.7)"]}
              style={styles.gradient}
          />
          <View style={styles.center}>
            <Ionicons name="document-text-outline" size={64} color="#64748b" />
            <Text style={[styles.errorText, textStyle]}>
              {i18n.t("postDetails.postNotFound")}
            </Text>
            <TouchableOpacity
                style={styles.retryButton}
                onPress={() => router.back()}
            >
              <Text style={styles.retryButtonText}>
                {i18n.t("postDetails.goBack")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
    );
  }

  return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <BackgroundVideo />

        {/* Gradient overlay */}
        <LinearGradient
            colors={[
              "rgba(0,0,0,0.9)",
              "rgba(0,0,0,0.7)",
              "rgba(0,0,0,0.5)",
              "rgba(0,0,0,0.8)"
            ]}
            locations={[0, 0.3, 0.7, 1]}
            style={styles.gradient}
        />

        {/* Minimalist Header */}
        <Animated.View
            style={[
              styles.header,
              {
                transform: [{ translateY: headerAnim }, { scale: headerScale }],
                opacity: headerOpacity,
              },
            ]}
        >
          <HeaderWithNotifications
              isRTL={isRTL}
              showBackButton={true}
              backButtonColor="#10B981"
              notificationBellColor="#10B981"
              style={styles.headerContainer}
          />
        </Animated.View>

        <Animated.ScrollView
            style={styles.content}
            contentContainerStyle={styles.scrollViewContent}
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
            <View style={styles.cardContent}>
              <View style={styles.postHeader}>
                <View style={[styles.authorInfo, { flexDirection }]}>
                  <View style={styles.avatarContainer}>
                    <LinearGradient
                        colors={["#10B981", "#059669"]}
                        style={styles.avatar}
                    >
                      <Text style={styles.avatarText}>
                        {post.author?.username?.charAt(0).toUpperCase() || "U"}
                      </Text>
                    </LinearGradient>
                  </View>
                  <View>
                    <Text style={[styles.postAuthor, textStyle]}>
                      {post.author?.username || i18n.t("postDetails.anonymous")}
                    </Text>
                    <Text style={[styles.postDate, textStyle]}>
                      {formatDate(post.date)}
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={[styles.postTitle, textStyle]}>{post.title}</Text>
              <Text style={[styles.postContent, textStyle]}>{post.content}</Text>

              {/* Like Button */}
              <Animated.View
                  style={[
                    styles.interactionBar,
                    {
                      transform: [{ scale: likeScaleAnim }],
                      flexDirection
                    },
                  ]}
              >
                <TouchableOpacity
                    style={[
                      styles.likeButton,
                      post.isLikedByUser && styles.likeButtonActive,
                    ]}
                    onPress={() => handleLike(post.id)}
                    activeOpacity={0.8}
                >
                  <Ionicons
                      name={post?.isLikedByUser ? "heart" : "heart-outline"}
                      size={24}
                      color={post?.isLikedByUser ? "#EF4444" : "#94a3b8"}
                  />
                  <Text
                      style={[
                        styles.likeCount,
                        post.isLikedByUser && styles.likeCountActive,
                      ]}
                  >
                    {post.likes?.size || 0}
                  </Text>
                </TouchableOpacity>

                <View style={styles.commentCount}>
                  <Ionicons name="chatbubble-outline" size={20} color="#64748b" />
                  <Text style={styles.commentCountText}>{comments.length}</Text>
                </View>
              </Animated.View>
            </View>
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
            <View style={[styles.sectionHeader, { flexDirection }]}>
              <Text style={[styles.sectionTitle, textStyle]}>
                {i18n.t("postDetails.supportiveComments", { count: comments.length })}
              </Text>
              <Ionicons name="chatbubbles" size={24} color="#10B981" />
            </View>

            {/* Add Comment */}
            <View style={styles.addCommentContainer}>
              <View style={[styles.commentInputContainer, { flexDirection }]}>
                <TextInput
                    style={[styles.commentInput, textStyle]}
                    placeholder={i18n.t("postDetails.shareYourThoughts")}
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
                  {isCommenting ? (
                      <ActivityIndicator color="white" size="small" />
                  ) : (
                      <Ionicons name="send" size={20} color="white" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Comments List */}
            {commentsLoading ? (
                <View style={styles.commentsLoadingContainer}>
                  <ActivityIndicator size="small" color="#10B981" />
                  <Text style={[styles.commentsLoadingText, textStyle]}>
                    {i18n.t("postDetails.loadingComments")}
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
                        <View style={styles.commentContentContainer}>
                          <View style={[styles.commentHeader, { flexDirection }]}>
                            <View style={[styles.commentLeftSection, { flexDirection }]}>
                              <View style={styles.commentAvatar}>
                                <LinearGradient
                                    colors={["#10B981", "#059669"]}
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
                                <Text style={[styles.commentAuthor, textStyle]}>
                                  {comment.author?.username || i18n.t("postDetails.anonymous")}
                                </Text>
                                <Text style={[styles.commentDate, textStyle]}>
                                  {formatDate(comment.date)}
                                </Text>
                              </View>
                            </View>

                            {/* Report Button */}
                            <Animated.View
                                style={[{ transform: [{ scale: reportScaleAnim }] }]}
                            >
                              <TouchableOpacity
                                  style={[
                                    styles.reportButton,
                                    reportedComments.has(comment.id) &&
                                    styles.reportButtonReported,
                                  ]}
                                  onPress={() => handleReportComment(comment.id)}
                                  disabled={
                                      reportingCommentIds.has(comment.id) ||
                                      reportedComments.has(comment.id)
                                  }
                                  activeOpacity={0.7}
                              >
                                <Ionicons
                                    name={
                                      reportedComments.has(comment.id)
                                          ? "flag"
                                          : "flag-outline"
                                    }
                                    size={16}
                                    color={
                                      reportedComments.has(comment.id)
                                          ? "#EF4444"
                                          : "#94a3b8"
                                    }
                                />
                              </TouchableOpacity>
                            </Animated.View>
                          </View>
                          <Text style={[styles.commentContent, textStyle]}>{comment.content}</Text>

                          <View
                              style={{
                                flexDirection,
                                alignItems: "center",
                                marginTop: 8,
                              }}
                          >
                            {/* Like Button */}
                            <TouchableOpacity
                                onPress={() => handleLikeComment(comment.id)}
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  marginRight: 12,
                                }}
                                activeOpacity={0.7}
                            >
                              <Ionicons
                                  name={
                                    comment.isLikedByUser ? "heart" : "heart-outline"
                                  }
                                  size={18}
                                  color={comment.isLikedByUser ? "#EF4444" : "#94a3b8"}
                              />
                              <Text
                                  style={{
                                    color: "#e2e8f0",
                                    fontSize: 13,
                                    marginLeft: 4,
                                  }}
                              >
                                {comment.likes ? comment.likes.length : 0}
                              </Text>
                            </TouchableOpacity>
                          </View>

                          {/* Report Status Indicator */}
                          {reportedComments.has(comment.id) && (
                              <View style={[styles.reportStatusContainer, { flexDirection }]}>
                                <Ionicons
                                    name="checkmark-circle"
                                    size={14}
                                    color="#10B981"
                                />
                                <Text style={[styles.reportStatusText, textStyle]}>
                                  {i18n.t("postDetails.reported")}
                                </Text>
                              </View>
                          )}
                        </View>
                      </Animated.View>
                  ))}
                </Animated.View>
            )}

            {!commentsLoading && comments.length === 0 && (
                <View style={styles.emptyComments}>
                  <Ionicons name="chatbubble-outline" size={48} color="#374151" />
                  <Text style={[styles.emptyCommentsText, textStyle]}>
                    {i18n.t("postDetails.noComments")}
                  </Text>
                  <Text style={[styles.emptyCommentsSubtext, textStyle]}>
                    {i18n.t("postDetails.beFirst")}
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
    backgroundColor: "#0A0F1F",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: "100%",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: 16,
    marginTop: 16,
    fontWeight: "500",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: "#10B981",
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 16,
  },
  header: {
    position: "absolute",
    top: -60,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: Platform.OS === "ios" ? 44 : 20,
  },
  headerContainer: {
    paddingHorizontal: 20,

    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 90 : 70,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 50,
  },
  postCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    backgroundColor: "rgba(26, 32, 44, 0.8)",
    borderWidth: 1,
    borderColor: "rgba(20, 184, 128, 0.1)",
    overflow: "hidden",
    
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  cardContent: {
    padding: 20,
  },
  postHeader: {
    marginBottom: 16,
  },
  authorInfo: {
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
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  postTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#F0FDF4",
    marginBottom: 12,
    lineHeight: 30,
  },
  postContent: {
    fontSize: 16,
    color: "#CBD5E1",
    lineHeight: 24,
    marginBottom: 20,
  },
  postAuthor: {
    fontSize: 15,
    color: "#10B981",
    fontWeight: "600",
  },
  postDate: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  interactionBar: {
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(100, 116, 139, 0.2)",
  },
  likeButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 6,
    borderRadius: 20,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
  },
  likeButtonActive: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  likeCount: {
    marginLeft: 8,
    color: "#94A3B8",
    fontSize: 15,
    fontWeight: "600",
  },
  likeCountActive: {
    color: "#EF4444",
  },
  commentCount: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  commentCountText: {
    color: "#94A3B8",
    fontWeight: "600",
    marginLeft: 6,
    fontSize: 15,
  },
  commentsSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionHeader: {
    alignItems: "center",
    marginBottom: 16,
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: "#F0FDF4",
    fontSize: 18,
    fontWeight: "600",
  },
  addCommentContainer: {
    marginBottom: 24,
  },
  commentInputContainer: {
    alignItems: "center",
    backgroundColor: "rgba(26, 32, 44, 0.8)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(20, 184, 128, 0.1)",
  },
  commentInput: {
    flex: 1,
    color: "#F0FDF4",
    fontSize: 15,
    minHeight: 40,
    maxHeight: 100,
  },
  addCommentButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
  },
  addCommentButtonDisabled: {
    backgroundColor: "#334155",
    opacity: 0.6,
  },
  commentsList: {
    gap: 16,
  },
  commentItem: {
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: "rgba(26, 32, 44, 0.8)",
    borderWidth: 1,
    borderColor: "rgba(20, 184, 128, 0.1)",
    overflow: "hidden",
    
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  commentContentContainer: {
    padding: 16,
  },
  commentHeader: {
    alignItems: "center",
    marginBottom: 12,
    justifyContent: "space-between",
  },
  commentLeftSection: {
    alignItems: "center",
  },
  commentAvatar: {
    marginRight: 10,
  },
  commentAvatarGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  commentAvatarText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  commentMeta: {
    justifyContent: "center",
  },
  commentAuthor: {
    color: "#10B981",
    fontWeight: "600",
    fontSize: 15,
  },
  commentDate: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 2,
  },
  commentContent: {
    color: "#E2E8F0",
    fontSize: 15,
    lineHeight: 22,
  },
  reportButton: {
    padding: 6,
  },
  reportButtonReported: {
    opacity: 0.7,
  },
  reportStatusContainer: {
    alignItems: "center",
    marginTop: 8,
  },
  reportStatusText: {
    color: "#10B981",
    fontSize: 12,
    marginLeft: 4,
    fontWeight: "500",
  },
  emptyComments: {
    alignItems: "center",
    marginTop: 32,
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
    backgroundColor: "rgba(26, 32, 44, 0.5)",
  },
  emptyCommentsText: {
    color: "#94A3B8",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
  },
  emptyCommentsSubtext: {
    color: "#64748B",
    fontSize: 14,
    marginTop: 4,
  },
  commentsLoadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  commentsLoadingText: {
    color: "#94A3B8",
    fontSize: 14,
    marginLeft: 10,
  },
});