const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const pb = require("pokeapi-js-wrapper");
const customOptions = {
	cache: false,
	cacheImages: false
};
const Pokedex = new pb.Pokedex(customOptions);

const hostname = "127.0.0.1";
const port = 25666;

app.get("/", (req, res) => {
	fs.readFile(path.join(__dirname, "index.html"), (err, data) => {
		if (err) {
			res.writeHead(500);
			res.end("Serverfehler");
		} else {
			res.writeHead(200, { "Content-Type": "text/html" });
			res.end(data);
		}
	});
});


app.get("/pokemon.js", (req, res) => {
	fs.readFile(path.join(__dirname, "pokemon.js"), (err, data) => {
		if (err) {
			res.writeHead(500);
			res.end("Serverfehler");
		} else {
			res.writeHead(200, { "Content-Type": "text/javascript" });
			res.end(data);
		}
	});
});


app.get("/index_o.css", (req, res) => {
	fs.readFile(path.join(__dirname, "index_o.css"), (err, data) => {
		if (err) {
			res.writeHead(500);
			res.end("Serverfehler");
		} else {
			res.writeHead(200, { "Content-Type": "text/css" });
			res.end(data);
		}
	});
});

app.get("/brain.js", (req, res) => {
	fs.readFile(path.join(__dirname, "brain.js"), (err, data) => {
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
		const ans = await Pokedex.getPokemonByName(pokemonName);
		res.send(ans);
	} catch (error) {
		console.log(error);
		res.status(500).json({ error: "Fehler!" });
	}
});

app.get("/api/pokemon/species/:name", async (req, res) => {
	const speciesName = req.params.name;
	try {
		const ans = await Pokedex.getPokemonSpeciesByName(speciesName);
		res.send(ans);
	} catch (error) {
		console.log(error);
		res.status(500).json({ error: "Fehler!" });
	}
});

app.get("/api/pokedex/:name", async (req, res) => {
	const pokedexName = req.params.name;
	try {
		const ans = await Pokedex.getPokedexByName(pokedexName);
		res.send(ans);
	} catch (error) {
		console.log(error);
		res.status(500).json({ error: "Fehler!" });
	}
});

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
