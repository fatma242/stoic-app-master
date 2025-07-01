package com.example.stoic.Room.Service.WebSockets;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketBrokerConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // clients will do new SockJS("/ws-chat"). 
        // allow CORS from your Expo/Web ports:
        registry
            .addEndpoint("/ws-chat")
            .setAllowedOriginPatterns("${UserIphttp}", "${UserIPexp}", "${UserIphttp}")
            .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // messages whose destination starts "/topic" go back to clients
        config.enableSimpleBroker("/topic");
        // messages whose destination starts "/app" are routed to @MessageMapping handlers
        config.setApplicationDestinationPrefixes("/app");
    }
}
