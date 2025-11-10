var cache = require('memory-cache');
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

const hostname = "0.0.0.0";
const port = 25666;

// TODO: aggregate all needed res into one json and return/cache that
const PokeResponse = class {
	constructor(pokemon_name, sprite, id, color, flavor_texts, pokedex_entries, encounter_info){
		this.name = pokemon_name;
		this.sprite = sprite;
		this.id = id;
		this.color = color;
		this.flavor_texts = flavor_texts;
		this.encounter_info = encounter_info;
		this.pokedex_entries = pokedex_entries;
	}
}; 
app.get("/api/pokemon/info/:name/:pokedex", async (req, res) => {
	const pokemonNameOrId = req.params.name;
	const pokedexName = req.params.pokedex;
	try {
		const pokemonData = await cacheFunction(Pokedex.getPokemonByName, pokemonNameOrId, "pokemonData", req.ip);
		const pokemonSpeciesData = await cacheFunction(Pokedex.getPokemonSpeciesByName, pokemonNameOrId, "pokemonSpeciesData", req.ip);
		const pokemonEncounterData = await cacheFunction(Pokedex.getPokemonEncounterAreasByName, pokemonNameOrId, "pokemonEncounterData", req.ip);
		const pokedexData = await cacheFunction(Pokedex.getPokemonEncounterAreasByName, pokedexName, "pokedexData", req.ip);

		const pokemonName = pokemonData.name;


		const pokemon_sprite_front_default = pokemonData.sprites.front_default;
		const pokemon_id = pokemonData.id;
		const pokemon_species_color_name = pokemonSpeciesData.color.name;
		const pokemon_species_flavor_texts = pokemonSpeciesData.flavor_text_entries;
		const pokedex_pokemon_entries = pokedexData.pokemon_entries;
		const resp = new PokeResponse(pokemonName, pokemon_sprite_front_default, pokemon_id, pokemon_species_color_name, pokemon_species_flavor_texts, pokedex_pokemon_entries, pokemonEncounterData);
		res.send(resp);
	} catch (error) {
		console.log(error);
		res.status(500).json({ error: "Fehler bei fetch für /api/pokemon/info/:name/:pokedex" });
	};
});

app.get("/", (req, res) => {
	fs.readFile(path.join(__dirname, "index.html"), (err, data) => {
		if (err) {
			res.writeHead(500);
			res.end("Serverfehler (/)");
		} else {
			res.writeHead(200, { "Content-Type": "text/html" });
			res.end(data);
		}
	});
});

app.get("/api/pokemon-color/:id", async (req, res) => {
	const colorName = req.params.id;
	try {
		const ans = await cacheFunction(Pokedex.getPokemonColorByName, colorName, req.url, req.ip);
		res.send(ans);
	} catch (error) {
		console.log(error);
		res.status(500).json({ error: "Fehler bei fetch für /api/pokemon-color/:id!" });
	}
});

app.get("/pokemon.js", (req, res) => {
	fs.readFile(path.join(__dirname, "pokemon.js"), (err, data) => {
		if (err) {
			res.writeHead(500);
			res.end("Serverfehler (pokemon.js)");
		} else {
			res.writeHead(200, { "Content-Type": "application/javascript" });
			res.end(data);
		}
	});
});


app.get("/index_o.css", (req, res) => {
	fs.readFile(path.join(__dirname, "index_o.css"), (err, data) => {
		if (err) {
			res.writeHead(500);
			res.end("Serverfehler (index_o.css)");
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
			res.end("Serverfehler (brain.js)");
		} else {
			res.writeHead(200, { "Content-Type": "application/javascript" });
			res.end(data);
		}
	});
});

app.get("/api/pokemon/:name", async (req, res) => {
	const pokemonName = req.params.name;
	try {
		const ans = await cacheFunction(Pokedex.getPokemonByName, pokemonName, req.url, req.ip);
		res.send(ans);
	} catch (error) {
		console.log(error);
		res.status(500).json({ error: "Fehler bei fetch für /api/pokemon/:name!" });
	}
});

app.get("/api/pokemon/species/:name", async (req, res) => {
	const speciesName = req.params.name;
	try {
		const ans = await cacheFunction(Pokedex.getPokemonSpeciesByName, speciesName, req.url, req.ip);
		res.send(ans);
	} catch (error) {
		console.log(error);
		res.status(500).json({ error: "Fehler bei fetch für /api/pokemon/species/:name!" });
	}
});

app.get("/api/pokedex/:name", async (req, res) => {
	const pokedexName = req.params.name;
	try {
		const ans = await cacheFunction(Pokedex.getPokedexByName, pokedexName, req.url, req.ip);
		res.send(ans);
	} catch (error) {
		console.log(error);
		res.status(500).json({ error: "Fehler bei fetch für /api/pokedex/:name!" });
	}
});

app.get("/api/pokemon/:name/encounters", async (req, res) => {
	const pokemonName = req.params.name;
	try {
		// const ans = await Pokedex.getPokemonEncounterAreasByName(pokemonName);
		const ans = await cacheFunction(Pokedex.getPokemonEncounterAreasByName, pokemonName, req.url, req.ip);
		res.send(ans);
	} catch (error) {
		console.log(error);
		res.status(500).json({ error: "Fehler bei fetch für /api/pokedex/:name!" });
	}
});

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});


async function cacheFunction(originalFunction, arg, name, ip){
	console.log(originalFunction.name);
	const cacheName = name + "_" + arg;
	const cachedResponse = cache.get(cacheName);
	console.log(cacheName);
	if (cachedResponse) {
		console.log(`[${ip}]>got ${cacheName} cached.`);
		return cachedResponse;
	}

	console.log(`[${ip}]>${cacheName} not cached.`);
	const ans = await originalFunction(arg);
	
	if (ans) {
		cache.put(cacheName, ans);
	}
	return ans;
}
