import { mkdirSync } from 'node:fs'
import puppeteer from 'puppeteer-core'

const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const base = process.env.APP_URL ?? 'http://127.0.0.1:5173'
const shots = '/tmp/ab-react-verify'
mkdirSync(shots, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: true,
  pipe: true,
  args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--force-color-profile=srgb'],
})

const page = await browser.newPage()
await page.evaluateOnNewDocument(() => {
  window.__vibrated = false
  navigator.vibrate = () => {
    window.__vibrated = true
    return false
  }
})

const failures = []
function check(name, ok, detail = '') {
  if (!ok) failures.push(`${name}${detail ? `: ${detail}` : ''}`)
  else console.log(`ok ${name}`)
}

async function clickText(text) {
  const clicked = await page.evaluate((label) => {
    const button = [...document.querySelectorAll('button')].find((item) => item.textContent?.trim() === label)
    if (!(button instanceof HTMLButtonElement)) return false
    button.click()
    return true
  }, text)
  if (!clicked) throw new Error(`Missing button ${text}`)
}

await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
await page.goto(base, { waitUntil: 'networkidle0' })
await page.waitForFunction(() => {
  const images = [...document.querySelectorAll('.tile-image')]
  return (
    images.length === 4 &&
    images.every(
      (img) =>
        img instanceof HTMLImageElement &&
        img.naturalWidth > 0 &&
        (img.getAttribute('src') ?? '').startsWith('data:image/png'),
    )
  )
})
await page.screenshot({ path: `${shots}/01-home-phone.png` })
check('category images', (await page.$$('.tile-image')).length === 4)
const fullCorePoster = await page.$eval('.tile[data-category="fullCore"] .tile-image', (el) => el.getAttribute('data-source') ?? '')
check('full core thumbnail', fullCorePoster.endsWith('/exercises/forearm-plank.gif'), fullCorePoster)

check('home title', (await page.$eval('h2', (el) => el.textContent)) === 'Ab Workouts')
check('four categories', (await page.$$('.tile')).length === 4)
check('default timing', (await page.$eval('.chip', (el) => el.textContent ?? '')).includes('10 min · 30s'))

await page.click('[aria-label="Settings"]')
await page.waitForFunction(() => document.body.textContent?.includes('Session length'))
await page.screenshot({ path: `${shots}/02-settings.png` })
await page.goBack()
await page.waitForSelector('.tile-grid')
check('browser back from settings', (await page.$eval('h2', (el) => el.textContent)) === 'Ab Workouts')
await page.click('[aria-label="Settings"]')
await page.waitForFunction(() => document.body.textContent?.includes('Session length'))
const segments = await page.$$('.segment')
const durations = await segments[0].$$('button')
const lengths = await segments[1].$$('button')
await durations[0].click()
await lengths[1].click()
await clickText('Done')
await page.waitForSelector('.chip')
const chip = await page.$eval('.chip', (el) => el.textContent ?? '')
check('saved timing', chip.includes('5 min · 60s'), chip)

await page.reload({ waitUntil: 'networkidle0' })
const chipAfterReload = await page.$eval('.chip', (el) => el.textContent ?? '')
check('timing persists', chipAfterReload.includes('5 min · 60s'), chipAfterReload)

await page.click('.tile[data-category="upper"]')
await page.waitForSelector('.demo-image')
const gifSrc = await page.$eval('.demo-image', (el) => el.getAttribute('src') ?? '')
check('crunch gif', gifSrc.endsWith('/exercises/crunch.gif'), gifSrc)
await page.waitForFunction(() => {
  const img = document.querySelector('.demo-image')
  return img instanceof HTMLImageElement && img.naturalWidth > 0
})
const countdown = await page.$eval('.countdown', (el) => el.textContent ?? '')
check('countdown', countdown.includes('1:00'), countdown)
const upNext = await page.$eval('.up-next', (el) => el.textContent ?? '')
check('up next', upNext.includes('Sit-up'), upNext)
check('elapsed', (await page.$eval('.workout-meta', (el) => el.textContent ?? '')).includes('Elapsed'))
await page.screenshot({ path: `${shots}/03-workout.png` })

await new Promise((resolve) => setTimeout(resolve, 1300))
const afterTick = await page.$eval('.countdown', (el) => el.textContent ?? '')
check('timer moves', afterTick.includes('0:59') || afterTick.includes('0:58'), afterTick)

