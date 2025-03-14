package org.counterTest;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.scheduling.annotation.Scheduled;

@RestController
@CrossOrigin(origins = "http://127.0.0.1:8081")  // Adjust the URL to your frontend's URL if necessary
public class CounterController {

    private int counter = 0;

    private CounterWebSocketHandler webSocketHandler;

    // Constructor injection of WebSocket handler
    public CounterController(CounterWebSocketHandler webSocketHandler) {
        this.webSocketHandler = webSocketHandler;
    }

    // REST API to get the current counter value
    @GetMapping("/counter")
    public int getCounter() {
        return counter;
    }

    // REST API to increment the counter
    @PostMapping("/increment")
    public int incrementCounter() {
        counter++;
        return counter;
    }

    // Endpoint to start the recursive counting process
    @PostMapping("/start-counting")
    public String startCounting() {
        new Thread(() -> {
            // Start counting from 1 to 100, using recursion
            recursiveCountAndNotify(1, 100);
        }).start();
        return "Counting started";
    }

    // Recursive function that counts from 1 to 100 and notifies the frontend after each step
    private void recursiveCountAndNotify(int current, int max) {
        if (current <= max) {
            counter = current; // Update the counter value
            System.out.println("Updated counter to: " + current);  // Log the update
            sendUpdateToFrontend(current);  // Send the updated value via WebSocket
            try {
                Thread.sleep(500);  // Optional delay between counts (500ms)
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            recursiveCountAndNotify(current + 1, max);  // Recursive call
        }
    }


    // Method to send the counter update to the frontend via WebSocket
    private void sendUpdateToFrontend(int value) {
        if (webSocketHandler != null) {
            webSocketHandler.sendUpdate(value);
            System.out.println(value);
        }
    }

}
