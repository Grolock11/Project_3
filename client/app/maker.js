//Global edit mode object. Used for storing which games are in edit mode so they don't resize at inproper times
let editMode = {};

const handleGame = (e) => {
  e.preventDefault();
  $('#snackbar').animate({height:'hide'}, 350);

//Only check name since status always has some value. Progress is never required
  if($('#gameName').val() == '') {
    displaySnackbar('Game name is required');
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

  sendAjax('DELETE', '/game', $(`.delete${name.replace(/\s/g, "SPACE")}`).serialize(), () => {
    loadGamesFromServer();
  });

  return false;
}

//send a request to edit the game
const editGame = (e, game) => {
  e.preventDefault();

  ReactDOM.render(
    <GameEditMode game={game} />,
    document.querySelector(`.${game.name.replace(/\s/g, "SPACE")}`)
  );

  return false;
}

//Go back to edit mode without making any request
const cancelEdit = (e, game) => {
  e.preventDefault();

  ReactDOM.render(
    <GameReadMode game={game} />,
    document.querySelector(`.${game.name.replace(/\s/g, "SPACE")}`)
  );

  return false;
}

//send a request to edit the game
const submitEdit = (e, game, oldGame) => {
  e.preventDefault();

  sendAjax('POST', '/editGame', $(`.edit${oldGame.name.replace(/\s/g, "SPACE")}`).serialize(), () => {
    ReactDOM.render(
      <GameReadMode game={game} />,
      document.querySelector(`.${oldGame.name.replace(/\s/g, "SPACE")}`)
    );

    loadGamesFromServer();
  });

  return false;
}

//using a comment attribute temporarily in react to store comments inline
const GameForm = (props) => {
  return (
    <form id="gameForm" onSubmit={handleGame} name="gameForm" action="games" method="POST" className="gameForm" >
      <div id="gameFormInputs">
        <div>
          <label htmlFor="gameName">Game: </label>
          <input id="gameName" type="text" name="name" placeholder="Game Name" />
        </div>
        <div>
          <label htmlFor="gameStatus">Status: </label>
          <select id="gameStatus" name='status' placeholder="Current Status" onChange={statusChange} >
            <option value='Not yet started'>Not yet started</option>
            <option value='In Progress'>In Progress</option>
            <option value='Completed'>Completed</option>
            <option value='Aiming for 100%'>Aiming for 100%</option>
            <option value='Completed 100%'>Completed 100%</option>
          </select>
        </div>
        <div id='progressArea'>
        </div>
      </div>
      <input id='csrf' type="hidden" name="_csrf" value={props.csrf} />
      <input className="gameSubmit" type="submit" value="Submit" />
    </form>
  );
};

//display progress when it may be needed
const DisplayProgress = (props) => {
  return (
    <div>
      <label htmlFor="progress">Progress: </label>
      <input id="progress" type="text" name="progress" placeholder="Current Progress" />
    </div>
  )
}

//hides progress on when it's not needed
const HideProgress = (props) => {
  return (<div></div>)
}

//to perform on status change to display/hide progress
const statusChange = () => {

  const value = $('#gameStatus').val();

  if(checkStatus(value)) {
    ReactDOM.render(
      <DisplayProgress />,
      document.querySelector('#progressArea')
    );

    $('#gameForm').animate({height: '110'}, 50)
  }
  else {
    ReactDOM.render(
      <HideProgress />,
      document.querySelector('#progressArea')
    )

    $('#gameForm').animate({height: '87'}, 50)
  }
}

//called when the status in an edit field is changed
const editStatusChange = (value, game) => {
  game.status = value;

  if($(`.edit${game.name.replace(/\s/g, "SPACE")}Progress`).length) {
    ReactDOM.render(
      <RefreshProgress game={game}/>,
      document.querySelector(`.edit${game.name.replace(/\s/g, "SPACE")}Progress`)
    );
  }
}

//refreshes the progress section of an edit mode game
const RefreshProgress = (props) => {
  const game = props.game;

  return(
    <div className={`edit${game.name.replace(/\s/g, "SPACE")}Progress progressDiv`}>
      <h3 className="gameProgress editLabel progressEditLabel" >Progress: {!checkStatus(game.status) && 'N/A' }</h3>
      {checkStatus(game.status) && <input className='editInput progressInput' name="progress" type='text' value={game.progress} onChange={(e) => onInputChange(e.target.value, game, 'progress')} /> }
    </div>
  )
}

//Quick function to check if the status is one that could use a progress field
const checkStatus = (status) => {
    if(status === 'In Progress' || status === 'Aiming for 100%') {
      return true;
    }
    return false;
}

//Edit button has no functionality behind it yet
const GameList = (props) => {
  if(props.games.length === 0) {
    return (
      <div className="gameList">
        <h3 className="emptyGame">No games found on this account</h3>
      </div>
    );
  };

  const gameNodes = props.games.map(function(game) {
    let classes = `game ${game.name.replace(/\s/g, "SPACE")}`; //to set mutliple classes since `` quotes apparently don't like className

    return (
      <div key={game._id} className={classes} onClick={() => {testDivClick(game)}} >
        <h3 className="gameName"> Name: {game.name} </h3>
        <h3 className="gameStatus"> Status: {game.status} </h3>
        <h3 className="gameProgress"> Progress: {game.progress || 'N/A'} </h3>
        <form className={`delete${game.name.replace(/\s/g, "SPACE")}`} onSubmit={(e) => deleteGame(e, game.name)} >
          <input className="deleteGame" type='submit' value='Delete'/>
          <input id='csrf' type="hidden" name="_csrf" value={$('#csrf').val()} />
          <input type="hidden" name="gameName" value={game.name} />
        </form>
        <form className={`edit${game.name.replace(/\s/g, "SPACE")}`} onSubmit={(e) => editGame(e, game)} >
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

const testDivClick = (game) => {
  const div = $(`.${game.name.replace(/\s/g, "SPACE")}`);

  if (div.css('height') != '200px') {
    div.animate({height: '200'}, 300);
  }
  else if (!editMode[game.name.replace(/\s/g, "SPACE")]) {
    div.animate({height: '75'}, 300);
  }
}

//switches a game to edit mode
const GameEditMode = (props) => {
  //one copy for editing and a separate copy to revert back to on cancel
  const game = props.game;
  editMode[game.name.replace(/\s/g, "SPACE")] = true;

  $(`.${game.name.replace(/\s/g, "SPACE")}`).animate({height: '200'}, 300);

  const oldGame = {
    name: game.name,
    progress: game.progress,
    status: game.status,
  };
  return (
    <form className={`edit${game.name.replace(/\s/g, "SPACE")} editForm`} onSubmit={(e) => submitEdit(e, game, oldGame)} >
    <div>
      <h3 className="gameName editLabel"> Name:</h3><input className='editInput' name="name" type='text' value={game.name} onChange={(e) => onInputChange(e.target.value, game, 'name')} />
    </div>
    <div className='editStatusDiv'>
      <h3 className="gameStatus editLabel"> Status:</h3><select id="gameStatus" className='editInput' name='status' onChange={(e) => {editStatusChange(e.target.value, game)}} >
      {game.status == 'Not yet started' && <option value='Not yet started' selected>Not yet started</option>}
      {game.status != 'Not yet started' && <option value='Not yet started'>Not yet started</option>}
      {game.status == 'In Progress' && <option value='In Progress' selected >In Progress</option>}
      {game.status != 'In Progress' &&<option value='In Progress'>In Progress</option>}
      {game.status == 'Completed' && <option value='Completed' selected >Completed</option>}
      {game.status != 'Completed' && <option value='Completed'>Completed</option>}
      {game.status == 'Aiming for 100%' && <option value='Aiming for 100%' selected >Aiming for 100%</option>}
      {game.status != 'Aiming for 100%' && <option value='Aiming for 100%'>Aiming for 100%</option>}
      {game.status == 'Completed 100%' && <option value='Completed 100%' selected >Completed 100%</option>}
      {game.status != 'Completed 100%' && <option value='Completed 100%'>Completed 100%</option>}
      </select>
    </div>
      <input className='cancelEdit' type='button' value='Cancel' onClick={(e) => cancelEdit(e, oldGame)} />
      <input className="editGame" type='submit' value='Submit'/>
      <input id='csrf' type="hidden" name="_csrf" value={$('#csrf').val()} />
      <input type="hidden" name="gameName" value={game.name} />
      <div className={`edit${game.name.replace(/\s/g, "SPACE")}Progress progressDiv`}>
        <h3 className="gameProgress editLabel progressEditLabel" >Progress: {!checkStatus(game.status) && 'N/A' }</h3>
        {checkStatus(game.status) && <input className='editInput progressInput' name="progress" type='text' value={game.progress} onChange={(e) => onInputChange(e.target.value, game, 'progress')} /> }
      </div>
    </form>
  );
};

//switches the game back to read only mode
const GameReadMode = (props) => {
  const game = props.game;
  editMode[game.name.replace(/\s/g, "SPACE")] = false;

  return (
    <div>
      <h3 className="gameName"> Name: {game.name} </h3>
      <h3 className="gameStatus"> Status: {game.status} </h3>
      <h3 className="gameProgress"> Progress: {game.progress || 'N/A'} </h3>
      <form className={`delete${game.name.replace(/\s/g, "SPACE")}`} onSubmit={(e) => deleteGame(e, game.name)} >
        <input className="deleteGame" type='submit' value='Delete'/>
        <input id='csrf' type="hidden" name="_csrf" value={$('#csrf').val()} />
        <input type="hidden" name="gameName" value={game.name} />
      </form>
      <form className={`edit${game.name.replace(/\s/g, "SPACE")}`} onSubmit={(e) => editGame(e, game)} >
        <input className="editGame" type='submit' value='Edit'/>
        <input id='csrf' type="hidden" name="_csrf" value={$('#csrf').val()} />
        <input type="hidden" name="gameName" value={game.name} />
      </form>
    </div>
  );
};

//Reload the games from the sever
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

  $('#gameName').autocomplete({
    source: ['testing1, testing2, random, randomtest']
  });

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














