import Vue from 'vue'
import Router from 'vue-router'
import latency from '../pages/latency.vue'
import upload from '../pages/upload.vue'
import download from '../pages/download.vue'

Vue.use(Router)

const router = new Router({ 
  mode: 'hash',
  routes: [
    { path: '/', redirect: '/latency' },
    { path: '/latency', component: latency, name:'延迟测试' }, 
    { path: '/upload', component: upload, name:'上传测试' }, 
    { path: '/download', component: download, name:'下载测试' }
  ]
})

router.beforeEach( async(to, from, next) => {
  document.title = to.name
  next()
})

export default router
