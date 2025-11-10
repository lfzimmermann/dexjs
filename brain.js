const originalFetch = window.fetch;

// ELEMENTS 	// 
const input = document.getElementById('pokemonName');
const form = document.getElementById('searchPokemonForm');

// BUTTONS 	//
const genPokemonButton = document.getElementById('genPokemonButton');
const resetSearchButton = document.getElementById('resetSearchButton');
const hideAllNotCaughtButton = document.getElementById('hideAllNotCaughtButton');
const hideAllCaughtButton = document.getElementById('hideAllCaughtButton');


// URLS 	//
const POKEMON_API_URL = "/api/pokemon";
const POKEMON_DATA_API_URL = "/api/pokemon/info";
const POKEMON_COLOR_URL = "/api/pokemon-color"
const POKEDEX_API_URL = "/api/pokedex";
const POKEMON_SPECIES_API_URL = "/api/pokemon/species";


// FUNCTIONS 	//

window.fetch = async function(url, options){
	const cacheName = 'pokemonCache';

	try {
		const cache = await caches.open(cacheName);
		const cachedResponse = await cache.match(url);

		if (cachedResponse) {
			return cachedResponse;
		}

		const fetchResponse = await originalFetch(url, options);

		if (fetchResponse.ok) {
			cache.put(url, fetchResponse.clone());
		}

		return fetchResponse;


	} catch (error) {
		console.error('Fehler beim Abrufen oder Cachen:', error);
		return await originalFetch(url, options);
	}

}



// TODO: outsource to own file
class Pokemon {
	constructor(nameOrId, pokedexNameOrId){
		this.partDiv;
		this.wholeDiv;
		this.nameOrId = nameOrId;
		this.pokedexNameOrId = pokedexNameOrId;
		this.image = document.createElement('img');
		this.textDiv = document.createElement('div');
		this.topTextDiv = document.createElement('div');
		this.name = document.createElement('h2');
		this.nr = document.createElement('h2');
		this.checkbox = document.createElement('input');
		this.allTextDiv = document.createElement('div');
		this.desc = document.createElement('p');
		this.newDiv = document.createElement('div');
		this.bottomDiv = document.createElement('div');
		this.detailElem = document.createElement('details');
		this.detailElemSummary = document.createElement('summary');
		this.a = document.createElement('a');
		this.ul = document.createElement('ul');
		this.checkboxStatus = 'false';
	}
}

async function createPokemon(wholeDiv, partDiv, nameOrId){
	const pokedexNameOrId = "2"; // Pokemon Yellow
	let pokemon = new Pokemon(nameOrId, pokedexNameOrId);
	pokemon.partDiv = partDiv;
	pokemon.wholeDiv = wholeDiv;

	// TODO: make class method to avoid reassignment
	pokemon = setupNodeClasses(pokemon);
	
	// Event-Listener für Änderungen des Checkbox-Status
	pokemon.checkbox.addEventListener('change', function() {
		localStorage.setItem('pokemon_checkbox_status_' + nameOrId, this.checked);
	});

	// Status aus localStorage abrufen und setzen
	syncCheckboxStatusWithCache(pokemon);

	fetchAndPopulatePokemonEntry(pokemon)
	return pokemon
}

function syncCheckboxStatusWithCache(pokemon){
	pokemon.checkboxStatus = localStorage.getItem('pokemon_checkbox_status_' + pokemon.nameOrId);
	if (pokemon.checkboxStatus === 'true') {
		pokemon.checkbox.checked = true;
	}
}

