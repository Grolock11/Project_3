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

  sendAjax('DELETE', '/game', $(`.delete${name.replace(/\s|:|-|'|./g, "QZ")}`).serialize(), () => {
    loadGamesFromServer();
  });

  return false;
}

//send a request to edit the game
const editGame = (e, game) => {
  e.preventDefault();

  ReactDOM.render(
    <GameEditMode game={game} />,
    document.querySelector(`.${game.name.replace(/\s|:|-|'|./g, "QZ")}`)
  );

  return false;
}

//Go back to edit mode without making any request
const cancelEdit = (e, game) => {
  e.preventDefault();

  ReactDOM.render(
    <GameReadMode game={game} />,
    document.querySelector(`.${game.name.replace(/\s|:|-|'|./g, "QZ")}`)
  );

  return false;
}

//send a request to edit the game
const submitEdit = (e, game, oldGame) => {
  e.preventDefault();

  sendAjax('POST', '/editGame', $(`.edit${oldGame.name.replace(/\s|:|-|'|./g, "QZ")}`).serialize(), () => {
    ReactDOM.render(
      <GameReadMode game={game} />,
      document.querySelector(`.${oldGame.name.replace(/\s|:|-|'|./g, "QZ")}`)
    );

    loadGamesFromServer();
  });

  return false;
}

//populate autocomplete based on user search
const searchGames = (currentSearch) => {

  //reset underlying value for game image so it doesn't save the wrong one
  $('#gameCover').val('');

  sendAjax('POST', '/searchGames', $('#gameForm').serialize(), (response) => {
    let games = response.games.body;
    console.dir(response.games.body);

    if(games.length) {
      const gameNames = games.map((game) => {
        return game.name;
      })

      //set the autocomplete to show the games found from the search
      $('#gameName').autocomplete({
        source: gameNames,
        select: function (event, ui) {
          let selected = games.filter((game) => {
            return game.name == ui.item.value;
          })

          console.dir(ui.item.value);
          console.dir(selected);

          //Set the image for the game if it has one
          if(selected[0]) {
            if(selected[0].cover) {
              $('#gameCover').val(selected[0].cover.url);
            }
            else {
              $('#gameCover').val('');
            }
          }
          else {
            $('#gameCover').val('');
          }
        }
      });
    }
  })
}

//using a comment attribute temporarily in react to store comments inline
const GameForm = (props) => {
  return (
    <form id="gameForm" onSubmit={handleGame} name="gameForm" action="games" method="POST" className="gameForm" >
      <div id="gameFormInputs">
        <div>
          <label htmlFor="gameName">Game: </label>
          <input id="gameName" className='mdl-textfield__input' type="text" name="name" placeholder="Game Name" onChange={(e) => searchGames(e.target.value)} />
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
      <input id='gameCover' type="hidden" name="cover" value='' />
      <input className="gameSubmit mdl-button mdl-js-button mdl-button--raised mdl-button--colored" type="submit" value="Submit" />
    </form>
  );
};

//display progress when it may be needed
const DisplayProgress = (props) => {
  return (
    <div>
      <label htmlFor="progress" className='progressLabel'>Progress: </label>
      <input id="progress" type="text" className='mdl-textfield__input' name="progress" placeholder="Current Progress" />
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

    $('#gameForm').animate({height: '130'}, 50)
  }
  else {
    ReactDOM.render(
      <HideProgress />,
      document.querySelector('#progressArea')
    )

    $('#gameForm').animate({height: '100'}, 50)
  }
}

//called when the status in an edit field is changed
const editStatusChange = (value, game) => {
  game.status = value;

  if($(`.edit${game.name.replace(/\s|:|-|'|./g, "QZ")}Progress`).length) {
    ReactDOM.render(
      <RefreshProgress game={game}/>,
      document.querySelector(`.edit${game.name.replace(/\s|:|-|'|./g, "QZ")}Progress`)
    );
  }
}

