<template>
  <div class="upload">
    <el-card class="box-card">
      <div ref="myChart" style="width: 100%;height:400px;margin-bottom:20px;"></div>
      <el-row :gutter="10">
        <el-col :span="6" :offset="2">
          <el-form label-width="100px" label-position="left">
            <el-form-item label="文件大小">
              <el-select v-model="form.value" placeholder="" style="width:130px;">
                <el-option
                  v-for="item in form.options"
                  :key="item.value"
                  :label="item.label"
                  size="medium"
                  :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="测试次数">
              <el-input-number size="medium" v-model="form.iterations" :min="1" :max="100" label="测试次数"></el-input-number>
            </el-form-item>
            <el-form-item label="间隔时间(秒)">
              <el-input-number size="medium" v-model="form.duration" :min="0" :max="1000" label="间隔时间"></el-input-number>
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="16">
          <div class="table">
            <el-table
              :data="tableData"
              border
              style="width: 360px;margin:0 auto;">
              <el-table-column
                prop="now"
                label="当前值">
              </el-table-column>
              <el-table-column
                prop="average"
                label="平均值">
              </el-table-column>
            </el-table>
          </div>
        </el-col>
      </el-row>
      <el-button type="primary" @click="change" style="margin-top:30px;">{{button}}</el-button>
      <el-button type="primary" @click="clear" style="margin-top:30px;">清空</el-button>
    </el-card>
  </div>
</template>

<script>
import echarts from 'echarts'
import { setTimeout } from 'timers';

