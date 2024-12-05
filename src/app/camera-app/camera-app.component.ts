import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
const icsParser = require('ics-parser');

@Component({
  selector: 'app-camera-app',
  templateUrl: './camera-app.component.html',
  styleUrls: ['./camera-app.component.css'],
})
export class CameraAppComponent implements OnInit {
  events: { title: string; start: Date | null; end: Date | null }[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const icsUrl =
      'https://www.airbnb.com.br/calendar/ical/45528337.ics?s=6e3d033213a65bdbf6ad95a7785f7b38';

    this.http.get(icsUrl, { responseType: 'text' }).subscribe(
      (icsData) => {
        const parser = new icsParser();
        const parsedData = parser.parse(icsData);  // Usando ics-parser

        parsedData.forEach((event: any) => {
          this.events.push({
            title: event.summary || 'Sem título',
            start: event.startDate ? new Date(event.startDate) : null,
            end: event.endDate ? new Date(event.endDate) : null,
          });
        });
      },
      (error) => {
        console.error('Erro ao carregar o calendário:', error);
      }
    );
  }
}
