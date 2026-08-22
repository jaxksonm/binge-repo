import random
import os
import requests
import urllib3
from dotenv import load_dotenv

# force ipv4 
urllib3.util.connection.HAS_IPV6 = False

load_dotenv()  # load the env file 

API_KEY = os.getenv("IMDB_API_KEY")

POSTER_BASE_URL = "https://image.tmdb.org/t/p/w500"


def get_random_movie_id():
    page = random.randint(1, 10)
    url = "https://api.themoviedb.org/3/movie/popular"
    params = {"api_key": API_KEY, "page": page}
    response = requests.get(url, params=params)
    data = response.json()
    movie = random.choice(data["results"])
    return movie["id"]


def get_movie_details(movie_id):
    url = f"https://api.themoviedb.org/3/movie/{movie_id}"
    params = {"api_key": API_KEY}
    response = requests.get(url, params=params)
    return response.json()


def get_movie():
    movie_id = get_random_movie_id()
    details = get_movie_details(movie_id)

    title = details["title"]
    overview = details["overview"]
    runtime = details["runtime"]  # in minutes
    genres = [g["name"] for g in details["genres"]]
    poster_path = details["poster_path"]
    poster_url = f"{POSTER_BASE_URL}{poster_path}" if poster_path else None

    return {
        "title": title,
        "overview": overview,
        "runtime": runtime,
        "genres": genres,
        "poster_url": poster_url,
    }


def main():
    movie = get_movie()
    print(f"Title: {movie['title']}")
    print(f"Genres: {', '.join(movie['genres'])}")
    print(f"Runtime: {movie['runtime']} minutes")
    print(f"Overview: {movie['overview']}")
    print(f"Poster: {movie['poster_url']}")


if __name__ == "__main__":
    main()