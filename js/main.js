'use strict';


const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let gameState = false;


// ======================= MODEL ==================================

const background = {
    image: null,
    isLoaded: false,
    posX1: 0,
    posX2: canvas.width,
    speed: 1,
    setSize() {
        this.posX1 = 0;
        this.posX2 = canvas.width;
    },
    init() {
        const self = this;
        this.image = new Image();
        this.image.addEventListener('load', function (e) {
            self.isLoaded = true;
        });
        this.image.src = 'img/background.png';
        window.addEventListener('resize', function () {
            self.setSize();
        });
        this.setSize();
    },
    render() {
        if (this.isLoaded) {
            background.posX1 -= background.speed;
            background.posX2 -= background.speed;
            ctx.drawImage(this.image, background.posX1, 0, canvas.width + this.speed, canvas.height);
            ctx.drawImage(this.image, background.posX2, 0, canvas.width + this.speed, canvas.height);
            if (background.posX1 <= -canvas.width) {
                background.posX1 = canvas.width
            }
            if (background.posX2 <= -canvas.width) {
                background.posX2 = canvas.width
            }
        }
    }
}

const bullets = [];
class Bullet {
    constructor(posX, posY, end) {
        this.speed = 10;
        this.size = 10;
        this.speedX = (end.x - posX) / this.speed;
        this.speedY = (end.y - posY) / this.speed;
        this.posX = posX;
        this.posY = posY;
    }
    update() {
        this.posX += this.speedX;
        this.posY += this.speedY;
    }
    render() {
        ctx.beginPath();
        ctx.fillStyle = "red";
        ctx.arc(this.posX, this.posY, this.size / 2, 0, 2 * Math.PI);
        ctx.fill();
    }
    touch() {
        for (let i = 0; i <= bullets.length - 1; i++) {
            if ((bullets[i].posY > canvas.height || bullets[i].posX > canvas.width) || (bullets[i].posY < 0 || bullets[i].posX < 0)) {
                bullets[i].delete(i);
                continue;
            }
            for (let j = 0; j <= enemies.length - 1 && bullets.length !== 0; j++) {
                const matchByY = (bullets[i].posY >= enemies[j].posY && bullets[i].posY <= (enemies[j].posY + 80));
                const matchByX = (bullets[i].posX >= enemies[j].posX && bullets[i].posX <= (enemies[j].posX + 80))

                if (matchByY && matchByX) {
                    if (enemies[j].hp > 1) {
                        enemies[j].hp -= 1;
                        bullets[i].delete(i);
                    } else {
                        booms.push(new Boom(enemies[j].posX, enemies[j].posY));
                        enemies[j].delete(j);
                        bullets[i].delete(i);
                        players[0].score += 1;
                        players[0].money += 10;

                        document.getElementById("score").innerHTML = players[0].score;
                        document.getElementById("money").innerHTML = players[0].money;
                        if (localStorage.getItem('sounds') == "on") {
                            sounds.boom();
                        }
                    }
                }
            }
        }
    }
    delete(indexNumber) {
        bullets.splice(indexNumber, 1);
    }
}

const enemies = [];
class Enemy {
    constructor(posX, posY, speed, hp, level) {
        this.posX = posX;
        this.posY = posY;
        this.speed = speed;
        this.hp = hp;
        this.level = level;
        this.startHp = hp;
        this.image = new Image();
        this.image.src = "img/alienspaceship.png";
    }

    update() {
        this.posX = this.posX - this.speed;
        for (var i = 0; i < enemies.length; i++) {
            if (enemies[i].posX < -50) {
                enemies[i].delete(i);
            }
        }
    }
    render() {
        var color = "green";
        if (this.hp <= this.startHp / 3) {
            color = "red"
        }
        else if (this.hp <= this.startHp / 2) {
            color = "yellow"
        }
        else if (this.hp > this.startHp / 2) {
            color = "green"
        }
        ctx.drawImage(this.image, 0, 0, this.image.width, this.image.height, this.posX, this.posY, 80, 80);
        ctx.fillStyle = color
        ctx.fillRect(this.posX, this.posY - 10, 17 * this.hp, 5)
    }
    delete(indexNumber) {
        enemies.splice(indexNumber, 1);
    }
}

