# WinterAssignment_IMG
This is the submission for the team I don't Know's Winter Assignment.

Instructions for setup-
Clone the repo

```
npm install
```

after this


```
node server.js
```
Open localhost on port 3000.

About the Web App -

This is a quiz web app which allows users to sign up and login. 
After signing up, the user is redirected to login page. After logging in, the user is shown two options , Join a quiz and Create a quiz. After clicking on create a quiz, they get a roomcode which they have to share with other users who want to give the quiz. On clicking join a quiz, a user has three options-
1. Join Individually
2. Join a team
3. Create a team

On clicking Join individually, the user is directly redirected to the quizpage and the quiz starts.
On clicking create a team, a user has to enter the quiz-room in which he wants to participate and a corresponding team code is generated which is shared to other members of the team.
On clicking join a team, a user has to enter a valid team id and they are redirected to the waiting page. When the leader of a team(Team creator) clicks Go to quiz, the quiz starts.


Made with ♥️ by Team I don't Know
