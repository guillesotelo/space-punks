const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
const isMobile = window.innerWidth < 800
canvas.width = isMobile ? window.innerWidth : 1024
canvas.height = isMobile ? window.innerHeight : 768

class Player {
    constructor() {

        this.velocity = {
            x: 0,
            y: 0,
        }
        this.rotation = 0
        this.opacity = 1

        const image = new Image()
        image.src = './assets/spaceship.png'

        image.onload = () => {
            const scale = isMobile ? .06 : .08
            this.image = image
            this.width = image.width * scale
            this.height = image.height * scale

            this.position = {
                x: canvas.width / 2 - this.width / 2,
                y: canvas.height - this.height - (isMobile ? 80 : 30),
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

class Invader {
    constructor({ position }) {

        this.velocity = {
            x: 0,
            y: 0,
        }

        const image = new Image()
        image.src = './assets/invader.png'

        image.onload = () => {
            const scale = isMobile ? 250 / window.innerWidth : 1.2
            this.image = image
            this.width = image.width * scale
            this.height = image.height * scale

            this.position = {
                x: position.x,
                y: position.y,
            }
        }
    }

    draw() {
        c.drawImage(
            this.image,
            this.position.x,
            this.position.y,
            this.width,
            this.height
        )
    }

    // For every frame
    update({ velocity }) {
        if (!this.image) return
        this.draw()
        this.position.x += velocity.x
        this.position.y += velocity.y
    }

    shoot(invaderProjectiles) {
        if (!this.position) return
        invaderProjectiles.push(new InvaderProjectile({
            position: {
                x: this.position.x + this.width / 2,
                y: this.position.y + this.height,
            },
            velocity: {
                x: 0,
                y: 5
            }
        }
        ))

    }
}

class Grid {
    constructor(score) {
        this.position = {
            x: 0,
            y: 0
        }

        this.velocity = {
            x: isMobile ? 1.5 : 2.5,
            y: 0
        }

        this.invaders = []

        const maxCols = isMobile ? 9 : 13
        const maxRows = isMobile ? 5 : 7
        const level = Math.floor((score ? score : 1) / 100)

        const colCant = level + 4
        const cols = colCant > maxCols ? maxCols : colCant
        const rowCant = Math.floor(cols / 4) + 1
        const rows = rowCant > maxRows ? maxRows : rowCant

        this.width = cols * (isMobile ? 0.075 * window.innerWidth : 60)
        this.height = rows * (isMobile ? 0.075 * window.innerHeight : 60)

        for (let x = 0; x < cols; x++) {
            for (let y = 0; y < rows; y++) {
                this.invaders.push(new Invader({
                    position: {
                        x: x * (isMobile ? 0.08 * window.innerWidth : 60),
                        y: y * (isMobile ? 0.08 * window.innerWidth : 45) + 50,
                    }
                }))
            }
        }
    }

    update() {
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

        this.velocity.y = 0

        if (this.position.x + this.width >= canvas.width ||
            this.position.x <= 0) {
            this.velocity.x = -this.velocity.x

            this.velocity.y = 40
        }
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
        c.fillStyle = 'yellow'
        c.fill()
        c.closePath()
    }

    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

class Particle {
    constructor({ position, velocity, radius, color, fade }) {
        this.position = position
        this.velocity = velocity
        this.radius = radius
        this.color = color
        this.opacity = 1
        this.fade = fade
    }

    draw() {
        c.save()
        c.globalAlpha = this.opacity
        c.beginPath()
        c.arc(
            this.position.x,
            this.position.y,
            this.radius,
            0,
            Math.PI * 2
        )
        c.fillStyle = this.color
        c.fill()
        c.closePath()
        c.restore()
    }

    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

        if (this.fade) this.opacity -= 0.01
    }
}

class InvaderProjectile {
    constructor({ position, velocity }) {
        this.position = position
        this.velocity = velocity
        this.width = 3
        this.height = 10
    }

    draw() {
        c.fillStyle = 'white'
        c.fillRect(this.position.x, this.position.y, this.width, this.height)
    }

    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

// vars
let score = 0
let frames = 0
let player = new Player()
let projectiles = []
let grids = [new Grid(score)]
let invaderProjectiles = []
let particles = []
const keys = {
    a: false,
    d: false,
    w: false,
    s: false,
    space: false,
}
let game = {
    over: false,
    active: true,
}

const updateScore = () => {
    score += 10
    const scoreTag = document.querySelector('.game__score-number')
    scoreTag.innerText = score
}

const createUniverse = () => {
    for (let i = 0; i < 50; i++) {
        particles.push(new Particle({
            position: {
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
            },
            velocity: {
                x: 0,
                y: 1
            },
            radius: 1,
            color: 'white'
        }))
    }
}
createUniverse()

const createParticles = (object, color, fade, spread = 3) => {
    // Explosion
    for (let i = 0; i < 15; i++) {
        particles.push(new Particle({
            position: {
                x: object.position.x + object.width / 2,
                y: object.position.y + object.height / 2
            },
            velocity: {
                x: (Math.random() - 0.5) * 2,
                y: (Math.random() - 0.5) * 2
            },
            radius: Math.random() * spread,
            color: color || '#eebaff',
            fade
        }))
    }
}

const shoot = () => {
    projectiles.push(new Projectile(
        {
            position: { x: player.position.x + player.width / 2, y: player.position.y },
            velocity: { x: 0, y: -10 }
        }))
}


// Animation Loop
function animate() {
    if (!game.active) return
    requestAnimationFrame(animate)
    c.fillStyle = "black"
    c.fillRect(0, 0, canvas.width, canvas.height)
    player.update()

    particles.forEach((particle, i) => {
        if (particle.opacity <= 0) setTimeout(() => particles.splice(i, 1), 0)

        // Re-using background particles
        if (particle.position.y - particle.radius >= canvas.height) {
            particle.position.x = Math.random() * canvas.width
            particle.position.y = -particle.radius
        }
        else particle.update()
    })

    invaderProjectiles.forEach((invaderProjectile, i) => {
        if (invaderProjectile.position.y + invaderProjectile.height >= canvas.height) {
            setTimeout(() => invaderProjectiles.splice(i, 1), 0);
        }
        else invaderProjectile.update()

        // Projectile hits player
        if (invaderProjectile.position.y + invaderProjectile.height >= player.position.y &&
            invaderProjectile.position.y <= player.position.y + player.height &&
            invaderProjectile.position.x + invaderProjectile.width >= player.position.x &&
            invaderProjectile.position.x <= player.position.x + player.width) {
            createParticles(player, 'white', true, 7)
            setTimeout(() => {
                invaderProjectiles.splice(i, 1)
                player.opacity = 0
                game.over = true
            }, 0)
            setTimeout(() => endGame(), 1500)
        }
    })

    projectiles.forEach((projectile, i) => {
        // Remove all not in screen
        if (projectile.position.y + projectile.radius <= 0) {
            // Settimeout for preventing projectile flashing
            setTimeout(() => projectiles.splice(i, 1), 0)
        }
        else projectile.update()
    })

    grids.forEach((grid, gridIndex) => {
        grid.update()

        // Spawning enemy projectiles
        if (frames % (Math.floor(Math.random() * 500)) === 0 && grid.invaders.length > 0) {
            grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(invaderProjectiles)
        }

        // Grid gets to player position Y (game over)
        const lastEnemy = grid.invaders[grid.invaders.length - 1]
        if (player.position && lastEnemy.position.y + lastEnemy.height >= player.position.y) {
            player.opacity = 0
            game.over = true
            endGame()
        }

        grid.invaders.forEach((invader, i) => {
            invader.update({ velocity: grid.velocity })

            // Hit enemy
            projectiles.forEach((projectile, j) => {
                if (projectile.position.y - projectile.radius <= invader.position.y + invader.height &&
                    projectile.position.x + projectile.radius >= invader.position.x &&
                    projectile.position.x - projectile.radius <= invader.position.x + invader.width &&
                    projectile.position.y + projectile.radius >= invader.position.y) {

                    updateScore()

                    setTimeout(() => {
                        // Remove invader & projectile on collision
                        const invaderFound = grid.invaders.find(wanted => wanted === invader)
                        const projectileFound = projectiles.find(wanted => wanted === projectile)
                        if (invaderFound && projectileFound) {

                            // Explosions
                            createParticles(invader, '', true)

                            grid.invaders.splice(i, 1)
                            projectiles.splice(j, 1)

                            // If first or last columns removed (shooted), start and finish movements on the new first and last columns
                            if (grid.invaders.length > 0) {
                                firstInvader = grid.invaders[0]
                                lastInvader = grid.invaders[grid.invaders.length - 1]

                                grid.width = lastInvader.position.x - firstInvader.position.x + lastInvader.width
                                grid.position.x = firstInvader.position.x


                            } else grids.splice(gridIndex, 1) // Remove garbage
                        }
                    }, 0);
                }
            })
        })

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

    // Spawning enemies
    if (grids.length === 0) {
        score += 50
        grids.push(new Grid(score))
        frames = 0
    }

    frames++
}


const startGame = (autoshooting) => {
    const canvas = document.querySelector('canvas')
    const scoreTag = document.querySelector('.game__score')
    const scoreNumber = document.querySelector('.game__score-number')
    const autoshoot = document.querySelector('.game__autoshoot')
    canvas.style = 'filter: none'
    scoreTag.style = 'filter: none'
    autoshoot.style = 'filter: none'
    scoreNumber.innerText = '0'

    const start = document.querySelector('.game__start')
    const restart = document.querySelector('.game__restart')
    const header = document.querySelector('.game__header')
    start.style.display = 'none'
    restart.style.display = 'none'
    header.style.display = 'flex'
    score = 0
    frames = 0
    player = new Player()
    projectiles = []
    grids = [new Grid(score)]
    invaderProjectiles = []
    particles = []
    game = { over: false, active: true }

    const ctrls = document.querySelector('.game__controls')
    ctrls.style.display = isMobile ? 'flex' : 'none'
    const left = document.querySelector('.game__controls-left')
    const right = document.querySelector('.game__controls-right')
    const autoshootLabel = document.querySelector('.game__autoshoot')
    const inputs = Array.from(document.querySelectorAll('#autoshoot'))
    const shootCtrl = document.querySelector('.game__controls-shoot')

    shootCtrl.onclick = () => shoot()
    left.addEventListener("touchstart", () => keys.a = true)
    right.addEventListener("touchstart", () => keys.d = true)
    left.addEventListener("touchend", () => keys.a = false)
    right.addEventListener("touchend", () => keys.d = false)

    let intervalId = autoshooting ? setInterval(() => shoot(), 200) : null
    autoshootLabel.style.display = 'flex'
    inputs.forEach(input => {
        if (autoshooting) {
            const shootCtrl = document.querySelector('.game__controls-shoot')
            input.checked = true
            shootCtrl.style.opacity = 0
        }
        input.addEventListener('click', () => {
            if (input.checked) {
                const shootCtrl = document.querySelector('.game__controls-shoot')
                intervalId = setInterval(() => shoot(), 200)
                shootCtrl.style.opacity = 0
            }
            else clearInterval(intervalId)
        })
    }
    )
    animate()
}

const renderStart = () => {
    const startBtn = document.querySelector('.game__start-btn')
    startBtn.onclick = () => {
        const autoshoot = document.querySelector('#autoshoot')
        startGame(autoshoot.checked)
    }
}
renderStart()

const endGame = () => {
    game.active = false

    const canvas = document.querySelector('canvas')
    const restart = document.querySelector('.game__restart')
    const restartBtn = document.querySelector('.game__restart-btn')
    const gameOver = document.querySelector('.game__over')
    const endScore = document.querySelector('.game__endscore')
    const scoreTag = document.querySelector('.game__score')
    const autoshoot = document.querySelector('.game__autoshoot')

    restart.style.display = 'flex'
    restartBtn.onclick = () => startGame()

    canvas.style = 'filter: blur(5px);'
    scoreTag.style = 'filter: blur(5px);'
    autoshoot.style = 'filter: blur(5px);'
    gameOver.innerText = 'Game Over'
    endScore.innerText = `${score} points`
}


// Movements
addEventListener('keydown', (e) => {
    // console.log(e.code)
    if (game.over) return

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
            shoot()
            break
    }
})
addEventListener('keyup', (e) => {
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

