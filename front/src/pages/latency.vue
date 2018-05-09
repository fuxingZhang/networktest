<template>
  <div class="latency">
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
import axios from '../axios'
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
      timer: "",
      tableData: [
        {
          now: "0ms",
          average: "0ms"
        }
      ],
      length:0,
      myChart: null,
      stop: false,
      now:0,
      average:0,
      option: {
        title: {
          text: 'Latency Test',
          subtext: '延迟测试'
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
            formatter: '{value}ms'
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
                show: true,
                position: 'outside',
                formatter: '{c}ms'
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
                show: true,
                position: 'outside',
                formatter: '{c}ms'
              }
            }
          }
        ],
        animationDuration: 1000,
        animationDurationUpdate: 1000,
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
  },
  mounted() {
    const myChart = echarts.init(this.$refs.myChart);
    myChart.setOption(this.option);
    this.myChart = myChart
  },
  methods: {
    change() {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = "";
        this.button = "开始";
        this.stop = true;
        return;
      }
      this.stop = false;
      this.button = "停止";
      this.run();
    },
    async run() {
      if(this.stop) return;
      const start = Date.now();
      let res = await axios.get("api/latency");
      const end = Date.now();
      if (res.status != 200) {
        this.$message.error('网络异常')
        this.button = "开始";
        this.stop = true;
        return
      }
      this.now = end - start;
      this.average = parseInt((this.average*this.length + this.now) / (++this.length));
      const now = this.now + "ms";
      const average = this.average + "ms";
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
      if (!this.stop) {
        this.timer = setTimeout(this.run, 1000);
      }
    },
    clear() {
      this.stop = true;
      this.tableData = [
        {
          now: 0,
          average: 0
        }
      ];
      this.now = 0;
      this.average = 0;
      this.length = 0;
      this.button = "开始";
      const data = []
      const now = []
      const average = []
      for(let i=0;i<10;i++){
        data.push(' ')
        now.push(0)
        average.push(0)
      }
      this.option.xAxis.data = data
      this.option.series[0].data = now
      this.option.series[1].data = average
      this.myChart.setOption(this.option);
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = "";
      }
    }
  }
};
</script>

<style>
.latency {
  margin: 20px 14%;
}
.latency .cell {
  text-align: center;
}
.latency .table {
  margin-top: 20px;
}
.latency .echarts {
  height: 300px;
}
@media screen and (max-width: 767px) {
  .latency {
    margin: 15px;
  }
}
</style>
