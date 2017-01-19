//
// Initialize Phaser, and creates a 1350x600 game
var game = new Phaser.Game(1500, 600, Phaser.AUTO, 'gameDiv');
//var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update, render:render },true);

var shoots = "";
var fireRate = 100;
var nextFire = 0;
var shootCount = 0
var direccio ="dreta";
// ENemy shoots
var shootsEnemy = "";
var fireRateEnemy = 100;
var nextFireEnemy = 0;
var shootCountEnemy = 0
var enemyKilled;

var emitter;

var time_check;
var time_check2;


var mainState = {


      preload: function() {
        //game.stage.backgroundColor = '#60cccc';

      	game.scale.scaleMode = Phaser.ScaleManager.RESIZE;

        game.load.image("background", "assets/img/background.png");
      	game.load.tilemap('map', 'assets/map/tiled_map2.json', null, Phaser.Tilemap.TILED_JSON);
      	game.load.image('pipe-tileset', 'assets/img/pipe-mini.png');
      	game.load.image('ground-tileset', 'assets/img/ground-mini.png');
      	game.load.spritesheet('coin-tileset', 'assets/img/coin-mini.png',32,32);
      	game.load.spritesheet('hero', 'assets/img/hero.png', 43, 60);
        game.load.spritesheet('turtle', 'assets/img/turtle-mini.png', 60, 60);
        game.load.spritesheet('enemy', 'assets/img/enemy.png', 150, 150);
        game.load.spritesheet('explosion', 'assets/img/explosion.png', 128, 128);
        game.load.image('shoot', 'assets/img/shoot.png');
        game.load.image('particula', 'assets/img/particula.png');
        game.load.image('cor', 'assets/img/cor.png');
        game.load.image('score', 'assets/img/score.png');
        game.load.image('congrats', 'assets/img/congrats.png');
        game.load.audio('hitSound', ['assets/sounds/hitSound.mp3']);
        game.load.audio('heroHitsound', ['assets/sounds/heroHit.mp3']);
        game.load.audio('weaponSound', ['assets/sounds/weaponSound.mp3']);
        game.load.audio('explosionSound', ['assets/sounds/explosion.mp3']);
        game.load.audio('soundtrack', ['assets/sounds/soundtrack.mp3']);
        game.load.audio('congratulations', ['assets/sounds/congratulations.mp3']);

      },




      create: function() {
      	this.map = game.add.tilemap('map');
        game.add.tileSprite(0, 0, 2000, 600, 'background');
      	this.map.addTilesetImage('pipe-tileset');
      	this.map.addTilesetImage('ground-tileset');
      	this.map.addTilesetImage('coin-tileset');

      	this.layer = this.map.createLayer('pipe-layer');

      	this.layer.resizeWorld();
      	//this.layer.debug=true;
      	this.map.setCollisionBetween(1, 12);
      	this.map.setTileIndexCallback(9, this.hitCoin, this);

        //----------- SOUNDS --------
        this.hitSound = game.add.audio('hitSound');
        this.heroHitsound = game.add.audio('heroHitsound');
        this.weaponSound = game.add.audio('weaponSound');
        this.explosionSound = game.add.audio('explosionSound');
        this.congratulations = game.add.audio('congratulations');
        this.soundtrack = game.add.audio('soundtrack');
        this.soundtrack.play();


        // ------ COR / SCORE IMATGE -----
        scoreImg = game.add.sprite(game.camera.width / 2 - 70, 20, 'score');
        scoreImg.fixedToCamera = true;
        scoreImg.scale.setTo(0.05, 0.05);

        cor1 = game.add.sprite(20, 20, 'cor');
        cor1.fixedToCamera = true;
        cor1.scale.setTo(0.4, 0.4);

        cor2 = game.add.sprite(1200, 20, 'cor');
        cor2.fixedToCamera = true;
        cor2.scale.setTo(0.4, 0.4);

        // ------ Controlem el temps -------
        time_check = game.time.now;
        time_check2 = game.time.now;

      	game.world.setBounds(0, 0, 1900, 600);

      	game.physics.startSystem(Phaser.Physics.ARCADE);

      	this.hero = game.add.sprite(game.world.centerX, game.world.centerY, 'hero');

      	game.physics.enable(	this.hero);
      	//hero.body.bounce.y = 0.2;
      	this.hero.body.gravity.y = 700;//300
      	this.hero.body.bounce.y = 0;
      	this.hero.body.damping = 0.2;
      	this.hero.animations.add('right', [0,1,2], 10, true);
      	this.hero.animations.add('left', [3,4,5], 10, true);


        // ----------- PARTICULES -------
          emitter = game.add.emitter(0, 0, 100);

          emitter.makeParticles('particula');
          emitter.gravity = 200;

        //------------ VIDES / SCORE----------

          this.score = 0;
            this.scoreLabel = this.game.add.text(game.camera.width / 2, 20, this.score, { font: "45px Lemonada", fill: "#ffffff" });
            this.scoreLabel.fixedToCamera = true;

          this.heroVides = 9;
            this.labelHero = this.game.add.text(100, 20, this.heroVides, { font: "45px Lemonada", fill: "#ffffff" });
            this.labelHero.fixedToCamera = true;


          this.enemyVides = 9;
            this.labelEnemy = this.game.add.text(1275, 20, this.enemyVides, { font: "45px Lemonada", fill: "#ffffff" });
            this.labelEnemy.fixedToCamera = true;


        // ------------ SHOOTS --------

        this.shoots = game.add.group();
        this.shoots.enableBody = true;
        this.shoots.physicsBodyType = Phaser.Physics.ARCADE;
        this.shoots.createMultiple(20, 'shoot');
        this.shoots.setAll('checkWorldBounds', true);
        this.shoots.setAll('outOfBoundsKill', true);

        this.enemyShoots = game.add.group();
        this.enemyShoots.enableBody = true;
        this.enemyShoots.physicsBodyType = Phaser.Physics.ARCADE;
        this.enemyShoots.createMultiple(20, 'shoot');
        this.enemyShoots.setAll('checkWorldBounds', true);
        this.enemyShoots.setAll('outOfBoundsKill', true);

      	this.cursors = game.input.keyboard.createCursorKeys();

      	game.camera.follow(this.hero);

      	this.group_of_coins = game.add.group();
      	for (var i = 0; i < 2; i++)
      	{
      		    this.mycoin = game.add.sprite(1200+i*40, 440, 'coin-tileset');
      	    //  This creates a new Phaser.Sprite instance within the group
      	    //  It will be randomly placed within the world and use the 'baddie' image to display
      	    //enemy=group_of_coins.create(70, 170, );
      	    this.mycoin.animations.add('coin_animation', [0,1,2,3,4,5,6,7,8], 10, true);
      	    game.physics.enable(this.mycoin);
          	this.mycoin.body.bounce.set(1);
          	this.mycoin.body.immovable = true;
          	this.mycoin.animations.play('coin_animation');
      	    //group_of_coins.create(360 + Math.random() * 200, 120 + Math.random() * 200, 'coin-tileset');
      	    this.group_of_coins.add(this.mycoin);
      	}

        //---- ENEMY -----
        this.enemy = game.add.sprite(1590, 390, 'enemy');

        game.physics.enable(this.enemy);
      	this.enemy.body.bounce.y = 0.2;
      	this.enemy.body.gravity.y = 500;//300
      	this.enemy.animations.add('right', [0,1,2,3], 10, true);
      	this.enemy.animations.add('left', [12,13,14,15], 10, true);
        this.enemy.animations.add('rightEnano', [4,5,6,7], 10, true);
      	this.enemy.animations.add('leftEnano', [8,9,10,11], 10, true);
      	this.enemy.animations.play('right');
      	this.enemy.body.velocity.x=150;
        this.enemy.body.immovable = true;


        //----TURTLE-----

      	// this.turtle = game.add.sprite(730, 479, 'turtle');
        //
        //
      	// game.physics.enable(this.turtle);
      	// this.turtle.body.bounce.y = 0.2;
      	// this.turtle.body.gravity.y = 100;//300
      	// this.turtle.animations.add('right', [0,1,2], 10, true);
      	// this.turtle.animations.add('left', [3,4,5], 10, true);
      	// this.turtle.animations.play('right');
      	// this.turtle.body.velocity.x=150;
        //this.turtle.immovable = true;

        // ------- EXPLOSION -------
        this.explosion = game.add.sprite(1590, 390, 'explosion');
        this.explosion.animations.add('explosion', [0,1,2,3,4,5,6,7], 10, true);

        //Barra espaiadora
        this.spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

      },

      update: function() {


  	    //  Collide the hero and the stars with the platforms
  	    game.physics.arcade.collide(this.hero, this.layer);
  	    //game.physics.arcade.collide(this.turtle, this.layer);
        game.physics.arcade.collide(this.enemy, this.layer);
        game.physics.arcade.collide(this.shoots, this.layer, this.killShoot, null, this);
        game.physics.arcade.collide(this.enemyShoots, this.layer, this.killShoot, null, this);
        //game.physics.arcade.collide(this.hero, this.turtle);



  	    this.hero.body.velocity.x = 0;


        this.spaceKey.onDown.add(this.dispara, this);


  	    if (this.cursors.up.isDown  && this.hero.body.onFloor())
  	    {
  		      this.hero.body.velocity.y = -450;
  	    }
  	    else if (this.cursors.left.isDown)
  	    {
      		//  Move to the left
      		this.hero.body.velocity.x = -300;
      		this.hero.animations.play('left');
          direccio = "esquerra";

  	    }
  	    else if (this.cursors.right.isDown)
  	    {
      		//  Move to the right
      		this.hero.body.velocity.x = 300;
      		this.hero.animations.play('right');
          direccio = "dreta";
  	    }
  	    else
  	    {
      		//  Stand still
      		this.hero.animations.stop();
          if (direccio == "dreta"){
            this.hero.frame=0;
          }
          else if (direccio == "esquerra") {
            this.hero.frame=5;
          }
  	    }


  	    game.physics.arcade.collide(	this.hero, 	this.group_of_coins, this.hitCoin, null, this);

        // ------ TURTLE -------
  	    // if(	this.turtle.x>730+340 ){
  			//     this.turtle.body.velocity.x=-150;
  			//     this.turtle.animations.play('left');
  	    // }
  	    // if(	this.turtle.x<740  ){
  			//     this.turtle.body.velocity.x=+150;
  			//     this.turtle.animations.play('right');
  	    // }

        // ---------ENEMY---------
        if(	this.enemy.x>1365+150 ){
  			    this.enemy.body.velocity.x=-150;
            this.enemy.animations.play('right');
  	    }
  	    if(	this.enemy.x<1365){
  			    this.enemy.body.velocity.x=+150;
            this.enemy.animations.play('left');
  	    }

        if (game.time.now - time_check > 700 && enemyKilled != true){
          // Cridem la funció per que l'enemic dispari
          this.disparaEnemy();
          time_check = game.time.now;
        }

        if (game.time.now - time_check2 > 3000 && enemyKilled != true){
          this.enemy.body.velocity.y = -400;
          time_check2 = game.time.now;
        }

        // ------- FIRE COLLISION ------
        game.physics.arcade.overlap(this.shoots, this.enemy, this.hitEnemy, null, this);
        game.physics.arcade.overlap(this.enemyShoots, this.hero, this.hitHero, null, this);


  	    //console.log(" x="+turtle.x);


      },


      render: function() {



        //  Useful debug things you can turn on to see what's happening

        // game.debug.heroBounds(hero);
        // game.debug.cameraInfo(game.camera, 32, 32);
        // game.debug.body(hero);
        //game.debug.bodyInfo(	this.hero, 32, 32);

      },

      hitCoin: function(sprite1, sprite2) {
        this.score += 10;
        this.scoreLabel.text = this.score;
      	sprite2.destroy();
      	return false;

      },

      dispara: function(){
        if (game.time.now > nextFire && this.shoots.countDead() > 0)
        {
            this.weaponSound.play();

            // alert("SHOOT :D");
            nextFire = game.time.now + fireRate;

            var shoot = this.shoots.getFirstDead();

            shoot.reset(this.hero.body.x - 8, this.hero.body.y - 8);

            //game.physics.arcade.moveToCursors.left(shoot, 600);
            //shoot.animations.add('shoot', [0,1,2], 10, true);

            if (direccio == "dreta"){
              shoot.body.velocity.x += 600;
              //game.physics.arcade.moveToXY(shoot, x, 300);
            }
            else if (direccio == "esquerra"){
              shoot.body.velocity.x -= 600;
            }

        }
      },

      // Funció de per fer que dispari l'enemic
      disparaEnemy: function(){
        if (game.time.now > nextFireEnemy && this.enemyShoots.countDead() > 0)
        {
            this.weaponSound.play();
            // alert("SHOOT :D");
            nextFireEnemy = game.time.now + fireRateEnemy;

            var shootEnemy = this.enemyShoots.getFirstDead();

            shootEnemy.reset(this.enemy.body.x, this.enemy.body.y + 18);

            game.physics.arcade.moveToObject(shootEnemy, this.hero, 450);

        }
      },

      // Funció que s'activa al disparar a l'enemic
      hitEnemy: function(enemy, shoots){
        // Sound
        this.hitSound.play();

        // score
        this.score += 10;
        this.scoreLabel.text = this.score;

        //  eliminem la bala

        shoots.kill();
        shootCount += 1;
        //  Restem una vida
        this.enemyVides -= 1;
        this.labelEnemy.text = this.enemyVides;


        console.log(shootCount);

        if (this.enemyVides == 6){
          this.explosion.reset(enemy.body.x, enemy.body.y-20);
          this.explosion.play('explosion', 30, false, true);
          this.explosionSound.play();
          enemy.scale.setTo(0.6, 0.6);
        }
        if (this.enemyVides == 3){
          this.explosion.reset(enemy.body.x, enemy.body.y-20);
          this.explosion.play('explosion', 30, false, true);
          this.explosionSound.play();
          enemy.scale.setTo(0.4, 0.4);
        }
        if(this.enemyVides == 0){
          this.explosion.reset(enemy.body.x, enemy.body.y-20);
          this.explosion.play('explosion', 30, false, true);

          // Particules
          emitter.x = this.enemy.body.x;
          emitter.y = this.enemy.body.y;

          emitter.start(true, 4000, null, 10);
          enemy.kill();

          //  Destruim  les particules despres de 2 segons
          //game.time.events.add(2000, destroyEmitter, this);

          enemyKilled = true;
          shootCount = 0;

          // Explosion sound
          congrats = game.add.sprite(game.camera.width / 3, game.camera.height / 3, 'congrats');
          congrats.fixedToCamera = true;

          // CONGRATULATIONS
          // game.paused=true;
          this.soundtrack.pause();
          this.congratulations.play()
          var unpause = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
          unpause.onDown.add(this.restartGame, this);


            text_xocat = game.add.text(game.camera.width / 4 + (220)  , game.camera.height / 4, "PREM ENTER", {
                    font: "35px Lemonada",
                    fill: "#ff0044",
                    align: "center"
            });
            text_xocat.fixedToCamera = true;

        }
      },

      // DESTRUIM LES PARTICULES
      destroyEmitter: function(){
        emitter.destroy();
      },

      // Funció quan l'heroi rep un cop
      hitHero: function(hero, shoots){

        // SOUND
        this.heroHitsound.play()

        //  eliminem la bala
        shoots.kill();
        shootCountEnemy += 1;

        //  Restem una vida
        this.heroVides -= 1;
        this.labelHero.text = this.heroVides;


        console.log(shootCount);
        //  And create an explosion
        if (this.heroVides == 0){
          this.explosion.reset(hero.body.x, hero.body.y-20);
          this.explosion.play('explosion', 30, false, true);
          hero.kill();
          shootCountEnemy = 0;
          var time_check2 = game.time.now;

          this.heroDead = true;

          // // GAME OVER
          game.paused=true;
          var unpause = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
          unpause.onDown.add(this.restartGame, this);

          if (game.paused){
            text_xocat = game.add.text(game.camera.width / 3-100, game.camera.height / 3, "GAME OVER \n PREM ENTER PER TORNAR A COMENÇAR", {
                    font: "35px Lemonada",
                    fill: "#ff0044",
                    align: "center"
            });
            text_xocat.fixedToCamera = true;
          }
          //game.time.events.add(1000, gameOver, this);

        }
      },


      // Eliminem les bales disparades
      killShoot: function(shoots, layer){
        shoots.kill();
      },


      // Restart the game
      restartGame: function() {
          // Start the 'main' state, which restarts the game
          this.soundtrack.pause();
          enemyKilled=false;
          game.paused=false;
          game.state.start('main');
      },
}

// Add and start the 'main' state to start the game
game.state.add('main', mainState);
game.state.start('main');
