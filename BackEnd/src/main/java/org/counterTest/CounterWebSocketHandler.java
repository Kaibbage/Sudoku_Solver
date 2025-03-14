package org.counterTest;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;

@Component  // Ensures it's a singleton Spring bean
public class CounterWebSocketHandler extends TextWebSocketHandler {

    private final Set<WebSocketSession> sessions = new CopyOnWriteArraySet<>();

    public CounterWebSocketHandler() {
        System.out.println("CounterWebSocketHandler instance created: " + this);
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        sessions.add(session);
        System.out.println("New WebSocket connection established: " + session.getId());
        System.out.println("Handler instance: " + this);  // Log the handler instance
        System.out.println("Total active sessions: " + sessions.size());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        // Handle incoming messages if needed
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, org.springframework.web.socket.CloseStatus status) throws Exception {
        sessions.remove(session);
        System.out.println("WebSocket connection closed: " + session.getId());
        System.out.println("Close status: " + status);
        System.out.println("Total active sessions: " + sessions.size());
    }

    public void sendUpdate(int counterValue) {
        System.out.println("Attempting to send update: " + counterValue);
        System.out.println("Handler instance: " + this);  // Log the handler instance
        System.out.println("Active sessions: " + sessions.size());
        TextMessage message = new TextMessage(String.valueOf(counterValue));
        synchronized (sessions) {
            for (WebSocketSession session : sessions) {
                if (session.isOpen()) {
                    try {
                        session.sendMessage(message);
                        System.out.println("Sent update to session " + session.getId() + ": " + counterValue);
                    } catch (IOException e) {
                        System.err.println("Failed to send message to session " + session.getId() + ": " + e.getMessage());
                    }
                }
            }
        }
    }
}