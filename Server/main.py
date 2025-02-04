from flask import Flask

app = Flask(__name__)

@app.route("/")
def home():
    return "Ahoj, toto je môj server!"

@app.route("/test")
def test():
    return "Testujem route na serveri."

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=8080)