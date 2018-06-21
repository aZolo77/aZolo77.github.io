setTimeout(function() {
    document.addEventListener("DOMContentLoaded", startGame);
}, 1000);

var startGame = (function() {
    // создание объекта новой игры
    const game = new Phaser.Game(480, 320, Phaser.CANVAS, phaserScene, {
        preload: preload,
        create: create,
        update: update
    });

    var ball, paddle, // мячик и платформа
        bricks, newBrick, brickInfo, // кирпичики
        scoreText, score = 0, // счёт
        livesText, lifeLostText, lives = 3, // жизни
        textStyle = { font: '18px Arial', fill: '#0095DD' }, // стиль текста
        startButton, playing = false; // начало игры

    function preload() {
        // настройки для resize и цвета экрана
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL; // NO_SCALE, EXACT_FIT, RESIZE, USER_SCALE
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
        game.stage.backgroundColor = "#fff";

        // загружаем картинки и спрайты
        game.load.image('ball', 'images/ball.png');
        game.load.image('paddle', 'images/paddle.png');
        game.load.image('brick', 'images/brick.png');
        game.load.spritesheet('ball', 'images/wobble.png', 20, 20); // параметры нарезки спрайта
        game.load.spritesheet('button', 'images/button.png', 120, 40);
    }

    function create() {
        // настройки физики
        game.physics.startSystem(Phaser.Physics.ARCADE); // физика движения (Arcade Physics, P2, Ninja Physics, Box2D)
        game.physics.arcade.checkCollision.down = false; // отключение столкновений с нижней границей canvas

        // выводим объекты на экран
        ball = game.add.sprite(game.world.width * 0.5, game.world.height - 25, 'ball');
        paddle = game.add.sprite(game.world.width * 0.5, game.world.height - 5, 'paddle');
        ball.anchor.set(0.5);
        paddle.anchor.set(0.5, 1); // установим якорь объекту посередине x и внизу y

        // анимация объекта при помощи спрайта
        // имя анимации, очерёдность показа картинок из спрайта, частота кадров (in fps)
        ball.animations.add('wobble', [0, 1, 0, 2, 0, 1, 0, 2, 0], 24);

        // включить объекты в систему движения
        game.physics.enable(ball, Phaser.Physics.ARCADE);
        game.physics.enable(paddle, Phaser.Physics.ARCADE);

        // настройки движения для объектов
        ball.body.collideWorldBounds = true; // останавливаем объект при столкновении с границей canvas
        ball.body.bounce.set(1);
        ball.checkWorldBounds = true; // установка события столкновения с границами
        paddle.body.immovable = true; // объект остаётся на месте при столкновении с другим объектом

        // событие вылета за границу
        ball.events.onOutOfBounds.add(ballLeaveScreen, this);

        // отрисовка группы объектов (кирпичики)
        initBricks();

        // выводим информационный текст для игроков
        scoreText = game.add.text(5, 5, 'Points: 0', textStyle);
        livesText = game.add.text(game.world.width - 5, 5, 'Lives: ' + lives, textStyle);
        livesText.anchor.set(1, 0);
        lifeLostText = game.add.text(game.world.width * 0.5, game.world.height * 0.5, "Life lost, click to continue", textStyle);
        lifeLostText.anchor.set(0.5);
        lifeLostText.visible = false; // скрыть текст на время

        // добавление кнопки
        //  over, out, down события (последние 3 параметра)
        startButton = game.add.button(game.world.width * 0.5, game.world.height * 0.5, 'button', startGame, this, 1, 0, 2);
        startButton.anchor.set(0.5);
    }

    function update() {
        // инициализируем столкновение объектов
        game.physics.arcade.collide(ball, paddle, ballHitPaddle); // 3й параметр - функция-callback
        game.physics.arcade.collide(ball, bricks, ballHitBrick);

        // управление движением объекта с помощью мышки
        if (playing) {
            paddle.x = game.input.x || game.world.width * 0.5;
            // paddle.y = game.input.y;
        }
    }

    // описание объекта (кирпичики)
    function initBricks() {
        brickInfo = {
            width: 50,
            height: 20,
            count: {
                row: 3,
                col: 7
            },
            offset: {
                top: 50,
                left: 60
            },
            padding: 10
        };

        bricks = game.add.group();
        for (let c = 0; c < brickInfo.count.col; c++) {
            for (let r = 0; r < brickInfo.count.row; r++) {
                let brickX = (c * (brickInfo.width + brickInfo.padding)) + brickInfo.offset.left;
                let brickY = (r * (brickInfo.height + brickInfo.padding)) + brickInfo.offset.top;
                newBrick = game.add.sprite(brickX, brickY, 'brick');
                game.physics.enable(newBrick, Phaser.Physics.ARCADE);
                newBrick.body.immovable = true;
                newBrick.anchor.set(0.5);
                bricks.add(newBrick);
            }
        }
    }

    // callback (столкновение мячика с кирпичиком)
    function ballHitBrick(ball, brick) {
        // console.log(bricks);
        ball.animations.play('wobble');
        // анимация исчезновения объекта
        let killTween = game.add.tween(brick.scale); // выбираем свойство оъекта для анимации
        killTween.to({ x: 0, y: 0 }, 200, Phaser.Easing.Linear.None); // что произойдёт со свойством в конце анимации, время анимации и тип
        killTween.onComplete.addOnce(function() { // по завершению анимации удаляем объект
            brick.kill();
        }, this);
        killTween.start(); // запускаем анимацию
        // game.add.tween(brick.scale).to({x:2,y:2}, 500, Phaser.Easing.Elastic.Out, true, 100); - стартует анимацию автоматически (shorthand)

        // увеличиваем счёт
        score += 10;

        // меняем текст при событии столкновения мячика с кирпичиком
        scoreText.setText(`Points: ${score}`);

        // проверка свойства alive (true по-умолчанию) у всех элементов из группы bricks
        setTimeout(function() {
            let count_alive = 0;
            for (let i = 0; i < bricks.children.length; i++) {
                if (bricks.children[i].alive == true) {
                    count_alive++;
                }
            }
            // оповещение о выигрыше
            if (count_alive == 1) {
                alert('You won the game, congrats!');
                location.reload();
            }
        }, 0);
    }

    // считаем жизни и выводи сообщения о проигрыше
    function ballLeaveScreen() {
        playing = false;
        lives--;
        if (lives) {
            // выводим инфо об оставшихся жизнях
            livesText.setText(`Lives: ${lives}`);
            lifeLostText.visible = true;
            // восстанавливаем положение объектов мячика и платформы
            ball.reset(game.world.width * 0.5, game.world.height - 25);
            paddle.reset(game.world.width * 0.5, game.world.height - 5);
            // события нажатия любой клавиши перезапускает движение и скрывает информационный текст
            game.input.onDown.addOnce(function() {
                lifeLostText.visible = false;
                ball.body.velocity.set(150, -150);
                playing = true;
            }, this);
        } else {
            alert('You lost the game');
            location.reload();
        }
    }

    // анимация столкновения объектов с помощью спрайта
    function ballHitPaddle(ball, paddle) {
        ball.animations.play('wobble');
        // изменяет угол движения объекта при столкновении
        ball.body.velocity.x = -1 * 5 * (paddle.x - ball.x);
    }

    // стартуем игру с помощью нажатия
    function startGame() {
        startButton.destroy();
        ball.body.velocity.set(150, -150); // установить направление движения мячика
        playing = true;
    }
})();