await clickText('Pause')
const pausedAt = await page.$eval('.countdown', (el) => el.textContent ?? '')
await new Promise((resolve) => setTimeout(resolve, 1300))
const still = await page.$eval('.countdown', (el) => el.textContent ?? '')
check('pause holds', still.includes('Paused') && still.includes(pausedAt.slice(0, 4)), `${pausedAt} -> ${still}`)
check('resume label', (await page.$eval('.controls', (el) => el.textContent ?? '')).includes('Resume'))

await page.click('[aria-label="Favorite"]')
check(
  'starred',
  (await page.$eval('[aria-pressed="true"]', (el) => el.getAttribute('aria-label'))) === 'Remove favorite',
)

await clickText('Resume')
await clickText('Skip')
await page.waitForFunction(() => document.querySelector('.workout-copy h2')?.textContent === 'Rest')
const restClock = await page.$eval('.countdown', (el) => el.textContent ?? '')
check('rest', restClock.includes('0:03') || restClock.includes('0:02'), restClock)
const restNext = await page.$eval('.up-next', (el) => el.textContent ?? '')
check('rest up next', restNext.includes('Sit-up'), restNext)
await page.waitForFunction(() => {
  const img = document.querySelector('.demo-image')
  const frame = document.querySelector('.gif-frame')
  return (
    img instanceof HTMLImageElement &&
    (img.getAttribute('src') ?? '').startsWith('data:image/png') &&
    frame?.getAttribute('data-exercise') === 'sit-up'
  )
})
const restExercise = await page.$eval('.gif-frame', (el) => el.getAttribute('data-exercise') ?? '')
check('rest shows next move', restExercise === 'sit-up', restExercise)
const restSrc = await page.$eval('.demo-image', (el) => el.getAttribute('src') ?? '')
const restGifCount = await page.$$eval('.gif-frame img[src$=".gif"]', (els) => els.length)
await new Promise((resolve) => setTimeout(resolve, 400))
const restSrcLater = await page.$eval('.demo-image', (el) => el.getAttribute('src') ?? '')
check('rest is a still', restSrc.startsWith('data:image/png') && restSrc === restSrcLater && restGifCount === 0, restSrc.slice(0, 32))
await page.screenshot({ path: `${shots}/04-rest.png` })

await clickText('Skip')
await page.waitForFunction(() => document.querySelector('.workout-copy h2')?.textContent === 'Sit-up')
await clickText('Previous')
await page.waitForFunction(() => document.querySelector('.workout-copy h2')?.textContent === 'Crunch')
check('previous exercise', (await page.$eval('.workout-copy h2', (el) => el.textContent)) === 'Crunch')

await clickText('End')
await page.waitForSelector('.tile')
check('end returns home', (await page.$eval('h2', (el) => el.textContent)) === 'Ab Workouts')
await page.waitForSelector('.tile')
await page.click('[aria-label="Favorites"]')
await page.waitForSelector('.favorite-name')
check('favorite saved', (await page.$eval('.favorite-name', (el) => el.textContent)) === 'Crunch')
await page.screenshot({ path: `${shots}/05-favorites.png` })
await clickText('Start favorites')
await page.waitForSelector('.topbar-title')
check('favorites session', (await page.$eval('.topbar-title', (el) => el.textContent)) === 'Favorites')
await clickText('End')
await page.click('[aria-label="Favorites"]')
await clickText('Remove')
check('favorite removed', (await page.$eval('.empty h2', (el) => el.textContent)) === 'No favorites yet')

await page.click('text/Back').catch(() => clickText('Back'))
const audioCount = await page.$$eval('audio, video', (els) => els.length)
const vibrated = await page.evaluate(() => window.__vibrated)
check('no media elements', audioCount === 0, String(audioCount))
check('no vibration', vibrated === false)

await page.setViewport({ width: 1024, height: 1366, deviceScaleFactor: 1 })
await page.goto(base, { waitUntil: 'networkidle0' })
await page.screenshot({ path: `${shots}/06-home-ipad.png` })
const shellWidth = await page.$eval('.app-shell', (el) => el.getBoundingClientRect().width)
check('ipad shell larger', shellWidth >= 800, String(shellWidth))
check('ipad still four tiles', (await page.$$('.tile')).length === 4)
await page.click('.tile[data-category="obliques"]')
await page.waitForSelector('.demo-image')
await page.screenshot({ path: `${shots}/07-workout-ipad.png` })
const obliqueGif = await page.$eval('.demo-image', (el) => el.getAttribute('src') ?? '')
check('oblique gif', obliqueGif.includes('bicycle-crunch'), obliqueGif)
await page.goBack()
await page.waitForSelector('.tile-grid')
check('browser back from workout', (await page.$eval('h2', (el) => el.textContent)) === 'Ab Workouts')

