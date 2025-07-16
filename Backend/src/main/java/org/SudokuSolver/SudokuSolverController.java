package org.SudokuSolver;

import org.springframework.web.bind.annotation.*;

import java.util.Arrays;

@RestController
@CrossOrigin(origins = {
        "https://sudoku-solver-3b4n.onrender.com",
        "http://127.0.0.1:8081"
})
public class SudokuSolverController {

    private SudokuSolverWebSocketHandler webSocketHandler;

    // Constructor injection of WebSocket handler
    public SudokuSolverController(SudokuSolverWebSocketHandler webSocketHandler) {
        this.webSocketHandler = webSocketHandler;
    }

    public static class InputRequest {
        private String input;
        private String id;

        public String getInput() {
            return input;
        }
        public String getId(){
            return id;
        }

        public void setInput(String input) {
            this.input = input;
        }
        public void setId(String id){
            this.id = id;
        }
    }


    @GetMapping("/")
    public String home() {
        return "Sudoku Solver Backend is running!";
    }




    @PostMapping("/start-solving")
    public String startSolving(@RequestBody InputRequest request) {
        String input = request.getInput();
        String id = request.getId();

        char[][] grid = getGridFromString(input);
        new Thread(() -> {
            try {
                solveSudoku(grid, id);
            } catch (InterruptedException e) {
                throw new RuntimeException(e);
            }
        }).start();


        return "Sudoku solving started";
    }

    @PostMapping("/generate-random")
    public String generateRandom() throws InterruptedException {
        char[][] grid = generateRandomGrid();

        String stringGrid = getStringFromGrid(grid);

        return stringGrid;
    }

    public char[][] generateRandomGrid() throws InterruptedException {
        int numNumbers = ((int) (Math.random() * 30)) + 18;

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

            if(grid[randomR][randomC] == '.' && valid(rowUsed, colUsed, boxUsed, randomVal, randomR, randomC)){
                markUsed(rowUsed, colUsed, boxUsed, randomVal, randomR, randomC);
                grid[randomR][randomC] = (char) ('0' + randomVal);
            }

            count++;
        }

        char[][] tempGrid = new char[9][9];
        for(int r = 0; r < 9; r++){
            for(int c = 0; c < 9; c++){
                tempGrid[r][c] = grid[r][c];
            }
        }

        boolean done = solve(grid, 0, 0, 9, rowUsed, colUsed, boxUsed, false, "");

        if(done){
            return tempGrid;
        }
        else{
            return generateRandomGrid();
        }
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
        else if(failed){
            sb.append("::" + "failed");
        }
        else{
            sb.append("::inProgress");
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
    private void sendUpdateToFrontend(String value, String id) {
        if (webSocketHandler != null) {
            webSocketHandler.sendUpdate(value, id);
        }
    }

    public void solveSudoku(char[][] board, String id) throws InterruptedException {
        int n = board.length;
        boolean[][] rowUsed = new boolean[n][n];
        boolean[][] colUsed = new boolean[n][n];
        boolean[][] boxUsed = new boolean[n][n];
        boolean validStart = initialize(board, n, rowUsed, colUsed, boxUsed);

        if(!validStart){
            String stringGrid = getStringFromGrid(board, false, true);
            sendUpdateToFrontend(stringGrid, id);
            return;
        }

        boolean done = solve(board, 0, 0, n, rowUsed, colUsed, boxUsed, true, id);
        String stringGrid = getStringFromGrid(board, done, false);
        sendUpdateToFrontend(stringGrid, id);
    }

    public boolean solve(char[][] board, int r, int c, int n, boolean[][] rowUsed, boolean[][] colUsed, boolean[][] boxUsed, boolean delay, String id) throws InterruptedException {
        if(r == n){
            return true;
        }


        if(delay){
            //Thread.sleep(1);
            String stringGrid = getStringFromGrid(board, false, false);
            sendUpdateToFrontend(stringGrid, id);
        }


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
            return solve(board, nextR, nextC, n, rowUsed, colUsed, boxUsed, delay, id);
        }

        for(int i = 1; i <= n; i++){
            board[r][c] = (char) ('0' + i);
            if(valid(rowUsed, colUsed, boxUsed, i, r, c)){
                markUsed(rowUsed, colUsed, boxUsed, i, r, c);
                if(solve(board, nextR, nextC, n, rowUsed, colUsed, boxUsed, delay, id)){
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
