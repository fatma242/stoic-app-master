// package com.example.stoic.config;

// import jakarta.servlet.http.HttpServletRequest;
// import jakarta.servlet.http.HttpServletResponse;
// import jakarta.servlet.http.HttpSession;
// import org.springframework.web.servlet.HandlerInterceptor;

// public class AuthInterceptor implements HandlerInterceptor {
//     @Override
//     public boolean preHandle(
//             HttpServletRequest request,
//             HttpServletResponse response,
//             Object handler) throws Exception {

//         // Allow login and registration through
//         String path = request.getRequestURI();
//         if (path.startsWith("/api/users/login") || path.startsWith("/api/users/register")) {
//             return true;
//         }

//         HttpSession session = request.getSession(false);
//         if (session != null && session.getAttribute("user") != null) {
//             return true;    // user is logged in → proceed
//         }

//         // no session or no "user" → block
//         response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
//         response.getWriter().write("Unauthorized: please log in");
//         return false;
//     }
// }
