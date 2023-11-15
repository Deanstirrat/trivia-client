import { useState, useEffect } from 'react';
import JoinGameForm from './Components/JoinGameForm';
import io from 'socket.io-client';
import RoundDisplay from './Components/RoundDisplay';
import Scoreboard from './Components/Scoreboard';


function App() {

  const [socket, setSocket] = useState(null);
  const [joinCode, setJoinCode] = useState(null);
  const [teamName, setTeamName] = useState(null);
  const [teamId, setTeamId] = useState(null);
  const [teamFormError, setTeamFormError] = useState(null);

  //game variables
  const [gameData, setGameData] = useState(null);


  //check/update teamId
  useEffect(() => {
    if (!teamId) {
      // check cookies for teamId
      const cookies = document.cookie.split("; ");
      const cookieData = {};
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].split("=");
        cookieData[cookie[0]] = cookie[1];
      }
      const foundTeamId = cookieData["teamId"];
      if (foundTeamId) {
        setTeamId(foundTeamId);
      }
    } else {
      const cookies = document.cookie.split("; ");
      const cookieData = {};
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].split("=");
        cookieData[cookie[0]] = cookie[1];
      }
      const foundTeamId = cookieData["teamId"];
      if (!foundTeamId) {
        // set teamId in cookies with a 5-hour expiration
        const expirationDate = new Date();
        expirationDate.setTime(expirationDate.getTime() + 5 * 60 * 60 * 1000);
        document.cookie = `teamId=${teamId}; expires=${expirationDate.toUTCString()}`;
      }
    }
  }, [teamId]);

  //update local socket on mount
  useEffect(() => {
    console.log('socket change');
    const newSocket = io('http://localhost:3000');
    newSocket.on('connect' , () => {
      setSocket(newSocket);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);


  useEffect(() => {
    if(socket){
      //update game data
      socket.on('updateGameData', ({updatedGame}) => {
        if (updatedGame !== gameData) {
          console.log('updating game data');
          setGameData(updatedGame);
        }
      });
      //increment round
      socket.on('incrementRound', ({newRound}) => {
        console.log('try to increment round')
        if(gameData && newRound!==gameData.currentRound){
          console.log('increment round')
          setGameData((prevGameData) => ({
            ...prevGameData,
            currentRound: newRound,
          }));
        }
      });
    }
  }, [socket])

  //update server with local socketId on change
  useEffect(() => {
    if (socket && teamId) {
      console.log(`send server new socket id: ${socket.id}`);
      socket.emit('updateTeamSocketId', { socketId: socket.id, teamId: teamId});
    }
  }, [socket, teamId]);

  //join game with given id
  const joinGame = (e) => {
    e.preventDefault();
    const data = {
      teamName,
      socketId: socket.id
    };

    const resource = 'http://localhost:3000/games/'+joinCode;

    // Send an HTTP POST request to the server route
    fetch(resource, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response => {
      if (response.status === 201) {
        // Handle successful response (status code 201)
        return response.json();
      } else if (response.status === 400) {
        setTeamFormError("Invalid code");
        throw new Error('Invalid code found');
      } else if (response.status === 404) {
        setTeamFormError("Game not found");
        throw new Error('Game not found');
      } else if (response.status === 409) {
        setTeamFormError("Team name already exists");
        throw new Error('Team name already exists');
      } else {
        // Handle other errors
        throw new Error('An error occurred');
      }
    })
    .then(data => {
      // Handle the data returned from the server
      if (data.teamId) {
        setTeamId(data.teamId);
      }
      if(data.gameData){
        setGameData(data.gameData);
      }
    })
    .catch(error => {
      // Handle any errors
    });
  }

  //handle round submit
  const submitRound = (answers) => {
    console.log(`submit round to host at socket: ${gameData.host.socketId}`);
    socket.emit('submitAnswers', {answers: answers, teamId: teamId, roundNumber: gameData.currentRound, hostSocket: gameData.host.socketId, sourceAnswers: gameData.quiz.questionSet.rounds[gameData.currentRound].questions});
  }


    //debuggin
    // useEffect(() => {
    //   console.log('game data was updated');
    //   console.log(gameData);
    // }, [gameData])


  return (
    <div>
      {!teamId && <JoinGameForm joinGame={joinGame} setJoinCode={setJoinCode} setTeamName={setTeamName} error={teamFormError}/>}
      {(teamId && !gameData) && <div>Host disconnected...</div>}
      {gameData && gameData.currentRound===-1 && 
      <div> waiting to start... </div>}
      {gameData && gameData.currentRound>-1 && gameData.currentRound<=gameData.quiz.questionSet.rounds.length-1 &&
        <RoundDisplay submitRound={submitRound} round={gameData.quiz.questionSet.rounds[(gameData.currentRound)]} roundAnswers={gameData.teams.find((team) => team.team._id.toString() === teamId).team.rounds.some((round) => round.round === gameData.currentRound)} currentQuestion={gameData.currentQuestion} />}
      {gameData && <Scoreboard teams={gameData.teams}/>}
    </div>
  );
}

export default App;