function setupNodeClasses(pokemon){
	pokemon.bottomDiv.classList.add('flex');

	pokemon.desc.classList.add('description-text');
	pokemon.desc.classList.add('text-[80%]');

	pokemon.newDiv.classList.add('text-[80%]');
	pokemon.newDiv.classList.add('overflow-scroll');
	pokemon.newDiv.classList.add('max-h-[10vh]');

	pokemon.allTextDiv.classList.add('flex-col');
	pokemon.textDiv.classList.add('text');
	pokemon.topTextDiv.classList.add('flex');
	pokemon.topTextDiv.classList.add('relative');

	pokemon.image.classList.add('w-[20vw]');
	pokemon.image.classList.add('h-[20vw]');
	pokemon.image.classList.add('md:w-[15vw]');
	pokemon.image.classList.add('md:h-[15vw]');
	pokemon.image.classList.add('lg:w-[10vw]');
	pokemon.image.classList.add('lg:h-[10vw]');

	pokemon.name.classList.add('font-bold');

	pokemon.nr.classList.add('mr-[10px]');
	pokemon.nr.classList.add('w-[5vw]');
	pokemon.nr.classList.add('text-right');

	// Checkbox erstellen
	pokemon.checkbox.classList.add('ml-auto');
	pokemon.checkbox.classList.add('mr-[30px]');
	pokemon.checkbox.classList.add('mt-auto');
	pokemon.checkbox.classList.add('mb-auto');
	pokemon.checkbox.classList.add('w-[2.5vw]');
	pokemon.checkbox.classList.add('h-[2.5vw]');
	pokemon.checkbox.type = 'checkbox';
	pokemon.checkbox.id = 'pokemon-checkbox-' + pokemon.nameOrId; // Eindeutige ID für die Checkbox
	return pokemon
}

function fetchAndPopulatePokemonEntry(pokemonobj){
	var append = false;
	fetch(`${POKEMON_DATA_API_URL}/${pokemonobj.nameOrId}/${pokemonobj.pokedexNameOrId}`).then((response) => response.json()).then(async (newPokemon) => {
		const pokemonName = newPokemon.name;
		pokemonobj.image.src = newPokemon.sprite;
		pokemonobj.name.textContent = capitalizeFirstLetter(pokemonName);
		pokemonobj.nr.textContent = newPokemon.id;

		pokemonobj.partDiv.appendChild(pokemonobj.image);
 		pokemonobj.topTextDiv.appendChild(pokemonobj.name);
 		pokemonobj.topTextDiv.appendChild(pokemonobj.checkbox);
 		pokemonobj.topTextDiv.appendChild(pokemonobj.nr);
 
 		pokemonobj.allTextDiv.appendChild(pokemonobj.topTextDiv);
 		pokemonobj.allTextDiv.appendChild(pokemonobj.textDiv);
 		pokemonobj.partDiv.appendChild(pokemonobj.allTextDiv);

		localStorage.setItem('pokemon_' + pokemonName + '_color', newPokemon.color);
		for (var entry in newPokemon.flavor_texts){
			if (newPokemon.flavor_texts[entry].language.name === 'en'){
				pokemonobj.desc.textContent = newPokemon.flavor_texts[entry].flavor_text;
			}
		}
		pokemonobj.newDiv.appendChild(pokemonobj.desc);
		pokemonobj.partDiv.querySelector('div.text').appendChild(pokemonobj.newDiv);

		var i = 0;
		for (var entry in newPokemon.encounter_info){
			if (entry !== null){

				for (var detail in newPokemon.encounter_info[entry].version_details)
				{
					if (newPokemon.encounter_info[entry].version_details[detail].version.name === 'yellow') {

						const li = document.createElement("li");
						li.textContent = newPokemon.encounter_info[entry].location_area.name;
						pokemonobj.ul.appendChild(li);
						localStorage.setItem('pokemon_encounter_' + pokemonName + '_' + i, newPokemon.encounter_info[entry].location_area.name);
						i++;
						append = true;
					}

				}
			}
		}
		if (append === true){
			pokemonobj.detailElem.appendChild(pokemonobj.ul);
			pokemonobj.bottomDiv.appendChild(pokemonobj.detailElem);
		} else {
			pokemonobj.wholeDiv.classList.add('mb-[20px]');
		}
		
		pokemonobj.wholeDiv.appendChild(pokemonobj.bottomDiv);

		var color = localStorage.getItem('pokemon_'+pokemonName+'_color');
		var num = '400';
		if (color != null){
			if (color === "white"){
				num = '200';
				color = 'gray';
			}
			if (color === "brown"){
				num = '500';
				color = 'amber';
			}
			if (color === "black"){
				num = '700';
				color = 'neutral';
			}

			pokemonobj.partDiv.classList.add('bg-'+color+'-'+num+'/20');
			pokemonobj.partDiv.classList.add('inset-shadow-'+color+'-'+num+'/40');
			pokemonobj.partDiv.classList.add('transition');
			pokemonobj.partDiv.classList.add('delay-50');
			pokemonobj.partDiv.classList.add('duration-200');
			pokemonobj.partDiv.classList.add('ease-in-out');
			pokemonobj.partDiv.classList.add('hover:scale-105');
		}
	});
}

