import requests
from bs4 import BeautifulSoup
from pymongo import MongoClient
from datetime import datetime
from dotenv import load_dotenv
import os
import schedule
import time

# Load environment variables
load_dotenv()

# MongoDB Connection URI from .env file
MONGO_URI = os.getenv("MONGODB_URI")

# Database and Collection Names
DATABASE_NAME = "chess_ratings"
COLLECTION_NAME = "chess_players"  

def scrape_chess_ratings():
    URL = "https://ratings.fide.com/a_top_var.php?continent=0&country=IND&rating=standard&gender=&age1=0&age2=0&period=2025-01-01&period2=1"
    response = requests.get(URL)
    soup = BeautifulSoup(response.content, "html.parser")

    table_rows = soup.select("table tr")[1:]  # Skip header row
    data = []

    for row in table_rows:
        cols = row.find_all("td")
        if len(cols) < 6:
            continue
        
        
        data.append({
            "indianRank": int(cols[0].text.strip()),
            "name": cols[1].text.strip(),
            "title": cols[2].text.strip(),
            "federation": cols[3].text.strip(),
            "rating": int(cols[4].text.strip()),
            "birthYear": int(cols[5].text.strip()),
            "scrapedAt": datetime.now()
        })

    return data

def save_to_mongodb(data):
    try:
        client = MongoClient(MONGO_URI)
        db = client[DATABASE_NAME]
        collection = db[COLLECTION_NAME]
        
        # Clear existing data before inserting new data
        collection.delete_many({})
        
        # Insert new data
        collection.insert_many(data)
        print(f"Successfully saved {len(data)} players to MongoDB.")
    except Exception as e:
        print(f"Error saving to MongoDB: {e}")
    finally:
        client.close()

def update_chess_data():
    print("Starting chess data update...")
    chess_data = scrape_chess_ratings()
    save_to_mongodb(chess_data)
    print("Chess data update completed.")

# Schedule the update to run daily
schedule.every().day.at("00:00").do(update_chess_data)

if __name__ == "__main__":
    # Initial run
    update_chess_data()
    
    # Keep the script running for scheduled updates
    while True:
        schedule.run_pending()
        time.sleep(60)