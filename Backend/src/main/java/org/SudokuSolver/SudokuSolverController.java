package org.SudokuSolver;

import org.springframework.web.bind.annotation.*;

import java.util.Arrays;

@RestController
@CrossOrigin(origins = "http://127.0.0.1:8081")  // Adjust the URL to your frontend's URL if necessary
public class SudokuSolverController {

    private SudokuSolverWebSocketHandler webSocketHandler;

    // Constructor injection of WebSocket handler
    public SudokuSolverController(SudokuSolverWebSocketHandler webSocketHandler) {
        this.webSocketHandler = webSocketHandler;
    }

    public static class InputRequest {
        private String input;

        public String getInput() {
            return input;
        }

        public void setInput(String input) {
            this.input = input;
        }
    }

    @RestController
    public class HomeController {
        @GetMapping("/")
        public String home() {
            return "Sudoku Solver Backend is running!";
        }
    }



    // Endpoint to start the recursive counting process
    @PostMapping("/start-solving")
    public String startSolving(@RequestBody InputRequest request) {
        String input = request.getInput();
        System.out.println(input);

        char[][] grid = getGridFromString(input);
        new Thread(() -> {
            try {
                solveSudoku(grid);
            } catch (InterruptedException e) {
                throw new RuntimeException(e);
            }
        }).start();


        return "Sudoku solving started";
    }

    @PostMapping("/generate-random")
    public String generateRandom() {
        int numNumbers = ((int) (Math.random() * 30)) + 10;

        System.out.println(numNumbers);

        char[][] grid = generateRandomGrid(numNumbers);


        String stringGrid = getStringFromGrid(grid);

        return stringGrid;
    }

    public char[][] generateRandomGrid(int numNumbers){
        boolean[][] rowUsed = new boolean[9][9];
        boolean[][] colUsed = new boolean[9][9];
        boolean[][] boxUsed = new boolean[9][9];

        char[][] grid = new char[9][9];

        for(int i = 0; i < 9; i++){
            Arrays.fill(grid[i], '.');
        }

        int count = 0;

        while(count < numNumbers){
            int randomR = (int) (Math.random() * 9);
            int randomC = (int) (Math.random() * 9);
            int randomVal = (int) (Math.random() * 9) + 1;

            if(valid(rowUsed, colUsed, boxUsed, randomVal, randomR, randomC)){
                markUsed(rowUsed, colUsed, boxUsed, randomVal, randomR, randomC);
                grid[randomR][randomC] = (char) ('0' + randomVal);
            }

            count++;
        }

        return grid;
    }

    private char[][] getGridFromString(String stringGrid){
        char[][] grid = new char[9][9];
        String[] rows = stringGrid.split(" \\| ");

        int r = 0;

        for(String row: rows){
            String[] units = row.split(" ");
            int c = 0;

            for(String unit: units){
                grid[r][c] = unit.charAt(0);
                c++;
            }
            r++;
        }

        return grid;
    }

    private String getStringFromGrid(char[][] grid, boolean finished, boolean failed){
        StringBuilder sb = new StringBuilder();
        for(int r = 0; r < 9; r++){
            for(int c = 0; c < 9; c++){
                sb.append(grid[r][c] + " ");
            }
            sb.append("| ");
        }

        sb.delete(sb.length()-3, sb.length());

        if(finished){
            sb.append("::" + "done");
        }

        if(failed){
            sb.append("::" + "failed");
        }

        return sb.toString();

    }

    private String getStringFromGrid(char[][] grid){
        StringBuilder sb = new StringBuilder();
        for(int r = 0; r < 9; r++){
            for(int c = 0; c < 9; c++){
                sb.append(grid[r][c] + " ");
            }
            sb.append("| ");
        }

        sb.delete(sb.length()-3, sb.length());

        return sb.toString();
    }




    // Method to send the counter update to the frontend via WebSocket
    private void sendUpdateToFrontend(String value) {
        if (webSocketHandler != null) {
            webSocketHandler.sendUpdate(value);
            System.out.println(value);
        }
    }

    public void solveSudoku(char[][] board) throws InterruptedException {
        int n = board.length;
        boolean[][] rowUsed = new boolean[n][n];
        boolean[][] colUsed = new boolean[n][n];
        boolean[][] boxUsed = new boolean[n][n];
        boolean validStart = initialize(board, n, rowUsed, colUsed, boxUsed);

        if(!validStart){
            String stringGrid = getStringFromGrid(board, false, true);
            sendUpdateToFrontend(stringGrid);
            return;
        }

        boolean done = solve(board, 0, 0, n, rowUsed, colUsed, boxUsed);
        String stringGrid = getStringFromGrid(board, done, false);
        sendUpdateToFrontend(stringGrid);
    }

    public boolean solve(char[][] board, int r, int c, int n, boolean[][] rowUsed, boolean[][] colUsed, boolean[][] boxUsed) throws InterruptedException {
        if(r == n){
            return true;
        }

        //Thread.sleep(1);
        String stringGrid = getStringFromGrid(board, false, false);
        sendUpdateToFrontend(stringGrid);

        int nextR;
        int nextC;

        if(c < n-1){
            nextR = r;
            nextC = c+1;
        }
        else{
            nextR = r+1;
            nextC = 0;
        }

        if(board[r][c] != '.'){
            return solve(board, nextR, nextC, n, rowUsed, colUsed, boxUsed);
        }

        for(int i = 1; i <= n; i++){
            board[r][c] = (char) ('0' + i);
            if(valid(rowUsed, colUsed, boxUsed, i, r, c)){
                markUsed(rowUsed, colUsed, boxUsed, i, r, c);
                if(solve(board, nextR, nextC, n, rowUsed, colUsed, boxUsed)){
                    return true;
                }
                markUnused(rowUsed, colUsed, boxUsed, i, r, c);
            }
        }

        board[r][c] = '.';

        return false;
    }

    public boolean initialize(char[][] board, int n, boolean[][] rowUsed, boolean[][] colUsed, boolean[][] boxUsed){
        for(int i = 0; i < n; i++){
            for(int j = 0; j < n; j++){
                if(board[i][j] != '.'){
                    int val = Character.getNumericValue(board[i][j]);
                    if(valid(rowUsed, colUsed, boxUsed, val, i, j)){
                        markUsed(rowUsed, colUsed, boxUsed, val, i, j);
                    }
                    else{
                        return false;
                    }

                }
            }
        }

        return true;
    }

    public boolean valid(boolean[][] rowUsed, boolean[][] colUsed, boolean[][] boxUsed, int num, int r, int c){
        int boxNum = getBoxNum(r, c);
        int numIndex = num-1;
        return !rowUsed[r][numIndex] && !colUsed[c][numIndex] && !boxUsed[boxNum][numIndex];
    }

    public void markUsed(boolean[][] rowUsed, boolean[][] colUsed, boolean[][] boxUsed, int num, int r, int c){
        int boxNum = getBoxNum(r, c);
        int numIndex = num-1;
        rowUsed[r][numIndex] = true;
        colUsed[c][numIndex] = true;
        boxUsed[boxNum][numIndex] = true;

    }

    public void markUnused(boolean[][] rowUsed, boolean[][] colUsed, boolean[][] boxUsed, int num, int r, int c){
        int boxNum = getBoxNum(r, c);
        int numIndex = num-1;
        rowUsed[r][numIndex] = false;
        colUsed[c][numIndex] = false;
        boxUsed[boxNum][numIndex] = false;

    }

    public int getBoxNum(int r, int c){
        return (r/3)*3 + (c/3);
    }

}
