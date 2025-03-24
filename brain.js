const form = document.getElementById('searchPokemonForm');
const genPokemonButton = document.getElementById('genPokemonButton');
const POKEMON_API_URL = "/api/pokemon";
const POKEMON_SPECIES_API_URL = "/api/pokemon/species";

async function getPokemonFragment(div, pokemonName) {
	const image = document.createElement('img');
	image.classList.add('w-32');
	const textDiv = document.createElement('div');
	textDiv.classList.add('text');

	const name = document.createElement('h2');
	name.classList.add('font-bold');

	fetch(`${POKEMON_API_URL}/${pokemonName}`).then((response) => response.json()).then(async (newPokemon) => {
		image.src = newPokemon.sprites.front_default;
		div.appendChild(image);


		name.textContent = capitalizeFirstLetter(newPokemon.name.concat(" #", newPokemon.id));
		textDiv.appendChild(name);

		div.appendChild(textDiv);

		await getPokemonSpeciesFragment(div, pokemonName);
	}).catch(error => {
            console.error("Fehler beim Abrufen von Pokemon-Spezies-Daten:", error);
            // Fehlerbehandlung hier (z.B. Fehlermeldung anzeigen)
        });

	return div;

}

function capitalizeFirstLetter(val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

async function getPokemonSpeciesFragment(div, pokemonName){
	const desc = document.createElement('p');
	desc.classList.add('description-text');
	const newDiv = document.createElement('div');
	newDiv.classList.add('text-[80%]');
	newDiv.classList.add('overflow-scroll');
	newDiv.classList.add('max-h-20');

	fetch(`${POKEMON_SPECIES_API_URL}/${pokemonName}`).then((response) => response.json()).then((newPokemon) => {

		for (var entry in newPokemon.flavor_text_entries){
			console.log(entry);
			if (newPokemon.flavor_text_entries[entry].language.name === 'de'){
				desc.textContent = newPokemon.flavor_text_entries[entry].flavor_text;
			}

			// if (entry.language.name === 'en'){
			// 	desc.textContent = entry.flavor_text; 
			// }
		}
		newDiv.appendChild(desc);
		div.querySelector('div.text').appendChild(newDiv);
		
	}).catch(error => {
            console.error("Fehler beim Abrufen von Pokemon-Spezies-Daten:", error);
            // Fehlerbehandlung hier (z.B. Fehlermeldung anzeigen)
        });
	return div;
}

async function createPokemonDiv(pokemonNameOrId){
	
	const root = document.getElementById("root");
	const div = document.createElement('div');
	div.classList.add('flex');
	div.classList.add('mb-20px');
	div.classList.add('max-h-32');
	
	await getPokemonFragment(div, pokemonNameOrId);
	

	root.appendChild(div);

}

genPokemonButton.addEventListener("click", async (event) => {
	createPokemonDiv(Math.floor(Math.random() * 1000));
});

form.addEventListener("submit", async (event) => {
	event.preventDefault();
	const pokemonName = document.getElementById('pokemonName').value;
	createPokemonDiv(pokemonName);
});


function test(){
	document.getElementById('test').textContent = "bwah";
}
