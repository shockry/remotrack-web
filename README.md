# RemoTrack

RemoTrack uses Bluetooth Low Energy to get the phone to communicate with the browser, this means a safe, very fast and responsive experience and access from anywhere.

This is the primary piece in the system, the web app.

Features
--------

* Play in the browser, fully control with your own phone.
* Your controls are the phone sensors and an action button for more interactivity.
* Pair-and-forget experience. 
* Best score is saved on the phone rather than the browser, so you are carrying your best score wherever you go.
* In case of loss, you are presented with a "play again" button on the phone (it vibrates, too :D).

Click the image below to watch a boring video of me showing how this works 🤷‍♂️

[![Video](https://img.youtube.com/vi/LiPRqrNF9ng/sddefault.jpg)](https://www.youtube.com/watch?v=LiPRqrNF9ng)

How to run
----------
The Web Bluetooth API is supported only by Chrome at the moment, also it's only supported on macOS, Linux and Chrome OS (I have only run it on macOS, though).

if you are using Chrome 56 or later on macOS or Chrome OS, the app will run with no additional configurations.

Otherwise if you are uing Chrome 55 on any of the three platforms (or Chrome 56 on Linux), you will have to enable it from the experimental features window:
`chrome://flags/#enable-experimental-web-platform-features`
enable the highlighted flag, and restart Chrome.

Clone this repo, and inside the project's root directory, run these in the terminal:

`npm install` then `npm run bundle`

You will also need a simple server to run it locally, you can use Python's little SimpleHTTPServer, run this from the project's root directory:

`python -m SimpleHTTPServer 8000`
and head to `http://localhost:8000/` in your browser to run the app.
