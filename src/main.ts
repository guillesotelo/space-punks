const canvas = document.querySelector('canvas') || document.createElement('canvas')

const c = canvas.getContext('2d')
canvas.width = innerWidth
canvas.height = innerHeight

class Player {
    position: { x: number; y: number }
    velocity: { x: number; y: number }
    image: HTMLImageElement
    width: number
    height: number

    constructor() {
        this.position = {
            x: 200,
            y: 200,
        }
        this.velocity = {
            x: 0,
            y: 0,
        }
        const image = new Image()
        image.src = './assets/spaceship.png'

        // First call for TS
        this.image = image
        this.width = image.width
        this.height = image.height

        image.onload = () => {
            const scale = .1
            this.image = image
            this.width = image.width * scale
            this.height = image.height * scale
        }
    }

    draw() {
        if (c) {
            c.fillStyle = 'black'
            c.fillRect(this.position.x, this.position.y, this.width, this.height)
            if (this.image) {
                c.drawImage(
                    this.image,
                    this.position.x,
                    this.position.y,
                    this.width,
                    this.height
                )
            }
        }
    }
}

const player = new Player()

// Animation Loop
function animate() {
    requestAnimationFrame(animate)
    c?.fillRect(0, 0, canvas.width, canvas.height)
    player.draw()

}
animate()