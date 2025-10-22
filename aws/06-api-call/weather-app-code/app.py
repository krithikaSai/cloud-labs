from flask import Flask, render_template, request
import requests

app = Flask(__name__)

API_KEY = 'insert-your-api-key'
BASE_URL = "http://api.openweathermap.org/data/2.5/weather?"

@app.route("/", methods=["GET", "POST"])
def index():
    weather_data = None

    if request.method == "POST":
        city_name = request.form.get("city")
        complete_url = f"{BASE_URL}q={city_name}&appid={API_KEY}&units=metric"

        try:
            response = requests.get(complete_url)
            response.raise_for_status()
            data = response.json()

            weather_data = {
                "location": data['name'],
                "temperature": data['main']['temp'],
                "description": data['weather'][0]['description'].title()
            }
        except Exception as e:
            weather_data = {"error": str(e)}

    return render_template("index.html", weather=weather_data)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)

