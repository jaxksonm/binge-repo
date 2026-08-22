import random 


names = ["Olivia", "Sophia", "Isabella", "Ava", "Mia", "Charlotte", 
               "Amelia", "Harper", "Evelyn", "Luna", "Aria", "Ella", 
               "Scarlett", "Grace", "Chloe", "Victoria", "Riley", 
               "Aubrey", "Zoey", "Layla"]

def get_name():
    return random.choice(names)

def get_movie():
    return input("What movie do you want to watch? \n")

def generate_phone_number():
    phone_number = random.randint(10**9, (10**10) - 1)
    return phone_number

def match_maker(movie, number, name):
    number_str = str(number)
    formatted = "(" + number_str[:3] + ")" + number_str[3:]
    print(f"Movie: {movie}")
    print(f"Name: {name}")
    print(f"Phone Number: {formatted}")
    


def main():
    movie = get_movie()
    name = get_name()
    number = generate_phone_number()
    match_maker(movie, number, name)


if __name__ == "__main__":
    main()  