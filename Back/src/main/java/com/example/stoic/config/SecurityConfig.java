package com.example.stoic.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
          // disable CSRF since we're permitting all requests
          .csrf(csrf -> csrf.disable())
          // allow every endpoint without authentication
          .authorizeHttpRequests(auth -> auth
              .anyRequest().permitAll()
          )
          // turn off default login forms/basic auth
          .httpBasic(basic -> basic.disable());

        return http.build();
    }
}