function capitalizeFirstLetter(val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}


async function isInEdition(editionName, entryVersionDetails){
	for (var details in entryVersionDetails){
		if (entryVersionDetails[details].version.name === editionName){
			return true;
		}
	}
	return false;
	
}

async function hideAllCaught(){

	const root = await document.getElementById('root');

	for (var i = 0; i < root.childElementCount; i++){
		try {
			const pokemonName = root.children[i].getAttribute('id').split('_')[2];

			// TODO: remove ability to use ID as Name
			const checkboxStatus = localStorage.getItem('pokemon_checkbox_status_' + pokemonName);
			if (checkboxStatus === "true") {
				root.children[i].style.display = 'none';
				console.log("hiding: "+pokemonName);

			}

		} catch (error){
			console.error("hideAllCaught(): "+ error);
		}

	}
	
}

// there are 10 colors!
async function getAllColors(){
	for (var i = 1; i < 11; i++){
		fetch(`${POKEMON_COLOR_URL}/${i}`).then((response) => response.json()).then(async (color) => {

			console.log(color);

		}).catch(error => {
			console.error("Fehler beim Abrufen von Pokedex-Daten:", error);
			// Fehlerbehandlung hier (z.B. Fehlermeldung anzeigen)
		});
	}



}

async function hideAllNotCaught(){

	const root = await document.getElementById('root');

	for (var i = 0; i < root.childElementCount; i++){
		try {
			const pokemonName = root.children[i].getAttribute('id').split('_')[2];

			// TODO: remove ability to use ID as Name
			const checkboxStatus = localStorage.getItem('pokemon_checkbox_status_' + pokemonName);
			if (checkboxStatus === "false" || checkboxStatus === null) {
				root.children[i].style.display = 'none';
				console.log("hiding: "+pokemonName);

			}

		} catch (error){
			console.error("hideAllNotCaught(): "+ error);
		}

	}
	
}

async function resetFilter(){
	const root = await document.getElementById('root');
	console.log("CALLED resetFilter()");

	for (var i = 0; i < root.childElementCount; i++){
		try {
			if (root.children[i].style.display === "none"){
				root.children[i].style.display = "block";
			}
		} catch (error){
			console.error('No children in root.');
		}
	}

}

async function resetRootDiv(){
	
	const root = await document.getElementById('root');

	for (var div in root.children){
		try {
			root.children[0].remove();
		} catch (error){
			console.error('No children in root.');
		}
	}

}


// if prependOrAppend === 0 -> prepend
// 		      === 1 -> append
async function createPokemonDiv(nameOrId, prependOrAppend){
	
	// bg-blue-400/20
	//
	// 	BLACK
	// bg-neutral-700/20
	//
	// bg-pink-400/20
	// bg-gray-400/20
	//
	// 	WHITE
	// bg-gray-200/20
	//
	// bg-purple-400/20
	// bg-white-400/20
	//
	// 	BROWN
	// bg-amber-500/20
	//
	// bg-yellow-400/20
	// bg-red-400/20
	// bg-green-400/20
	
	// inset-shadow-blue-400/40
	//
	// 	BLACK
	// inset-shadow-neutral-700/40
	//
	// inset-shadow-pink-400/40
	// inset-shadow-gray-400/40
	//
	// 	WHITE
	// inset-shadow-gray-200/40
	//
	// inset-shadow-purple-400/40
	// inset-shadow-white-400/40
	//
	// 	BROWN
	// inset-shadow-amber-500/40
	//
	// inset-shadow-yellow-400/40
	// inset-shadow-red-400/40
	// inset-shadow-green-400/40
	const root = document.getElementById("root");
	const partDiv = document.createElement('div');
	const wholeDiv = document.createElement('div');
	partDiv.classList.add('flex');
	partDiv.classList.add('max-h-[15%]');
	partDiv.classList.add('top-part');
	partDiv.classList.add('inset-shadow-xs');

	partDiv.classList.add('rounded-xl');
	
	let pokemon = await createPokemon(wholeDiv, partDiv, nameOrId);
	finish(pokemon, root, prependOrAppend);

}

