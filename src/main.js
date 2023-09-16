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
            x: isMobile ? 2 : 3,
            y: 0
        }

        this.invaders = []

        const maxCols = isMobile ? 9 : 13
        const maxRows = isMobile ? 5 : 7

        const colCant = Math.floor((score || 1) / 100) + 4
        const cols = colCant > maxCols ? maxCols : colCant
        const rowCant = Math.floor((score || 1) / 200) + 1
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
const player = new Player()
const projectiles = []
const grids = [new Grid(score)]
const invaderProjectiles = []
const particles = []
const keys = {
    a: false,
    d: false,
    w: false,
    s: false,
    space: false,
}
const game = {
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

const renderControls = () => {
    const ctrls = document.querySelector('.game__controls')
    ctrls.style.display = 'flex'
    const left = document.querySelector('.game__controls-left')
    const right = document.querySelector('.game__controls-right')
    const autoshootLabel = document.querySelector('.game__autoshoot')
    const input = document.querySelector('#autoshoot')
    const shootCtrl = document.querySelector('.game__controls-shoot')

    if(input.checked) shootCtrl.style.opacity = 0
    shootCtrl.onclick = () => input.checked ? null : shoot()
    left.addEventListener("touchstart", () => keys.a = true)
    right.addEventListener("touchstart", () => keys.d = true)
    left.addEventListener("touchend", () => keys.a = false)
    right.addEventListener("touchend", () => keys.d = false)

    let intervalId = null
    autoshootLabel.style.display = 'flex'
    input.addEventListener('click', () => {
        if (input.checked) intervalId = setInterval(() => shoot(), 200)
        else clearInterval(intervalId)
    })
}
if (isMobile) renderControls()

const endGame = () => {
    game.active = false

    const body = document.querySelector('body')
    const canvas = document.querySelector('canvas')
    const title = document.querySelector('.game__title')
    const subtitle = document.querySelector('.game__subtitle')
    const scoreTag = document.querySelector('.game__score')
    const autoshoot = document.querySelector('.game__autoshoot')

    canvas.style = 'filter: blur(5px);'
    scoreTag.style = 'filter: blur(5px);'
    autoshoot.style = 'filter: blur(5px);'
    title.onclick = () => window.location.reload()
    subtitle.onclick = () => window.location.reload()
    title.innerText = 'Game Over'
    subtitle.innerText = `${score} points`
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
        if (frames % (Math.floor(Math.random() * 1000)) === 0 && grid.invaders.length > 0) {
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
animate()

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