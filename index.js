#!/usr/bin/env node

/**
 * main function
 * created by INCHMAN
 * 2017.12.23
 */

const https = require('https')

const C = require('commander')
const chalk = require('chalk')

const log = console.log

C.version('1.0.0')
	.option('-l --livescore', 'show live score')
	.option('--interval [seconds]', 'set a interval to output live score, only valid when -l or --livescore is provided and there is match going on')
	.option('-t --today', 'show today\'s match list')
	.option('-r --ranking [length]', 'show the current world ranking')
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
		https.get('https://snkdev.top/dev/api/v1/match/livescore', (res) => {
			var rawData = ''
			res.on('data', (chunk) => {
				rawData += chunk
			})
			res.on('end', function () {
				var data;
				try {
					data = JSON.parse(rawData).data;
				} catch (err) {
					return log('请求失败，请重试')
				}
				if (data.length === 0) {
					return log('暂时没有直播，请稍后再试')
				}
				log(chalk.bold('比分直播'))
				const horizontalLine = new Array(48).join('-')
				log(`${horizontalLine}`)
				data.forEach((el, index) => {
					const leftScoreSpaces = el.common.leftScore < 100 ? ' ' : ''
					log(`${emptify(el.player1.name, '', 12)} V ${emptify(el.player2.name, 'front', 12)}`)
					log(`台面剩余：            ${leftScoreSpaces}${el.common.leftScore}`)
					log(`最佳局制：             ${el.common.bestOf}`)
					log(`当前比分：         ${formatScoreNumber(el.player1.totalSetScore, '', 3)} : ${formatScoreNumber(el.player2.totalSetScore, 'back', 3)}`)
					log(`当前局分：         ${formatScoreNumber(el.player1.thisSetScore, '', 3)} : ${formatScoreNumber(el.player2.thisSetScore, 'back', 3)}`)
					log(`${horizontalLine}`)
				})
			})
		}).on('error', (err) => {
			log('出错了-_-||')
		})
	}
}

/**
 * output today's match if --today or -t option is provided
 */

if (C.today) {
	https.get('https://snkdev.top/dev/api/v1/match/today', (res) => {
		var rawData = ''
		res.on('data', (chunk) => {
			rawData += chunk
		})
		res.on('end', function () {
			var data;
			try {
				data = JSON.parse(rawData).data;
			} catch (err) {
				return log('请求失败，请重试')
			}
			if (data.length === 0) {
				return log('今天没有比赛')
			}
			log(new Array(57).join('-'))
			data.forEach(session => {
				log(`比赛轮次：${session.round} 时间：${session.time}`)
				const { againstList } = session
				againstList.forEach((against, index) => {
					log(`${against.no} ${emptify(against.p1name)} ${formatScoreNumber(against.p1set)} : ${formatScoreNumber(against.p2set, 'back')} ${emptify(against.p2name, 'front')}`)
				})
				log(new Array(57).join('-'))
			});
		})
	}).on('error', (err) => {
		log('出错了-_-||')
	})
}

/**
 * show the world ranking if --ranking or -r option is provided
 */

if (C.ranking) {
	https.get('https://snkdev.top/dev/api/v1/player/ranking', (res) => {
		var rawData = ''
		res.on('data', (chunk) => {
			rawData += chunk
		})
		res.on('end', function () {
			var data;
			try {
				data = JSON.parse(rawData).data;
			} catch (err) {
				return log('请求失败，请重试')
			}
			const length = isNaN(parseInt(C.ranking)) ? 10000 : parseInt(C.ranking)
			log(chalk.bold('当前世界排名'))
			data.forEach((el, index) => {
				if (index < length) {
					log(`${formatRankingNumber(el.no)} ${emptify(el.name)} ${emptify(el.prize, 'front', 12, ' ')}`)
				}
			})
		})
	})
}


/**
 * create certain length of space before/after str, so the length of the string will be 12(any specific length). 
 */

function emptify(str, position, length, delimiter) {
	str = str.replace(/\-/g, '')
	const _length = length || 12
	const _delimiter = delimiter || '  '
	const spaceLength = _length - str.length
	return position === 'front' ? createCertainLengthSpace(spaceLength) + str : str + createCertainLengthSpace(spaceLength)
	function createCertainLengthSpace(num) {
		// use two space because the string contains chinese characters
		return new Array(num).join(_delimiter)
	}
}

/**
 * beautify the output of score number
 */

function formatScoreNumber(no, position, length) {
	const _length = length || 2
	if (_length === 2) {
		return no >= 10 ? no : (position === 'back' ? `${no} ` : ` ${no}`)
	}
	if (_length === 3) {
		if (position === 'back') {
			return no < 10 ? `${no}  ` : no < 100 ? `${no} ` : no 
		}
		return no < 10 ? `  ${no}` : no < 100 ? ` ${no}` : no
	}
}

/**
 * beautify the output of ranking number
 */

function formatRankingNumber(no, position) {
	return no < 10 ? `${no}  ` : no < 100 ? `${no} ` : no
}