const levels = [];
class Level {
    constructor(respTime) {
        this.respTime = respTime;
        this.respTimeInterval = null;
        this.respTimeInterval2 = null;
    }
    respIncrease() {
        if (this.respTime > 200) {
            if (this.respTime > 500) {
                if (this.respTime > 1000) {
                    this.respTime -= 5;
                }
                this.respTime -= 3;
            }
            this.respTime -= 1;
        }
        enemies.push(new Enemy(canvas.width + 100, Math.random() * ((canvas.height - 70) - 100) + 100, 3, 4, 1));
        this.respTimeInterval2 = setTimeout(this.respIncrease.bind(this), this.respTime);
    }
    start() {
        gameState = true;
        this.respTimeInterval = setTimeout(this.respIncrease.bind(this), this.respTime);
        $('#startButton').prop('disabled', true);
        this.respTime = 1200;
    }
    stop() {
        clearInterval(this.respTimeInterval2);
        $('#startButton').prop('disabled', false);
    }
}


const players = [];
class Player {
    constructor(posX, posY, hp, speed) {
        this.posX = posX;
        this.posY = posY;
        this.hp = hp;
        this.startHp = hp;
        this.score = 0;
        this.money = 0;
        this.speed = speed;
        this.image = new Image();
        this.image.src = "img/ship.png";
        this.color = "green";
    }

    render() {
        ctx.save();
        ctx.beginPath();
        ctx.drawImage(this.image, this.posX - 35, this.posY - 35, 70, 70);
        ctx.closePath();
        ctx.restore();
        if (this.hp <= this.startHp / 3) {
            this.color = "red"
        }
        else if (this.hp <= this.startHp / 2) {
            this.color = "yellow"
        }
        else if (this.hp > this.startHp / 2) {
            this.color = "green"
        }
        ctx.fillStyle = this.color;
        ctx.fillRect(this.posX - 35, this.posY - 60, (75 / this.startHp) * this.hp, 10)


    }
    update() {

        for (let i = 0; i < enemies.length; i++) {
            const matchByX = (players[0].posX >= enemies[i].posX && players[0].posX <= (enemies[i].posX + 80));
            const matchByY = (players[0].posY >= enemies[i].posY && players[0].posY <= (enemies[i].posY + 80));
            if (matchByX && matchByY) {
                players[0].hp -= 1;
                players[0].score += 1;
                document.getElementById("score").innerHTML = players[0].score;
                booms.push(new Boom(enemies[i].posX, enemies[i].posY));
                enemies[i].delete(i);
                if (players[0].hp == 0) {
                    levels[0].stop();
                    modals.endgame.open();
                    setScore();
                    document.getElementById("gameoverscore").innerHTML = ("  " + players[0].score);
                    game.pause();
                    players[0].money = 0;
                    players[0].score = 0;
                    document.getElementById("money").innerHTML = players[0].money;
                    document.getElementById("score").innerHTML = players[0].score;
                    players[0].hp = 7;
                    gameState = false;
                    clearLevel();
                }
            }
        }
    }
}
function clearLevel() {
    for (var i = 0; i < enemies.length; i++) {
        enemies[i].delete(i);
    }
}
const playerWeapons = [];
class PlayerWeapon {
    constructor(posX, posY) {
        this.posX = posX;
        this.posY = posY;
        this.rangle = 0;
        this.image = new Image();
        this.image.src = "img/weapon.png"
    }
    render() {
        ctx.save();
        ctx.beginPath();
        // Move registration point to the center of the canvas
        ctx.translate(players[0].posX, players[0].posY);
        // Rotate 1 degree
        ctx.rotate(this.rangle);
        // Move registration point back to the top left corner of canvas
        ctx.translate(-(players[0].posX + 20), -(players[0].posY + 35));
        ctx.drawImage(this.image, players[0].posX, players[0].posY, 70, 70);
        ctx.closePath();
        ctx.restore();
    }
}


