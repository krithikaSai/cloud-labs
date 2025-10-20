import pymysql
pymysql.install_as_MySQLdb()

from flask import Flask, render_template, request, redirect, url_for, session, flash
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
import MySQLdb
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = "super-secret-key"  

# Flask-Login setup
login_manager = LoginManager()
login_manager.login_view = 'login'
login_manager.init_app(app)

# RDS MySQL config
DB_CONFIG = {
    "host": "replace with your endpoint",
    "user": "replace with your username",
    "passwd": "replace with your password",
    "db": "notes_app"
}

# User class
class User(UserMixin):
    def __init__(self, id, username):
        self.id = id
        self.username = username

@login_manager.user_loader
def load_user(user_id):
    conn = MySQLdb.connect(**DB_CONFIG)
    cursor = conn.cursor()
    cursor.execute("SELECT id, username FROM users WHERE id = %s", (user_id,))
    result = cursor.fetchone()
    cursor.close()
    conn.close()
    if result:
        return User(result[0], result[1])
    return None

# Helper function to connect to DB
def get_db():
    return MySQLdb.connect(**DB_CONFIG)

# Routes
@app.route('/')
@login_required
def home():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, title, content, created_at FROM notes WHERE user_id = %s", (current_user.id,))
    notes = cursor.fetchall()
    cursor.close()
    conn.close()
    return render_template('notes.html', notes=notes, username=current_user.username)

@app.route('/add_note', methods=['POST'])
@login_required
def add_note():
    title = request.form['title']
    content = request.form['content']
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO notes (user_id, title, content) VALUES (%s, %s, %s)",
                   (current_user.id, title, content))
    conn.commit()
    cursor.close()
    conn.close()
    return redirect(url_for('home'))

@app.route('/edit_note/<int:note_id>', methods=['GET', 'POST'])
@login_required
def edit_note(note_id):
    conn = get_db()
    cursor = conn.cursor()
    if request.method == 'POST':
        title = request.form['title']
        content = request.form['content']
        cursor.execute("UPDATE notes SET title=%s, content=%s WHERE id=%s AND user_id=%s",
                       (title, content, note_id, current_user.id))
        conn.commit()
        cursor.close()
        conn.close()
        return redirect(url_for('home'))
    else:
        cursor.execute("SELECT title, content FROM notes WHERE id=%s AND user_id=%s", (note_id, current_user.id))
        note = cursor.fetchone()
        cursor.close()
        conn.close()
        if note:
            return render_template('edit_note.html', note_id=note_id, title=note[0], content=note[1])
        else:
            return redirect(url_for('home'))

@app.route('/delete_note/<int:note_id>', methods=['POST'])
@login_required
def delete_note(note_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM notes WHERE id=%s AND user_id=%s", (note_id, current_user.id))
    conn.commit()
    cursor.close()
    conn.close()
    return redirect(url_for('home'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id, password_hash FROM users WHERE username=%s", (username,))
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        if result and check_password_hash(result[1], password):
            user = User(result[0], username)
            login_user(user)
            return redirect(url_for('home'))
        else:
            flash("Invalid credentials")
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        hashed_pw = generate_password_hash(password)
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE username=%s", (username,))
        if cursor.fetchone():
            flash("Username already exists")
        else:
            cursor.execute("INSERT INTO users (username, password_hash) VALUES (%s, %s)", (username, hashed_pw))
            conn.commit()
            flash("User registered! Please log in.")
        cursor.close()
        conn.close()
        return redirect(url_for('login'))
    return render_template('register.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)