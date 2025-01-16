// 변수 모으기
const apiKey = '1e3c00a40110306e1353c4f4ec5d461f';
const popularMoviesUrl = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=ko-KR&page=1`;
const bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
const searchResultDiv = document.querySelector("#movieresult");
const searchtext = document.querySelector("#searchInput");
const sr = document.querySelector(".ss");
const bookmarkDiv = document.querySelector("#bookmarkList");
const bookmarksSection = document.querySelector("#bookmarks");

let debounceTimeout;

// 인기 영화 목록
async function fetchPopularMovies() {
  try {
    const response = await fetch(popularMoviesUrl);
    if (!response.ok) throw new Error('영화 목록을 가져오는 데 문제가 발생했습니다.');
    
    const data = await response.json();
    displayPopularMovies(data.results);
  } catch (error) {
    alert(error.message);
  }
}

// 검색 구현
async function searchMovies(query) {
  try {
    const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=ko-KR&query=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('검색 결과를 가져오는 데 문제가 발생했습니다.');

    const data = await response.json();
    displaySearchResults(data.results);
    searchtext.value = ''; // 인풋 박스 내용 초기화
  } catch (error) {
    alert(error.message);
  }
}

// 디바운싱 (선택 도전)
function debounce(func, delay) {
  return function(...args) {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

// 검색 버튼 클릭 및 엔터키로 검색 (디바운스 적용)
const debouncedSearchMovies = debounce(function() {
  const query = searchtext.value;
  if (query) searchMovies(query);
}, 300); // 300ms 후 호출

document.querySelector("#searchbtn").addEventListener('click', debouncedSearchMovies);

searchtext.addEventListener('keypress', function (event) {
  if (event.key === 'Enter') {
    debouncedSearchMovies();
  }
});

// 검색 결과 표시
function displaySearchResults(movies) {
  sr.innerHTML = searchtext.value + ' 검색 결과입니다.';
  searchResultDiv.innerHTML = ''; // 초기화
  if (movies.length === 0) {
    searchResultDiv.innerHTML = '<p>검색 결과가 없습니다.</p>';
    return;
  }

  movies.forEach(movie => {
    const movieElement = createMovieElement(movie);
    searchResultDiv.appendChild(movieElement);
  });
}

// 인기 영화 표시
function displayPopularMovies(movies) {
  const popularMovieDiv = document.querySelector("#popularmovie");
  popularMovieDiv.innerHTML = '';

  movies.forEach(movie => {
    const movieElement = createMovieElement(movie);
    popularMovieDiv.appendChild(movieElement);
  });
}

// 영화 요소 생성
function createMovieElement(movie) {
  const movieElement = document.createElement('div');
  movieElement.classList.add('movie');
  movieElement.innerHTML = `
    <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title}" />
    <h3>${movie.title}</h3>
    <p>평점: ${movie.vote_average.toFixed(1)}</p>
    <button class="modal-btn" data-movie='${JSON.stringify(movie)}'>상세 정보 보기</button>
  `;

  movieElement.querySelector('.modal-btn').addEventListener("click", function () {
    const movieData = JSON.parse(this.getAttribute('data-movie'));
    showMovieDetails(movieData);
  });

  return movieElement;
}

// 영화 상세 정보 보기
function showMovieDetails(movie) {
  const modal = document.createElement('div');
  modal.classList.add('modal');
  modal.innerHTML = `
    <div class="modal-content">
      <img class="image" src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title}"/>
      <h2>${movie.title}</h2>
      <p>${movie.overview}</p>
      <p>평점: ${movie.vote_average.toFixed(1)}</p>
      <button class="bookmark-btn">북마크 추가하기</button>
      <button class="close-btn">닫기</button>
    </div>`;

  document.body.appendChild(modal);
  modal.classList.remove("hide");

  modal.querySelector(".bookmark-btn").addEventListener("click", function () {
    addBookmark(movie);
    modal.classList.add("hide");
    document.body.removeChild(modal);
  });

  modal.querySelector(".close-btn").addEventListener("click", function () {
    modal.classList.add("hide");
    document.body.removeChild(modal);
  });

  modal.addEventListener("click", function (event) {
    if (event.target === modal) {
      modal.classList.add("hide");
      document.body.removeChild(modal);
    }
  });
}

// 로컬 저장소를 활용한 북마크 추가
function addBookmark(movie) {
  if (!bookmarks.find(b => b.id === movie.id)) {
    bookmarks.push(movie);
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    alert(`${movie.title}이(가) 북마크에 추가되었습니다.`);
  } else {
    alert('이미 북마크에 추가된 영화입니다.');
  }
}

// 북마크 보기 버튼 클릭 이벤트 리스너
document.querySelector("#lookbookmark").addEventListener('click', function () {
  bookmarkDiv.innerHTML = ''; // 초기화

  if (bookmarks.length === 0) {
    bookmarkDiv.innerHTML = '<p>북마크가 없습니다.</p>';
    return;
  }

  bookmarks.forEach(movie => {
    const movieElement = createMovieElement(movie);
    bookmarkDiv.appendChild(movieElement);
  });

  bookmarksSection.classList.add('show'); // 북마크 섹션 보이기
});

// 영화 검색 제목 클릭 시 초기 화면으로 돌아가기
document.querySelector('h1').addEventListener('click', function () {
  bookmarksSection.classList.remove('show'); // 북마크 섹션 숨기기
  searchResultDiv.innerHTML = ''; // 검색 결과 초기화
  bookmarkDiv.innerHTML = ''; // 북마크 리스트 초기화
  sr.innerHTML = ''; // 검색 결과 텍스트 초기화
});

// 페이지가 로드되면 인기 영화 가져오기
document.addEventListener('DOMContentLoaded', fetchPopularMovies);
