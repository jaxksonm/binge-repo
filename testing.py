import random
import os
import requests
import urllib3
from dotenv import load_dotenv

# force ipv4 
urllib3.util.connection.HAS_IPV6 = False

load_dotenv() # load the env file 

API_KEY = os.getenv("IMDB_API_KEY") # use this api key for the movie 



def get_name():
    return random.choice(names)

def get_movie():
    page = random.randint(1, 10)
    url = "https://api.themoviedb.org/3/movie/popular"
    params = {"api_key": API_KEY, "page": page}
    response = requests.get(url, params=params)
    data = response.json()
    movie = random.choice(data["results"])
    return movie["title"]



def main():
    movie = get_movie()
    print({movie})
    


if __name__ == "__main__":
    main()