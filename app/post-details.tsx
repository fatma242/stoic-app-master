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
import { HeaderWithNotifications } from "../components/HeaderWithNotifications";

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
  likes?: User[];
  isLikedByUser?: boolean;
}

export default function PostDetailsScreen() {
  const router = useRouter();
  const { postId, roomId } = useLocalSearchParams();
  
  // تحديد اتجاه النص
  const isRTL = i18n.locale === "ar";
  const textStyle = isRTL ? styles.rtlText : styles.ltrText;
  const flexDirection = isRTL ? "row-reverse" : "row";

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [newComment, setNewComment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
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

  // 1) Load userId once on mount
  useEffect(() => {
    loadUserData();
  }, []);

  // 2) Fetch post details, comments, and run entrance animations
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
                Alert.alert(
                  i18n.t("postDetails.success"),
                  i18n.t("postDetails.commentRemoved")
                );
                fetchComments();
              } else {
                Alert.alert(
                  i18n.t("postDetails.success"),
                  i18n.t("postDetails.commentReported")
                );
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

      Alert.alert(
        i18n.t("postDetails.success"),
        i18n.t("postDetails.commentAdded")
      );
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
          <Text style={[styles.loadingText, textStyle]}>
            {i18n.t("postDetails.loadingPost")}
          </Text>
        </View>
      </LinearGradient>
    );
  }

  if (!post) {
    return (
      <LinearGradient colors={["#0f172a", "#1e293b"]} style={styles.center}>
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
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
          <HeaderWithNotifications 
            isRTL={isRTL}
            style={{ backgroundColor: 'transparent', padding: 0 }}
          />
          <Text style={[styles.headerTitle, textStyle]}>
            {i18n.t("postDetails.therapySession")}
          </Text>
          <View style={styles.headerRight}>
            <Ionicons name="heart-outline" size={20} color="#10b981" />
          </View>
        </LinearGradient>
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
          <LinearGradient
            colors={["#1e293b", "#334155"]}
            style={styles.cardGradient}
          >
            <View style={styles.postHeader}>
              <View style={[styles.authorInfo, { flexDirection }]}>
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
                    name={post?.isLikedByUser ? "heart" : "heart-outline"}
                    size={24}
                    color={post?.isLikedByUser ? "#ef4444" : "#94a3b8"}
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
          <View style={[styles.sectionHeader, { flexDirection }]}>
            <Text style={[styles.sectionTitle, textStyle]}>
              {i18n.t("postDetails.supportiveComments", { count: comments.length })}
            </Text>
            <Ionicons name="chatbubbles" size={24} color="#10b981" />
          </View>

          {/* Add Comment */}
          <View style={styles.addCommentContainer}>
            <LinearGradient
              colors={["#1e293b", "#334155"]}
              style={[styles.commentInputContainer, { flexDirection }]}
            >
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
                  <LinearGradient
                    colors={["#1e293b", "#334155"]}
                    style={styles.commentGradient}
                  >
                    <View style={[styles.commentHeader, { flexDirection }]}>
                      <View style={[styles.commentLeftSection, { flexDirection }]}>
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
                          <LinearGradient
                            colors={
                              reportedComments.has(comment.id)
                                ? ["#ef4444", "#dc2626"]
                                : [
                                    "rgba(239, 68, 68, 0.1)",
                                    "rgba(220, 38, 38, 0.1)",
                                  ]
                            }
                            style={styles.reportButtonGradient}
                          >
                            {reportingCommentIds.has(comment.id) ? (
                              <ActivityIndicator size="small" color="#ef4444" />
                            ) : (
                              <Ionicons
                                name={
                                  reportedComments.has(comment.id)
                                    ? "flag"
                                    : "flag-outline"
                                }
                                size={16}
                                color={
                                  reportedComments.has(comment.id)
                                    ? "#fff"
                                    : "#ef4444"
                                }
                              />
                            )}
                          </LinearGradient>
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
                          color={comment.isLikedByUser ? "#ef4444" : "#64748b"}
                        />
                        <Text
                          style={{
                            color: "#fff",
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
                          color="#10b981"
                        />
                        <Text style={[styles.reportStatusText, textStyle]}>
                          {i18n.t("postDetails.reported")}
                        </Text>
                      </View>
                    )}
                  </LinearGradient>
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
    flexGrow: 1,
    paddingBottom: 50,
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 25,
  },
  likeCount: {
    marginLeft: 8,
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  likeCountActive: {
    color: "#ef4444",
  },
  commentCount: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 16,
    backgroundColor: "rgba(16, 185, 129, 0.08)",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  commentCountText: {
    color: "#10b981",
    fontWeight: "700",
    marginLeft: 6,
    fontSize: 14,
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
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  addCommentContainer: {
    marginBottom: 24,
  },
  commentInputContainer: {
    alignItems: "center",
    backgroundColor: "#1e293b",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  commentInput: {
    flex: 1,
    color: "#fff",
    fontSize: 15,
    minHeight: 36,
    maxHeight: 100,
    paddingRight: 10,
  },
  addCommentButton: {
    marginLeft: 8,
    borderRadius: 16,
    overflow: "hidden",
  },
  addCommentButtonDisabled: {
    opacity: 0.5,
  },
  addCommentButtonGradient: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  commentsList: {
    gap: 18,
  },
  commentItem: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
  },
  commentGradient: {
    padding: 16,
  },
  commentHeader: {
    alignItems: "center",
    marginBottom: 8,
    justifyContent: "space-between",
  },
  commentLeftSection: {
    alignItems: "center",
  },
  commentAvatar: {
    marginRight: 10,
  },
  commentAvatarGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  commentAvatarText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  commentMeta: {
    justifyContent: "center",
  },
  commentAuthor: {
    color: "#10b981",
    fontWeight: "700",
    fontSize: 15,
  },
  commentDate: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 2,
  },
  commentContent: {
    color: "#e2e8f0",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 6,
  },
  reportButton: {
    borderRadius: 14,
    overflow: "hidden",
    marginLeft: 8,
  },
  reportButtonGradient: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  reportButtonReported: {
    opacity: 0.7,
  },
  reportStatusContainer: {
    alignItems: "center",
    marginTop: 4,
  },
  reportStatusText: {
    color: "#10b981",
    fontSize: 12,
    marginLeft: 4,
    fontWeight: "600",
  },
  emptyComments: {
    alignItems: "center",
    marginTop: 32,
    marginBottom: 24,
  },
  emptyCommentsText: {
    color: "#64748b",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 12,
  },
  emptyCommentsSubtext: {
    color: "#64748b",
    fontSize: 14,
    marginTop: 4,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 16,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: "#10b981",
    borderRadius: 20,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  rtlText: {
    textAlign: "right",
  },
  ltrText: {
    textAlign: "left",
  },
});