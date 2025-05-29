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

/**
 * Fetch popular movies and attach the first YouTube trailer key (if any) to each movie.
 */
export async function fetchMoviesWithTrailers() {
  const data = await fetchPopularMovies();
  const movies = data.results;

  const moviesWithTrailers = await Promise.all(
    movies.map(async (movie: any) => {
      const videosData = await fetchMovieVideos(movie.id);
      const trailers = videosData.results.filter(
        (video: any) => video.type === 'Trailer' && video.site === 'YouTube'
      );
      return {
        ...movie,
        trailerKey: trailers.length > 0 ? trailers[0].key : null,
      };
    })
  );

  return moviesWithTrailers;
}
