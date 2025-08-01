package org.SudokuSolver;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.HashMap;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;

@Component  // Ensures it's a singleton Spring bean
public class SudokuSolverWebSocketHandler extends TextWebSocketHandler {

    private final Set<WebSocketSession> sessions = new CopyOnWriteArraySet<>();
    private HashMap<String, WebSocketSession> idToSession = new HashMap<>();

    public SudokuSolverWebSocketHandler() {
        System.out.println("SudokuSolverWebSocketHandler instance created: " + this);
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        sessions.add(session);

        String id = session.getId();
        idToSession.put(id, session);
        session.sendMessage(new TextMessage("SessionId:" + id));
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        // Handle incoming messages if needed
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, org.springframework.web.socket.CloseStatus status) throws Exception {
        sessions.remove(session);
    }

    public void sendUpdate(String text, String id) {
        TextMessage message = new TextMessage(text);
        WebSocketSession session = idToSession.get(id);
        if (session.isOpen()) {
            try {
                session.sendMessage(message);
            }
            catch (IOException e) {
                System.err.println("Failed to send message to session " + session.getId() + ": " + e.getMessage());
            }
        }


    }
}