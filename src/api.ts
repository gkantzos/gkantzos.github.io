const API_KEY = '1440486e2303acd8482582f79b512e28';
const BASE_URL = 'https://api.themoviedb.org/3';

export async function fetchPopularMovies() {
  const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US`);
  if (!response.ok) throw new Error('Failed to fetch popular movies');
  return response.json();
}

export async function fetchMovieDetails(id: number) {
  const response = await fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=en-US`);
  if (!response.ok) throw new Error('Failed to fetch movie details');
  return response.json();
}

export async function fetchNowPlaying() {
  const response = await fetch(`${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=en-US`);
  if (!response.ok) throw new Error('Failed to fetch now playing movies');
  return response.json();
}

export async function fetchUpcomingMovies() {
  const response = await fetch(`${BASE_URL}/movie/upcoming?api_key=${API_KEY}&language=en-US`);
  if (!response.ok) throw new Error('Failed to fetch upcoming movies');
  return response.json();
}

export async function fetchMovieVideos(movieId: number) {
  const response = await fetch(`${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}&language=en-US`);
  if (!response.ok) throw new Error('Failed to fetch movie videos');
  return response.json();
}

export async function fetchMoviesWithTrailers() {
  const data = await fetchPopularMovies();
  const movies = data.results;

const moviesWithTrailers = await Promise.all(
  movies.map(async (movie: any) => {
    const videosData = await fetchMovieVideos(movie.id);

    // Προσπάθησε να βρεις πρώτα το επίσημο trailer
    let trailer = videosData.results.find(
      (video: any) =>
        video.type === 'Trailer' &&
        video.site === 'YouTube' &&
        video.official === true
    );

    // Αν δεν υπάρχει official, πάρε οποιοδήποτε YouTube trailer
    if (!trailer) {
      trailer = videosData.results.find(
        (video: any) =>
          video.type === 'Trailer' &&
          video.site === 'YouTube'
      );
    }

    return {
      ...movie,
      trailerKey: trailer ? trailer.key : null,
    };
  })
);

return moviesWithTrailers;

}

export const fetchMovieCredits = async (movieId: number) => {
  const response = await fetch(
    `${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}&language=en-US`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch credits');
  }
  return response.json();
};
