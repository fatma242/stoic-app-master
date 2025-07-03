// import React, { useState } from "react";
// import {
//   View,
//   TouchableOpacity,
//   Text,
//   StyleSheet,
//   ActivityIndicator,
// } from "react-native";
// import { WebView } from "react-native-webview";
// import * as Crypto from "expo-crypto";
// import * as AuthSession from "expo-auth-session";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useRouter } from "expo-router";

// // Replace with your Google Web client ID
// const CLIENT_ID =
//   "528785831948-8j0lo6b8suppu8s4mcc38iov3npm3o0o.apps.googleusercontent.com";
// // Expo proxy redirect URI
// const REDIRECT_URI = AuthSession.makeRedirectUri({  });

// export default function InAppGoogleLogin() {
//   const [authUrl, setAuthUrl] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const router = useRouter();

//   /** Starts the OAuth flow by building URL and displaying WebView */
//   const startLogin = async () => {
//     // Generate a secure random nonce
//     const bytes = await Crypto.getRandomBytesAsync(16);
//     const state = Array.from(bytes)
//       .map((b) => b.toString(16).padStart(2, "0"))
//       .join("");

//     // Build Google OAuth2 URL
//     const url =
//       "https://accounts.google.com/o/oauth2/v2/auth" +
//       `?response_type=id_token` +
//       `&client_id=${CLIENT_ID}` +
//       `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
//       `&scope=openid%20email%20profile` +
//       `&nonce=${state}` +
//       `&prompt=select_account`;

//     setAuthUrl(url);
//   };

//   /** Monitors navigation state in WebView to detect redirect back */
//   const onNavStateChange = async (navState: any) => {
//     const { url } = navState;
//     if (!authUrl) return;

//     // When OAuth2 completes, Google redirects to REDIRECT_URI#id_token=...
//     if (url.startsWith(REDIRECT_URI)) {
//       setLoading(true);
//       // Extract the fragment after '#'
//       const [, fragment] = url.split("#");
//       const params = new URLSearchParams(fragment);
//       const idToken = params.get("id_token");
//       if (idToken) {
//         // Close WebView
//         setAuthUrl(null);
//         try {
//           // Send ID token to backend for verification & session creation
//           const res = await fetch(
//             "http://192.168.1.19:8100/api/users/oauth/google",
//             {
//               method: "POST",
//               headers: { "Content-Type": "application/json" },
//               credentials: "include",
//               body: JSON.stringify({ idToken }),
//             }
//           );
//           if (res.ok) {
//             const { userId } = await res.json();
//             await AsyncStorage.setItem("userId", userId);
//             router.replace("/home");
//           } else {
//             console.error("OAuth login failed:", await res.text());
//           }
//         } catch (err) {
//           console.error("Network or server error:", err);
//         } finally {
//           setLoading(false);
//         }
//       } else {
//         console.error("No id_token in redirect URL");
//         setAuthUrl(null);
//         setLoading(false);
//       }
//     }
//   };

//   return (
//     <View style={styles.container}>
//       {authUrl ? (
//         <WebView
//           source={{ uri: authUrl }}
//           onNavigationStateChange={onNavStateChange}
//           startInLoadingState
//           renderLoading={() => (
//             <ActivityIndicator size="large" style={styles.loader} />
//           )}
//         />
//       ) : (
//         <TouchableOpacity
//           style={styles.button}
//           onPress={startLogin}
//           disabled={loading}
//         >
//           <Text style={styles.buttonText}>
//             {loading ? "Signing in..." : "Continue with Google"}
//           </Text>
//         </TouchableOpacity>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#000" },
//   loader: { flex: 1, justifyContent: "center", alignItems: "center" },
//   button: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     margin: 20,
//     borderRadius: 8,
//     padding: 15,
//   },
//   buttonText: { fontSize: 16, fontWeight: "bold", color: "#000" },
// });
