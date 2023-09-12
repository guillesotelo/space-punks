const canvas = document.querySelector('canvas')

const c = canvas.getContext('2d')
canvas.width = innerWidth
canvas.height = innerHeight

class Player {
    constructor() {

        this.velocity = {
            x: 0,
            y: 0,
        }
        this.rotation = 0

        const image = new Image()
        image.src = './assets/spaceship.png'

        image.onload = () => {
            const scale = .1
            this.image = image
            this.width = image.width * scale
            this.height = image.height * scale

            this.position = {
                x: canvas.width / 2 - this.width / 2,
                y: canvas.height - this.height - 30,
            }
        }
    }

    draw() {
        c.save()
        c.globalAlpha = this.opacity
        c.translate(
            player.position.x + player.width / 2,
            player.position.y + player.height / 2)

        c.rotate(this.rotation)

        c.translate(
            -player.position.x - player.width / 2,
            -player.position.y - player.height / 2)

        c.drawImage(
            this.image,
            this.position.x,
            this.position.y,
            this.width,
            this.height
        )
        c.restore();
    }

    // For every frame
    update() {
        if (!this.image) return
        this.draw()
        this.position.x += this.velocity.x
    }
}

class Projectile {
    constructor({ position, velocity }) {
        this.position = position
        this.velocity = velocity

        this.radius = 3
    }

    draw() {
        c.beginPath()
        c.arc(
            this.position.x,
            this.position.y,
            this.radius,
            0,
            Math.PI * 2
        )
        c.fillStyle = 'red'
        c.fill()
        c.closePath()
    }

    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

const player = new Player()
const projectiles = []
const keys = {
    a: false,
    d: false,
    w: false,
    s: false,
    space: false,
}

// Animation Loop
function animate() {
    requestAnimationFrame(animate)
    c.fillStyle = "black"
    c.fillRect(0, 0, canvas.width, canvas.height)
    player.update()

    projectiles.forEach(projectile => {
        projectile.update()

    })

    if (keys.a && player.position.x >= 10) {
        player.velocity.x = -10
        player.rotation = -0.15
    }
    else if (keys.d && player.position.x + player.width <= canvas.width - 10) {
        player.velocity.x = 10
        player.rotation = 0.15
    }
    else {
        player.velocity.x = 0
        player.rotation = 0
    }
    // if (keys.w && player.position.y) player.position.y -= 10
    // if (keys.s) player.position.y += 10
    // if(keys.space) 
}
animate()

// Movements
addEventListener('keydown', (e) => {
    console.log(e.code)
    switch (e.code) {
        case 'KeyA':
        case 'ArrowLeft':
            keys.a = true
            break
        case 'KeyD':
        case 'ArrowRight':
            keys.d = true
            break
        case 'KeyW':
        case 'ArrowUp':
            keys.w = true
            break
        case 'KeyS':
        case 'ArrowDown':
            keys.s = true
            break
        case 'Space':
        case 'ControlLeft':
            projectiles.push(new Projectile(
                {
                    position: { x: player.position.x + player.width / 2, y: player.position.y },
                    velocity: { x: 0, y: -10 }
                }))
            break
    }
})
addEventListener('keyup', (e) => {
    console.log(e.code)
    switch (e.code) {
        case 'KeyA':
        case 'ArrowLeft':
            keys.a = false
            break
        case 'KeyD':
        case 'ArrowRight':
            keys.d = false
            break
        case 'KeyW':
        case 'ArrowUp':
            keys.w = false
            break
        case 'KeyS':
        case 'ArrowDown':
            keys.s = false
            break
        case 'Space':
        case 'ControlLeft':
            keys.space = false
            break
    }
})