class Modal {
    constructor(id) {
        this.id = id;
    }
    open() {
        game.pause();
        document.getElementById(this.id).style.display = "block";
        levels[0].stop();
    }
    close() {
        if (gameState) {
            document.getElementById(this.id).style.display = "none";
            game.resume();
            levels[0].start();
        }
        if (!gameState) {
            document.getElementById(this.id).style.display = "none";
            game.resume();
        }
    }
    closeB() {
        document.getElementById(this.id).style.display = "none";
        game.resume();
    }
    closeDM() {
        document.getElementById(this.id).style.display = "none";
    }
}

const modals = {
    options: new Modal("options"),
    store: new Modal("store"),
    rules: new Modal("rules"),
    records: new Modal("records"),
    register: new Modal("register"),
    nomoney: new Modal("nomoney"),
    tostartgame: new Modal("tostartgame"),
    endgame: new Modal("endgame")
}

const options = {
    musicCheck: document.getElementById("music"),
    soundsCheck: document.getElementById("sounds"),
    music: function () {
        if (options.musicCheck.checked) {
            localStorage.setItem('music', "on")
        }
        else {
            localStorage.setItem('music', "off")
        }
    },
    sounds: function () {
        if (options.soundsCheck.checked) {
            localStorage.setItem('sounds', "on")
        }
        else {
            localStorage.setItem('sounds', "off")
        }
    }
}
const store = {
    second: function () {
        if (players[0].money >= 200) {
            canvas.addEventListener('click', function (event) {
                const RADIUS = 200;
                let x = 0;
                let y = 0;
                let radians = Math.atan2(event.offsetY - players[0].posY, event.offsetX - players[0].posX);
                x = (Math.round(players[0].posX + RADIUS * Math.cos(radians)) - 10);
                y = (Math.round(players[0].posY + RADIUS * Math.sin(radians)) - 10);

                bullets.push(new Bullet((players[0].posX), (players[0].posY), { x, y }));
            })
            players[0].money -= 200;
            document.getElementById("money").innerHTML = players[0].money;
            $('#secondGun').prop('disabled', true);
        }
        else {
            modals.nomoney.open();
        }

    },
    third: function () {
        if (players[0].money >= 500) {
            canvas.addEventListener('click', function (event) {
                const RADIUS = 200;
                let x = 0;
                let y = 0;
                let radians = Math.atan2(event.offsetY - players[0].posY, event.offsetX - players[0].posX);
                x = (Math.round(players[0].posX + RADIUS * Math.cos(radians)) - 10);
                y = (Math.round(players[0].posY + RADIUS * Math.sin(radians)) + 10);

                bullets.push(new Bullet((players[0].posX), (players[0].posY), { x, y }));

            })
            players[0].money -= 500;
            document.getElementById("money").innerHTML = players[0].money;
            $('#thirdGun').prop('disabled', true);
        }
        else {
            modals.nomoney.open();
        }

    },
    speed: function () {
        if (players[0].money >= 60) {
            players[0].speed += 1;
            players[0].money -= 60;
            document.getElementById("money").innerHTML = players[0].money;
        }
        else {
            modals.nomoney.open();
        }
    },
    hp: function () {
        if (players[0].money >= 40) {
            players[0].hp += 1;
            players[0].money -= 40;
            document.getElementById("money").innerHTML = players[0].money;
        }
        else {
            modals.nomoney.open();
        }
    }
};

const sounds = {
    backgroundSound: new Audio("sounds/background.mp3"),
    shootSound: new Audio("sounds/shoot.wav"),
    boomSound: new Audio("sounds/boom.wav"),
    isReady: false,
    shoot() {
        this.shootSound.play();
    },
    boom() {
        this.boomSound.play();
    },
    background() {
        this.backgroundSound.play();
    },
};

function setUserName() {
    var inputValue = "";
    inputValue = document.getElementById("userNameValue").value;
    document.getElementById("userNameValue").placeholder = inputValue;
    document.getElementById("userName").innerHTML = inputValue;
    localStorage.setItem('userName', inputValue)

    $('#startButton').prop('disabled', false);
    modals.register.close();
}
// 3aceb4163f17014d4f04495ef82cd6e74b4ea811f284080db432e40a3091feb5b4bb2b491e47cfea6171f
// https://oauth.vk.com/authorize?client_id=6910838&display=page&redirect_uri=&scope=friends&response_type=token&v=5.52
// https://oauth.vk.com/blank.html#access_token=3aceb4163f17014d4f04495ef82cd6e74b4ea811f284080db432e40a3091feb5b4bb2b491e47cfea6171f&expires_in=86400&user_id=395892662


