const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());

const databasePath = path.join(__dirname, "cricketMatchDetails.db");
const database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http:/localhost:/3000")
    );
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
  }
};

initializeDbAndServer();

const convertPlayerDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
  };
};

const convertMatchDetailsDbObjectToResponseDbObject = (dbObject) => {
  return {
    matchId: dbObject.match_id,
    match: dbObject.match,
    year: dbObject.year,
  };
};

app.get("/players/", async (request, response) => {
  const getPLayerQuery = `
    SELECT
        *
    FROM
        player_details;`;
  const playersArray = await database.all(getPLayerQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertPlayerDbObjectToResponseObject(eachPlayer)
    )
  );
});

app.get("/players/:player_id", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT * 
    FROM
    player_details
    WHERE player_id = ${playerId};`;
  const playersArray = await database.get(getPlayerQuery);
  response.send(convertPlayerDbObjectToResponseObject(playersArray));
});

app.put("players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const updatePlayerQuery = `
    UPDATE
    player_details
    SET
    player_name = '${playerName}'
    WHERE player_id = ${playerId};`;
  await database.run(getPlayerQuery);
  response.send("Player Details Updated");
});

app.get("/matches/:matchId", async (request, response) => {
  const { matchId } = request.params;
  const matchDetailsQuery = `
    SELECT * 
    FROM 
    match_details
    WHERE 
    match_id = ${matchId};`;
  const matchDetails = await database.get(matchDetailsQuery);
  response.send(convertMatchDetailsDbObjectToResponseDbObject(matchDetails));
});

app.get("players/:playerId/matches/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerMatchQuery = `
    SELECT *
    FROM
    player_match_score
    NATURAL JOIN match_details
    WHERE player_id = ${playerId};`;
  const playerMatches = await database.all(getPlayerMatchQuery);
  response.send(
    playerMatches.map((eachMatch) =>
      convertMatchDetailsDbObjectToResponseDbObject(eachMatch)
    )
  );
});

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getMatchPlayerQuery = `
    SELECT * 
    FROM player_match_score
    NATURAL JOIN player_details
    WHERE 
    match_id = ${matchId};`;
  const playersArray = await database.all(getMatchPlayerQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertPlayerDbObjectToResponseObject(eachPlayer)
    )
  );
});

app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getMatchPlayerQuery = `
    SELECT
    player_id as playerId,
    player_name as playerName,
    SUM(score) as totalScore,
    SUM(fours) as totalFours,
    SUM(sixes) as totalSixes
    FROM player_match_score
    NATURAL JOIN player_details
    WHERE 
    player_id = ${playerId};`;
  const playerMatchDetails = await database.get(getMatchPlayerQuery);
  response.send(playerMatchDetails);
});

module.exports = app;
