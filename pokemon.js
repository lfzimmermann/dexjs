const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const pb = require("pokeapi-js-wrapper");

const hostname = "127.0.0.1";
const port = 3000;

app.get("/", (req, res) => {
  fs.readFile(path.join(__dirname, "pokeapi-js-wrapper-sw.js"), (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end("Serverfehler");
    } else {
      res.writeHead(200, { "Content-Type": "text/javascript" });
      res.end(data);
    }
  });
});

app.get("/api/pokemon/:name", async (req, res) => {
  const pokemonName = req.params.name;
  try {
    const Pokedex = new pb.Pokedex();
    const ans = await Pokedex.getPokemonByName(pokemonName);
    res.send(ans);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Fehler!" });
  }
});

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
