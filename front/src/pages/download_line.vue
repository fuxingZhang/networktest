<template>
  <div class="download">
    <el-card class="box-card">
      <div ref="myChart" style="width: 100%;height:400px;"></div>
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
      <el-button type="primary" @click="change" style="margin-top:30px;">{{button}}</el-button>
      <el-button type="primary" @click="clear" style="margin-top:30px;">清空</el-button>
    </el-card>
  </div>
</template>

<script>
import echarts from 'echarts'

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
          text: 'DownLoad Test',
          subtext: '下载测试'
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
  created() {
    if (!Date.now) {
      Date.now = function now() {
        return new Date().getTime();
      };
    }
    this.CancelToken = this.axios.CancelToken;
    this.init()
  },
  mounted() {
    const myChart = echarts.init(this.$refs.myChart);
    myChart.setOption(this.option);
    this.myChart = myChart
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
      this.run();
    },
    async run() {
      const start = Date.now();
      this.start = start
      this.source = this.CancelToken.source();
      let res = await this.request.get("api/download",{
        cancelToken: this.source.token
      });
      const end = Date.now();
      console.log(res);
      this.button = "开始";
      this.length = 0;
      this.source = null;
      this.running = false;
      if (res.status != 200) {
        this.$message.error('网络异常')
      }
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
        // host: 'http://' + location.host
        host: 'http://localhost:8010'
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
        },
        onDownloadProgress: progressEvent => {
          console.log(progressEvent)
          console.log(progressEvent.loaded/(10*1024*1024))
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
      })
      request.interceptors.response.use((response) => {
        return response
      }, (error) => {
        return Promise.reject(error)
      })
      this.request = request
    }
  }
};
</script>

<style>
.download {
  margin: 20px 14%;
}
.download .cell {
  text-align: center;
}
.download .table {
  margin-top: 20px;
}
.download .echarts {
  height: 300px;
}
@media screen and (max-width: 767px) {
  .download {
    margin: 15px;
  }
}
</style>
