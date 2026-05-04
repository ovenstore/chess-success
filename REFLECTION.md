## Q1

One thing I changed about the brief is that I added more detail to the data stored about wins and losses. Initially I planned to store the total number of wins and losses for a player, thinking that I would then calculate the number of draws in the front end based on those values and the total number of games played. However, I ended up wanting to differentiate between wins and losses of different difficulty, so instead I actually store `easyWins`, `easyLosses`, and `easyDraws`, as well as the same three points for medium and hard difficulty as well. This way it is easy for the player to view the number of wins, draws, and losses for each individual difficulty on their dashboard. 

## Q2

One technical challenge that I ran into was a bug that caused unauthenticated users to appear logged-in with a default username `Player`. This would happen when a the site detected a session token that was expired, and it would not correctly delete the token and redirect the user to a login page. This was a simple fix, it just took me a few claude prompts to figure out what was going on. The issue was solved by deleting the expired tokens and redirecting the user as intended. 

## Q3

One example of good Claude code was the styling - whenever I gave Claude the instruction to style the pages with a consistent gold and black theme, it was easily able to do it. I have used AI before but never directly in the IDE, so the biggest difference I have noticed is that it has full access to my entire project directory. This is a dramatic change and is what allows it to style all of my pages at once so effortlessly. 

One example of bad Claude code was the code that generated the issue described in Q2. It was strange to describe an issue that Claude had created and see it try to figure out how to fix it. It took multiple attempts before it spotted the bug and was able to correctly redirect the user. I find it surprising that it would write code in the first place that allowed for a strange state on the website where a user is not authenticated but appears to be authenticated under a place holder username. 

The biggest thing I learned from this is that one really cannot rely on the AI tools themselves to write fully functional code. It should always be vetted and examined by a human to ensure that the code functions as it should. 

## Q4

One user action is playing a game of chess and reviewing the game. This happens first when the user initiates a game by selecting the difficulty and color and hitting play. They are able to play the game until they either resign or the game ends in checkmate or a draw. Once the game is over, the site saves the game automatically using a `POST /api/games/<id>`, where `<id>` is the game's ID. This `POST` request includes the game moves, as well as the game's difficulty, the result, and the color that the player played as. Next, if the user navigates to review their game, the website sends a `GET /api/games/<id>` for the correct game ID, which retrieves the game from the database. The list of moves allow the user to step through the game, move by move, and the orientation of the board is determined by the color that the user played as. 

## Q5

If I had two more weeks of this project, I would try to add an engine review element to the game review similar to real chess websites. This would mean that during the game review, a chess engine is constantly evaluating the position, such that at every step of the game the player can view whether they had an advantage or disadvantage. This seemed too far out of scope given the time we had, but it would have been an interesting feature to try to bring to this project. 