// $.ajax({
//     url: "https://api.vk.com/method/account.getProfileInfo?access_token=3aceb4163f17014d4f04495ef82cd6e74b4ea811f284080db432e40a3091feb5b4bb2b491e47cfea6171f&v=5.52",
//     method: "GET",
//     dataType: "JSONP",
//     success: function (data) {
//     }
// });



class Boom {
    constructor(posX, posY) {
        this.posX = posX;
        this.posY = posY;
        this.i = 0;
        this.interval = setInterval(this.animate.bind(this), 80),
            this.image = new Image();
        this.image.src = "img/boom.png";
    }
    animate() {
        this.i = this.i + 1;
        if (this.i > 11) {
            clearInterval(this.interval)
        }
    }
    render() {
        ctx.drawImage(this.image, (423 / 11) * this.i, 0, 38, 38, this.posX, this.posY, 70, 70);
    }
}
const booms = [];


const cursor = {
    posX: canvas.width / 2,
    posY: canvas.height / 2,
    render() {
        var cursorImage = new Image();
        cursorImage.src = "img/cursor.png";
        ctx.drawImage(cursorImage, cursor.posX, cursor.posY, 50, 50)
    }
}

// Initialize Firebase
var config = {
    apiKey: "AIzaSyBa03tPYxJ-cPb4tj7uqMkVqbbUL__JOSc",
    authDomain: "my-project-72601.firebaseapp.com",
    databaseURL: "https://my-project-72601.firebaseio.com",
    projectId: "my-project-72601",
    storageBucket: "my-project-72601.appspot.com",
    messagingSenderId: "274918729222"
};
firebase.initializeApp(config);
var database = firebase.database();
var ref = database.ref("scores");
ref.on("value", getData, errData);

const setSize = function () {
    const size = document.getElementById('canvas-wrap').getBoundingClientRect();
    canvas.width = size.width;
    canvas.height = size.height;
};

function soundTest() {
    if (localStorage.getItem('music') == "on") {
        $('#music').prop('checked', true);
        sounds.background();
    }
    else {
        $('#music').prop('checked', false);
    }
    if (localStorage.getItem('sounds') == "on") {
        $('#sounds').prop('checked', true);
    }
    else {
        $('#sounds').prop('checked', false);
    }
}

function getUserName() {
    if (localStorage.getItem('userName')) {
        document.getElementById("userName").innerHTML = localStorage.getItem('userName');
        document.getElementById("userNameValue").innerHTML = localStorage.getItem('userName');
        $('#startButton').prop('disabled', false);
    }
    if (!localStorage.getItem('userName')) {
        document.getElementById("tostartgame").style.display = "block";
    }
}

const game = {
    startNew: () => {
        draw();
        document.getElementById("canvas").style.cursor = "none";
    },
    pause: () => {
        cancelAnimationFrame(startAnimation);
        document.getElementById("canvas").style.cursor = "default";
    },
    resume: () => {
        draw();
        document.getElementById("canvas").style.cursor = "none";
    },
    stop: () => {
        cancelAnimationFrame(startAnimation);
        document.getElementById("canvas").style.cursor = "default";
    }
}

function getData(data) {
    document.getElementById("scorelist").innerHTML = "";
    var scores = data.val();
    var keys = Object.keys(scores);
    for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        var name = scores[k].name;
        var score = scores[k].score;
        var ol = document.getElementById("scorelist");
        var li = document.createElement("li");
        li.innerHTML = name + ": " + score;
        scorelist.appendChild(li)
    }
}


function errData(err) {
    console.log("ERROR");
    console.log(err);
}


function setScore() {
    var data = {
        name: localStorage.getItem("userName"),
        score: players[0].score
    }
    ref.push(data);
}

