const startGame = (function() {

    // === объекты игры ===
    var platforms, ground, ledge1, ledge2, // земля и платформы
        player, // персонаж
        stars, // звёзды
        cursors, // объект для взаимодействия с клавиатурой
        scoreText, score = 0; // счёт

    // === создание новой игры === 
    const game = new Phaser.Game(800, 600, Phaser.Auto, gameHolder, {
        preload: preload,
        create: create,
        update: update
    });


    function preload() {
        // === подгрузка изображений ===
        game.load.image('sky', 'images/sky.png');
        // game.load.image('sky', 'images/bg.jpg');
        game.load.image('ground', 'images/platform.png');
        game.load.image('star', 'images/star.png');
        game.load.spritesheet('dude', 'images/dude.png', 32, 48);
    }

    function create() {
        // === установка системы физики объектам ===
        game.physics.startSystem(Phaser.Physics.ARCADE);

        // === небо ===
        game.add.sprite(0, 0, 'sky');

        // === создние группы, настройка физики для всех объектов группы ===
        platforms = game.add.group();
        platforms.enableBody = true;

        // === земля ===
        ground = platforms.create(0, game.world.height - 64, 'ground');
        ground.scale.setTo(2, 2); // увеличивает картинку
        ground.body.immovable = true;

        // === платформы ===
        ledge1 = platforms.create(400, 400, 'ground');
        ledge1.body.immovable = true;
        ledge2 = platforms.create(-150, 250, 'ground');
        ledge2.body.immovable = true;

        // === создание объекта "Персонаж" ===
        player = game.add.sprite(32, game.world.height - 150, 'dude');
        // физика Игроку
        game.physics.arcade.enable(player);
        // при ударе происходит лёгкий 'bounce'
        player.body.bounce.y = 0.2;
        // притяжение 
        player.body.gravity.y = 300;
        // не проходит сквозь границы
        player.body.collideWorldBounds = true;
        // анимация передвижения Персонажа
        player.animations.add('left', [0, 1, 2, 3], 10, true);
        player.animations.add('right', [5, 6, 7, 8], 10, true);

        // === создаие группы объектов "звёзды" ===
        stars = game.add.group();
        stars.enableBody = true;
        // динамическая генерация
        for (let i = 0; i < 12; i++) {
            let star = stars.create(i * 70, 0, 'star');
            star.body.gravity.y = 6;
            star.body.bounce.y = 0.7 * Math.random() * 0.2;
        }

        // === выводим счёт на экран ===
        scoreText = game.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#555' });

        // === создание объекта cursors для перемещения персонажа ===
        cursors = game.input.keyboard.createCursorKeys();
        // console.log(cursors);
    }

    function update() {
        // === столкновение объектов между собой
        var hitPlatform = game.physics.arcade.collide(player, platforms);
        game.physics.arcade.collide(stars, platforms);
        // перекрытие персонажем объекты Звёзд
        game.physics.arcade.overlap(player, stars, collectStar, null, this);

        // === движение персонажа по оси x (на месте если не нажаты клавиши) ===
        player.body.velocity.x = 0;

        // === управление персонажем (бег) ===
        if (cursors.left.isDown) {
            player.body.velocity.x = -200;
            player.animations.play('left');
        } else if (cursors.right.isDown) {
            player.body.velocity.x = 200;
            player.animations.play('right');
        } else {
            // останавливаем анимацию
            player.animations.stop();
            player.frame = 4;
        }
        // прыжки
        if (cursors.up.isDown && player.body.touching.down && hitPlatform) {
            player.body.velocity.y = -300;
        }
    }

    // собираем звёзды
    function collectStar(player, star) {
        star.kill();
        // меняем счёт
        score += 10;
        scoreText.text = `Score: ${score}`;
    }
})();

document.addEventListener("DOMContentLoaded", startGame);