await page.evaluate(() => {
  localStorage.setItem('abworkouts.settings', JSON.stringify({ durationMinutes: 20, exerciseSeconds: 30 }))
})
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
await page.goto(base, { waitUntil: 'networkidle0' })
await page.click('.tile[data-category="fullCore"]')
await page.waitForSelector('.workout-copy h2')
for (let step = 0; step < 30; step += 1) {
  const title = await page.$eval('.workout-copy h2', (el) => el.textContent ?? '')
  if (title === 'Bird dog') break
  await clickText('Skip')
}
await page.waitForFunction(() => {
  const img = document.querySelector('.demo-image')
  return img instanceof HTMLImageElement && img.naturalWidth > 0 && (img.getAttribute('src') ?? '').includes('bird-dog')
})
async function demoFit() {
  return page.evaluate(() => {
    const img = document.querySelector('.demo-image')
    const frame = document.querySelector('.gif-frame')
    if (!(img instanceof HTMLImageElement) || !(frame instanceof HTMLElement) || img.naturalWidth === 0) return null
    const imageBox = img.getBoundingClientRect()
    const frameBox = frame.getBoundingClientRect()
    const natural = img.naturalWidth / img.naturalHeight
    const frameAspect = frameBox.width / frameBox.height
    const contentW = natural > frameAspect ? frameBox.width : frameBox.height * natural
    const contentH = natural > frameAspect ? frameBox.width / natural : frameBox.height
    return {
      objectFit: getComputedStyle(img).objectFit,
      fillsFrame: imageBox.width >= frameBox.width - 2 && imageBox.height >= frameBox.height - 2,
      fits: contentW <= frameBox.width + 1 && contentH <= frameBox.height + 1,
      largest: Math.max(contentW / frameBox.width, contentH / frameBox.height),
      contentW,
      contentH,
      frameW: frameBox.width,
      frameH: frameBox.height,
    }
  })
}

const birdDogFit = await demoFit()
check(
  'bird dog fully visible',
  Boolean(birdDogFit?.fillsFrame) &&
    birdDogFit?.objectFit === 'contain' &&
    birdDogFit?.fits &&
    (birdDogFit?.largest ?? 0) > 0.97,
  JSON.stringify(birdDogFit),
)
await page.screenshot({ path: `${shots}/08-bird-dog.png` })

for (const title of ['Jackknife', 'V-sit hold', 'Bear crawl', 'Push-up to side plank']) {
  for (let step = 0; step < 8; step += 1) {
    const current = await page.$eval('.workout-copy h2', (el) => el.textContent ?? '')
    if (current === title) break
    await clickText('Skip')
  }
  await page.waitForFunction((name) => {
    const img = document.querySelector('.demo-image')
    return document.querySelector('.workout-copy h2')?.textContent === name && img instanceof HTMLImageElement && img.naturalWidth > 0
  }, {}, title)
  const fit = await demoFit()
  const slug = title.toLowerCase().replace(/[^a-z]+/g, '-')
  check(
    `${title} fills the card`,
    Boolean(fit?.fillsFrame) && fit?.objectFit === 'contain' && fit?.fits && Math.min(fit?.contentW ?? 0, fit?.contentH ?? 0) >= 240,
    JSON.stringify(fit),
  )
  await page.screenshot({ path: `${shots}/10-${slug}.png` })
}

await clickText('End')
await page.waitForSelector('.tile')
await page.click('.tile[data-category="upper"]')
await page.waitForSelector('.workout-copy h2')
for (let step = 0; step < 12; step += 1) {
  const title = await page.$eval('.workout-copy h2', (el) => el.textContent ?? '')
  if (title === 'Toe touch') break
  await clickText('Skip')
}
await page.waitForFunction(() => {
  const img = document.querySelector('.demo-image')
  return img instanceof HTMLImageElement && (img.getAttribute('src') ?? '').includes('/exercises/toe-touch.gif')
})
check('toe touch gif', true)
await page.screenshot({ path: `${shots}/09-toe-touch.png` })

await browser.close()

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}
console.log('verified')
