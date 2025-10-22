# AWS Lab: Deploying a Flask Application on Windows EC2

### Objective
Creating a Windows EC2 instance, connecting to it using RDP, and creating a (very) simple Flask web application.

## Step 1: Launch an EC2 Instance

1. Log in to the AWS Management Console and open the EC2 Dashboard.
  
   <img src="images/1.png" width="550" height="380"/>


2. Click "Launch Instance" and configure as follows:

   <img src="images/2.png" width="550" height="380"/><br><br><br>
   <img src="images/3.png" width="550" height="380"/><br><br><br>
   <img src="images/4.png" width="550"/><br><br><br>
   <img src="images/5.png" width="550" height="380"/><br><br><br>
   <img src="images/6.png" width="550" height="380"/><br><br><br>
   <img src="images/7.png" width="550"/><br><br><br>
   <img src="images/8.png" width="550" height="380"/>

---

## Step 2: Retrieve the Windows Administrator Password

Follow the steps mentioned below and upload your .pem file to receive your administrator password.

<img src="images/9.png" width="550"/><br><br><br>
<img src="images/10.png" width="550"/><br><br><br>
<img src="images/11.png" width="550"/><br><br><br>
<img src="images/12.png" width="550"/><br><br><br>
<img src="images/13.png" width="550"/><br><br><br>
<img src="images/14.png" width="550"/>

---

## Step 3: Connect with RDP 

1) Copy the IP address of the EC2 instance. 

<img src="images/15.png" width="500"/>
   
2) Enter that as the Computer name in Remote Desktop Connection. 

<img src="images/16.png" width="450"/><br><br><br>
<img src="images/17.png" width="450"/>

3) Login with the password that has been retrieved in the previous step: 

<img src="images/18.png" width="400"/><br><br><br>
<img src="images/19.png" width="400"/>

---

## Step 3: Create the application

1) Open powershell in the windows instance and run the following command to install Chocolatey

```bash
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```
<img src="images/20.png" width="550" height="380"/><br><br><br>
<img src="images/21.png" width="550" height="380"/>

2) Type the following code in a notepad file (inside the project folder) named app.py

```bash
mkdir flask_app
```

```bash
cd flask_app
```

```bash
notepad app.py
```

```bash
from flask import Flask

app = Flask(__name__)

@app.route("/")
def hello():
    return "Hello from EC2!"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
```

3) Run the application

```bash
python app.py
```

<img src="images/22.png" width="450"/>

---

## Step 4: Edit the inbound rules of the security group and access the app

<img src="images/23.png" width="550" height="380"/><br><br><br>
<img src="images/24.png" width="450"/><br><br><br>
<img src="images/25.png" width="450"/><br><br><br>
<img src="images/26.png" width="450"/><br>

Open the application in your browser by running the URL below:

```bash
http://<replace-with-your-public-ip>:5000
```