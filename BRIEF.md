**Project Name:** Chess Success

**Problem Solved:** This is a game for entertainment, its purpose is fun

**Feature List:**
- User accounts (register, login, logout, delete account)
- Play chess games against bots of varying difficulty to win points
- Review your own previously played games with an interactive game viewer
- View a leaderboard with the scores of other players

**Data Model:**
1. Users
    - `username` 
    - `passwordHash`
    - `points` 
    - `gamesPlayed` 
    - `wins` 
    - `losses`
2. Games
    - `userID` - used to tie each game to its user
    - `pgn` - this is the standardized syntax for storing a chess game, it is a string of moves using a standardized syntax
    - `result` - whether the game was a loss, win, or draw
    - `difficulty` - the difficulty of the game

**API Endpoint Table:**
1. Authorization routes
    - `POST /api/auth/register` - create a user account
    - `POST /api/auth/login` - login to a user account
    - `POST /api/auth/logout` - logout of a user account
    - `DELETE /api/auth/delete` - delete a user account
2. User related routes
    - `GET /api/users/me` - retrieves account information for the logged-in account, such as wins, losses, games played, etc.
    - `GET /api/users/leaderboard` - retrieves the top performing accounts and their scores
3. Game related routes
    - `POST /api/games` - creates a game in the database with the game's PGN, result, and difficulty
    - `GET /api/games` - retrieves a list of the games played by the logged-in user
    - `GET /api/games/id` - retrieves the information of a specified game based on its MongoDB id

**Authentication:** This app will require authentication because it relies on users being created and authenticated before playing games.