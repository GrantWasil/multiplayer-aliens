class GameScene extends Phaser.Scene {
    constructor() {
      super("gameScene");
    }
    
    //load assets
    preload() {
        this.load.spritesheet(
          "avatarA",
          "https://cdn.glitch.com/f66772e3-bbf6-4f6d-b5d5-94559e3c1c6f%2FInvaderA_00%402x.png?v=1589228669385",
          {
            frameWidth: 48,
            frameHeight: 32
          }
        );
        this.load.spritesheet(
          "avatarB",
          "https://cdn.glitch.com/f66772e3-bbf6-4f6d-b5d5-94559e3c1c6f%2FInvaderB_00%402x.png?v=1589228660870",
          {
            frameWidth: 48,
            frameHeight: 32
          }
        );
        this.load.spritesheet(
          "avatarC",
          "https://cdn.glitch.com/f66772e3-bbf6-4f6d-b5d5-94559e3c1c6f%2FInvaderC_00%402x.png?v=1589228654058",
          {
            frameWidth: 48,
            frameHeight: 32
          }
        );
        this.load.spritesheet(
          "avatarAgreen",
          "https://cdn.glitch.com/f66772e3-bbf6-4f6d-b5d5-94559e3c1c6f%2FinvaderAgreen.png?v=1589839188589",
          {
            frameWidth: 48,
            frameHeight: 48
          }
        );
        this.load.spritesheet(
          "avatarAcyan",
          "https://cdn.glitch.com/f66772e3-bbf6-4f6d-b5d5-94559e3c1c6f%2FinvaderAcyan.png?v=1589839190850",
          {
            frameWidth: 48,
            frameHeight: 48
          }
        );
        this.load.spritesheet(
          "avatarAyellow",
          "https://cdn.glitch.com/f66772e3-bbf6-4f6d-b5d5-94559e3c1c6f%2FinvaderAyellow.png?v=1589839197191",
          {
            frameWidth: 48,
            frameHeight: 48
          }
        );
        this.load.spritesheet(
          "avatarBgreen",
          "https://cdn.glitch.com/f66772e3-bbf6-4f6d-b5d5-94559e3c1c6f%2FinvaderBgreen.png?v=1589839187283",
          {
            frameWidth: 48,
            frameHeight: 48
          }
        );
        this.load.spritesheet(
          "avatarBcyan",
          "https://cdn.glitch.com/f66772e3-bbf6-4f6d-b5d5-94559e3c1c6f%2FinvaderBcyan.png?v=1589839193162",
          {
            frameWidth: 48,
            frameHeight: 48
          }
        );
        this.load.spritesheet(
          "avatarByellow",
          "https://cdn.glitch.com/f66772e3-bbf6-4f6d-b5d5-94559e3c1c6f%2FinvaderByellow.png?v=1589839195096",
          {
            frameWidth: 48,
            frameHeight: 48
          }
        );
        this.load.spritesheet(
          "avatarCgreen",
          "https://cdn.glitch.com/f66772e3-bbf6-4f6d-b5d5-94559e3c1c6f%2FinvaderCgreen.png?v=1589839203129",
          {
            frameWidth: 48,
            frameHeight: 48
          }
        );
        this.load.spritesheet(
          "avatarCcyan",
          "https://cdn.glitch.com/f66772e3-bbf6-4f6d-b5d5-94559e3c1c6f%2FinvaderCcyan.png?v=1589839200959",
          {
            frameWidth: 48,
            frameHeight: 48
          }
        );
        this.load.spritesheet(
          "avatarCyellow",
          "https://cdn.glitch.com/f66772e3-bbf6-4f6d-b5d5-94559e3c1c6f%2FinvaderCyellow.png?v=1589839198988",
          {
            frameWidth: 48,
            frameHeight: 48
          }
        );
        this.load.spritesheet(
          "ship",
          "https://cdn.glitch.com/f66772e3-bbf6-4f6d-b5d5-94559e3c1c6f%2FShip%402x.png?v=1589228730678",
          {
            frameWidth: 60,
            frameHeight: 32
          }
        );
        this.load.spritesheet(
          "bullet",
          "https://cdn.glitch.com/f66772e3-bbf6-4f6d-b5d5-94559e3c1c6f%2Fbullet.png?v=1589229887570",
          {
            frameWidth: 32,
            frameHeight: 48
          }
        );
        this.load.spritesheet(
          "explosion",
          "https://cdn.glitch.com/f66772e3-bbf6-4f6d-b5d5-94559e3c1c6f%2Fexplosion57%20(2).png?v=1589491279459",
          {
            frameWidth: 48,
            frameHeight: 48
          }
        );
      }
    
    //init variables, define animations & sounds, and display assets
    create(){
        this.anims.create({
            key: "explode",
            frames: this.anims.generateFrameNumbers("explosion"),
            frameRate: 20,
            repeat: 0,
            hideOnComplete: true
        });
    }
    
    //update the attributes of various game objects per game logic
    update(){
    }
    
  }

const config = {
    width: 1400,
    height: 750,
    backgroundColor: "#FFFFF",
    parent: "gameContainer",
    scene: [GameScene],
    physics: {
      default: "arcade"
    }
  };