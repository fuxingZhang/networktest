<template>
  <div id="app">
    <header style="display:flex;">
      <div class="title">Network Speed Test</div>
      <div style="flex:1">
        <el-menu
          :default-active="defaultValue"
          class="el-menu"
          mode="horizontal"
          @select="handleSelect"
          background-color="#2a3f54"
          text-color="#fff"
          menu-trigger="click"
          active-text-color="#ffd04b">
          <router-link to="/latency">
            <el-menu-item index="1">延迟测试</el-menu-item>
          </router-link>
          <router-link to="/download">
            <el-menu-item index="2">下载测试</el-menu-item>
          </router-link>
          <router-link to="/upload">
            <el-menu-item index="3">上传测试</el-menu-item>
          </router-link>
        </el-menu>
      </div>
    </header>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  data(){
    return {
      defaultValue:'1'
    }
  },
  created(){
    let path = this.$route.path
    if(path == '/download') {
      this.defaultValue = '2'
    }else if(path == '/upload') {
      this.defaultValue = '3'
    }
  },
  methods: {
    handleSelect(key, keyPath) {
      console.log(key, keyPath)
    }
  }
}
</script>

<style>
*{
  margin: 0;
  padding: 0;
}
html{
  background-color: #fafafa;
}
#app {
  font-family: Helvetica, sans-serif;
  text-align: center;
  margin-bottom: 40px;
}
header{
  height: 60px;
  line-height: 60px;
  background-color: #2a3f54;
  color: #fff;
}
a{
  text-decoration: none;
}
.el-menu--horizontal .el-menu-item {
  float: left;
  height: 60px;
  line-height: 60px;
  margin: 0;
  border-bottom: 2px solid transparent;
}
.el-button--primary {
  background-color:#2a3f54;
  border-color:#2a3f54;
}
.el-button--primary:hover{
  background-color: #192632;
  border-color: #0d141a;
}
.el-button--primary:focus{
  background-color: #192632;
  border-color: #0d141a;
}
.title{
  width:300px;
}
@media screen and (max-width: 767px) {
  .title{
    width:180px;
    margin-right: 4px;
  }
  .el-menu-item {
    font-size: 12px;
    padding: 0 4px;
  }
}
</style>