export default {
  data() {
    const data = []
    const now = []
    const average = []
    for(let i=0;i<10;i++){
      data.push(' ')
      now.push(0)
      average.push(0)
    }
    return {
      remain:0,
      form:{
        size:'',
        iterations:1,
        duration:1,
        value:'1024',
        options: [
        {
          value: '10',
          label: '10kb'
        },{
          value: '100',
          label: '100kb'
        }, {
          value: '1024',
          label: '1mb'
        }, {
          value: '10240',
          label: '10mb'
        }, {
          value: '102400',
          label: '100mb'
        }],
      },
      uploadData:null,
      button: "开始",
      tableData: [
        {
          now: "0kb/s",
          average: "0kb/s"
        }
      ],
      myChart: null,
      request:null,
      CancelToken:null,
      now:0,
      start:0,
      average:0,
      length:0,
      running:false,
      option: {
        title: {
          text: 'Upload Test',
          subtext: '上传测试'
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data:['实时值','平均值']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        toolbox: {
          show: true,
          feature: {
            dataZoom: {
                yAxisIndex: 'none'
            },
            dataView: {readOnly: false},
            magicType: {type: ['line', 'bar']},
            restore: {},
            saveAsImage: {}
          }
        },
        xAxis: {
          type: 'category',
          data,
          boundaryGap: false
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: '{value}kb/s'
          }
        },
        series: [
          {
            data: now,
            type: 'line',
            smooth: true,
            name:'实时值',
            label: {
              normal: {
                show: false,
                position: 'top',
                formatter: '{c}kb/s'
              }
            }
          },
          {
            data: average,
            type: 'line',
            smooth: true,
            name:'平均值',
            label: {
              normal: {
                show: false,
                position: 'bottom',
                formatter: '{c}kb/s'
              }
            }
          }
        ],
        // animationDuration: 1000,
        // animationDurationUpdate: 1000,
        animationEasing:'cubicIn'
      }
    }
  },
  async created() {
    if (!Date.now) {
      Date.now = function now() {
        return new Date().getTime();
      };
    }
    this.CancelToken = this.axios.CancelToken;
    this.init()
    this.source = this.CancelToken.source();
    let res = await this.request.get("api/upload",{
      cancelToken: this.source.token
    });
    this.uploadData = res.data;
    this.source = null
  },
  mounted() {
    const myChart = echarts.init(this.$refs.myChart);
    myChart.setOption(this.option);
    this.myChart = myChart
  },
  destroyed() {
    if(this.source) {
      this.source.cancel('Operation canceled by the user.');
      this.source = null
    }
  },
  methods: {
    change() {
      if (this.running) {
        this.button = "开始";
        this.running = false;
        this.source.cancel('Operation canceled by the user.');
        return;
      }
      this.running = true;
      this.button = "停止";
      this.remain = this.form.iterations;
      this.run();
    },
    async run() {
      if(!this.running) return
      let duration = this.form.duration
      const start = Date.now();
      this.start = start
      this.source = this.CancelToken.source();
      let postData = []
      let n = parseInt(this.form.value)
      for(let i=0;i < n; i++){
        postData.push(this.uploadData)
      }
      let data = new FormData()
      let blob = new Blob(postData,{
        type:'application/octet-stream'
      }) //var aBlob = new Blob( array, options );
      // let file = new File([this.uploadData], "file.bin", {
      //   type: 'application/octet-stream',
      // });
      /**
       * The filename reported to the server (a USVString), when a Blob or File is passed as the second parameter. 
       * The default filename for Blob objects is "blob". 
       * The default filename for File objects is the file's filename.
       */
      // data.append('file', blob) 
      data.append('file', blob,'upload.bin') 
      // data.append('file',file) 
      // data.append('file',file,'appendFileName.bin') 
      let res = await this.request.post("api/upload", data,{
        cancelToken: this.source.token
      });
      const end = Date.now();
      console.log(res);
      this.length = 0;
      this.source = null;
      if (res.status != 200) {
        this.$message.error('网络异常')
      }
      this.remain--
      if(this.remain == 0) {
        this.button = "开始";
        this.running = false
        return
      }
      setTimeout( () => {
        this.run()
      }, duration*1000)
    },
    clear() {
      if(this.source) {
        this.source.cancel('Operation canceled by the user.');
        this.source = null
      }
      this.tableData = [
        {
          now: 0,
          average: 0
        }
      ];
      this.now = 0;
      this.average = 0;
      this.button = "开始";
      this.length = 0;
      this.running = false;
      const data = [];
      const now = [];
      const average = [];
      for(let i=0;i<10;i++){
        data.push(' ')
        now.push(0)
        average.push(0)
      }
      this.option.xAxis.data = data
      this.option.series[0].data = now
      this.option.series[1].data = average
      this.myChart.setOption(this.option);
    },
    init() {
      const Util = {
        host: 'http://' + location.host
        // host: 'http://localhost:8010'
      }
      const request = this.axios.create({
        baseURL: Util.host,
        // timeout: 10000,
        validateStatus: function (status) {
          return status < 600; 
        },
        onUploadProgress: progressEvent => {
          console.log(progressEvent)
          console.log(progressEvent.loaded)
          if(!this.running) return
          const end = Date.now();
          const ms = end - this.start;
          this.now = parseInt(progressEvent.loaded*1000/1024/ms);
          this.average = parseInt((this.average*this.length + this.now) / ++this.length);
          const now = this.now + "kb/s";
          const average = this.average + "kb/s";
          this.tableData = [
            {
              now,
              average
            }
          ];
          this.option.xAxis.data.shift()
          const date = new Date()
          const time = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
          this.option.xAxis.data.push(time)
          this.option.series[0].data.shift()
          this.option.series[1].data.shift()
          this.option.series[0].data.push(this.now)
          this.option.series[1].data.push(this.average)
          this.myChart.setOption(this.option);
        },
        onDownloadProgress: progressEvent => {
          console.log(progressEvent)
          console.log(progressEvent.loaded/(10*1024*1024))
        },
      })
      request.interceptors.response.use((response) => {
        return response
      }, (error) => {
        return Promise.reject(error)
      })
      request.defaults.headers.post['Content-Type'] = 'multipart/form-data';
      this.request = request
    }
  }
};
</script>

<style>
.upload {
  margin: 20px 14%;
}
.upload .cell {
  text-align: center;
}
.upload .table {
  margin-top: 20px;
}
.upload .echarts {
  height: 300px;
}
.el-input-number--medium {
  width: 130px;
}
@media screen and (max-width: 767px) {
  .upload {
    margin: 15px;
  }
}
</style>
