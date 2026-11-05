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
await page.screenshot({ path: `${shots}/01-home-phone.png` })

check('home title', (await page.$eval('h2', (el) => el.textContent)) === 'Ab Workouts')
check('four categories', (await page.$$('.tile')).length === 4)
check('default timing', (await page.$eval('.chip', (el) => el.textContent ?? '')).includes('10 min · 30s'))

await page.click('[aria-label="Settings"]')
await page.waitForFunction(() => document.body.textContent?.includes('Session length'))
await page.screenshot({ path: `${shots}/02-settings.png` })
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
check('rest', restClock.includes('0:03'), restClock)
const restNext = await page.$eval('.up-next', (el) => el.textContent ?? '')
check('rest up next', restNext.includes('Sit-up'), restNext)
const restSrc = await page.$eval('.demo-image', (el) => el.getAttribute('src') ?? '')
check('rest shows next gif', restSrc.includes('sit-up'), restSrc)
await page.screenshot({ path: `${shots}/04-rest.png` })

await clickText('End')
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

await browser.close()

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}
console.log('verified')
