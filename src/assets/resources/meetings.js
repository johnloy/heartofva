import day from 'dayjs'
import timezonePlugin from 'dayjs/plugin/timezone'
import utcPlugin from 'dayjs/plugin/utc'
import isBetween from 'dayjs/plugin/isBetween'
import { Low as DB } from 'lowdb'
import { SessionStorage } from 'lowdb/browser'

day.extend(utcPlugin)
day.extend(timezonePlugin)
day.extend(isBetween)

const meetingsDB = new DB(new SessionStorage('hova-meetings'), [])

export const meetings = (async () => {
  const response = await fetch(
    'https://heartofvadev.wpengine.com/wp-admin/admin-ajax.php?action=meetings'
  )

  meetingsDB.data = response.json()
  await meetingsDB.write()

  return meetingsDB.data
})()
