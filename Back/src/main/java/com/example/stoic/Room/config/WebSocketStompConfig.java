package com.example.stoic.Room.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketStompConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry
                .addEndpoint("/ws-chat")
                .setAllowedOrigins(
                        "${UserIphttp}", // Use the property defined in application.properties
                        "${UserIPexp}")
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // prefix for messages FROM server to client
        registry.enableSimpleBroker("/topic");
        // prefix for messages FROM client to server
        registry.setApplicationDestinationPrefixes("/app");
    }

}
