package com.example.stoic.config;

import org.springframework.boot.web.servlet.server.CookieSameSiteSupplier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CookieConfig {

    @Bean
    public CookieSameSiteSupplier cookieSameSiteSupplier() {
        // For development: allow cross-origin cookie sharing
        return CookieSameSiteSupplier.ofNone(); // SameSite=None; Secure
    }
}
