const handleGame = (e) => {
  e.preventDefault();
  $('#domoMessage').animate({width:'hide'}, 350);

  if($('#gameName').val() == '' || $('#status').val() == '') {
    handleError('RAWR! All fields are required');
    return false;
  }

  sendAjax('POST', $('#gameForm').attr('action'), $('#gameForm').serialize(), () => {
    loadGamesFromServer();
  });

  return false;
};

//send a request to delete the game
const deleteGame = (e, name) => {
  e.preventDefault();

  sendAjax('DELETE', '/game', $(`.delete${name}`).serialize(), () => {
    loadGamesFromServer();
  });

  return false;
}

//send a request to edit the game
const editGame = (e, game) => {
  e.preventDefault();

  ReactDOM.render(
    <GameEditMode game={game} />,
    document.querySelector(`.${game.name}`)
  );

  return false;
}

//send a request to edit the game
const submitEdit = (e, game) => {
  e.preventDefault();

  sendAjax('POST', '/editGame', $(`.edit${game.name}`).serialize(), () => {
    ReactDOM.render(
      <GameReadMode game={game} />,
      document.querySelector(`.${game.name}`)
    );

    loadGamesFromServer();
  });

  return false;
}

//using a comment attribute temporarily in react to store comments inline
const GameForm = (props) => {
  return (
    <form id="gameForm" onSubmit={handleGame} name="gameForm" action="games" method="POST" className="gameForm" >
      <label htmlFor="gameName">Game: </label>
      <input id="gameName" type="text" name="name" placeholder="Game Name" />
      <label htmlFor="progress">Progress: </label>
      <input id="progress" type="text" name="progress" placeholder="Current Progress" comment="Will likely be hidden and appear if 'in progress' is selected form the status drop down" />
      <label htmlFor="gameStatus">Status: </label>
      <input id="gameStatus" type="text" name="status" placeholder="Current Status" comment="make a dropdown with options Completed, in progress, planned, possibly others." />
      <input id='csrf' type="hidden" name="_csrf" value={props.csrf} />
      <input className="gameSubmit" type="submit" value="Submit" comment='class was domoMakerSubmit for css' />
    </form>
  );
};

//Edit button has no functionality behind it yet
const GameList = (props) => {
  if(props.games.length === 0) {
    return (
      <div className="gameList">
        <h3 className="emptyGame">No Entries yet, add one!</h3>
      </div>
    );
  };

  const gameNodes = props.games.map(function(game) {
    let classes = `game ${game.name}`; //to set mutliple classes since `` quotes apparently don't like className

    return (
      <div key={game._id} className={classes} >
        <h3 className="gameName"> Name: {game.name} </h3>
        <h3 className="gameStatus"> Status: {game.status} </h3>
        <h3 className="gameProgress" comment="Should only appear if status is in progress"> Progress: {game.progress} </h3>
        <form className={`delete${game.name}`} onSubmit={(e) => deleteGame(e, game.name)} >
          <input className="deleteGame" type='submit' value='Delete'/>
          <input id='csrf' type="hidden" name="_csrf" value={$('#csrf').val()} />
          <input type="hidden" name="gameName" value={game.name} />
        </form>
        <form className={`edit${game.name}`} onSubmit={(e) => editGame(e, game)} >
          <input className="editGame" type='submit' value='Edit'/>
          <input id='csrf' type="hidden" name="_csrf" value={$('#csrf').val()} />
          <input type="hidden" name="gameName" value={game.name} />
        </form>
      </div>
    );
  });

  return (
    <div className="gameList">
      {gameNodes}
    </div>
  );
};

const GameEditMode = (props) => {
  const game = props.game;
  return (
    <form className={`edit${game.name}`} onSubmit={(e) => submitEdit(e, game)} >
      <div><h3 className="gameName editInput"> Name:</h3><input className='editInput' name="name" type='text' value={game.name} onChange={(e) => onInputChange(e.target.value, game, 'name')} /></div>
      <div><h3 className="gameStatus editInput"> Status:</h3><input className='editInput' name="status" type='text' value={game.status} onChange={(e) => onInputChange(e.target.value, game, 'status')} /></div>
      <div><h3 className="gameProgress editInput"> Progress:</h3><input className='editInput' name="progress" type='text' value={game.progress} onChange={(e) => onInputChange(e.target.value, game, 'progress')} /></div>
      <input className="editGame" type='submit' value='Submit'/>
      <input id='csrf' type="hidden" name="_csrf" value={$('#csrf').val()} />
      <input type="hidden" name="gameName" value={game.name} />
    </form>
  );
};

const GameReadMode = (props) => {
  const game = props.game;
  return (
    <div>
      <h3 className="gameName"> Name: {game.name} </h3>
      <h3 className="gameStatus"> Status: {game.status} </h3>
      <h3 className="gameProgress" comment="Should only appear if status is in progress"> Progress: {game.progress} </h3>
      <form className={`delete${game.name}`} onSubmit={(e) => deleteGame(e, game.name)} >
        <input className="deleteGame" type='submit' value='Delete'/>
        <input id='csrf' type="hidden" name="_csrf" value={$('#csrf').val()} />
        <input type="hidden" name="gameName" value={game.name} />
      </form>
      <form className={`edit${game.name}`} onSubmit={(e) => editGame(e, game)} >
        <input className="editGame" type='submit' value='Edit'/>
        <input id='csrf' type="hidden" name="_csrf" value={$('#csrf').val()} />
        <input type="hidden" name="gameName" value={game.name} />
      </form>
    </div>
  );
};

const loadGamesFromServer = () => {
  sendAjax('GET', '/getGames', null, (data) => {
    ReactDOM.render(
      <GameList games={data.games} csrf={csrf} />,
      document.querySelector('#games')
    );
  });
};

const setup = function(csrf) {
  ReactDOM.render(
    <GameForm csrf={csrf} />,
    document.querySelector('#addGame')
  );

  ReactDOM.render(
    <GameList games={[]} />,
    document.querySelector('#games')
  );

  loadGamesFromServer();
};

const getToken = () => {
  sendAjax('GET', '/getToken', null, (result) => {
    setup(result.csrfToken);
  });
};

const onInputChange = (val, game, field) => {
  game[`${field}`] = val;

  setState({
    name: val
  });
}

$(document).ready(function() {
  getToken();
});














