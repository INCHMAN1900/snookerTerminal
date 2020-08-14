const https = require('https')

const HEADER = {
  'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_2 like Mac OS X) AppleWebKit/602.3.12 (KHTML, like Gecko) Mobile/14C92 Safari/601.1 MicroMessenger/6.7.3 Language/zh_CN',
  'Referer': 'https://servicewechat.com//{version}/page-frame.html'
}

function request (url, options = {}) {
  const {optionHeaders = {}, ...restOptions} = options
  let headers = Object.assign({}, HEADER, optionHeaders)
  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      headers,
      ...restOptions
    }, res => {
      let rawData = ''
      res.on('data', chunk => {
				rawData += chunk
      })
      res.on('end', () => {
        try {
          let json = JSON.parse(rawData);
          resolve(json.data || json.list)
				} catch (err) {
					reject(err)
				}
      })
    })

    req.on('error', err => {
      reject(err)
    })

    req.end()
  })
}

module.exports = request
