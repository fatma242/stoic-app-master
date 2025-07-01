// package com.example.stoic.config;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.web.servlet.config.annotation.*;

// @Configuration
// public class WebConfig implements WebMvcConfigurer {

//     @Override
//     public void addInterceptors(InterceptorRegistry registry) {
//         registry
//                 .addInterceptor(new AuthInterceptor())
//                 .addPathPatterns("/api/**")           // secure all /api endpoints
//                 .excludePathPatterns(
//                         "/api/users/login",
//                         "/api/users/register",
//                         "/api/users/session"              // if you want session‐check open
//                 );
//     }

//     // you can also enable CORS, static resources, etc., here
// }
