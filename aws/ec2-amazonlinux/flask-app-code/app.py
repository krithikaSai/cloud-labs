from flask import Flask

app = Flask(__name__)

@app.route('/')
def home():
    return """
    <html>
        <head>
            <title>Flask on EC2</title>
            <style>
                body {
                    background: linear-gradient(135deg, #4b6cb7, #182848);
                    color: #fff;
                    font-family: 'Segoe UI', sans-serif;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                }
                h1 {
                    font-size: 3em;
                    margin-bottom: 0.3em;
                    text-shadow: 2px 2px 5px rgba(0,0,0,0.3);
                }
                p {
                    font-size: 1.3em;
                    color: #e0e0e0;
                }
                .button {
                    background-color: #ff6f61;
                    color: white;
                    padding: 10px 20px;
                    border: none;
                    border-radius: 10px;
                    margin-top: 20px;
                    cursor: pointer;
                    transition: background 0.3s;
                }
                .button:hover {
                    background-color: #ff3b2e;
                }
            </style>
        </head>
        <body>
            <h1>Welcome to Your EC2 Flask App!</h1>
            <p>This page is running live on Amazon EC2.</p>
            <button class="button" onclick="alert('Your Flask app says hi!')">Click Me</button>
        </body>
    </html>
    """

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
