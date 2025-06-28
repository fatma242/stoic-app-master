package com.example.stoic.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Bean;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.core.Authentication;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
          .authorizeHttpRequests(authorize -> authorize
              // public URLs
              .requestMatchers("/", "/public/**", "/login**", "/error").permitAll()
              // any other request requires authentication
              .anyRequest().authenticated()
          )
          .oauth2Login(oauth2 -> oauth2
              // default login page or your custom one
              .loginPage("/oauth2/authorization/google")
              .defaultSuccessUrl("/dashboard", true)
          );
        return http.build();
    }
}
