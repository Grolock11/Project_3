const handleDomo = (e) => {
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

//send a request to delete the domo
const deleteDomo = (e, name) => {
  e.preventDefault();

  sendAjax('DELETE', '/game', $(`.${name}`).serialize(), () => {
    loadGamesFromServer();
  });

  return false;
}

//using a comment attribute temporarily in react to store comments inline
const GameForm = (props) => {
  return (
    <form id="gameForm" onSubmit={handleDomo} name="gameForm" action="maker" method="POST" className="gameForm" >
      <label htmlFor="gameName">Game: </label>
      <input id="gameName" type="text" name="name" placeholder="Domo Name" />
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
    return (
      <div key={game._id} className="game">
        <h3 className="gameName"> Name: {game.name} </h3>
        <h3 className="gameStatus"> Status: {game.status} </h3>
        <h3 className="gameProgress" comment="Should only appear if status is in progress"> Progress: {game.progress} </h3>
        <form className={game.name} onSubmit={(e) => deleteDomo(e, game.name)} >
          <input className="deleteGame" type='submit' value='Delete'/>
          <input id='csrf' type="hidden" name="_csrf" value={$('#csrf').val()} />
          <input type="hidden" name="domoName" value={game.name} />
        </form>
        <form className={game.name} onSubmit={(e) => deleteDomo(e, game.name)} >
          <input className="editGame" type='submit' value='Edit'/>
          <input id='csrf' type="hidden" name="_csrf" value={$('#csrf').val()} />
          <input type="hidden" name="domoName" value={game.name} />
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

$(document).ready(function() {
  getToken();
});














