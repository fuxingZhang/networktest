const Router = require('koa-router')
const fs = require('fs')
const _fs = require('../utils/fs')
const Busboy = require('busboy');
const inspect = require('util').inspect;
const router = new Router({
  prefix: '/api'
})

router
.get('/latency', async ctx => {
  ctx.body = 'ok'
})
.get('/download', async ctx => {
  let file = fs.createReadStream('./testFiles/10mb_file.bin')
  ctx.body = file
})
.get('/upload', async ctx => {
  let file = fs.createReadStream('./testFiles/1kb_file.bin')
  ctx.body = file
})
.post('/upload', async ctx => {
  ctx.body = await new Promise( (resolve, reject) => {
    let busboy = new Busboy({ headers: ctx.headers });
    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
      file.pipe(fs.createWriteStream('./uploads/'+filename))
      console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
      file.on('data', function(data) {
        // console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
      });
      file.on('end', function() {
        console.log('File [' + fieldname + '] Finished');
      });
    });
    busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
      console.log('Field [' + fieldname + ']: value: ' + inspect(val));
    });
    busboy.on('finish', () => {
      console.log('busboy finished!');
      resolve('finished')
    });
    busboy.on('error', err => {
      console.log('error!',err);
      reject(err)
    });
    ctx.req.pipe(busboy);
  })
})

module.exports = router