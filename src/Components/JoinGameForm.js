// import { useState } from 'react';
// import { styled } from 'styled-components';

function JoinGameForm({joinGame, setJoinCode, setTeamName, error}) {

  const updateName = (e) => {
    setTeamName(e.target.value);
  }
  const updateCode = (e) => {
    console.log('updating')
    setJoinCode(e.target.value);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    joinGame(e);
  };

  return (
    <div>
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label htmlFor="joinCode">join code</label>
                <input onChange={updateCode} type='text' className='form-control' id='joinCode' name='joinCode' placeholder='code' required></input>
            </div>
            <div className="form-group">
                <label htmlFor="teamName">team name</label>
                <input onChange={updateName} type='text' className='form-control' id='teamName' name='teamName' placeholder='team name' required></input>  
            </div>

            <div>
              {error && <p className="error-message">{error}</p>}
            </div>

            <button type="submit" className="btn btn-primary">Submit</button>

        </form>
    </div>
  );
}

export default JoinGameForm;
