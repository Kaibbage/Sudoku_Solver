package org.SudokuSolver;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final SudokuSolverWebSocketHandler webSocketHandler;

    // Inject the singleton bean via constructor
    public WebSocketConfig(SudokuSolverWebSocketHandler webSocketHandler) {
        this.webSocketHandler = webSocketHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(webSocketHandler, "/ws/sudoku")
                .setAllowedOrigins("https://sudoku-solver-3b4n.onrender.com");  // Add allowed origins for WebSocket
    }
}