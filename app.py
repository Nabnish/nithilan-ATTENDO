from flask import Flask, render_template, request, jsonify, redirect, url_for, session
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import mysql.connector

# Create a Flask app instance.
app = Flask(__name__)
app.secret_key = "your-secret-key"
CORS(app)

# ---------- MySQL Connection ----------
# Function to establish a connection to the MySQL database.
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="Nabeel174",
        database="attendo"
    )

# ---------- Routes ----------
# Route for the main login page.
@app.route('/')
def index():
    # Corrected path: Flask automatically looks inside the 'templates' folder.
    return render_template("login.html")

# Route for the user's home page after successful login.

@app.route('/home')
def home():
    if 'username' in session:
        return render_template("home.html", username=session['username'], role=session['role'])
    return redirect(url_for('index'))


# Route to handle user registration.
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    role = data.get("role", "student")

    if not username or not password:
        return jsonify({"status": "error", "message": "Please fill all fields."})

    hashed_pw = generate_password_hash(password)

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO users (username, password, role) VALUES (%s, %s, %s)",
            (username, hashed_pw, role)
        )
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"status": "success", "message": "User registered successfully!"})
    except mysql.connector.IntegrityError:
        return jsonify({"status": "error", "message": "Username already exists!"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

# Route to handle user login.
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True) # Use dictionary=True to access columns by name
        cursor.execute("SELECT username, password, role FROM users WHERE username=%s", (username,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()

        if user and check_password_hash(user['password'], password):
            session['username'] = user['username']
            session['role'] = user['role']
            return jsonify({"status": "success", "message": "Login successful!"})
        else:
            return jsonify({"status": "fail", "message": "Invalid credentials."})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

# ---------- Run App ----------
if __name__ == "__main__":
    app.run(debug=True)