//refreshes the progress section of an edit mode game
const RefreshProgress = (props) => {
  const game = props.game;

  return(
    <div className={`edit${game.name.replace(/\s|:|-|'|./g, "QZ")}Progress progressDiv mdl-textfield mdl-js-textfield`}>
      <h3 className="gameProgress editLabel progressEditLabel" >Progress: {!checkStatus(game.status) && 'N/A' }</h3>
      {checkStatus(game.status) && <input className='editInput progressInput mdl-textfield__input' name="progress" type='text' value={game.progress} onChange={(e) => onInputChange(e.target.value, game, 'progress')} /> }
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
    let classes = `game ${game.name.replace(/\s|:|-|'|./g, "QZ")}`; //to set mutliple classes since `` quotes apparently don't like className
    console.dir(game);
    return (
      <div key={game._id} className={classes} onClick={() => {testDivClick(game)}} >
        {game.cover && <img src={game.cover} />}
        {!game.cover && <h3 className='imgAlt'>No Image</h3>}
        <h3 className="gameName"> {game.name} </h3>
        <h3 className="gameStatus"> Status: {game.status} </h3>
        <h3 className="gameProgress"> Progress: {game.progress || 'N/A'} </h3>
        <form className={`delete${game.name.replace(/\s|:|-|'|./g, "QZ")}`} onSubmit={(e) => deleteGame(e, game.name)} >
          <input className="deleteGame  mdl-button mdl-js-button mdl-button--raised mdl-button--colored" type='submit' value='Delete'/>
          <input id='csrf' type="hidden" name="_csrf" value={$('#csrf').val()} />
          <input type="hidden" name="gameName" value={game.name} />
        </form>
        <form className={`edit${game.name.replace(/\s|:|-|'|./g, "QZ")}`} onSubmit={(e) => editGame(e, game)} >
          <input className="editGame  mdl-button mdl-js-button mdl-button--raised mdl-button--colored" type='submit' value='Edit'/>
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
  const div = $(`.${game.name.replace(/\s|:|-|'|./g, "QZ")}`);

  if (div.css('height') != '200px') {
    div.animate({height: '200'}, 300);
  }
  else if (!editMode[game.name.replace(/\s|:|-|'|./g, "QZ")]) {
    div.animate({height: '75'}, 300);
  }
}

//switches a game to edit mode
const GameEditMode = (props) => {
  //one copy for editing and a separate copy to revert back to on cancel
  const game = props.game;
  editMode[game.name.replace(/\s|:|-|'|./g, "QZ")] = true;

  $(`.${game.name.replace(/\s|:|-|'|./g, "QZ")}`).animate({height: '200'}, 300);

  const oldGame = {
    name: game.name,
    progress: game.progress,
    status: game.status,
    cover: game.cover,
  };
  return (
    <form className={`edit${game.name.replace(/\s|:|-|'|./g, "QZ")} editForm`} onSubmit={(e) => submitEdit(e, game, oldGame)} >
      {game.cover && <img src={game.cover} />}
      {!game.cover && <h3 className='imgAlt'>No Image</h3>}
      <h3 className="gameName"> {game.name} </h3>
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
        <input className='cancelEdit mdl-button mdl-js-button mdl-button--raised mdl-button--colored' type='button' value='Cancel' onClick={(e) => cancelEdit(e, oldGame)} />
        <input className="editGame mdl-button mdl-js-button mdl-button--raised mdl-button--colored" type='submit' value='Submit'/>
        <input id='csrf' type="hidden" name="_csrf" value={$('#csrf').val()} />
        <input type="hidden" name="gameName" value={game.name} />
        <div className={`edit${game.name.replace(/\s|:|-|'|./g, "QZ")}Progress progressDiv greenBack mdl-textfield mdl-js-textfield`}>
          <h3 className="gameProgress editLabel progressEditLabel" >Progress: {!checkStatus(game.status) && 'N/A' }</h3>
          {checkStatus(game.status) && <input className='editInput progressInput mdl-textfield__input' name="progress" type='text' value={game.progress} onChange={(e) => onInputChange(e.target.value, game, 'progress')} /> }
        </div>
    </form>
  );
};

//switches the game back to read only mode
const GameReadMode = (props) => {
  const game = props.game;
  editMode[game.name.replace(/\s|:|-|'|./g, "QZ")] = false;

  return (
    <div>
    {game.cover && <img src={game.cover} />}
    {!game.cover && <h3 className='imgAlt'>No Image</h3>}
    <h3 className="gameName"> {game.name} </h3>
      <h3 className="gameStatus"> Status: {game.status} </h3>
      <h3 className="gameProgress"> Progress: {game.progress || 'N/A'} </h3>
      <form className={`delete${game.name.replace(/\s|:|-|'|./g, "QZ")}`} onSubmit={(e) => deleteGame(e, game.name)} >
        <input className="deleteGame mdl-button mdl-js-button mdl-button--raised mdl-button--colored" type='submit' value='Delete'/>
        <input id='csrf' type="hidden" name="_csrf" value={$('#csrf').val()} />
        <input type="hidden" name="gameName" value={game.name} />
      </form>
      <form className={`edit${game.name.replace(/\s|:|-|'|./g, "QZ")}`} onSubmit={(e) => editGame(e, game)} >
        <input className="editGame mdl-button mdl-js-button mdl-button--raised mdl-button--colored" type='submit' value='Edit'/>
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














