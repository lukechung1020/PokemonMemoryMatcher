
const pokeAPIBaseUrl = "https://pokeapi.co/api/v2/pokemon/";
const game = document.getElementById('game');

let clicks = 0;
let firstPick;
let isPaused = true;
let matches;
let numMatches = 0;
let percentChance;

var countdown;
var deadline;

var settingsModal = document.getElementById("settings-modal");
var winModal = document.getElementById("winning-modal");
var loseModal = document.getElementById("losing-modal");

const handleSubmit = (event) => {
    event.preventDefault();
    var selectedDifficulty = document.getElementById("difficulty").value;
    var selectedTheme = document.getElementById("theme").value;

    startGame(selectedDifficulty, selectedTheme);
}

var form = document.getElementById("game-settings");
form.addEventListener("submit", handleSubmit);


const colors = {
    fire: '#FDDFDF',
    grass: '#DEFDE0',
    electric: '#FCF7DE',
    water: '#DEF3FD',
    ground: '#f4e7da',
    rock: '#d5d5d4',
    fairy: '#fceaff',
    poison: '#98d7a5',
    bug: '#f8d5a3',
    dragon: '#97b3e6',
    psychic: '#eaeda1',
    flying: '#F5F5F5',
    fighting: '#E6E0D4',
    normal: '#F5F5F5'
};

const loadPokemon = async (rows, columns) => {
    const randomIds = new Set();
    while (randomIds.size < numMatches) {
        const randomNumber = Math.ceil(Math.random() * 150);
        randomIds.add(randomNumber);
    }
    const pokePromises = [...randomIds].map(id => fetch(pokeAPIBaseUrl + id))
    const results = await Promise.all(pokePromises);
    return await Promise.all(results.map(res => res.json()));
}

const resetGame = async (rows, columns, seconds) => {
    setValues(seconds);
    document.documentElement.style.setProperty("--rows", rows);
    document.documentElement.style.setProperty("--columns", columns);
    numMatches = rows * columns / 2;
    game.innerHTML = '';
    isPaused = true;
    firstPick = null;
    matches = 0;

    document.getElementById("matches").innerHTML = matches;
    document.getElementById("numMatches").innerHTML = numMatches;

    setTimeout(async () => {
        const loadedPokemon = await loadPokemon(rows, columns);
        displayPokemon([...loadedPokemon, ...loadedPokemon]);
        isPaused = false;
    }, 200)
}

const displayPokemon = (pokemon) => {
    pokemon.sort(_ => Math.random() - 0.5);
    const pokemonHTML = pokemon.map(pokemon => {
        const type = pokemon.types[0]?.type?.name;
        const color = colors[type] || '#F5F5F5';
        return `
          <div class="card" onclick="clickCard(event)" data-pokename="${pokemon.name}" style="background-color:${color};">
            <div class="front ">
            </div>
            <div class="back rotated" style="background-color:${color};">
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}"  />
            <h2>${pokemon.name}</h2>
            </div>
        </div>
    `}).join('');
    game.innerHTML = pokemonHTML;
}

const clickCard = (e) => {
    const pokemonCard = e.currentTarget;
    const [front, back] = getFrontAndBackFromCard(pokemonCard)
    if (front.classList.contains("rotated") || isPaused) {
        return;
    }
    isPaused = true;
    rotateElements([front, back]);
    if (!firstPick) {
        firstPick = pokemonCard;
        isPaused = false;
    }
    else {
        const secondPokemonName = pokemonCard.dataset.pokename;
        const firstPokemonName = firstPick.dataset.pokename;
        if (firstPokemonName !== secondPokemonName) {
            const [firstFront, firstBack] = getFrontAndBackFromCard(firstPick);
            setTimeout(() => {
                rotateElements([front, back, firstFront, firstBack]);
                firstPick = null;
                isPaused = false;
            }, 500)
        } else {
            matches++;
            document.getElementById("matches").innerHTML = matches;
            if (matches === numMatches) {
                displayWinningCard();
            }
            powerUp();
            firstPick = null;
            isPaused = false;
        }
    }
    clicks++;
    updateClicks();
}

const getFrontAndBackFromCard = (card) => {
    const front = card.querySelector(".front");
    const back = card.querySelector(".back");
    return [front, back]
}

const rotateElements = (elements) => {
    if (typeof elements !== 'object' || !elements.length) return;
    elements.forEach(element => element.classList.toggle('rotated'));
}

const setValues = (seconds) => {
    clicks = 0;
    document.getElementById("num-clicks").innerHTML = clicks;
    clearInterval(countdown);
    startCountdown(seconds * 1000);
}

const updateClicks = () => {
    document.getElementById("num-clicks").innerHTML = clicks;
}

const displayWinningCard = () => {
    clearInterval(countdown);
    winModal.showModal();
}

const closeWinningCard = () => {
    winModal.close();
    initiateGame();
}

const displayLosingCard = () => {
    clearInterval(countdown);
    loseModal.showModal();
}

const closeLosingCard = () => {
    loseModal.close();
    initiateGame();
}

const startCountdown = (duration) => {
    var currentTime = Date.parse(new Date());
    deadline = new Date(currentTime + duration);

    countdown = setInterval(() => {
        var now = new Date().getTime();
        var timeLeft = deadline - now;

        var minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        var secondsString = seconds.toString().padStart(2, "0");

        document.getElementById("minute").innerHTML = minutes;
        document.getElementById("second").innerHTML = secondsString;

        if (timeLeft <= 1) {
            clearInterval(countdown);
            displayLosingCard();
        }
    });
}

const addTime = (seconds) => {
    deadline = new Date(deadline.getTime() + seconds * 1000);

    var animationElement = document.getElementById("animation");
    animationElement.textContent = "+" + seconds + " seconds";
    animationElement.style.display = "block";
    setTimeout(function () {
        animationElement.style.display = "none";
    }, 2000);
}

const powerUp = () => {
    const randomChance = Math.floor(Math.random() * 100);
    if (randomChance <= percentChance) {
        addTime(3);
    }
}

const startGame = (selectedDifficulty, selectedTheme) => {
    if (selectedTheme === "Dark") {
        document.documentElement.style.setProperty("--bg", "#121212");
        document.documentElement.style.setProperty("--card-colour", "#f5f5f5");
        document.documentElement.style.setProperty("--text-colour", "#f5f5f5");
    } else {
        document.documentElement.style.setProperty("--bg", "white");
        document.documentElement.style.setProperty("--card-colour", "black");
        document.documentElement.style.setProperty("--text-colour", "black");
    }

    settingsModal.close();
    if (selectedDifficulty === "Easy") {
        percentChance = 20;
        resetGame(3, 4, 61);
    } else if (selectedDifficulty === "Medium") {
        percentChance = 30;
        resetGame(4, 4, 46);
    } else {
        percentChance = 40;
        resetGame(4, 5, 31);
    }
}

const initiateGame = () => {
    clearInterval(countdown);
    settingsModal.showModal();
}

initiateGame();