function finish(pokemon, root, prependOrAppend){

	pokemon.wholeDiv.appendChild(pokemon.partDiv);
	pokemon.wholeDiv.setAttribute("id", "pokemon_div_"+pokemon.nameOrId);

	if (prependOrAppend === 0) {
		root.insertBefore(pokemon.wholeDiv, root.firstChild);
	} else if(prependOrAppend === 1){
		root.appendChild(pokemon.wholeDiv);
	}

}


resetSearchButton.addEventListener("click", async (event) => {
	await resetFilter();
});

hideAllNotCaughtButton.addEventListener("click", async (event) => {
	await hideAllNotCaught();
});

hideAllCaughtButton.addEventListener("click", async (event) => {
	await hideAllCaught();
});


form.addEventListener("submit", async (event) => {
	event.preventDefault();
});

input.addEventListener("input", async (event) => {
	const inputContent = document.getElementById('pokemonName').value;

	const regex = RegExp("^location:[a-zA-Z0-9-]*$", "gi");
	if (!inputContent.match(regex)){
		await hideAllBut(inputContent);
	} else {
		await hideAllButInLocation(inputContent);
	}
});

async function hideAllButInLocation(encounter_location){

	// TODO: fix for new ul and li items

	await resetFilter();

	const root = document.getElementById('root');
	const root_children_count = root.childElementCount;
	const regex = new RegExp(encounter_location.substring(9));
	for (var i = 0; i < root_children_count; i++){
		const pokemon_name = root.children[i].getAttribute('id').split('_')[2];
		const pokemon_div = document.getElementById('pokemon_div_' + pokemon_name);
		const pokemon_encounter_locations_ul = pokemon_div.querySelector("div.flex details ul");
		if (pokemon_encounter_locations_p === null){
			console.log("no encounter possible!");
			console.log("---");
			pokemon_div.style.display = 'none';
			continue;
		}

		const pokemon_encounter_locations = pokemon_encounter_locations_p.textContent.split(' ');

		var hide = true;
		for (var encounter in pokemon_encounter_locations){
			const encounter_location = pokemon_encounter_locations[encounter];
			if (encounter_location !== ""){
				console.log(encounter_location);
				if (encounter_location.match(regex)){
					hide = false;

				}

			}
		}
		if (hide){
			pokemon_div.style.display = 'none';
			console.log("hiding: " + pokemon_name);
		}
		console.log("---");
	}


}
async function hideAllBut(pokemonName){
	await resetFilter();
	const root = await document.getElementById('root');

	for (var i = 0; i < root.childElementCount; i++){
		try {
			let regex = new RegExp(pokemonName.toLowerCase(), 'gi');
			if (!root.children[i].getAttribute('id').split('_')[2].match(regex)){
				root.children[i].style.display = 'none';
			}

		} catch (error){
			console.error("hideAllBut(): "+ error);
		}

	}

}


async function genPokemonFromGeneration() {
	const pokedexName = "2";

	fetch(`${POKEDEX_API_URL}/${pokedexName}`).then((response) => response.json()).then(async (newPokedex) => {

		const entries = newPokedex.pokemon_entries;
		for (var entry in entries){
			const pokemon = entries[entry].pokemon_species.name;
			await createPokemonDiv(pokemon, 1);
		}
		
	}).catch(error => {
            console.error("Fehler beim Abrufen von Pokedex-Daten:", error);
            // Fehlerbehandlung hier (z.B. Fehlermeldung anzeigen)
        });
	
}
