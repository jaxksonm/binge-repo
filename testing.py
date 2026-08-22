import random 


def get_movie():
    return input("What movie do you want to watch? \n")

def generate_phone_number():
    phone_number = random.randint(10**9, (10**10) - 1)
    return phone_number

def match_maker(movie, number):
    number_str = str(number)
    formatted = "(" + number_str[:3] + ")" + number_str[3:]
    print(f"Movie: {movie}")
    print(f"Phone Number: {formatted}")


def main():
    movie = get_movie()
    number = generate_phone_number()
    match_maker(movie, number)


if __name__ == "__main__":
    main()