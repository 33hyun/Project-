const apiKey = '1e3c00a40110306e1353c4f4ec5d461f';
const popularMoviesUrl = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=ko-KR&page=1`;
const bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];

// 인기 영화 목록
async function fetchPopularMovies() {
  try {
    const response = await fetch(popularMoviesUrl);
    if (!response.ok) {
      throw new Error('네트워크 응답이 올바르지 않습니다.');
    }
    const data = await response.json();
    displayPopularMovies(data.results);
  } catch (error) {
    console.error('영화 목록을 가져오는 데 문제가 발생했습니다:', error);
  }
}

// 영화 검색
async function searchMovies(query) {
  try {
    const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=ko-KR&query=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error('네트워크 응답이 올바르지 않습니다.');
    }
    const data = await response.json();
    displaySearchResults(data.results);
  } catch (error) {
    console.error('영화 검색 중 오류가 발생했습니다:', error);
  }
}

// 검색 버튼 클릭 및 엔터키로 검색
document.querySelector("#searchbtn").addEventListener('click', function () {
  const query = document.querySelector("#searchInput").value;
  if (query) {
    searchMovies(query);
  }
});

// 엔터 키로 검색 가능하게 설정
document.querySelector("#searchInput").addEventListener('keypress', function (event) {
  if (event.key === 'Enter') {
    const query = this.value;
    if (query) {
      searchMovies(query);
    }
  }
});

// 검색 결과 표시
function displaySearchResults(movies) {
  const searchResultDiv = document.querySelector("#movieresult");
  searchResultDiv.innerHTML = '';

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
  
  // 버튼 클릭 이벤트 리스너 추가
  const modalBtn = movieElement.querySelector('.modal-btn');
  modalBtn.addEventListener("click", function () {
    const movieData = JSON.parse(this.getAttribute('data-movie'));
    showMovieDetails(movieData);
  });

  return movieElement;
}

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
    </div>
  `;

  document.body.appendChild(modal);
  modal.classList.remove("hide");

  // 북마크 추가 버튼 클릭 이벤트 리스너
  const bookmarkBtn = modal.querySelector(".bookmark-btn");
  bookmarkBtn.addEventListener("click", function () {
    addBookmark(movie);
    modal.classList.add("hide");
    document.body.removeChild(modal);
  });

  const closebtn = modal.querySelector(".close-btn");
  closebtn.addEventListener("click", function () {
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

function addBookmark(movie) {
  // 북마크 중복 추가 막기
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
  const bookmarkDiv = document.querySelector("#bookmarkList");
  const bookmarksSection = document.querySelector("#bookmarks");
  
  bookmarkDiv.innerHTML = ''; // 이전 검색 결과 지우기

  if (bookmarks.length === 0) {
    bookmarkDiv.innerHTML = '<p>북마크가 없습니다.</p>';
    return;
  }

  bookmarks.forEach(movie => {
    const movieElement = createMovieElement(movie);
    bookmarkDiv.appendChild(movieElement);
  });

  // 북마크 섹션 보이기
  bookmarksSection.classList.add('show');
});

// 영화 검색 제목 클릭 시 초기 화면으로 돌아가기
document.querySelector('h1').addEventListener('click', function () {
  const bookmarksSection = document.querySelector("#bookmarks");
  bookmarksSection.classList.remove('show'); 
  document.querySelector("#movieresult").innerHTML = ''; 
  document.querySelector("#bookmarkList").innerHTML = ''; 
});

document.addEventListener('DOMContentLoaded', fetchPopularMovies);
