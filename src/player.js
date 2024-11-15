import * as THREE from 'three';
import { TextureManager } from './textureManager.js';
import { Collision } from './collision.js';

export class Player{
    static playerWidth = 0.5;
    static playerHeight = 1.5;
    static playerSpeed = 0.1;

    constructor(scene, board, playerNumber, x, y){
        this.playerNumber = playerNumber;
        this.board = board;

        this.velY = 0;
        this.grounded = false;

        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(Player.playerWidth, 0.5, Player.playerHeight),
            new THREE.MeshPhongMaterial({ map: TextureManager.ObjectTextures["player" + playerNumber] })
        );
        scene.add(this.mesh);

        this.updatePosition(x, y - 0.5 + (Player.playerHeight / 2));
    }

    hasCollided(offsetX, offsetY){
        let surroundingTiles = this.board.getTilesAroundPlayer(this);
        let collided = false;
        for (let i = 0; i < surroundingTiles.length; i++) {
            let tile = surroundingTiles[i];
            let tileBoundingBox = tile.getBoundingBox();
            let playerBoundingBox = this.getOffsetBoundingBox(this.x + offsetX, this.y + offsetY);
            if (Collision.AABBIntersect(playerBoundingBox, tileBoundingBox)) {
                collided = true;
                break;
            }
        }

        // check player collision with other player
        let otherPlayer = this.playerNumber === 1 ? this.board.player2 : this.board.player1;
        let otherPlayerBoundingBox = otherPlayer.getBoundingBox();
        let playerBoundingBox = this.getOffsetBoundingBox(this.x + offsetX, this.y + offsetY);
        if (Collision.AABBIntersect(playerBoundingBox, otherPlayerBoundingBox)) {
            collided = true;
        }

        return collided;
    }

    move(deltaX, deltaY){
        deltaX *= Player.playerSpeed;
        deltaY *= Player.playerSpeed;

        let newX = this.x + deltaX;
        if (!this.hasCollided(deltaX, 0)) {
            this.updatePosition(newX, this.y);
        }
        let newY = this.y + deltaY;
        if (!this.hasCollided(0, deltaY)) {
            this.updatePosition(this.x, newY);
        }
    }

    update(){
        this.velY -= 0.01;
        let hasCollided = this.hasCollided(0, this.velY);
        // check if player is on the ground
        if (this.velY < 0) {
            if (hasCollided) {
                this.velY = 0;
                this.grounded = true;
            }else{
                this.grounded = false;
            }
        }else{
            if (hasCollided) {
                this.velY = 0;
            }
        }

        if(!this.grounded){
            let newY = this.y + this.velY;
            if (!hasCollided) {
                this.updatePosition(this.x, newY);
            }
        }
    }

    jump(){
        if (this.grounded) {
            this.velY = 0.3;
            this.grounded = false;
        }
    }

    // position is bottom left of mesh
    getOffsetBoundingBox(x, y){
        return {
            x: x - Player.playerWidth / 2,
            y: y - Player.playerHeight / 2,
            width: Player.playerWidth,
            height: Player.playerHeight
        };
    }

    getBoundingBox(){
        return {
            x: this.x - Player.playerWidth / 2,
            y: this.y - Player.playerHeight / 2,
            width: Player.playerWidth,
            height: Player.playerHeight
        };
    }

    updatePosition(x, y){
        this.x = x;
        this.y = y;
        this.mesh.position.set(x, 0, y);
    }
}