const allCatsBtn = document.getElementById('all-cats-btn');
const favCatsBtn = document.getElementById('fav-cats-btn');
const catsContainer = document.getElementById('cats-container');
const loadingText = document.getElementById('loading-text');

let currentTab = 'all';
let allCats = [];
let favoriteCats = JSON.parse(localStorage.getItem('favoriteCats')) || [];

favoriteCats = favoriteCats.filter(cat => cat && cat.id && cat.url);

localStorage.setItem('favoriteCats', JSON.stringify(favoriteCats));

let isLoading = false;

allCatsBtn.addEventListener('click', () => {
    allCatsBtn.classList.add('active');
    favCatsBtn.classList.remove('active');
    setTab('all');
});
favCatsBtn.addEventListener('click', () => {
    favCatsBtn.classList.add('active');
    allCatsBtn.classList.remove('active');
    setTab('favorites');
});

function setTab(tab) {
    currentTab = tab;
    allCatsBtn.classList.toggle('active', tab === 'all');
    favCatsBtn.classList.toggle('active', tab === 'favorites');
    renderCats();
}

async function loadCats() {
    if (isLoading) return;
    isLoading = true;
    loadingText.style.display = 'block';

    try {
        const response = await fetch('https://api.thecatapi.com/v1/images/search?limit=15');
        const data = await response.json();
        allCats = allCats.concat(data);
        renderCats();
    } catch (error) {
        console.error('Ошибка загрузки котиков:', error);
    } finally {
        isLoading = false;
        loadingText.style.display = 'none';
    }
}

function renderCats() {
    catsContainer.innerHTML = '';

    const catsToShow = currentTab === 'all' ? allCats : favoriteCats;

    if (catsToShow.length === 0 && currentTab === 'favorites') {
        const noCatsText = document.createElement('div');
        noCatsText.className = 'no-cats-text';
        noCatsText.textContent = 'Избранных котиков не нашлось';
        catsContainer.appendChild(noCatsText);
        return;
    }

    catsToShow.forEach(cat => {
        const catItem = document.createElement('div');
        catItem.className = 'cat-item';

        const catImg = document.createElement('img');
        catImg.src = cat.url;

        const likeBtn = document.createElement('div');
        likeBtn.className = `like-btn ${isFavorite(cat.id) ? 'red' : 'default'}`;

        likeBtn.addEventListener('click', () => toggleFavorite(cat, likeBtn));

        catItem.appendChild(catImg);
        catItem.appendChild(likeBtn);
        catsContainer.appendChild(catItem);
    });
}

function isFavorite(catId) {
    return favoriteCats.some(cat => cat.id === catId);
}

function toggleFavorite(cat, likeBtn) {
    const index = favoriteCats.findIndex(favCat => favCat.id === cat.id);

    if (index === -1) {
        favoriteCats.push(cat);
        likeBtn.classList.remove('default');
        likeBtn.classList.add('orange');
        setTimeout(() => {
            likeBtn.classList.remove('orange');
            likeBtn.classList.add('red');
        }, 300);
    } else {
        favoriteCats.splice(index, 1);
        likeBtn.classList.remove('red', 'orange');
        likeBtn.classList.add('default');
    }

    localStorage.setItem('favoriteCats', JSON.stringify(favoriteCats));
    renderCats();
}


window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 && currentTab === 'all') {
        loadCats();
    }
});

loadCats();
