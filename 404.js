let selectedCards = [];
let cardMap = {};
let currentBit = 0;
let answerBits = 0;
const maxBits = 5;
let fullDeck = [];

const cardPickContainer = document.getElementById("card-pick");
const groupContainer = document.getElementById("card-group");
const revealContainer = document.getElementById("revealed-card");

async function fetchCards() {
	try {
		const res = await fetch(
			"https://deckofcardsapi.com/api/deck/new/draw/?count=52"
		);
		const data = await res.json();

		fullDeck = data.cards;
		selectedCards = fullDeck.slice(0, 20);

	
		selectedCards.forEach((card, i) => {
			card.binaryValue = i + 1;
			cardMap[card.binaryValue] = card;
		});

	
		selectedCards.forEach((card) => {
			const img = document.createElement("img");
			img.src = card.image;
			img.alt = `${card.value} of ${card.suit}`;
			cardPickContainer.appendChild(img);
		});

		fanCards(cardPickContainer);
	} catch (error) {
		console.error("Error fetching cards:", error);
	}
}


function fanCards(container) {
	const cards = container.querySelectorAll("img");
	const total = cards.length;
	const spacing = 5; // angle spacing between cards
	const startAngle = -Math.floor(total / 2) * spacing;

	cards.forEach((card, i) => {
		const angle = startAngle + i * spacing;
		const offset = (i - total / 2) * 30 - 20;
		card.style.transform = `rotate(${angle}deg)`;
		card.style.left = `calc(50% + ${offset}px)`;
		card.style.bottom = `0`;
		card.style.zIndex = i;
	});
}


function startTrick() {
	document.getElementById("step-1").classList.add("hidden");
	document.getElementById("main-title").classList.add("hidden");
	document.getElementById("step-2").classList.remove("hidden");
	showNextGroup();
}


function showNextGroup() {
	groupContainer.innerHTML = "";

	const bit = 1 << currentBit;
	const group = selectedCards.filter((card) => (card.binaryValue & bit) !== 0);


	const availableExtras = fullDeck.filter((c) => !selectedCards.includes(c));
	const shuffledExtras = availableExtras.sort(() => Math.random() - 0.5);
	const extras = shuffledExtras.slice(0, 14 - group.length);

	const combined = [...group, ...extras].sort(() => Math.random() - 0.5);

	combined.forEach((card) => {
		const img = document.createElement("img");
		img.src = card.image;
		img.alt = `${card.value} of ${card.suit}`;
		groupContainer.appendChild(img);
	});

	fanCards(groupContainer);
}


function answer(isYes) {
	if (isYes) answerBits += 1 << currentBit;
	currentBit++;

	if (currentBit >= maxBits) {
		revealCard();
	} else {
		showNextGroup();
	}
}

function revealCard() {
	document.getElementById("step-2").classList.add("hidden");
	document.getElementById("step-3").classList.remove("hidden");

	const card = cardMap[answerBits];

	if (card) {
	
		const mainCard = document.createElement("img");
		mainCard.src = card.image;
		mainCard.alt = `${card.value} of ${card.suit}`;
		mainCard.className = "main-card";
		revealContainer.appendChild(mainCard);

		setTimeout(() => {
		
			for (let i = 0; i < 12; i++) {
				const img = document.createElement("img");
				img.src = card.image;
				img.alt = `${card.value} of ${card.suit}`;

			
				const randomLeft = Math.random() * 100; 
				const randomDelay = Math.random() * 5; 
				const randomDuration = 8 + Math.random() * 7; 

				img.style.left = `${randomLeft}%`;
				img.style.animationDelay = `${randomDelay}s`;
				img.style.animationDuration = `${randomDuration}s`;

				revealContainer.appendChild(img);
			}
		}, 800); 
	} else {
		revealContainer.innerHTML = `<div class="error-message">Card not found. Try again!</div>`;
	}
}


function shuffleDeck() {
	document.getElementById("step-3").classList.add("hidden");
	document.getElementById("main-title").classList.remove("hidden");
	document.getElementById("step-1").classList.remove("hidden");

	
	cardPickContainer.innerHTML = "";
	groupContainer.innerHTML = "";
	revealContainer.innerHTML = "";

	
	currentBit = 0;
	answerBits = 0;
	selectedCards = [];
	cardMap = {};


	fetchCards();
}

const isThumbnail =
	window.location.href.includes("pen") && !window.location.href.includes("edit");
if (isThumbnail) {
	window.addEventListener("load", () => {
		startTrick();
		for (let i = 0; i < maxBits; i++) {
			setTimeout(() => {
				answer(Math.random() < 0.5);
			}, i * 800);
		}
	});
} else {
	
	fetchCards();
}
