#!/usr/bin/env node

/**
 * main function
 * created by INCHMAN
 * 2017.12.23
 */

const C = require('commander')
const chalk = require('chalk')

const request = require('./request')

const { space, expandString } = require('./utils')

const log = console.log

const logSubtitle = title => log(chalk.rgb(0xaa, 0xaa, 0xaa)(title))

const pkg = require('./package.json')

C.version(pkg.version)
  .option('-l --livescore', 'show live score')
  .option(
    '--interval [seconds]',
    'set a interval to output live score, only valid when -l or --livescore is provided and there is match going on'
  )
  .option('-t --today', "show today's match list")
  .option('-r --ranking [length]', 'show the current world ranking')
  .option('-a --all', 'show world ranking of all the players')
  .parse(process.argv)

/**
 * output live score if --livescore or -l option is provided
 */
if (C.livescore) {
  outputLiveScore()
  const interval = C.interval
  if (interval) {
    const seconds = parseInt(interval)
    if (isNaN(seconds)) {
      return log('时间格式以秒为单位')
    }
    if (seconds < 5) {
      return log('间隔不得小于5s')
    }
    setInterval(function () {
      outputLiveScore()
    }, parseInt(C.interval) * 1000)
  }

  function outputLiveScore() {
    request('https://snkdev.top/dev/api/v1/match/livescore')
      .then(data => {
        if (data.length === 0) {
          return log('暂时没有直播，请稍后再试')
        }
        log(chalk.bold('比分直播'))
        const horizontalLine = space(56, '-')
        log(horizontalLine)
        data.forEach(match => {
          log(
            space(10),
            expandString(match.player1.name, '', 20),
            ' V ',
            expandString(match.player2.name, 'front', 20)
          )
          log('台面剩余：', expandString(match.common.leftScore, 'front', 24))
          log('最佳局制：', expandString(match.common.bestOf, 'front', 24))
          log(
            '当前比分：',
            expandString(match.player1.totalSetScore, 'front', 20),
            ' : ',
            match.player2.totalSetScore
          )
          log(
            '当前局份：',
            expandString(match.player1.thisSetScore, 'front', 20),
            ' : ',
            match.player2.thisSetScore
          )
          log(horizontalLine)
        })
      })
      .catch(err => {
        console.log(err)
      })
  }
}

/**
 * output today's match if --today or -t option is provided
 */

if (C.today) {
  request('https://api.fri.tv/api/v2/match/matchListByDate/?predatestart=&nextdatestart=&encoding=utf-8&userid=&sign=')
    .then(data => {
      if (data.length === 0) {
        return log('今天没有比赛')
      }
      log(space(56, '-'))
      data.forEach(session => {
        log()
        log(chalk.bold(`比赛时间：${chalk.green(session.datainfo)}`))
        log()
        const { datalist: matches } = session
        matches.forEach((match, index) => {
          log(`比赛：${match.matchname} 轮次：${match.luncititle}`)
          logSubtitle(`时间：${match.matchdate}`)
          log(
            expandString(match.player1, 'back', 20),
            expandString(match.player1fen, 'front', 2),
            ' : ',
            expandString(match.player2fen, 'back', '2'),
            expandString(match.player2, 'front', 20)
          )
          if (index !== matches.length - 1) {
            log()
          }
        })
        log()
        log(space(56, '-'))
      })
    })
    .catch(err => { })
}

/**
 * show the world ranking if --ranking or -r option is provided
 */

if (C.ranking) {
  request('https://snkdev.top/dev/api/v1/player/ranking').then(data => {
    let length = parseInt(C.ranking)
    if (!length) {
      length = C.all ? 10000 : 16
    }
    log()
    log(chalk.bold(chalk.green('当前世界排名')))
    log()
    data.forEach((player, index) => {
      if (index < length) {
        log(
          chalk.gray(expandString(player.no, 'back', 3)),
          expandString(player.name, 'back', 24),
          expandString(player.prize, 'front', 12)
        )
      }
    })
    log()
  })
}
