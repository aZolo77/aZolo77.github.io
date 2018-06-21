const startGame = (function() {

    // === объекты игры ===
    var platforms, // земля и платформы
        player, // персонаж
        cursors, // объект управления нажатиями
        stars, // звёзды
        scoreText, score = 0, // счёт
        bombs; // бомбы

    // === создание новой игры ===
    const config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: gameHolder,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 300 },
                debug: false
            }
        },
        scene: {
            preload: preload,
            create: create,
            update: update
        }
    };

    const game = new Phaser.Game(config);

    function preload() {
        // === подгрузка картинок и спрайтов ===
        this.load.image('sky', 'images/sky.png');
        this.load.image('ground', 'images/platform.png');
        this.load.image('bomb', 'images/bomb.png');
        this.load.image('star', 'images/star.png');
        this.load.image('bomb', 'images/bomb.png');
        this.load.spritesheet('dude',
            'images/dude.png', { frameWidth: 32, frameHeight: 48 }
        );
    }

    function create() {
        // === добавление новых объектов === 
        this.add.image(400, 300, 'sky'); // позиционирование элемента относительно его центра (по умолчанию)
        // можно исправить применив сл настройку code.setOrigin(0, 0) {top, left}

        // === создание группы объектов ===
        platforms = this.physics.add.staticGroup(); // Dynamic and Static
        platforms.create(400, 568, 'ground').setScale(2).refreshBody(); // refresh (т к эта группа статических обектов)
        platforms.create(600, 400, 'ground');
        platforms.create(50, 250, 'ground');
        platforms.create(750, 220, 'ground');

        // === создание объекта Персонаж ===
        player = this.physics.add.sprite(100, 450, 'dude'); // Dynamic Physics body by default
        // настройки для bounce-affect и столкновения с границами мира
        player.setBounce(0.2);
        player.body.setGravityY(200); // сила притяжения
        player.setCollideWorldBounds(true);
        // === создание анимации движения (управление) ===
        // движение влево
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }), // нарезка из картинок с 0 по 3
            frameRate: 10, // 10 fps
            repeat: -1 // loop
        });
        // поворот
        this.anims.create({
            key: 'turn',
            frames: [{ key: 'dude', frame: 4 }],
            frameRate: 20
        });
        // движение вправо
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }), // нарезка из картинок с 5 по 8
            frameRate: 10,
            repeat: -1
        });

        // === создание группы объектов "Звёзды" ===
        stars = this.physics.add.group({
            key: 'star',
            repeat: 11,
            setXY: { x: 12, y: 0, stepX: 70 }
        });
        // перебрать группу и задать bounce-effect для каждого элемента
        stars.children.iterate(function(child) {
            child.setBounceY(Phaser.Math.FloatBetween(0.2, 0.5));
        });

        // === объект "Бомбы"
        bombs = this.physics.add.group();

        // === счёт ===
        scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#555' });

        // === объект управления клавиатурой ===
        cursors = this.input.keyboard.createCursorKeys();
    }

    function update() {
        // === установка взаимодействия между объектами ===
        this.physics.add.collider(player, platforms);
        this.physics.add.collider(stars, platforms);
        // сбор Звёзд
        this.physics.add.overlap(player, stars, collectStars, null, this);
        // столкновение с бомбами
        this.physics.add.collider(bombs, platforms);
        this.physics.add.collider(player, bombs, hitBomb, null, this);

        // === события нажатия клавиш ===
        // движение влево/вправо и поворот
        if (cursors.left.isDown) {
            player.setVelocityX(-200);
            player.anims.play('left', true);
        } else if (cursors.right.isDown) {
            player.setVelocityX(200);
            player.anims.play('right', true);
        } else {
            player.setVelocityX(0);
            player.anims.play('turn');
        }
        // прыжок
        if (cursors.up.isDown && player.body.touching.down) {
            player.setVelocityY(-450);
        }
    }

    // === собираем Звёзды ===
    function collectStars(player, star) {
        star.disableBody(true, true);
        // изменение счёта
        score += 10;
        scoreText.setText('Score: ' + score);

        // === столкновение с бомбами ===
        if (stars.countActive(true) === 0) {
            stars.children.iterate(function(child) {
                child.enableBody(true, child.x, 0, true, true);
            });
            var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

            var bomb = bombs.create(x, 16, 'bomb');
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
            bomb.allowGravity = false;
        }
    }

    // столкновение Персонажа с бомбами
    function hitBomb(player, bomb) {
        this.physics.pause();
        player.setTint(0xff0000);
        player.anims.play('turn');
        gameOver = true;
        setTimeout(function() {
            alert("!!BuGAGa!!");
        }, 700);
    }
})();


document.addEventListener("DOMContentLoaded", startGame);