function openFullscreen() {
    let elem = document.getElementById("main");
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
    }
}






// ======================= CONTROLLER  ==================================

// controller for weapon move
canvas.addEventListener('mousemove', function (event) {
    playerWeapons[0].rangle = Math.atan2(event.offsetY - players[0].posY, event.offsetX - players[0].posX);
});
// controller for cursor
canvas.addEventListener("mousemove", function (e) {
    cursor.posX = e.offsetX - 25;
    cursor.posY = e.offsetY - 25;
});
// controller for bullets
canvas.addEventListener('click', function (event) {
    const RADIUS = 200;
    let x = 0;
    let y = 0;
    let radians = Math.atan2(event.offsetY - players[0].posY, event.offsetX - players[0].posX);
    x = Math.round(players[0].posX + RADIUS * Math.cos(radians));
    y = Math.round(players[0].posY + RADIUS * Math.sin(radians));
    bullets.push(new Bullet(players[0].posX, players[0].posY, { x, y }));
    if (localStorage.getItem('sounds') == "on") {
        sounds.shoot();
    }
});
window.addEventListener("deviceorientation", function (e) {
    let x = e.gamma;
    let y = e.beta;
    let z = e.alpha;
    if ((players[0].posY + 35 + (x / 5) <= canvas.height) && (players[0].posY - 35 + (x / 5) >= 0)) {
        players[0].posY = players[0].posY - (x / 5);
    }
    if ((players[0].posX - 35 + (y / 5) >= 0) && (players[0].posX + 35 + (y / 5) <= canvas.width)) {
        players[0].posX = players[0].posX + (y / 5);
    }
}, true);
window.addEventListener('resize', setSize);
// player moves
function handleInput() {
    if (input.isDown('DOWN') || input.isDown('s')) {
        if (players[0].posY + 35 < canvas.height) {
            players[0].posY += players[0].speed;
        }
    }
    if (input.isDown('UP') || input.isDown('w')) {
        if (players[0].posY - 35 > 100) {
            players[0].posY += - players[0].speed;
        }
    }
    if (input.isDown('LEFT') || input.isDown('a')) {
        if (players[0].posX - 35 > 0) {
            players[0].posX -= players[0].speed;
        }
    }
    if (input.isDown('RIGHT') || input.isDown('d')) {
        if (players[0].posX + 35 < canvas.width) {
            players[0].posX += players[0].speed;
        }
    }
}
(function () {
    var pressedKeys = {};
    function setKey(event, status) {
        var code = event.keyCode;
        var key;
        switch (code) {
            case 32:
                key = 'SPACE'; break;
            case 37:
                key = 'LEFT';
                break;
            case 38:
                key = 'UP';
                break;
            case 39:
                key = 'RIGHT';
                break;
            case 40:
                key = 'DOWN';
                break;
            default:
                // Convert ASCII codes to letters
                key = String.fromCharCode(code);
        }
        pressedKeys[key] = status;
    }
    document.addEventListener('keydown', function (e) {
        setKey(e, true);
    });
    document.addEventListener('keyup', function (e) {
        setKey(e, false);
    });

    window.input = {
        isDown: function (key) {
            return pressedKeys[key.toUpperCase()];
        }
    };
})();
var startAnimation;

// ======================= VIEW ==================================
function draw() {

    handleInput();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    startAnimation = requestAnimationFrame(draw);
    background.render();
    bullets.forEach((bullet) => {
        bullet.update();
        bullet.render();
        bullet.touch();
    });
    enemies.forEach((enemy) => {
        enemy.update();
        enemy.render();
    });
    players.forEach((player) => {
        player.render();
        player.update();
    });
    playerWeapons.forEach((playerWeapon) => {
        playerWeapon.render();
    });
    booms.forEach((boom) => {
        boom.render();
    });
    cursor.render();

};



//  ============= INIT =================================
function initMain() {
    soundTest();
    setSize();
    getUserName();

    background.init();
    players.push(new Player(50, canvas.height / 2, 7, 5));
    playerWeapons.push(new PlayerWeapon(190, 300));
    levels.push(new Level(1200));
}

draw();

initMain();










