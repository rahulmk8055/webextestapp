import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import {
  Chart,
  LineController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  TimeSeriesScale,
  Legend,
  Title,
  Tooltip,
} from 'chart.js';
import { AppService } from './app.service';

declare var Webex: any ;

var app = new Webex.Application();

var meetingid = 1;

app.onReady().then(() => {
  console.log("App is ready, getting user info...", {message:'The app is ready.'})
  app.context.getUser().then(
    function (user: any) {
      console.log("This is user data",{message : user})
    }
).catch(
    function (error: { message: string; }) {
      console.log("getUser promise rejected with " + error.message, {message:"error"});
    })
  app.context.getMeeting().then(
      function (meeting: any) {
        console.log("This is user data",{message : meeting})
        meetingid = Number(meeting.conferenceId);
      }
  ).catch(
      function (error: { message: string; }) {
        console.log("getmeeting promise rejected with " + error.message, {message:"error"});
      })
 }
);


// function log(type: string, data: { message: string; }) {
//   console.log(data)
// }

Chart.register(
  LineController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  TimeSeriesScale,
  Legend,
  Title,
  Tooltip
);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  @ViewChild('chartCanvas') chartCanvas: ElementRef;

  sent = false;
  chart: any;
  color = '00FF00';
  meetingId = meetingid;
  chartConfig: any = {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: "No. of people reported unable to hear",
        backgroundColor: 'rgb(255, 99, 132)',
        borderColor: 'rgb(255, 99, 132)',
        data: [],
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          min: 0,
          ticks: {
            // forces step size to be 50 units
            stepSize: 1
          }
        }
      }
    },
  };

  constructor(public appService: AppService) {
    this.appService.webSocket$.subscribe((res) => {
      this.color = res.status.color;
      this.chartConfig.data.labels.push(res.ts);
      this.chartConfig.data.datasets[0].data.push(res.status.count);
      if (this.chartConfig.data.datasets[0].data.length > 12) {
        this.chartConfig.data.labels.splice(0, 1);
        this.chartConfig.data.datasets[0].data.splice(0, 1);
      }
      this.chart.update();
    });
    this.appService.webSocket$.next({ method: 'hello', meetingId: this.meetingId });
  }

  ngAfterViewInit() {
    this.chart = new Chart(this.chartCanvas.nativeElement, this.chartConfig);
  }

  notAbleToHear() {
    setTimeout(() => {
      this.sent = false;
    }, 5 * 1000);
    this.sent = true;
    this.appService.webSocket$.next({ method: 'cantSeeYou', meetingId: this.meetingId });
  }
}
